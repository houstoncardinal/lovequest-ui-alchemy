import React, { useState } from "react";
import { ArrowLeft, Shield, AlertTriangle, Ban, Flag, UserX, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router-dom";
import Logo from "@/components/Logo";

const BlockReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [reportReason, setReportReason] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const reportReasons = [
    "Inappropriate behavior",
    "Fake profile",
    "Harassment",
    "Spam or scam",
    "Underage user",
    "Inappropriate photos",
    "Offensive language",
    "Other"
  ];

  const safetyActions = [
    {
      id: "block",
      title: "Block User",
      description: "Stop all communication and hide their profile",
      icon: Ban,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      id: "report",
      title: "Report User",
      description: "Report inappropriate behavior to our team",
      icon: Flag,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      id: "hide",
      title: "Hide Profile",
      description: "Hide this profile from your recommendations",
      icon: EyeOff,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200"
    }
  ];

  const handleAction = (action: string) => {
    setSelectedAction(action);
  };

  const handleSubmit = () => {
    // Handle the action submission
    if (selectedAction === "block") {
      // Block user logic
      alert("User has been blocked successfully");
    } else if (selectedAction === "report") {
      // Report user logic
      alert("Report submitted successfully. Our team will review it within 24 hours.");
    } else if (selectedAction === "hide") {
      // Hide profile logic
      alert("Profile hidden from your recommendations");
    }
    navigate(-1);
  };

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
            <div className="p-3 bg-red-100 rounded-full">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Safety & Privacy</h1>
          <p className="text-gray-600">Choose how to handle this user</p>
        </div>

        {/* User Info */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-semibold">A</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Ahmed, 28</p>
                <p className="text-sm text-gray-500">Last active: 2 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Actions */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Safety Actions
            </CardTitle>
            <CardDescription>Choose an action to take</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {safetyActions.map((action) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedAction === action.id
                      ? `${action.borderColor} ${action.bgColor}`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleAction(action.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <Icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                    {selectedAction === action.id && (
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Report Reason */}
        {selectedAction === "report" && (
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Report Reason</CardTitle>
              <CardDescription>Why are you reporting this user?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportReasons.map((reason) => (
                <div
                  key={reason}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    reportReason === reason
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setReportReason(reason)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{reason}</span>
                    {reportReason === reason && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Block Confirmation */}
        {selectedAction === "block" && (
          <Card className="border-0 shadow-sm bg-red-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-red-700">Block Confirmation</CardTitle>
              <CardDescription className="text-red-600">
                This will permanently block all communication with this user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-100 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-1">What happens when you block someone:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• They can no longer message you</li>
                      <li>• Their profile will be hidden from your recommendations</li>
                      <li>• You won't appear in their recommendations</li>
                      <li>• This action cannot be undone</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Safety Tips */}
        <Card className="border-0 shadow-sm bg-blue-50/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-blue-700">Safety Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <p className="text-sm text-blue-700">
                Never share personal information like your address or financial details
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <p className="text-sm text-blue-700">
                Meet in public places for your first few meetings
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <p className="text-sm text-blue-700">
                Trust your instincts - if something feels wrong, report it
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Emergency Contact</CardTitle>
            <CardDescription>Add a trusted contact for safety</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Emergency Contact</p>
                <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-700">
                In case of emergency, you can quickly contact your trusted person
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {selectedAction && (
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSelectedAction("");
                setReportReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 ${
                selectedAction === "block" 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
              onClick={handleSubmit}
              disabled={selectedAction === "report" && !reportReason}
            >
              {selectedAction === "block" ? "Block User" : 
               selectedAction === "report" ? "Submit Report" : "Hide Profile"}
            </Button>
          </div>
        )}

        {/* Contact Support */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Need help?</p>
          <Button variant="link" className="text-emerald-600">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlockReport; 