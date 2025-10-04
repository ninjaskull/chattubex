import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight,
  Sparkles,
  Phone,
  Zap,
  Shield,
  Mic,
  Settings,
  Rocket,
  Heart,
  Code,
  Users,
  Target,
  TrendingUp,
  PhoneCall,
  Database,
  Lock,
  Cpu,
  Mail,
  Menu
} from "lucide-react";
import { Link, useLocation } from "wouter";
import fallOwlLogo from "@assets/FallOwl_logo_1759280190715.png";
import { EnterpriseFooter } from "@/components/EnterpriseFooter";

export default function AboutUs() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [showHeader, setShowHeader] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowHeader(true);
      } else {
        setShowHeader(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Database,
      title: "Smart CRM",
      description: "Streamline your sales pipeline with our intelligent CRM system",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Target,
      title: "Intent Engine",
      description: "AI-powered intent detection to optimize your outreach",
      gradient: "from-teal-500 to-cyan-500"
    },
    {
      icon: Phone,
      title: "Twilio Integration",
      description: "Seamless integration with Twilio for reliable communications",
      gradient: "from-orange-400 to-pink-500"
    },
    {
      icon: Mic,
      title: "Programmable Voice",
      description: "Customize voice interactions with programmable controls",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "BYOC Dialer",
      description: "Bring Your Own Credentials for complete control",
      gradient: "from-teal-500 to-cyan-500"
    }
  ];

  const values = [
    {
      icon: Rocket,
      title: "Innovation First",
      description: "Constantly evolving to meet your business needs"
    },
    {
      icon: Heart,
      title: "User Focused",
      description: "Building tools that sales teams actually love to use"
    },
    {
      icon: Lock,
      title: "Security",
      description: "Your data security is our top priority"
    },
    {
      icon: Cpu,
      title: "Cutting Edge",
      description: "Leveraging the latest technology for best results"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-slate-900">
      {/* Navigation */}
      <nav className={`${showHeader ? 'fixed top-0 animate-in slide-in-from-top duration-300' : 'relative top-4'} left-0 right-0 z-50 px-4 md:px-6 lg:px-8 ${!showHeader && 'mb-8'} transition-all`}>
        <div className={`max-w-7xl mx-auto bg-white/80 backdrop-blur-xl ${showHeader ? 'rounded-b-2xl mt-0' : 'rounded-2xl mt-0'} border border-gray-200/50 shadow-lg shadow-slate-900/5`}>
          <div className="px-4 md:px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" data-testid="link-home">
                  <img 
                    src={fallOwlLogo} 
                    alt="FallOwl" 
                    className="h-10 w-auto object-contain"
                  />
                </Link>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/features" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" data-testid="link-features">
                  Features
                </Link>
                <Link href="/#integrations" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" data-testid="link-integrations">
                  Integrations
                </Link>
                <Link href="/about" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" data-testid="link-about">
                  About
                </Link>
                <Link href="/api-docs" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" data-testid="link-api-docs">
                  API Doc
                </Link>
                <Button 
                  size="sm" 
                  className="bg-slate-900 hover:bg-slate-800 text-white text-sm rounded-xl" 
                  data-testid="button-signin"
                  onClick={() => window.location.href = 'https://app.fallowl.com'}
                >
                  Sign in
                </Button>
              </div>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
                data-testid="button-mobile-menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            {isMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top">
                <div className="flex flex-col space-y-3">
                  <Link href="/features" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 rounded-lg hover:bg-slate-50 transition-colors" data-testid="link-mobile-features">
                    Features
                  </Link>
                  <Link href="/#integrations" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 rounded-lg hover:bg-slate-50 transition-colors" data-testid="link-mobile-integrations">
                    Integrations
                  </Link>
                  <Link href="/about" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 rounded-lg hover:bg-slate-50 transition-colors" data-testid="link-mobile-about">
                    About
                  </Link>
                  <Link href="/api-docs" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 rounded-lg hover:bg-slate-50 transition-colors" data-testid="link-mobile-api-docs">
                    API Doc
                  </Link>
                  <div className="px-4 pt-2">
                    <Button 
                      size="sm" 
                      className="bg-slate-900 hover:bg-slate-800 text-white w-full rounded-xl" 
                      data-testid="button-mobile-signin"
                      onClick={() => window.location.href = 'https://app.fallowl.com'}
                    >
                      Sign in
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 md:px-6 lg:px-8 pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 opacity-60"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center space-y-6">
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 px-4 py-1.5 text-sm" data-testid="badge-status">
              <Sparkles className="w-3 h-3 mr-1" />
              Under Active Development
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                About Fallowl
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Making sales and cold calling effortless with intelligent automation and seamless integrations
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-4 md:px-6 lg:px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <Card className="border-0 shadow-xl bg-white overflow-hidden" data-testid="card-story">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-900 px-4 py-2 rounded-full">
                    <Code className="w-4 h-4" />
                    <span className="text-sm font-semibold">Built by Amit Yadav</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                    A Solo Mission to Transform Cold Calling
                  </h2>
                  
                  <p className="text-slate-600 leading-relaxed">
                    Fallowl is an individual venture, created with the vision of making sales and cold calling 
                    accessible, efficient, and powerful for businesses of all sizes.
                  </p>
                  
                  <p className="text-slate-600 leading-relaxed">
                    What started as a personal project has evolved into a comprehensive platform that 
                    combines cutting-edge technology with practical sales tools.
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl blur-2xl opacity-20"></div>
                  <div className="relative bg-slate-900 rounded-2xl p-8 text-white">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-white/80">Individual Company</p>
                          <p className="font-semibold">Solo Founded</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                          <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-white/80">Status</p>
                          <p className="font-semibold">Active Development</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-white/80">Pricing</p>
                          <p className="font-semibold">Currently Free</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 md:px-6 lg:px-8 py-16 bg-gradient-to-b from-transparent to-purple-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                What We Offer
              </span>
            </h2>
            <p className="text-slate-600 text-lg">
              Comprehensive tools to supercharge your sales operations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                  hoveredFeature === index ? 'scale-105' : ''
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                data-testid={`card-feature-${index}`}
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 md:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                Our Values
              </span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center space-y-3 p-6 rounded-xl hover:bg-white/60 transition-all duration-300"
                data-testid={`value-${index}`}
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-slate-900">{value.title}</h3>
                <p className="text-sm text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Info */}
      <section className="px-4 md:px-6 lg:px-8 py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-white overflow-hidden" data-testid="card-pricing">
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-6 py-2 rounded-full">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">Limited Time Offer</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold">
                  <span className="bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                    Currently Free to Use
                  </span>
                </h2>
                
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  We're in active development and offering Fallowl completely free while we refine the platform. 
                  A small fee may be introduced in the future, but early users will receive special benefits.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <PhoneCall className="w-5 h-5 text-slate-900" />
                    <span className="text-sm font-medium">Unlimited Calls</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Database className="w-5 h-5 text-slate-900" />
                    <span className="text-sm font-medium">Full CRM Access</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Zap className="w-5 h-5 text-slate-900" />
                    <span className="text-sm font-medium">All Integrations</span>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl group mt-4"
                  data-testid="button-get-started"
                  onClick={() => setLocation("/demo")}
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <EnterpriseFooter />
    </div>
  );
}
