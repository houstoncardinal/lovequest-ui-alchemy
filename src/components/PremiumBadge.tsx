import { Badge } from '@/components/ui/badge';
import { Crown, Star, Gem } from 'lucide-react';

interface PremiumBadgeProps {
  plan: 'basic' | 'premium' | 'platinum';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const PremiumBadge = ({ plan, size = 'sm', showIcon = true }: PremiumBadgeProps) => {
  const getConfig = () => {
    switch (plan) {
      case 'platinum':
        return {
          icon: Gem,
          label: 'Platinum',
          variant: 'default' as const,
          className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0'
        };
      case 'premium':
        return {
          icon: Crown,
          label: 'Premium',
          variant: 'default' as const,
          className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0'
        };
      default:
        return {
          icon: Star,
          label: 'Basic',
          variant: 'secondary' as const,
          className: ''
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (plan === 'basic') return null;

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} flex items-center gap-1`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
};

export default PremiumBadge;