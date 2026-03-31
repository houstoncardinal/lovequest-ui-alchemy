import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import VerificationStatus from '@/components/VerificationStatus';
import VerificationFlow from '@/components/VerificationFlow';
import { 
  Shield, 
  Camera, 
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Award,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VerificationRequest {
  id: string;
  verification_type: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  admin_notes?: string;
  id_document_url?: string;
  face_photo_url?: string;
  created_at: string;
  updated_at: string;
}

interface Profile {
  is_verified: boolean | null;
}

const Verification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerificationFlow, setShowVerificationFlow] = useState(false);

  useEffect(() => {
    if (user) {
      loadVerificationData();
    }
  }, [user]);

  const loadVerificationData = async () => {
    try {
      // Verification requests table not yet created — use profile is_verified
      setVerificationRequest(null);

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('user_id', user?.id ?? '')
        .single();

      if (profileError) throw profileError;
      setProfile(profileData as Profile);

    } catch (error) {
      console.error('Error loading verification data:', error);
      toast({
        title: "Load Error",
        description: "Failed to load verification status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    setShowVerificationFlow(false);
    loadVerificationData();
    toast({
      title: "Verification Submitted",
      description: "Your verification has been submitted for review.",
    });
  };

  const getVerificationStatus = () => {
    if (!verificationRequest) return 'none';
    return verificationRequest.status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Verified';
      case 'pending':
        return 'Under Review';
      case 'rejected':
        return 'Verification Failed';
      default:
        return 'Not Verified';
    }
  };

  const getProgressPercentage = () => {
    const status = getVerificationStatus();
    if (status === 'approved') return 100;
    if (status === 'pending') return 75;
    if (status === 'rejected') return 25;
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading verification status...</p>
        </div>
      </div>
    );
  }

  if (showVerificationFlow) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowVerificationFlow(false)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Verification
            </Button>
          </div>
          
          <VerificationFlow onComplete={handleVerificationComplete} />
        </div>
      </div>
    );
  }

  const status = getVerificationStatus();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Identity Verification</h1>
          </div>
          <p className="text-muted-foreground">
            Verify your identity to access all app features and build trust with other users
          </p>
        </div>

        {/* Current Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Verification Status</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status)}
                <span className="text-sm font-medium">{getStatusText(status)}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={getProgressPercentage()} className="h-3 mb-4" />
            
            {/* Access Status */}
            <div className={`p-4 rounded-lg border ${
              profile?.is_verified 
                ? 'bg-green-50 border-green-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-start gap-2">
                {profile?.is_verified ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${
                    profile?.is_verified ? 'text-green-800' : 'text-amber-800'
                  }`}>
                    {profile?.is_verified ? 'Full Access Granted' : 'Limited Access'}
                  </p>
                  <p className={`text-sm ${
                    profile?.is_verified ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {profile?.is_verified 
                      ? 'You can access all app features including messaging and matching.'
                      : 'You can browse profiles but cannot send messages until verified.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Verification Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Camera className="h-6 w-6 text-primary" />
              <span>Identity Verification</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Complete our secure identity verification process by uploading your government-issued ID and taking a verification selfie.
            </p>
            
            {/* Requirements */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">What you'll need:</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Government-issued ID
                  </h5>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                    <li>• Passport</li>
                    <li>• Driver's License</li>
                    <li>• National ID Card</li>
                    <li>• State ID</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium flex items-center gap-2">
                    <Camera className="w-4 h-4 text-green-600" />
                    Verification Selfie
                  </h5>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                    <li>• Clear photo of your face</li>
                    <li>• Good lighting</li>
                    <li>• Look directly at camera</li>
                    <li>• No filters or editing</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Status-based content */}
            {status === 'none' && (
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-4">
                  <Shield className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-900 mb-2">Ready to Get Verified?</h3>
                  <p className="text-sm text-blue-700">
                    The verification process takes just 2-3 minutes and helps keep our community safe.
                  </p>
                </div>
                <Button 
                  onClick={() => setShowVerificationFlow(true)}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start Verification Process
                </Button>
              </div>
            )}

            {status === 'pending' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-6 w-6 text-amber-600" />
                  <h3 className="font-semibold text-amber-800">Verification Under Review</h3>
                </div>
                <p className="text-amber-700 mb-4">
                  We're reviewing your submitted documents. This typically takes 24-48 hours. You'll receive a notification once the review is complete.
                </p>
                {verificationRequest && (
                  <div className="bg-white rounded border p-3">
                    <p className="text-xs text-amber-600">
                      Submitted on {new Date(verificationRequest.created_at).toLocaleDateString()} at {new Date(verificationRequest.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {status === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="font-semibold text-green-800">Verification Approved!</h3>
                </div>
                <p className="text-green-700 mb-4">
                  Congratulations! Your identity has been successfully verified. You now have full access to all app features.
                </p>
                <div className="bg-white rounded border p-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Verified Member</span>
                  </div>
                </div>
              </div>
            )}

            {status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <h3 className="font-semibold text-red-800">Verification Not Approved</h3>
                </div>
                <p className="text-red-700 mb-4">
                  Unfortunately, we couldn't verify your identity with the submitted documents. Please review the requirements and try again.
                </p>
                
                {verificationRequest?.admin_notes && (
                  <div className="bg-white rounded border p-4 mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Review Notes:</p>
                    <p className="text-sm text-red-800">{verificationRequest.admin_notes}</p>
                  </div>
                )}

                <Button 
                  onClick={() => setShowVerificationFlow(true)}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Try Verification Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verification Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Increased Trust</h4>
                <p className="text-sm text-muted-foreground">Show potential matches you're genuine and serious</p>
              </div>
              <div className="text-center p-4">
                <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Enhanced Safety</h4>
                <p className="text-sm text-muted-foreground">Connect with confidence in a secure environment</p>
              </div>
              <div className="text-center p-4">
                <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Full Access</h4>
                <p className="text-sm text-muted-foreground">Unlock messaging, matching, and all app features</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Having trouble with verification? Our support team is here to help with any questions or issues.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/help-support')}>
                  Contact Support
                </Button>
                <Button variant="outline" size="sm">
                  Verification FAQ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verification;