import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Crown, Star, Zap, Heart, MessageCircle, Video, Users, Shield, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "Free",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "5 likes per day",
        "Basic matching",
        "View profiles",
        "Standard support"
      ],
      limitations: [
        "No messaging without match",
        "Limited daily likes",
        "No premium features"
      ],
      color: "border-gray-200",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      popular: false
    },
    {
      id: "premium",
      name: "Premium",
      price: "$19.99",
      period: "per month",
      description: "Most popular choice",
      features: [
        "Unlimited likes",
        "See who liked you",
        "Advanced filters",
        "Priority support",
        "Message anyone (with paid message)",
        "Read receipts",
        "Profile boost"
      ],
      limitations: [
        "No video calls",
        "Limited paid messages"
      ],
      color: "border-emerald-200",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      popular: true
    },
    {
      id: "elite",
      name: "Elite",
      price: "$39.99",
      period: "per month",
      description: "Ultimate dating experience",
      features: [
        "Everything in Premium",
        "Unlimited paid messages",
        "Video calls",
        "Profile verification",
        "Advanced analytics",
        "VIP support",
        "Concierge matching"
      ],
      limitations: [],
      color: "border-amber-200",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      popular: false
    }
  ];

  const onboardingSteps = [
    {
      title: "Welcome to Jaan",
      subtitle: "Find your perfect match in a respectful, halal environment",
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Start Your Journey</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Join thousands of Muslims finding meaningful relationships. 
            Our platform prioritizes respect, privacy, and authentic connections.
          </p>
        </div>
      )
    },
    {
      title: "Choose Your Plan",
      subtitle: "Select the plan that best fits your dating goals",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Plan</h2>
            <p className="text-gray-600">Choose the features that matter most to you</p>
          </div>
          
          <div className="grid gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? `${plan.color} ${plan.bgColor} shadow-lg scale-105`
                    : 'border-gray-200 bg-white hover:border-emerald-200 hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-1 text-xs font-bold">
                    Most Popular
                  </Badge>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{plan.price}</div>
                    <div className="text-sm text-gray-500">{plan.period}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-sm">Features:</h4>
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {plan.limitations.length > 0 && (
                    <>
                      <h4 className="font-semibold text-gray-900 text-sm mt-4">Limitations:</h4>
                      <div className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs text-gray-600">×</span>
                            </div>
                            <span className="text-sm text-gray-500">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Complete Your Profile",
      subtitle: "Add your photos and tell us about yourself",
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Almost There!</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Your profile is the key to finding meaningful connections. 
            Take your time to showcase the real you.
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep === 1 && !selectedPlan) {
      return; // Don't proceed without selecting a plan
    }
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      navigate("/home");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`p-2 rounded-full transition-colors ${
                currentStep === 0 
                  ? 'text-gray-300' 
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            
            <div className="flex space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={handleNext}
              disabled={currentStep === 1 && !selectedPlan}
              className={`p-2 rounded-full transition-colors ${
                currentStep === 1 && !selectedPlan
                  ? 'text-gray-300'
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h1>
          <p className="text-gray-600">{currentStepData.subtitle}</p>
        </div>

        <div className="mb-8">
          {currentStepData.content}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleNext}
            disabled={currentStep === 1 && !selectedPlan}
            className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 ${
              currentStep === 1 && !selectedPlan
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105'
            }`}
          >
            {currentStep === onboardingSteps.length - 1 ? 'Complete Setup' : 'Continue'}
          </button>
          
          {currentStep === 1 && (
            <p className="text-xs text-gray-500 text-center">
              You can change your plan anytime in your account settings
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;