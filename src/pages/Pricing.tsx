import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, Star, Zap, Heart, MessageCircle, Video, Users, Shield, Globe, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Pricing = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: "basic",
      name: "Basic",
      monthlyPrice: "Free",
      yearlyPrice: "Free",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "5 likes per day",
        "Basic matching",
        "View profiles",
        "Standard support",
        "Basic filters"
      ],
      limitations: [
        "No messaging without match",
        "Limited daily likes",
        "No premium features",
        "No read receipts",
        "No profile boost"
      ],
      color: "border-gray-200",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      popular: false,
      icon: Users
    },
    {
      id: "premium",
      name: "Premium",
      monthlyPrice: "$19.99",
      yearlyPrice: "$199.99",
      period: billingCycle === 'monthly' ? "per month" : "per year",
      description: "Most popular choice",
      features: [
        "Unlimited likes",
        "See who liked you",
        "Advanced filters",
        "Priority support",
        "Message anyone (with paid message)",
        "Read receipts",
        "Profile boost",
        "Undo last swipe",
        "5 paid messages per month"
      ],
      limitations: [
        "No video calls",
        "Limited paid messages"
      ],
      color: "border-emerald-200",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      popular: true,
      icon: Star
    },
    {
      id: "elite",
      name: "Elite",
      monthlyPrice: "$39.99",
      yearlyPrice: "$399.99",
      period: billingCycle === 'monthly' ? "per month" : "per year",
      description: "Ultimate dating experience",
      features: [
        "Everything in Premium",
        "Unlimited paid messages",
        "Video calls",
        "Profile verification",
        "Advanced analytics",
        "VIP support",
        "Concierge matching",
        "Priority in search results",
        "Custom filters",
        "Profile insights"
      ],
      limitations: [],
      color: "border-amber-200",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      popular: false,
      icon: Crown
    }
  ];

  const handlePlanSelect = (planId: string) => {
    // In a real app, this would handle payment processing
    console.log(`Selected plan: ${planId}`);
    navigate("/account");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-emerald-50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-emerald-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Pricing Plans</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-1 shadow-sm border border-emerald-100">
            <div className="flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  billingCycle === 'yearly'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <Badge className="ml-1 bg-emerald-100 text-emerald-700 text-xs">Save 20%</Badge>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Perfect Plan</h2>
            <p className="text-gray-600">Find the plan that matches your dating goals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-3xl shadow-lg border-2 p-6 transition-all duration-300 hover:shadow-xl ${
                    plan.popular ? 'border-emerald-300 scale-105' : plan.color
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-1 text-xs font-bold">
                      Most Popular
                    </Badge>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                      plan.id === 'basic' ? 'bg-gray-100' : 
                      plan.id === 'premium' ? 'bg-emerald-100' : 'bg-amber-100'
                    }`}>
                      <Icon className={`w-8 h-8 ${
                        plan.id === 'basic' ? 'text-gray-600' : 
                        plan.id === 'premium' ? 'text-emerald-600' : 'text-amber-600'
                      }`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-gray-900">
                        {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      </div>
                      <div className="text-sm text-gray-500">{plan.period}</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    <h4 className="font-semibold text-gray-900">What's included:</h4>
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="space-y-4 mb-8">
                      <h4 className="font-semibold text-gray-900">Limitations:</h4>
                      <div className="space-y-3">
                        {plan.limitations.map((limitation, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-500">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full py-3 rounded-2xl font-semibold transition-all duration-300 ${
                      plan.id === 'basic'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : plan.id === 'premium'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    {plan.id === 'basic' ? 'Get Started Free' : 'Choose Plan'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-12 bg-white rounded-3xl shadow-lg border border-emerald-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h4>
                <p className="text-sm text-gray-600">Yes, you can upgrade or downgrade your plan at any time from your account settings.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What are paid messages?</h4>
                <p className="text-sm text-gray-600">Paid messages allow you to send a message to someone you haven't matched with yet.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
                <p className="text-sm text-gray-600">Premium and Elite plans come with a 7-day free trial. Cancel anytime.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">How do video calls work?</h4>
                <p className="text-sm text-gray-600">Elite members can initiate video calls with their matches for a more personal connection.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 