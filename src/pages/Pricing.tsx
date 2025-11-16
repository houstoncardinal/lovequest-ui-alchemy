import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, Star, Zap, Heart, MessageCircle, Video, Users, Shield, Globe, X, Sparkles, Diamond } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Pricing = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: "free",
      name: "Free",
      monthlyPrice: "Free",
      yearlyPrice: "Free",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "5 likes per day",
        "Basic matching",
        "View profiles",
        "Voice notes & emojis",
        "Standard support",
        "Basic filters"
      ],
      limitations: [
        "No video messaging",
        "No messaging without match",
        "Limited daily likes",
        "No premium features",
        "No read receipts"
      ],
      color: "border-gray-200",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      buttonClass: "bg-gray-100 text-gray-700 hover:bg-gray-200",
      popular: false,
      icon: Users,
      savings: null
    },
    {
      id: "premium",
      name: "Premium",
      monthlyPrice: "$19.99",
      yearlyPrice: "$199.99",
      period: billingCycle === 'monthly' ? "per month" : "per year",
      description: "Most popular choice",
      features: [
        "Everything in Free",
        "Unlimited likes",
        "See who liked you",
        "Advanced filters",
        "Video messaging",
        "Read receipts",
        "Profile boost",
        "Priority support",
        "5 paid messages per month"
      ],
      limitations: [
        "Limited paid messages",
        "No video calls"
      ],
      color: "border-emerald-300",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      buttonClass: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105",
      popular: true,
      icon: Star,
      savings: billingCycle === 'yearly' ? "Save $40" : null
    },
    {
      id: "elite",
      name: "Elite",
      monthlyPrice: "$39.99",
      yearlyPrice: "$399.99",
      period: billingCycle === 'monthly' ? "per month" : "per year",
      description: "Ultimate marriage experience",
      features: [
        "Everything in Premium",
        "Video messaging",
        "Video calls with matches",
        "Unlimited paid messages",
        "Profile verification priority",
        "Advanced analytics",
        "VIP support",
        "Concierge matching",
        "Priority in search results",
        "Custom filters"
      ],
      limitations: [],
      color: "border-amber-300",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      buttonClass: "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg hover:scale-105",
      popular: false,
      icon: Crown,
      savings: billingCycle === 'yearly' ? "Save $80" : null
    }
  ];

  const handlePlanSelect = (planId: string) => {
    // Navigate to onboarding with selected plan
    navigate("/onboarding", { state: { selectedPlan: planId } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-emerald-400/20 rounded-full -translate-y-48 translate-x-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-200/20 to-amber-400/20 rounded-full translate-y-40 -translate-x-40 blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-emerald-50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-emerald-600" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">Choose Your Plan</h1>
            <p className="text-xs text-gray-500">Join thousands finding love</p>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="relative z-10 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-emerald-100">
            <div className="flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-2 py-1 shadow-lg">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Save 20%
                </Badge>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="relative z-10 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Perfect Plan</h2>
            <p className="text-gray-600 text-lg">Find the plan that matches your dating goals</p>
            <div className="flex items-center justify-center space-x-2 mt-4 text-emerald-600">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">All plans include verified profiles & secure messaging</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                    plan.popular ? 'border-emerald-300 scale-105 ring-4 ring-emerald-100' : plan.color
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 text-sm font-bold shadow-lg">
                        <Crown className="w-4 h-4 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {plan.savings && billingCycle === 'yearly' && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-3 py-1 shadow-lg">
                        {plan.savings}
                      </Badge>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center relative overflow-hidden ${
                      plan.id === 'free' ? 'bg-gray-100' : 
                      plan.id === 'premium' ? 'bg-gradient-to-br from-emerald-100 to-emerald-200' : 'bg-gradient-to-br from-amber-100 to-amber-200'
                    }`}>
                      {plan.id !== 'free' && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                      )}
                      <Icon className={`w-10 h-10 relative z-10 ${
                        plan.id === 'free' ? 'text-gray-600' : 
                        plan.id === 'premium' ? 'text-emerald-600' : 'text-amber-600'
                      }`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    
                    <div className="mb-6">
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      </div>
                      <div className="text-sm text-gray-500">{plan.period}</div>
                      {billingCycle === 'yearly' && plan.id !== 'free' && (
                        <div className="text-xs text-emerald-600 font-medium mt-1">
                          {plan.id === 'premium' ? '$1.67/month saved' : '$3.33/month saved'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <Diamond className="w-4 h-4 mr-2 text-emerald-500" />
                      What's included:
                    </h4>
                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-emerald-600" />
                          </div>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="space-y-4 mb-8">
                      <h4 className="font-semibold text-gray-500 text-sm">Limitations:</h4>
                      <div className="space-y-2">
                        {plan.limitations.slice(0, 2).map((limitation, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 text-sm relative overflow-hidden group ${plan.buttonClass}`}
                  >
                    {/* Button shine effect for premium plans */}
                    {plan.id !== 'free' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    )}
                    <span className="relative z-10">
                      {plan.id === 'free' ? 'Get Started Free' : 'Choose Plan'}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Feature Comparison */}
          <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Choose LoveQuest?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Verified Profiles</h4>
                <p className="text-sm text-gray-600">All members are verified for authentic connections and safety.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Premium Dating</h4>
                <p className="text-sm text-gray-600">Respectful platform designed for serious relationship seekers.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">50k+ Members</h4>
                <p className="text-sm text-gray-600">Join thousands of singles finding meaningful relationships.</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h4>
                  <p className="text-sm text-gray-600">Yes, you can upgrade or downgrade your plan at any time from your account settings.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What are paid messages?</h4>
                  <p className="text-sm text-gray-600">Paid messages allow you to send a message to someone you haven't matched with yet.</p>
                </div>
              </div>
              <div className="space-y-4">
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

      {/* Bottom accent */}
      <div className="relative z-10 h-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 mt-8"></div>
    </div>
  );
};

export default Pricing; 