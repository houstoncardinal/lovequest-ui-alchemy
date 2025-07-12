import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Phone, Mail, ChevronDown, Search } from "lucide-react";
import InteractiveMenu from "@/components/ui/modern-mobile-menu";

const HelpSupport = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqSections = [
    {
      id: "account",
      title: "Account & Profile",
      items: [
        {
          question: "How do I delete my account?",
          answer: "You can delete your account by going to Settings > Account > Delete Account. This action is permanent and cannot be undone."
        },
        {
          question: "How do I change my photos?",
          answer: "Go to your profile, tap the edit button, then tap on any photo to replace it or add new ones."
        },
        {
          question: "Can I hide my age?",
          answer: "Yes, you can hide your age in Privacy Settings. However, this may reduce your match potential."
        }
      ]
    },
    {
      id: "matching",
      title: "Matching & Discovery",
      items: [
        {
          question: "How does the matching algorithm work?",
          answer: "Our algorithm considers your preferences, interests, location, activity level, and compatibility factors to suggest the best matches."
        },
        {
          question: "Why am I not getting matches?",
          answer: "Try updating your photos, expanding your search criteria, or being more active on the app. Complete profiles get more matches."
        },
        {
          question: "Can I undo a swipe?",
          answer: "Yes, with Premium you can use the Rewind feature to undo your last swipe."
        }
      ]
    },
    {
      id: "premium",
      title: "Premium Features",
      items: [
        {
          question: "What's included in Premium?",
          answer: "Premium includes unlimited likes, rewind, boost, passport, read receipts, and advanced filters."
        },
        {
          question: "How do I cancel my subscription?",
          answer: "You can cancel your subscription in your device's app store settings or contact our support team."
        }
      ]
    },
    {
      id: "safety",
      title: "Safety & Privacy",
      items: [
        {
          question: "How do I report someone?",
          answer: "You can report a user by going to their profile, tapping the three dots menu, and selecting 'Report'."
        },
        {
          question: "How do I block someone?",
          answer: "Go to the user's profile or chat, tap the three dots menu, and select 'Block User'."
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const filteredSections = faqSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      searchQuery === "" || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate("/account")}>
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Help & Support</h1>
          <div></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Contact Options */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Contact Us</h3>
          
          <div className="space-y-3">
            <button className="w-full flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <MessageCircle className="w-5 h-5 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-blue-900">Live Chat</p>
                <p className="text-sm text-blue-700">Get instant help from our team</p>
              </div>
            </button>
            
            <button className="w-full flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
              <Mail className="w-5 h-5 text-green-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-green-900">Email Support</p>
                <p className="text-sm text-green-700">support@fewebe.com</p>
              </div>
            </button>
            
            <button className="w-full flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
              <Phone className="w-5 h-5 text-purple-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-purple-900">Phone Support</p>
                <p className="text-sm text-purple-700">Available 9 AM - 6 PM EST</p>
              </div>
            </button>
          </div>
        </div>

        {/* Search FAQ */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Search FAQ</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-4">
          {filteredSections.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    activeSection === section.id ? "rotate-180" : ""
                  }`} 
                />
              </button>
              
              {activeSection === section.id && (
                <div className="px-6 pb-6 space-y-4">
                  {section.items.map((item, index) => (
                    <div key={index} className="border-l-4 border-primary/20 pl-4">
                      <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Emergency Contact */}
        <div className="bg-red-50 rounded-2xl p-6">
          <h3 className="font-semibold text-red-900 mb-2">Emergency?</h3>
          <p className="text-red-800 text-sm mb-4">
            If you're in immediate danger, contact local emergency services.
          </p>
          <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold">
            Emergency: 911
          </button>
        </div>
      </div>

      <InteractiveMenu />
    </div>
  );
};

export default HelpSupport;