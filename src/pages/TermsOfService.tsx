import React from "react";
import { ArrowLeft, FileText, Shield, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo size="sm" />
            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-emerald-100 rounded-full">
              <FileText className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: December 2024</p>
        </div>

        {/* Introduction */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Welcome to Jaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Jaan is a premium Muslim dating platform designed to help Muslims find meaningful relationships 
              in accordance with Islamic values. By using our service, you agree to these terms and conditions.
            </p>
            <p className="text-gray-700 leading-relaxed">
              These terms govern your use of Jaan's website, mobile applications, and services. 
              Please read them carefully before using our platform.
            </p>
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Eligibility Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                <p className="text-gray-700">You must be at least 18 years old to use Jaan</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                <p className="text-gray-700">You must be single, divorced, or widowed</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                <p className="text-gray-700">You must provide accurate and truthful information</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                <p className="text-gray-700">You must respect Islamic values and community guidelines</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Conduct */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              User Conduct & Behavior
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">You agree to:</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                  <p className="text-gray-700">Be respectful and courteous to all users</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                  <p className="text-gray-700">Maintain appropriate Islamic behavior and dress</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                  <p className="text-gray-700">Not engage in harassment, bullying, or inappropriate behavior</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                  <p className="text-gray-700">Not share inappropriate or explicit content</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                  <p className="text-gray-700">Not use the platform for commercial purposes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Privacy & Data Protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              We are committed to protecting your privacy and personal information. Our data collection 
              and usage practices are outlined in our Privacy Policy.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                <p className="text-gray-700">We collect only necessary information for service provision</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                <p className="text-gray-700">Your data is encrypted and stored securely</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                <p className="text-gray-700">We do not sell your personal information to third parties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Services */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-emerald-600" />
              Premium Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Jaan offers premium subscription plans with enhanced features. Subscription terms and 
              billing practices are as follows:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                <p className="text-gray-700">Subscriptions auto-renew unless cancelled</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                <p className="text-gray-700">Refunds are provided according to our refund policy</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                <p className="text-gray-700">Premium features are subject to availability</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Activities */}
        <Card className="border-0 shadow-sm bg-red-50/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-red-700">Prohibited Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                <p className="text-red-700">Creating fake or misleading profiles</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                <p className="text-red-700">Harassment, stalking, or threatening behavior</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                <p className="text-red-700">Sharing inappropriate or explicit content</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                <p className="text-red-700">Attempting to circumvent safety measures</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                <p className="text-red-700">Using the platform for commercial purposes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Account Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to terminate or suspend accounts that violate these terms. 
              You may also terminate your account at any time.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                <p className="text-gray-700">Violations may result in immediate account suspension</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                <p className="text-gray-700">Appeals can be submitted through our support system</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                <p className="text-gray-700">Account deletion is permanent and irreversible</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="border-0 shadow-sm bg-yellow-50/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-yellow-700">Important Disclaimers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                <p className="text-yellow-700">We do not guarantee successful matches or relationships</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                <p className="text-yellow-700">Users are responsible for their own safety and decisions</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                <p className="text-yellow-700">We are not responsible for user-generated content</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">Jaan Dating Platform</p>
                <p className="text-sm text-gray-500">support@jaan.com</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Legal Department</p>
                <p className="text-sm text-gray-500">legal@jaan.com</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Privacy Officer</p>
                <p className="text-sm text-gray-500">privacy@jaan.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agreement */}
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            By using Jaan, you acknowledge that you have read, understood, and agree to these Terms of Service.
          </p>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => navigate(-1)}
          >
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 