import { RotateCcw, SlidersHorizontal } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showFilterButton?: boolean;
  showRefreshButton?: boolean;
  onBack?: () => void;
  onFilter?: () => void;
  onRefresh?: () => void;
}

const Header = ({ 
  title, 
  subtitle, 
  showBackButton = false, 
  showFilterButton = true,
  showRefreshButton = false,
  onBack,
  onFilter,
  onRefresh
}: HeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
      <div className="flex items-center">
        {showBackButton && (
          <button onClick={onBack} className="mr-3 p-2">
            <RotateCcw className="w-6 h-6" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {showRefreshButton && (
          <button onClick={onRefresh} className="p-2">
            <RotateCcw className="w-6 h-6 text-gray-600" />
          </button>
        )}
        {showFilterButton && (
          <button onClick={onFilter} className="p-2">
            <SlidersHorizontal className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;