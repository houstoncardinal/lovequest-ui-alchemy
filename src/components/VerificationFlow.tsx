import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setCameraActive(true);
    } catch {
      toast({ title: "Camera Access Required", description: "Please allow camera access.", variant: "destructive" });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
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
        setFacePhoto(canvas.toDataURL('image/jpeg', 0.8));
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File Type", variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File Too Large", description: "Max 5MB.", variant: "destructive" });
        return;
      }
      setIdDocument(file);
    }
  };

  const submitVerification = async () => {
    if (!user || !idDocument || !facePhoto) {
      toast({ title: "Missing Requirements", description: "Please upload ID and take a face photo.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      // Upload ID doc
      const idExt = idDocument.name.split('.').pop();
      const idPath = `${user.id}/id-${Date.now()}.${idExt}`;
      await supabase.storage.from('user-photos').upload(idPath, idDocument);

      // Upload face photo
      const faceBlob = await (await fetch(facePhoto)).blob();
      const facePath = `${user.id}/face-${Date.now()}.jpg`;
      await supabase.storage.from('user-photos').upload(facePath, faceBlob);

      // Mark profile as pending verification
      await supabase.from('profiles').update({ is_verified: false }).eq('user_id', user.id);

      setStep('complete');
      toast({ title: "Verification Submitted", description: "You'll be notified once approved." });
    } catch (error) {
      console.error('Verification error:', error);
      toast({ title: "Upload Failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  React.useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  if (step === 'complete') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" /> Verification Submitted
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Your verification has been submitted for review. Typically 24-48 hours.</p>
          <Button onClick={onComplete} className="w-full">Continue to App</Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'face') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2"><Camera className="w-5 h-5" /> Face Verification</CardTitle>
          <p className="text-sm text-muted-foreground">Take a selfie to verify your identity</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-muted aspect-square">
            {facePhoto ? (
              <img src={facePhoto} alt="Captured selfie" className="w-full h-full object-cover" />
            ) : (
              <>
                <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`} />
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          {!cameraActive && !facePhoto && <Button onClick={startCamera} className="w-full"><Camera className="w-4 h-4 mr-2" /> Start Camera</Button>}
          {cameraActive && !facePhoto && (
            <>
              <Button onClick={capturePhoto} className="w-full">Capture Photo</Button>
              <Button onClick={stopCamera} variant="outline" className="w-full">Cancel</Button>
            </>
          )}
          {facePhoto && (
            <>
              <Button onClick={submitVerification} className="w-full" disabled={isUploading}>
                {isUploading ? 'Submitting...' : 'Submit Verification'}
              </Button>
              <Button onClick={() => { setFacePhoto(null); startCamera(); }} variant="outline" className="w-full" disabled={isUploading}>Retake</Button>
            </>
          )}
          <Button onClick={() => setStep('id')} variant="ghost" className="w-full" disabled={isUploading}>Back</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2"><Upload className="w-5 h-5" /> Upload ID Document</CardTitle>
        <p className="text-sm text-muted-foreground">Upload a clear photo of your government-issued ID</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          {idDocument ? (
            <div className="space-y-2">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-sm font-medium">{idDocument.name}</p>
              <p className="text-xs text-muted-foreground">{(idDocument.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium">Click to upload your ID</p>
              <p className="text-xs text-muted-foreground">Passport, Driver's License, or National ID</p>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleIdUpload} className="hidden" />
        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full" disabled={isUploading}>
          {idDocument ? 'Change Document' : 'Select Document'}
        </Button>
        <Button onClick={() => setStep('face')} className="w-full" disabled={!idDocument || isUploading}>
          Continue to Face Verification <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default VerificationFlow;
