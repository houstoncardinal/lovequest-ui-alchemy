import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowLeft,
  ArrowRight,
  User,
  Calendar,
  FileText,
  Camera,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VerificationRequest {
  id: string;
  user_id: string;
  verification_type: string;
  status: string;
  id_document_url?: string;
  face_photo_url?: string;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    avatar_url?: string;
    age?: number;
    location?: string;
  };
}

interface QuickReviewProps {
  onBack: () => void;
}

const QuickReview: React.FC<QuickReviewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      // First get verification requests
      const { data: requests, error: requestsError } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (requestsError) throw requestsError;

      // Then get profiles for each request
      const requestsWithProfiles = await Promise.all(
        (requests || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, display_name, avatar_url, age, location')
            .eq('user_id', request.user_id)
            .single();

          return {
            ...request,
            profiles: profile
          };
        })
      );

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Load requests error:', error);
      toast({
        title: "Load Error",
        description: "Failed to load verification requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (action: 'approve' | 'reject') => {
    const currentRequest = requests[currentIndex];
    if (!currentRequest) return;

    setProcessing(true);
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      
      const { error: updateError } = await supabase
        .from('verification_requests')
        .update({
          status,
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', currentRequest.id);

      if (updateError) throw updateError;

      // If approved, update user profile to allow app access
      if (action === 'approve') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            can_access_app: true,
            verification_level: 'verified',
            is_verified: true
          })
          .eq('user_id', currentRequest.user_id);

        if (profileError) throw profileError;
      }

      toast({
        title: `Verification ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The verification request has been ${action}d successfully.`,
      });

      // Remove this request from the list and move to next
      const updatedRequests = requests.filter((_, index) => index !== currentIndex);
      setRequests(updatedRequests);
      
      // Adjust current index if needed
      if (currentIndex >= updatedRequests.length && updatedRequests.length > 0) {
        setCurrentIndex(updatedRequests.length - 1);
      } else if (updatedRequests.length === 0) {
        // No more requests to review
        onBack();
        return;
      }
      
      // Clear admin notes for next request
      setAdminNotes('');

    } catch (error) {
      console.error('Verification action error:', error);
      toast({
        title: "Action Failed",
        description: "Failed to update verification status.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const nextRequest = () => {
    if (currentIndex < requests.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAdminNotes('');
    }
  };

  const previousRequest = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setAdminNotes('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification requests...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-gray-600 mb-4">
              No pending verification requests to review.
            </p>
            <Button onClick={onBack}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentRequest = requests[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h1 className="text-xl font-bold">Quick Review</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {currentIndex + 1} of {requests.length}
            </Badge>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousRequest}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextRequest}
                disabled={currentIndex === requests.length - 1}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / requests.length) * 100}%` }}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={currentRequest.profiles?.avatar_url} />
                  <AvatarFallback>
                    {currentRequest.profiles?.first_name?.[0]}{currentRequest.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{currentRequest.profiles?.display_name}</h3>
                  <p className="text-sm text-gray-600">
                    Age: {currentRequest.profiles?.age}
                  </p>
                  <p className="text-sm text-gray-600">
                    {currentRequest.profiles?.location}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Submitted</span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(currentRequest.created_at).toLocaleDateString()} at{' '}
                  {new Date(currentRequest.created_at).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <Badge className="bg-amber-100 text-amber-800">
                  Pending Review
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Verification Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Document */}
                {currentRequest.id_document_url && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium">ID Document</h4>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={`${supabase.storage.from('verification-documents').getPublicUrl(currentRequest.id_document_url).data.publicUrl}`}
                        alt="ID Document"
                        className="w-full h-64 object-contain bg-gray-50"
                      />
                    </div>
                  </div>
                )}

                {/* Face Photo */}
                {currentRequest.face_photo_url && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Camera className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium">Face Verification</h4>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={`${supabase.storage.from('verification-documents').getPublicUrl(currentRequest.face_photo_url).data.publicUrl}`}
                        alt="Face Photo"
                        className="w-full h-64 object-contain bg-gray-50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* User Notes */}
              {currentRequest.notes && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">User Notes</h4>
                  <p className="text-sm text-gray-700">{currentRequest.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Panel */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Review Decision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-notes">Admin Notes (optional)</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this verification decision..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => handleVerificationAction('approve')}
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {processing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve Verification
                </Button>

                <Button
                  onClick={() => handleVerificationAction('reject')}
                  disabled={processing}
                  variant="destructive"
                  className="flex-1"
                >
                  {processing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Reject Verification
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Keyboard shortcuts: <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">A</kbd> to approve, 
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs ml-1">R</kbd> to reject,
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs ml-1">→</kbd> for next
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuickReview;