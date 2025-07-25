import React, { useRef, useEffect, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userImage: string;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ 
  isOpen, 
  onClose, 
  userName, 
  userImage 
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      initializeCall();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isOpen]);

  const initializeCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Simulate call connection
      setTimeout(() => {
        setCallStatus('connected');
        // In a real app, you'd establish WebRTC connection here
        simulateRemoteVideo();
      }, 2000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access camera/microphone. Please check permissions.",
        variant: "destructive",
      });
      onClose();
    }
  };

  const simulateRemoteVideo = () => {
    // In a real implementation, this would be the remote peer's video stream
    // For demo purposes, we'll show a placeholder
    if (remoteVideoRef.current) {
      // Create a canvas element to simulate remote video
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw a simple pattern
        const gradient = ctx.createLinearGradient(0, 0, 640, 480);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#059669');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 640, 480);
        
        // Add text
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Simulated Remote Video', 320, 240);
      }
      
      const stream = canvas.captureStream(30);
      remoteVideoRef.current.srcObject = stream;
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setCallStatus('ended');
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    cleanup();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-4xl max-h-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Call status indicator */}
        <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 rounded-full px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              callStatus === 'connecting' ? 'bg-yellow-500' :
              callStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-white text-sm font-medium">
              {callStatus === 'connecting' ? 'Connecting...' :
               callStatus === 'connected' ? 'Connected' : 'Call Ended'}
            </span>
          </div>
        </div>

        {/* Remote video (main view) */}
        <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
          {callStatus === 'connected' ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <img
                src={userImage}
                alt={userName}
                className="w-32 h-32 rounded-full object-cover mb-4 ring-4 ring-white"
              />
              <h3 className="text-white text-xl font-semibold mb-2">{userName}</h3>
              <p className="text-gray-300">
                {callStatus === 'connecting' ? 'Calling...' : 'Call ended'}
              </p>
            </div>
          )}

          {/* Local video (picture-in-picture) */}
          <div className="absolute bottom-20 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            {isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <VideoOff className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Call controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center justify-center space-x-6">
            {/* Audio toggle */}
            <button
              onClick={toggleAudio}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isAudioEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            {/* End call */}
            <button
              onClick={endCall}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <PhoneOff className="w-8 h-8" />
            </button>

            {/* Video toggle */}
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isVideoEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;