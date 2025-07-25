import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Users, 
  Cigarette, 
  Baby,
  Ban,
  CheckCircle,
  Info
} from 'lucide-react';

interface ProfileBadgeProps {
  type: 'marital_status' | 'smoking_status' | 'children_status' | 'verification' | 'premium';
  value: string | boolean;
  compact?: boolean;
}

const ProfileBadge = ({ type, value, compact = false }: ProfileBadgeProps) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'marital_status':
        const maritalConfigs = {
          never_married: { label: 'Never Married', variant: 'secondary' as const, icon: Heart },
          divorced: { label: 'Divorced', variant: 'outline' as const, icon: Users },
          widowed: { label: 'Widowed', variant: 'outline' as const, icon: Heart },
          separated: { label: 'Separated', variant: 'outline' as const, icon: Users }
        };
        return maritalConfigs[value as keyof typeof maritalConfigs] || null;

      case 'smoking_status':
        const smokingConfigs = {
          never: { label: 'Non-Smoker', variant: 'default' as const, icon: Ban, color: 'text-green-700 bg-green-100' },
          occasionally: { label: 'Occasional', variant: 'secondary' as const, icon: Cigarette, color: 'text-yellow-700 bg-yellow-100' },
          socially: { label: 'Social Smoker', variant: 'secondary' as const, icon: Cigarette, color: 'text-orange-700 bg-orange-100' },
          regularly: { label: 'Smoker', variant: 'destructive' as const, icon: Cigarette, color: 'text-red-700 bg-red-100' },
          prefer_not_to_say: { label: 'Private', variant: 'outline' as const, icon: Info }
        };
        return smokingConfigs[value as keyof typeof smokingConfigs] || null;

      case 'children_status':
        if (typeof value === 'boolean') {
          return value 
            ? { label: 'Has Children', variant: 'secondary' as const, icon: Baby, color: 'text-blue-700 bg-blue-100' }
            : { label: 'No Children', variant: 'outline' as const, icon: Users };
        }
        
        const childrenConfigs = {
          wants_children: { label: 'Wants Children', variant: 'default' as const, icon: Baby, color: 'text-green-700 bg-green-100' },
          doesnt_want_children: { label: 'No Children Wanted', variant: 'secondary' as const, icon: Ban },
          open_to_children: { label: 'Open to Children', variant: 'outline' as const, icon: Heart },
          already_has_enough: { label: 'Has Enough Children', variant: 'secondary' as const, icon: Baby },
          prefer_not_to_say: { label: 'Private', variant: 'outline' as const, icon: Info }
        };
        return childrenConfigs[value as keyof typeof childrenConfigs] || null;

      case 'verification':
        return value 
          ? { label: 'Verified', variant: 'default' as const, icon: CheckCircle, color: 'text-green-700 bg-green-100' }
          : null;

      default:
        return null;
    }
  };

  const config = getBadgeConfig();
  
  if (!config) return null;

  const Icon = config.icon;
  const sizeClass = compact ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  const iconSize = compact ? 'h-3 w-3' : 'h-4 w-4';
  const customColor = 'color' in config ? config.color : '';

  return (
    <Badge 
      variant={config.variant}
      className={`${customColor || ''} ${sizeClass} flex items-center gap-1 font-medium`}
    >
      <Icon className={iconSize} />
      {!compact && config.label}
    </Badge>
  );
};

export default ProfileBadge;