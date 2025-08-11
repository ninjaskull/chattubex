import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Brain, 
  Cpu, 
  Database, 
  Globe, 
  Network, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Award, 
  Layers, 
  Shield, 
  Rocket, 
  Target, 
  X,
  Cloud,
  Code,
  Lock,
  Bot,
  Phone,
  Mail,
  ChevronRight,
  Play,
  Moon,
  Sun,
  Menu,
  MessageCircle,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { setAuthenticated } from "@/lib/auth";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [clickCount, setClickCount] = useState(0);
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [password, setPassword] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState(0);

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const authMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest("POST", "/api/auth", { password });
      return response.json();
    },
    onSuccess: (data: any) => {
      setAuthenticated(true);
      localStorage.setItem("auth_token", data.token);
      toast({ title: "Access granted", description: "Welcome to the dashboard!" });
      setLocation("/dashboard");
    },
    onError: () => {
      toast({ title: "Access denied", description: "Invalid credentials", variant: "destructive" });
    },
  });

  const handleYearClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      setShowPasswordField(true);
      setClickCount(0);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      authMutation.mutate(password);
    }
  };

  const services = [
    {
      icon: Cloud,
      title: "Cloud Integration",
      description: "Seamlessly connect your startup to modern cloud infrastructure with scalable, secure solutions.",
      features: ["AWS & Azure Setup", "Auto-scaling", "99.9% Uptime"],
      color: "from-cyan-500 to-blue-600"
    },
    {
      icon: Code,
      title: "Custom Software Development",
      description: "Build cutting-edge applications tailored to your business needs with modern tech stacks.",
      features: ["React & Node.js", "Mobile Apps", "API Development"],
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Bot,
      title: "AI Consulting",
      description: "Leverage artificial intelligence to automate processes and gain competitive advantages.",
      features: ["Machine Learning", "Data Analytics", "Process Automation"],
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Shield,
      title: "Cybersecurity",
      description: "Protect your digital assets with enterprise-grade security solutions and monitoring.",
      features: ["24/7 Monitoring", "Penetration Testing", "Compliance"],
      color: "from-red-500 to-orange-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      company: "TechStart Inc.",
      image: "SC",
      quote: "FallOwl transformed our infrastructure. We scaled from 10 to 100,000 users seamlessly.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      company: "InnovateNow",
      image: "MR",
      quote: "Their AI solutions reduced our processing time by 80%. Game changer for our startup.",
      rating: 5
    },
    {
      name: "Emily Watson",
      company: "DataFlow",
      image: "EW",
      quote: "Best cybersecurity implementation we've seen. Our data has never been safer.",
      rating: 5
    }
  ];

  const caseStudies = [
    {
      title: "E-commerce Platform Scale-Up",
      client: "ShopNext",
      outcome: "400% traffic increase handled",
      metric: "40ms response time",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "AI-Powered Analytics Dashboard",
      client: "DataInsights Pro",
      outcome: "90% faster decision making",
      metric: "Real-time processing",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Fintech Security Overhaul",
      client: "PaySecure",
      outcome: "Zero security breaches",
      metric: "SOC2 compliant",
      gradient: "from-cyan-500 to-blue-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveService((prev) => (prev + 1) % services.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [services.length]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 text-slate-900'}`}>
      
      {/* Animated Tech Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 ${isDarkMode ? 'cyber-grid opacity-30' : 'circuit-lines opacity-20'}`}></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl floating-animation" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl floating-animation" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Navigation */}
      <nav className={`relative z-50 ${isDarkMode ? 'bg-slate-900/90' : 'bg-white/90'} backdrop-blur-xl border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 xl:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 pulse-glow">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FallOwl
                </span>
                <p className="text-xs text-slate-500">Smart IT Solutions</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#services" className={`${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors duration-300`}>Services</a>
              <a href="#about" className={`${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors duration-300`}>About</a>
              <a href="#portfolio" className={`${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors duration-300`}>Portfolio</a>
              <a href="#contact" className={`${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors duration-300`}>Contact</a>
              <Button onClick={toggleTheme} variant="ghost" size="icon" className="relative">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full neon-glow">
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-4">
              <Button onClick={toggleTheme} variant="ghost" size="icon">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={isDarkMode ? 'text-white' : 'text-slate-900'}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className={`lg:hidden py-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex flex-col space-y-4">
                <a href="#services" className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} px-4 py-2`}>Services</a>
                <a href="#about" className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} px-4 py-2`}>About</a>
                <a href="#portfolio" className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} px-4 py-2`}>Portfolio</a>
                <a href="#contact" className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} px-4 py-2`}>Contact</a>
                <Button className="mx-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 min-h-screen flex items-center overflow-hidden">
        <div className="max-w-full mx-auto px-4 sm:px-6 xl:px-12 w-full">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="mb-12 lg:mb-0">
              <div className="flex items-center space-x-2 mb-6">
                <div className={`px-4 py-2 rounded-full border ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'} text-sm font-medium`}>
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  AI-Powered Solutions
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-8">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent block mb-2">
                  Smart IT Solutions
                </span>
                <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} block mb-2`}>
                  for Visionary
                </span>
                <span className="holographic bg-clip-text text-transparent block">
                  Startups
                </span>
              </h1>
              
              <p className={`text-xl leading-relaxed mb-12 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Transform your startup with cutting-edge technology solutions. 
                We build scalable, secure, and innovative digital platforms 
                that grow with your vision.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-2xl neon-glow transform hover:scale-105 transition-all duration-300"
                >
                  Get a Free Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className={`px-8 py-4 rounded-2xl text-lg font-semibold border-2 transition-all duration-300 ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                >
                  <Play className="w-5 h-5 mr-2" />
                  See Our Work
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className={`flex items-center space-x-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>100+ Projects</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>50+ Startups</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative z-10 floating-animation">
                <div className={`w-full h-96 rounded-3xl ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'} border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} p-8 shadow-2xl`}>
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Globe className="w-12 h-12 text-white animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Digital Transformation
                    </h3>
                    <div className="space-y-3">
                      <div className={`h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full w-4/5 animate-pulse"></div>
                      </div>
                      <div className={`h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full w-3/5 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      </div>
                      <div className={`h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full w-5/6 animate-pulse" style={{animationDelay: '1s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 -right-4 w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg floating-animation" style={{animationDelay: '1s'}}>
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg floating-animation" style={{animationDelay: '2s'}}>
                <Rocket className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`py-24 ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 xl:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Why Choose </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">FallOwl</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              We partner with visionary startups to transform ideas into scalable, 
              secure, and innovative digital solutions that drive growth and success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Rocket,
                title: "Startup Agility",
                description: "Move fast with lean methodologies and rapid prototyping",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: TrendingUp,
                title: "Scalable Growth",
                description: "Solutions that grow from MVP to millions of users",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Rapid deployment and time-to-market optimization",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Target,
                title: "Cost Effective",
                description: "Startup-friendly pricing with maximum value delivery",
                color: "from-green-500 to-emerald-500"
              }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-slate-200'} backdrop-blur-sm hover:scale-105 transition-all duration-300 group`}>
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {item.title}
                    </h3>
                    <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24">
        <div className="max-w-full mx-auto px-4 sm:px-6 xl:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Our </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Services</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Comprehensive IT solutions designed to accelerate your startup's growth and digital transformation.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card 
                  key={index} 
                  className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-slate-200'} backdrop-blur-sm hover:scale-105 transition-all duration-500 group cursor-pointer ${activeService === index ? 'ring-2 ring-blue-500' : ''}`}
                  onMouseEnter={() => setActiveService(index)}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:shadow-2xl transition-shadow duration-300`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {service.title}
                        </h3>
                        <p className={`mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {service.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {service.features.map((feature, featureIndex) => (
                            <span 
                              key={featureIndex}
                              className={`px-3 py-1 rounded-full text-sm ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section id="portfolio" className={`py-24 ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 xl:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Success </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Stories</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Real results from real startups. See how we've helped companies scale and succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {caseStudies.map((study, index) => (
              <Card key={index} className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-slate-200'} backdrop-blur-sm hover:scale-105 transition-all duration-300 group overflow-hidden`}>
                <CardContent className="p-0">
                  <div className={`h-32 bg-gradient-to-br ${study.gradient} flex items-center justify-center`}>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <div className="w-8 h-8 bg-white rounded-lg"></div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {study.title}
                    </h3>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {study.client}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {study.outcome}
                      </span>
                      <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {study.metric}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-slate-200'} backdrop-blur-sm`}>
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className={`mb-6 italic ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.image}
                    </div>
                    <div>
                      <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {testimonial.name}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        
        <div className="relative max-w-full mx-auto px-4 sm:px-6 xl:px-12 text-center">
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Let's Build the Future Together
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Ready to transform your startup with cutting-edge technology? 
            Schedule a free consultation and discover how we can accelerate your growth.
          </p>
          <Button 
            size="lg"
            className="bg-white text-blue-600 hover:bg-slate-100 px-12 py-6 rounded-2xl text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Phone className="w-6 h-6 mr-3" />
            Schedule a Call
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'} border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 xl:px-12">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FallOwl
                </span>
              </div>
              <p className={`mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Transforming startups with innovative IT solutions that scale.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className={isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}>
                  <Mail className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className={isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}>
                  <Phone className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className={`font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Services</h3>
              <ul className="space-y-3">
                <li><a href="#" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>Cloud Integration</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>Custom Development</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>AI Consulting</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>Cybersecurity</a></li>
              </ul>
            </div>

            <div>
              <h3 className={`font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Company</h3>
              <ul className="space-y-3">
                <li><a href="#about" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>About Us</a></li>
                <li><a href="#portfolio" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>Portfolio</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>Careers</a></li>
                <li><a href="#contact" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className={`font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Stay Updated</h3>
              <p className={`mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Get the latest tech insights and startup tips.
              </p>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Enter email" 
                  className={`flex-1 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}
                />
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className={`mt-12 pt-8 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-300'} flex justify-between items-center`}>
            <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
              © <span onClick={handleYearClick} className="cursor-pointer hover:text-blue-400 transition-colors">2025</span> FallOwl. All rights reserved.
            </p>
            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-4 mb-2">
                <a href="#" className={`text-sm ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>Privacy</a>
                <a href="#" className={`text-sm ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}>Terms</a>
              </div>
              
              {/* Hidden password field that appears after clicking 2025 five times */}
              {showPasswordField && (
                <div className="flex items-center space-x-2 px-2 py-1 rounded bg-slate-100/80 border border-slate-200/50 text-xs">
                  <form onSubmit={handleAdminLogin} className="flex items-center space-x-2">
                    <Input 
                      type="password"
                      placeholder="Admin access" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-28 h-6 text-xs bg-white/70 border-slate-300/50 text-slate-700 placeholder-slate-500 focus:border-slate-400"
                      autoFocus
                    />
                    <Button 
                      type="submit"
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                      disabled={authMutation.isPending}
                    >
                      {authMutation.isPending ? (
                        <Zap className="w-3 h-3 animate-spin" />
                      ) : (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          {/* Paw pad */}
                          <ellipse cx="12" cy="16" rx="3.5" ry="2.5"/>
                          {/* Toe pads */}
                          <circle cx="8" cy="10" r="1.5"/>
                          <circle cx="12" cy="8" r="1.5"/>
                          <circle cx="16" cy="10" r="1.5"/>
                          <circle cx="10" cy="12" r="1.2"/>
                          <circle cx="14" cy="12" r="1.2"/>
                        </svg>
                      )}
                    </Button>
                  </form>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPasswordField(false)}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl neon-glow floating-animation"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* Admin Access Modal */}
      {showAdminAccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-md ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Admin Access
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAdminAccess(false)}
                  className={isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'}
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  disabled={authMutation.isPending}
                >
                  {authMutation.isPending ? "Authenticating..." : "Access Dashboard"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}