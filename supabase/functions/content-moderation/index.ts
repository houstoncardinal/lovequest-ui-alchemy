import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { action, content, reported_user_id, reported_message_id, reported_post_id, report_type, reason } = await req.json();

    console.log(`Content moderation action: ${action} for user ${user.id}`);

    if (action === 'analyze_content') {
      // Automated content analysis
      const flaggedWords = [
        'scam', 'fake', 'fraud', 'money', 'bitcoin', 'crypto', 'investment',
        'nude', 'sex', 'adult', 'explicit', 'porn', 'escort',
        'hate', 'kill', 'die', 'stupid', 'idiot', 'ugly'
      ];

      const suspiciousPatterns = [
        /\b\d{10,}\b/, // Phone numbers
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email addresses
        /\bhttps?:\/\/[^\s]+/gi, // URLs
        /\b(whatsapp|telegram|kik|snapchat|instagram)\b/gi, // External platforms
        /\$\d+|\d+\s*(dollars?|usd|€|euros?|£|pounds?)/gi // Money amounts
      ];

      let riskScore = 0;
      let flags = [];

      // Check for flagged words
      const lowerContent = content.toLowerCase();
      flaggedWords.forEach(word => {
        if (lowerContent.includes(word)) {
          riskScore += 10;
          flags.push(`Contains flagged word: ${word}`);
        }
      });

      // Check for suspicious patterns
      suspiciousPatterns.forEach((pattern, index) => {
        if (pattern.test(content)) {
          riskScore += 15;
          const patternNames = ['Phone number', 'Email address', 'URL', 'External platform', 'Money amount'];
          flags.push(`Contains suspicious pattern: ${patternNames[index]}`);
        }
      });

      // Check message length and caps
      if (content.length > 500) {
        riskScore += 5;
        flags.push('Very long message');
      }

      const capsPercentage = (content.match(/[A-Z]/g) || []).length / content.length;
      if (capsPercentage > 0.5) {
        riskScore += 10;
        flags.push('Excessive use of capital letters');
      }

      // Determine action based on risk score
      let recommendedAction = 'allow';
      if (riskScore >= 30) {
        recommendedAction = 'block';
      } else if (riskScore >= 15) {
        recommendedAction = 'review';
      }

      return new Response(JSON.stringify({
        risk_score: riskScore,
        flags: flags,
        recommended_action: recommendedAction,
        content_analyzed: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'report_user') {
      // Create user report
      const { data: report, error: reportError } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.id,
          reported_user_id,
          reported_message_id,
          reported_post_id,
          report_type,
          reason,
          status: 'pending'
        })
        .select()
        .single();

      if (reportError) {
        console.error('Error creating report:', reportError);
        return new Response(JSON.stringify({ error: 'Failed to create report' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if this user has multiple reports and should be auto-flagged
      const { data: reportCount } = await supabase
        .from('user_reports')
        .select('id', { count: 'exact' })
        .eq('reported_user_id', reported_user_id)
        .eq('status', 'pending');

      let autoAction = null;
      if (reportCount && reportCount.length >= 5) {
        // Auto-suspend user with multiple reports
        await supabase
          .from('profiles')
          .update({ can_access_app: false })
          .eq('user_id', reported_user_id);
        
        autoAction = 'user_suspended';
      }

      console.log(`Report created: ${report.id} against user ${reported_user_id}`);

      return new Response(JSON.stringify({
        report_id: report.id,
        status: 'reported',
        auto_action: autoAction,
        message: 'Report submitted successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'block_user') {
      // Block user
      const { error: blockError } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: reported_user_id,
          reason: reason || 'User requested block'
        });

      if (blockError) {
        console.error('Error blocking user:', blockError);
        return new Response(JSON.stringify({ error: 'Failed to block user' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`User ${user.id} blocked user ${reported_user_id}`);

      return new Response(JSON.stringify({
        status: 'blocked',
        message: 'User blocked successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'unblock_user') {
      // Unblock user
      const { error: unblockError } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', reported_user_id);

      if (unblockError) {
        console.error('Error unblocking user:', unblockError);
        return new Response(JSON.stringify({ error: 'Failed to unblock user' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`User ${user.id} unblocked user ${reported_user_id}`);

      return new Response(JSON.stringify({
        status: 'unblocked',
        message: 'User unblocked successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'get_blocked_users') {
      // Get list of blocked users
      const { data: blockedUsers, error: blockedError } = await supabase
        .from('user_blocks')
        .select(`
          blocked_id,
          reason,
          created_at,
          profiles!user_blocks_blocked_id_fkey (
            user_id,
            first_name,
            last_name,
            display_name,
            avatar_url
          )
        `)
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false });

      if (blockedError) {
        console.error('Error fetching blocked users:', blockedError);
        return new Response(JSON.stringify({ error: 'Failed to fetch blocked users' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        blocked_users: blockedUsers
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
    console.error('Error in content-moderation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});