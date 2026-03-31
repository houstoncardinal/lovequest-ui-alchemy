import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, ArrowLeft, ArrowRight, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface QuickReviewProps {
  onBack: () => void;
}

const QuickReview: React.FC<QuickReviewProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [adminNotes, setAdminNotes] = useState('');

  // Placeholder — verification_requests table not yet created
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h2 className="text-lg font-semibold">Quick Review</h2>
      </div>

      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No Pending Reviews</p>
          <p className="text-sm">Verification requests will appear here once the verification system is fully connected.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickReview;
