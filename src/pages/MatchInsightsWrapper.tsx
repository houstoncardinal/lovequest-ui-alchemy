import { useParams, useNavigate } from 'react-router-dom';
import MatchInsights from './MatchInsights';

const MatchInsightsWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (!id) {
    // If no ID provided, redirect back
    handleBack();
    return null;
  }

  return <MatchInsights matchId={id} onBack={handleBack} />;
};

export default MatchInsightsWrapper;