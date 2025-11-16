import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MapPin, 
  GraduationCap, 
  Users, 
  Calendar,
  Star,
  BookOpen,
  Home
} from 'lucide-react';

interface CompatibilityScoreProps {
  score: number;
  breakdown: {
    religious: number;
    location: number;
    age: number;
    education: number;
    family: number;
    lifestyle: number;
  };
  insights: string[];
}

const CompatibilityScore = ({ score, breakdown, insights }: CompatibilityScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const categories = [
    { key: 'religious', label: 'Religious Compatibility', icon: BookOpen, score: breakdown.religious },
    { key: 'location', label: 'Location Match', icon: MapPin, score: breakdown.location },
    { key: 'age', label: 'Age Compatibility', icon: Calendar, score: breakdown.age },
    { key: 'education', label: 'Education Level', icon: GraduationCap, score: breakdown.education },
    { key: 'family', label: 'Family Values', icon: Home, score: breakdown.family },
    { key: 'lifestyle', label: 'Lifestyle Match', icon: Users, score: breakdown.lifestyle },
  ];

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(score)} mb-2`}>
            {score}%
          </div>
          <Badge variant="secondary" className={`${getScoreBg(score)} ${getScoreColor(score)}`}>
            {score >= 80 ? 'Excellent Match' : score >= 60 ? 'Good Match' : 'Moderate Match'}
          </Badge>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground mb-3">Compatibility Breakdown</h4>
          {categories.map((category) => (
            <div key={category.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{category.label}</span>
                </div>
                <span className={`text-sm font-semibold ${getScoreColor(category.score)}`}>
                  {category.score}%
                </span>
              </div>
              <Progress 
                value={category.score} 
                className="h-2"
              />
            </div>
          ))}
        </div>

        {/* Key Insights */}
        {insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Key Compatibility Points
            </h4>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompatibilityScore;