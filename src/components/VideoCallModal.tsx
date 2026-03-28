import React, { useRef, useEffect, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X, Volume2 } from 'lucide-react';
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
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      initializeCall();
      // Auto-hide controls after 3 seconds
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    } else {
      cleanup();
    }

    return cleanup;
  }, [isOpen]);

  useEffect(() => {
    if (callStatus === 'connected') {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [callStatus]);

  const initializeCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Simulate call connection with realistic timing
      setTimeout(() => {
        setCallStatus('connected');
        simulateRemoteVideo();
        
        toast({
          title: "Call connected",
          description: `Connected with ${userName}`,
        });
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
    if (remoteVideoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Create animated gradient background
        const animateFrame = () => {
          const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
          const time = Date.now() * 0.001;
          gradient.addColorStop(0, `hsl(${160 + Math.sin(time) * 20}, 70%, 50%)`);
          gradient.addColorStop(1, `hsl(${140 + Math.cos(time) * 20}, 60%, 40%)`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 1280, 720);
          
          // Add moving circles for visual effect
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          for (let i = 0; i < 5; i++) {
            const x = 640 + Math.sin(time + i) * 300;
            const y = 360 + Math.cos(time + i * 1.5) * 200;
            const radius = 50 + Math.sin(time * 2 + i) * 20;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // Add call info text
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 32px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${userName}`, 640, 300);
          
          ctx.font = '20px Arial';
          ctx.fillText('Connected via Video Call', 640, 340);
          
          ctx.font = '16px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillText('Simulated Remote Video Feed', 640, 400);
          
          requestAnimationFrame(animateFrame);
        };
        
        animateFrame();
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
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setCallStatus('ended');
    setCallDuration(0);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        toast({
          title: videoTrack.enabled ? "Camera enabled" : "Camera disabled",
          description: videoTrack.enabled ? "Your video is now visible" : "Your video is now hidden",
        });
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        toast({
          title: isAudioEnabled ? "Microphone muted" : "Microphone unmuted",
          description: isAudioEnabled ? "You are now muted" : "You can now speak",
        });
      }
    }
  };

  const endCall = () => {
    cleanup();
    toast({
      title: "Call ended",
      description: `Call with ${userName} has ended`,
    });
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleScreenTap = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div 
        className="relative w-full h-full"
        onClick={handleScreenTap}
      >
        {/* Status Bar */}
        <div className={`absolute top-0 left-0 right-0 z-20 transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
          <div className="bg-gradient-to-b from-black/80 to-transparent px-4 pt-12 pb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  callStatus === 'connecting' ? 'bg-yellow-400' :
                  callStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <div>
                  <p className="text-white font-semibold text-lg">{userName}</p>
                  <p className="text-white/80 text-sm">
                    {callStatus === 'connecting' ? 'Connecting...' :
                     callStatus === 'connected' ? `Connected • ${formatDuration(callDuration)}` : 'Call Ended'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Remote video (main view) */}
        <div className="relative w-full h-full bg-gray-900 overflow-hidden">
          {callStatus === 'connected' ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary/80">
              <div className="relative mb-8">
                <img
                  src={userImage}
                  alt={userName}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-white/30 shadow-2xl"
                />
                {callStatus === 'connecting' && (
                  <div className="absolute inset-0 rounded-full border-4 border-white/50 border-t-white animate-spin"></div>
                )}
              </div>
              
              <h3 className="text-white text-2xl sm:text-3xl font-bold mb-2">{userName}</h3>
              <p className="text-white/80 text-lg mb-8">
                {callStatus === 'connecting' ? 'Calling...' : 'Call ended'}
              </p>
              
              {callStatus === 'connecting' && (
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
          )}

          {/* Local video (picture-in-picture) */}
          <div className={`absolute top-20 right-4 w-24 h-32 sm:w-32 sm:h-40 bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 transition-all duration-300 ${
            showControls ? 'opacity-100' : 'opacity-70'
          }`}>
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
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Call controls */}
        <div className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
          <div className="bg-gradient-to-t from-black/90 to-transparent px-4 pb-8 pt-12">
            {/* Audio indicator */}
            {isAudioEnabled && callStatus === 'connected' && (
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-2 bg-primary/50/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Volume2 className="w-4 h-4 text-primary" />
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-4 bg-primary/80 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-6 sm:space-x-8">
              {/* Audio toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAudio();
                }}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                  isAudioEnabled
                    ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                }`}
              >
                {isAudioEnabled ? <Mic className="w-6 h-6 sm:w-7 sm:h-7" /> : <MicOff className="w-6 h-6 sm:w-7 sm:h-7" />}
              </button>

              {/* End call */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  endCall();
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95"
              >
                <PhoneOff className="w-8 h-8 sm:w-10 sm:h-10" />
              </button>

              {/* Video toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVideo();
                }}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                  isVideoEnabled
                    ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                }`}
              >
                {isVideoEnabled ? <Video className="w-6 h-6 sm:w-7 sm:h-7" /> : <VideoOff className="w-6 h-6 sm:w-7 sm:h-7" />}
              </button>
            </div>
            
            {/* Control hint */}
            <div className="flex justify-center mt-4">
              <p className="text-white/60 text-sm">Tap screen to show/hide controls</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;