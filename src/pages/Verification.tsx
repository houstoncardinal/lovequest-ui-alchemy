import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import VerificationStatus from '@/components/VerificationStatus';
import PremiumBadge from '@/components/PremiumBadge';
import { 
  Shield, 
  Camera, 
  GraduationCap, 
  Briefcase, 
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  FileText,
  Award
} from 'lucide-react';

interface VerificationRequest {
  id: string;
  verification_type: 'photo' | 'education' | 'career' | 'background';
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
}

const Verification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchVerificationRequests();
    }
  }, [user]);

  const fetchVerificationRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data as any || []);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitVerificationRequest = async (type: 'photo' | 'education' | 'career' | 'background', documents: any) => {
    setUploading(type);
    try {
      const { error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user?.id,
          verification_type: type,
          documents: documents,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Verification Request Submitted",
        description: `Your ${type} verification request has been submitted for review`,
      });

      fetchVerificationRequests();
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your verification request",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const getVerificationStatus = (type: string) => {
    const request = requests.find(r => r.verification_type === type);
    return request?.status || 'none';
  };

  const getCompletionPercentage = () => {
    const types = ['photo', 'education', 'career', 'background'];
    const completed = types.filter(type => getVerificationStatus(type) === 'approved').length;
    return (completed / types.length) * 100;
  };

  const verificationTypes = [
    {
      type: 'photo' as const,
      title: 'Photo Verification',
      description: 'Verify your identity with a selfie holding your ID',
      icon: Camera,
      requirements: [
        'Clear photo of yourself',
        'Hold a government-issued ID',
        'Both face and ID must be visible',
        'Good lighting and resolution'
      ]
    },
    {
      type: 'education' as const,
      title: 'Education Verification',
      description: 'Verify your educational background',
      icon: GraduationCap,
      requirements: [
        'Diploma or degree certificate',
        'Official transcript',
        'University verification letter',
        'Clear, readable documents'
      ]
    },
    {
      type: 'career' as const,
      title: 'Career Verification',
      description: 'Verify your professional background',
      icon: Briefcase,
      requirements: [
        'Employment verification letter',
        'Professional license',
        'LinkedIn profile verification',
        'Salary or position confirmation'
      ]
    },
    {
      type: 'background' as const,
      title: 'Background Check',
      description: 'Comprehensive background verification',
      icon: Shield,
      requirements: [
        'Criminal background check',
        'Reference verification',
        'Address confirmation',
        'Character references'
      ]
    }
  ];

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Profile Verification</h1>
            <PremiumBadge plan="platinum" />
          </div>
          <p className="text-muted-foreground">
            Build trust with verified credentials and enhanced profile security
          </p>
        </div>

        {/* Verification Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Verification Progress</span>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium">{Math.round(getCompletionPercentage())}% Complete</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={getCompletionPercentage()} className="h-3 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {verificationTypes.map((type) => (
                <div key={type.type} className="text-center">
                  <VerificationStatus 
                    verificationType={type.type}
                    status={getVerificationStatus(type.type) as any}
                    showLabel={false}
                    size="lg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{type.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Verification Benefits */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verification Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Increased Trust</h4>
                <p className="text-sm text-muted-foreground">Show potential matches you're genuine</p>
              </div>
              <div className="text-center p-4">
                <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Enhanced Safety</h4>
                <p className="text-sm text-muted-foreground">Connect with other verified users</p>
              </div>
              <div className="text-center p-4">
                <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Priority Matching</h4>
                <p className="text-sm text-muted-foreground">Get featured in search results</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Types */}
        <div className="space-y-6">
          {verificationTypes.map((verificationType) => {
            const status = getVerificationStatus(verificationType.type);
            const request = requests.find(r => r.verification_type === verificationType.type);
            
            return (
              <Card key={verificationType.type}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <verificationType.icon className="h-6 w-6 text-primary" />
                      <span>{verificationType.title}</span>
                    </div>
                    <VerificationStatus 
                      verificationType={verificationType.type}
                      status={status as any}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{verificationType.description}</p>
                  
                  {/* Requirements */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Requirements:</h4>
                    <ul className="space-y-1">
                      {verificationType.requirements.map((req, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Status-based content */}
                  {status === 'none' && (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Upload your documents for {verificationType.title.toLowerCase()}
                        </p>
                        <Button 
                          onClick={() => submitVerificationRequest(verificationType.type, {})}
                          disabled={uploading === verificationType.type}
                        >
                          {uploading === verificationType.type ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Start Verification
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {status === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Under Review</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Your verification request is being reviewed. This typically takes 2-3 business days.
                      </p>
                      {request && (
                        <p className="text-xs text-yellow-600 mt-2">
                          Submitted on {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {status === 'approved' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Verified</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Your {verificationType.title.toLowerCase()} has been successfully verified!
                      </p>
                    </div>
                  )}

                  {status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-800">Verification Failed</span>
                      </div>
                      <p className="text-sm text-red-700 mb-3">
                        Your verification request was not approved. Please check the requirements and try again.
                      </p>
                      {request?.notes && (
                        <div className="bg-white rounded border p-3 mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Review Notes:</p>
                          <p className="text-sm">{request.notes}</p>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => submitVerificationRequest(verificationType.type, {})}
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Help Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Having trouble with verification? Our support team is here to help:
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
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