import { Heart, MapPin } from "lucide-react";
import { useState } from "react";

interface ProfileCardProps {
  id: string;
  name: string;
  age: number;
  distance: string;
  image: string;
  isLiked?: boolean;
  onLike?: (id: string) => void;
  onClick?: (id: string) => void;
}

const ProfileCard = ({ 
  id, 
  name, 
  age, 
  distance, 
  image, 
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
      className="relative bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105"
      onClick={() => onClick?.(id)}
    >
      {/* Profile Image */}
      <div className="aspect-[3/4] bg-gray-200 relative overflow-hidden">
        <img 
          src={image} 
          alt={`${name}'s profile`}
          className="w-full h-full object-cover"
        />
        
        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
            liked 
              ? "bg-primary text-white" 
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
        </button>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-20" />
        
        {/* Profile Info */}
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-semibold text-lg leading-tight">
            {name}, {age}
          </h3>
          <div className="flex items-center mt-1 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{distance}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;