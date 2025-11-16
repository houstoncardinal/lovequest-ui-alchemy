// ✅ MIGRATED TO FIREBASE - Terminal 1 - 2025-01-15
import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { db, doc, setDoc, collection, storage, ref as storageRef, uploadBytes, getDownloadURL } from '@/integrations/firebase';
import { useToast } from '@/hooks/use-toast';

interface VerificationFlowProps {
  onComplete: () => void;
}

const VerificationFlow: React.FC<VerificationFlowProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'id' | 'face' | 'complete'>('id');
  const [isUploading, setIsUploading] = useState(false);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [facePhoto, setFacePhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (error) {
      toast({
        title: "Camera Access Required",
        description: "Please allow camera access for face verification.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setFacePhoto(photoData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setIdDocument(file);
    }
  };

  const uploadToFirebase = async (file: File | Blob, fileName: string, type: 'id' | 'face') => {
    if (!user) throw new Error('User not authenticated');

    const fileRef = storageRef(storage, `verification-documents/${user.uid}/${type}-${fileName}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return url;
  };

  const submitVerification = async () => {
    if (!user || !idDocument || !facePhoto) {
      toast({
        title: "Missing Requirements",
        description: "Please upload both ID document and take a face photo.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload ID document
      const idUrl = await uploadToFirebase(
        idDocument,
        `${Date.now()}.${idDocument.name.split('.').pop()}`,
        'id'
      );

      // Convert face photo to blob and upload
      const response = await fetch(facePhoto);
      const faceBlob = await response.blob();
      const faceUrl = await uploadToFirebase(
        faceBlob,
        `${Date.now()}.jpg`,
        'face'
      );

      // Create verification request
      const verificationRef = doc(collection(db, 'verificationRequests'));
      await setDoc(verificationRef, {
        userId: user.uid,
        verificationType: 'identity',
        status: 'pending',
        idDocumentUrl: idUrl,
        facePhotoUrl: faceUrl,
        notes: 'ID and face verification submitted for review',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Update profile to show verification is pending
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        verificationRequired: true,
        canAccessApp: true, // Allow limited access while verification is pending
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setStep('complete');
      toast({
        title: "Verification Submitted",
        description: "Your verification has been submitted for review. You'll be notified once approved.",
      });

    } catch (error) {
      console.error('Verification upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const renderIdStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Upload className="w-5 h-5" />
          Upload ID Document
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Please upload a clear photo of your government-issued ID
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          {idDocument ? (
            <div className="space-y-2">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-sm font-medium">{idDocument.name}</p>
              <p className="text-xs text-muted-foreground">
                {(idDocument.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <p className="text-sm font-medium">Click to upload your ID</p>
                <p className="text-xs text-muted-foreground">
                  Passport, Driver's License, or National ID
                </p>
              </div>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleIdUpload}
          className="hidden"
        />
        
        <Button 
          onClick={() => fileInputRef.current?.click()}
          variant="outline" 
          className="w-full"
          disabled={isUploading}
        >
          {idDocument ? 'Change Document' : 'Select Document'}
        </Button>

        <Button 
          onClick={() => setStep('face')}
          className="w-full"
          disabled={!idDocument || isUploading}
        >
          Continue to Face Verification
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderFaceStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Camera className="w-5 h-5" />
          Face Verification
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Take a selfie to verify your identity
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative rounded-lg overflow-hidden bg-muted aspect-square">
          {facePhoto ? (
            <img 
              src={facePhoto} 
              alt="Captured selfie" 
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
              />
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Camera preview</p>
                  </div>
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="space-y-2">
          {!cameraActive && !facePhoto && (
            <Button onClick={startCamera} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          )}
          
          {cameraActive && !facePhoto && (
            <div className="space-y-2">
              <Button onClick={capturePhoto} className="w-full">
                Capture Photo
              </Button>
              <Button onClick={stopCamera} variant="outline" className="w-full">
                Cancel
              </Button>
            </div>
          )}
          
          {facePhoto && (
            <div className="space-y-2">
              <Button onClick={submitVerification} className="w-full" disabled={isUploading}>
                {isUploading ? 'Submitting...' : 'Submit Verification'}
              </Button>
              <Button 
                onClick={() => {
                  setFacePhoto(null);
                  startCamera();
                }} 
                variant="outline" 
                className="w-full"
                disabled={isUploading}
              >
                Retake Photo
              </Button>
            </div>
          )}
        </div>

        <Button 
          onClick={() => setStep('id')}
          variant="ghost" 
          className="w-full"
          disabled={isUploading}
        >
          Back to ID Upload
        </Button>
      </CardContent>
    </Card>
  );

  const renderCompleteStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          Verification Submitted
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Your identity verification has been submitted for review.
          </p>
          <p className="text-sm text-muted-foreground">
            You'll receive a notification once your verification is approved, typically within 24-48 hours.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-left">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                Limited Access
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Until verified, you can view profiles but cannot send messages or create matches.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={onComplete} className="w-full">
          Continue to App
        </Button>
      </CardContent>
    </Card>
  );

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  switch (step) {
    case 'id':
      return renderIdStep();
    case 'face':
      return renderFaceStep();
    case 'complete':
      return renderCompleteStep();
    default:
      return renderIdStep();
  }
};

export default VerificationFlow;