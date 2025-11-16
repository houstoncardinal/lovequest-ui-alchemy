import { Heart, MapPin, Shield } from "lucide-react";
import { useState } from "react";
import ProfileBadge from "./ProfileBadge";

interface ProfileCardProps {
  id: string;
  name: string;
  age: number;
  distance?: string;
  location?: string;
  bio?: string;
  image: string;
  verified?: boolean;
  matchScore?: number;
  badges?: string[];
  smokingStatus?: string;
  maritalStatus?: string;
  hasChildren?: boolean;
  childrenPreference?: string;
  isLiked?: boolean;
  onLike?: (id: string) => void;
  onClick?: (id: string) => void;
}

const ProfileCard = ({ 
  id, 
  name, 
  age, 
  distance,
  location, 
  bio,
  image,
  verified = false,
  matchScore,
  badges = [],
  smokingStatus,
  maritalStatus,
  hasChildren,
  childrenPreference,
  isLiked = false,
  onLike,
  onClick 
}: ProfileCardProps) => {
  const [liked, setLiked] = useState(isLiked);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    onLike?.(id);
  };

  return (
    <div 
      className="relative bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105 touch-manipulation"
      onClick={() => onClick?.(id)}
    >
      {/* Profile Image */}
      <div className="aspect-[3/4] bg-gray-200 relative overflow-hidden">
        <img 
          src={image} 
          alt={`${name}'s profile`}
          className="w-full h-full object-cover"
        />
        
        {/* Verification Badge */}
        {verified && (
          <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1.5 shadow-lg">
            <Shield className="h-3 w-3 text-white" />
          </div>
        )}

        {/* Match Score */}
        {matchScore && (
          <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            {matchScore}% Match
          </div>
        )}
        
        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 touch-manipulation ${
            liked 
              ? "bg-primary text-white" 
              : "bg-white text-gray-600 hover:bg-gray-50 active:bg-gray-100"
          }`}
        >
          <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
        </button>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-32" />
        
        {/* Profile Info */}
        <div className="absolute bottom-4 left-4 right-20 text-white">
          <h3 className="font-semibold text-lg leading-tight mb-1">
            {name}, {age}
          </h3>
          <div className="flex items-center mb-2 text-sm">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{distance || location}</span>
          </div>
          
          {/* Profile Badges */}
          <div className="flex flex-wrap gap-1 mt-2">
            {maritalStatus && (
              <ProfileBadge type="marital_status" value={maritalStatus} compact />
            )}
            {smokingStatus && (
              <ProfileBadge type="smoking_status" value={smokingStatus} compact />
            )}
            {hasChildren !== undefined && (
              <ProfileBadge type="children_status" value={hasChildren} compact />
            )}
            {verified && (
              <ProfileBadge type="verification" value={verified} compact />
            )}
          </div>
          
          {/* Bio Preview */}
          {bio && (
            <p className="text-xs text-gray-200 mt-2 line-clamp-2 leading-relaxed">
              {bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;