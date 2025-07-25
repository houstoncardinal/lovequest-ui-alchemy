import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      action, 
      user_id, 
      notification_type, 
      title, 
      body, 
      data, 
      token, 
      platform 
    } = await req.json();

    console.log(`Push notification action: ${action} for user ${user.id}`);

    if (action === 'register_token') {
      // Register/update push notification token
      const { error } = await supabase
        .from('push_notification_tokens')
        .upsert({
          user_id: user.id,
          token: token,
          platform: platform || 'web',
          is_active: true
        });

      if (error) {
        console.error('Error registering token:', error);
        return new Response(JSON.stringify({ error: 'Failed to register token' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Token registered successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'send_notification') {
      // Send push notification to specific user
      if (!user_id || !notification_type || !title || !body) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check user's notification preferences
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user_id)
        .single();

      // Default preferences if none exist
      const userPrefs = preferences || {
        new_matches: true,
        new_messages: true,
        profile_views: true,
        super_likes: true,
        push_enabled: true
      };

      // Check if user has this notification type enabled
      const shouldSend = userPrefs.push_enabled && (
        (notification_type === 'match' && userPrefs.new_matches) ||
        (notification_type === 'message' && userPrefs.new_messages) ||
        (notification_type === 'profile_view' && userPrefs.profile_views) ||
        (notification_type === 'super_like' && userPrefs.super_likes)
      );

      if (!shouldSend) {
        return new Response(JSON.stringify({
          success: true,
          message: 'Notification not sent - user preferences'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get user's push tokens
      const { data: tokens } = await supabase
        .from('push_notification_tokens')
        .select('token, platform')
        .eq('user_id', user_id)
        .eq('is_active', true);

      if (!tokens || tokens.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          message: 'No active tokens found'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // In a real implementation, you would integrate with:
      // - Firebase Cloud Messaging (FCM) for Android/Web
      // - Apple Push Notification Service (APNs) for iOS
      // - Web Push API for web notifications
      
      // For this demo, we'll just log the notification
      const notification: PushNotificationPayload = {
        title,
        body,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        data: {
          type: notification_type,
          timestamp: new Date().toISOString(),
          ...data
        }
      };

      console.log(`Would send push notification to ${tokens.length} devices:`, notification);

      // Here you would make actual API calls to push services
      // Example for FCM:
      /*
      const fcmKey = Deno.env.get('FCM_SERVER_KEY');
      for (const tokenData of tokens) {
        if (tokenData.platform === 'android' || tokenData.platform === 'web') {
          await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Authorization': `key=${fcmKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: tokenData.token,
              notification: {
                title: notification.title,
                body: notification.body,
                icon: notification.icon,
              },
              data: notification.data
            })
          });
        }
      }
      */

      return new Response(JSON.stringify({
        success: true,
        message: `Notification queued for ${tokens.length} devices`,
        notification_sent: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'send_bulk_notification') {
      // Send notification to multiple users (admin only)
      const isAdmin = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!isAdmin.data) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { user_ids, ...notificationData } = await req.json();

      if (!user_ids || !Array.isArray(user_ids)) {
        return new Response(JSON.stringify({ error: 'Invalid user_ids array' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let sentCount = 0;
      
      for (const userId of user_ids) {
        // Send to each user individually (respecting their preferences)
        try {
          const response = await fetch(`${req.url}`, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'send_notification',
              user_id: userId,
              ...notificationData
            })
          });

          if (response.ok) {
            sentCount++;
          }
        } catch (error) {
          console.error(`Failed to send notification to user ${userId}:`, error);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Bulk notification sent to ${sentCount}/${user_ids.length} users`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'update_preferences') {
      // Update user's notification preferences
      const { preferences } = await req.json();

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        });

      if (error) {
        console.error('Error updating preferences:', error);
        return new Response(JSON.stringify({ error: 'Failed to update preferences' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Preferences updated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'deactivate_token') {
      // Deactivate a push token
      const { error } = await supabase
        .from('push_notification_tokens')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('token', token);

      if (error) {
        console.error('Error deactivating token:', error);
        return new Response(JSON.stringify({ error: 'Failed to deactivate token' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Token deactivated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in push-notifications function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});