import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PhoneCall,
  Mic,
  BarChart3,
  Users,
  Zap,
  MessageSquare,
  Database,
  Settings,
  Clock,
  Shield,
  Globe,
  Activity,
  FileText,
  TrendingUp,
  Headphones,
  Target,
  Radio,
  Volume2,
  Upload,
  Download
} from "lucide-react";
import { Link } from "wouter";
import fallOwlLogo from "@assets/FallOwl_logo_1759280190715.png";
import { EnterpriseFooter } from "@/components/EnterpriseFooter";

export default function Features() {
  const features = [
    {
      icon: PhoneCall,
      title: "Smart Calling",
      description: "AI-powered calling with automatic recording and real-time transcription for better insights.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Mic,
      title: "Voice Recording",
      description: "Automatic call recording with cloud storage and instant playback access.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time dashboards with call metrics, performance tracking, and detailed reports.",
      gradient: "from-teal-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Contact Management",
      description: "Centralized contact database with custom fields, tags, and smart segmentation.",
      gradient: "from-orange-500 to-pink-500"
    },
    {
      icon: MessageSquare,
      title: "AI Chatbot",
      description: "Intelligent chatbot for lead scoring, contact analysis, and database queries.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Database,
      title: "CSV Import/Export",
      description: "Bulk import contacts via CSV and export your data anytime for backups.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Settings,
      title: "Workflow Automation",
      description: "Automate repetitive tasks with custom workflows and triggers.",
      gradient: "from-slate-600 to-slate-700"
    },
    {
      icon: Clock,
      title: "Call Scheduling",
      description: "Schedule calls with automatic reminders and timezone management.",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption, SOC 2 compliance, and advanced access controls.",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: Globe,
      title: "Multi-Channel Support",
      description: "Voice, SMS, and email campaigns from a single unified platform.",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Live call monitoring with supervisor controls and quality assurance.",
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: FileText,
      title: "Smart Notes",
      description: "Collaborative notes with real-time sync and encryption for privacy.",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Lead Scoring",
      description: "AI-powered lead scoring to prioritize high-value opportunities.",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      icon: Headphones,
      title: "Call Quality",
      description: "HD voice quality with noise cancellation and echo suppression.",
      gradient: "from-teal-500 to-cyan-500"
    },
    {
      icon: Target,
      title: "Campaign Manager",
      description: "Create and manage multi-touch campaigns with advanced targeting.",
      gradient: "from-orange-400 to-red-500"
    },
    {
      icon: Radio,
      title: "Live Streaming",
      description: "Stream calls and meetings with real-time collaboration features.",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: Volume2,
      title: "Voicemail Drop",
      description: "Pre-recorded voicemail messages for efficient outreach at scale.",
      gradient: "from-purple-600 to-indigo-600"
    },
    {
      icon: Upload,
      title: "Document Uploads",
      description: "Attach documents, images, and files to contacts and campaigns.",
      gradient: "from-emerald-500 to-green-600"
    },
    {
      icon: Download,
      title: "Data Export",
      description: "Export all your data in multiple formats for reporting and analysis.",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      icon: Zap,
      title: "API Integration",
      description: "RESTful API with webhooks for seamless third-party integrations.",
      gradient: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 px-4 md:px-6 lg:px-8 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 md:px-6">
            <div className="flex justify-between items-center h-16">
              <Link href="/">
                <a className="flex items-center cursor-pointer" data-testid="link-home">
                  <img 
                    src={fallOwlLogo} 
                    alt="FallOwl" 
                    className="h-10 w-auto object-contain"
                  />
                </a>
              </Link>
              
              <div className="flex items-center space-x-6">
                <a href="/#features" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" data-testid="link-features">Features</a>
                <a href="/#capabilities" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" data-testid="link-capabilities">Capabilities</a>
                <Link href="/api-docs">
                  <a className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" data-testid="link-api-docs">API Docs</a>
                </Link>
                <Link href="/">
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white" data-testid="button-back-home">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-6 border border-purple-200 shadow-sm">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Powerful Features</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-purple-500 to-teal-500 bg-clip-text text-transparent">
              Everything You Need to Excel
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Comprehensive communication platform with AI-powered features designed to streamline your workflow and boost productivity.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group"
                  data-testid={`card-feature-${index}`}
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            Ready to Transform Your Communication?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join thousands of businesses using FallOwl to streamline their operations.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/demo">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white" data-testid="button-book-demo">
                Book a Demo
              </Button>
            </Link>
            <Link href="/api-docs">
              <Button size="lg" variant="outline" className="border-gray-300" data-testid="button-explore-api">
                Explore API
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EnterpriseFooter />
    </div>
  );
}
