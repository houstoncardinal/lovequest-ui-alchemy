interface InterestTagProps {
  icon?: string;
  label: string;
  variant?: 'default' | 'highlighted' | 'negative';
}

const InterestTag = ({ icon, label, variant = 'default' }: InterestTagProps) => {
  const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200";
  
  const variantClasses = {
    default: "bg-gray-100 text-gray-700",
    highlighted: "bg-primary/10 text-primary border border-primary/20",
    negative: "bg-red-50 text-red-600 border border-red-200"
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`}>
      {icon && <span className="mr-1.5">{icon}</span>}
      {label}
    </span>
  );
};

export default InterestTag;