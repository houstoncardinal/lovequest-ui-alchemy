import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface VoiceMessageProps {
  audioBlob: Blob;
  duration: number;
  isOwnMessage: boolean;
  time: string;
}

const VoiceMessage: React.FC<VoiceMessageProps> = ({ 
  audioBlob, 
  duration, 
  isOwnMessage, 
  time 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    if (!audioRef.current) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(url);
      
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
          URL.revokeObjectURL(audioRef.current.src);
          audioRef.current = null;
        }
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
        isOwnMessage
          ? 'bg-gradient-to-br from-primary/50 to-primary text-white rounded-br-md'
          : 'bg-white border border-primary/10 text-gray-900 rounded-bl-md'
      }`}
    >
      <div className="flex items-center space-x-3">
        <button
          onClick={togglePlayback}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isOwnMessage
              ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'
              : 'bg-primary/10 hover:bg-primary/15 text-primary'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className={`flex-1 h-1 rounded-full overflow-hidden ${
              isOwnMessage ? 'bg-white bg-opacity-20' : 'bg-gray-200'
            }`}>
              <div
                className={`h-full transition-all duration-100 ${
                  isOwnMessage ? 'bg-white' : 'bg-primary/50'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${
              isOwnMessage ? 'text-white text-opacity-80' : 'text-gray-600'
            }`}>
              {formatTime(isPlaying ? currentTime : duration)}
            </span>
          </div>
        </div>
      </div>

      <p className={`text-xs mt-2 ${
        isOwnMessage ? 'text-white/70' : 'text-gray-500'
      }`}>
        {time}
      </p>
    </div>
  );
};

export default VoiceMessage;