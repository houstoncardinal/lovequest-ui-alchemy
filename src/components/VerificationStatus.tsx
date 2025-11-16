import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Shield, 
  GraduationCap, 
  Briefcase, 
  Camera,
  Clock,
  XCircle
} from 'lucide-react';

interface VerificationStatusProps {
  verificationType: 'photo' | 'education' | 'career' | 'background' | 'overall';
  status: 'none' | 'pending' | 'approved' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const VerificationStatus = ({ 
  verificationType, 
  status, 
  size = 'sm', 
  showLabel = true 
}: VerificationStatusProps) => {
  const getConfig = () => {
    const configs = {
      photo: { icon: Camera, label: 'Photo Verified' },
      education: { icon: GraduationCap, label: 'Education Verified' },
      career: { icon: Briefcase, label: 'Career Verified' },
      background: { icon: Shield, label: 'Background Verified' },
      overall: { icon: CheckCircle, label: 'Verified Profile' }
    };
    return configs[verificationType];
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-300',
          icon: CheckCircle
        };
      case 'pending':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: Clock
        };
      case 'rejected':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-300',
          icon: XCircle
        };
      default:
        return null;
    }
  };

  const config = getConfig();
  const statusConfig = getStatusConfig();

  if (!statusConfig || status === 'none') return null;

  const Icon = config.icon;
  const StatusIcon = statusConfig.icon;

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

  return (
    <Badge 
      variant={statusConfig.variant}
      className={`${statusConfig.className} ${sizeClasses[size]} flex items-center gap-1`}
    >
      {status === 'approved' ? (
        <Icon className={iconSizes[size]} />
      ) : (
        <StatusIcon className={iconSizes[size]} />
      )}
      {showLabel && (
        <span>
          {status === 'approved' && config.label}
          {status === 'pending' && 'Verification Pending'}
          {status === 'rejected' && 'Verification Failed'}
        </span>
      )}
    </Badge>
  );
};

export default VerificationStatus;