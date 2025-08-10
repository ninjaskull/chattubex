import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Brain, Cpu, Database, Globe, Network, Zap, ArrowRight, CheckCircle, Star, Users, Award, Layers, Shield, Rocket, Target, X } from "lucide-react";
import { setAuthenticated } from "@/lib/auth";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import PawMate from "@/components/pawmate-enhanced";

export default function Landing() {
  const [clickCount, setClickCount] = useState(0);
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  const [password, setPassword] = useState("");

  const [showPawMate, setShowPawMate] = useState(false);
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
      setShowAdminAccess(true);
      setClickCount(0);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      authMutation.mutate(password);
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI Lead Scoring",
      description: "Advanced AI algorithms analyze contact data to identify high-value prospects and score lead quality with precision.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Cpu,
      title: "Real-time Analytics",
      description: "Live dashboard with contact intelligence, campaign performance metrics, and business intelligence insights.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Database,
      title: "Secure Contact Management",
      description: "Enterprise-grade security with encrypted storage for contact data, campaign information, and business intelligence.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Network,
      title: "Business Intelligence Network",
      description: "Connect lead data sources, analyze market trends, and optimize campaign performance with comprehensive insights.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Advanced encryption protocols protect sensitive lead data and business intelligence with bank-level security.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Globe,
      title: "Multi-platform Integration",
      description: "Access lead scoring insights anywhere with automatic data sync and real-time updates across all platforms.",
      gradient: "from-teal-500 to-blue-500"
    }
  ];

  const stats = [
    { number: "99.99%", label: "Lead Accuracy", icon: CheckCircle },
    { number: "5ms", label: "Analysis Speed", icon: Zap },
    { number: "100K+", label: "Leads Scored", icon: Target },
    { number: "95%", label: "Conversion Rate", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>
      {/* Navigation */}
      <nav className="relative z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Target className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                LeadIQ Pro
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button className="text-slate-300 hover:text-white transition-colors duration-300">
                Solutions
              </button>
              <button className="text-slate-300 hover:text-white transition-colors duration-300">
                Technology
              </button>
              <button className="text-slate-300 hover:text-white transition-colors duration-300">
                Research
              </button>
              <Button 
                onClick={() => setShowChatbot(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/25"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700 mb-8">
              <Zap className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-sm text-slate-300">Powered by AI Technology</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
              Intelligent
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Lead Scoring
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Advanced AI technology combined with comprehensive business intelligence for sales teams. 
              AI-powered lead analysis, contact scoring, and real-time insights for optimal campaign performance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => setShowPawMate(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-2xl shadow-blue-500/25 text-lg group"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 text-lg"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 shadow-lg shadow-blue-500/25">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Advanced Lead Intelligence Features
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Everything you need for comprehensive lead management and AI-powered business intelligence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-800 backdrop-blur-xl hover:bg-slate-800/50 transition-all duration-500 group">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-3xl p-12 border border-slate-800 backdrop-blur-xl">
            <Rocket className="w-16 h-16 mx-auto mb-6 text-blue-400" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Lead Generation?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Join hundreds of sales teams already using our AI-powered platform for superior lead qualification and conversion
            </p>
            <Button 
              size="lg" 
              onClick={() => setShowChatbot(true)}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-2xl shadow-blue-500/25 text-lg"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="relative z-10 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Target className="text-white text-lg" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  LeadIQ Pro
                </span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md leading-relaxed">
                The ultimate lead scoring platform combining advanced AI technology with comprehensive business intelligence for sales optimization.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Lead Scoring</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Duggu AI Assistant</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Campaign Management</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Research</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 mb-4 md:mb-0">
              © <span 
                onClick={handleYearClick} 
                className="cursor-pointer hover:text-white transition-colors"
              >
                2025
              </span> LeadIQ Pro. All rights reserved.
            </p>
            
            {showAdminAccess && (
              <form onSubmit={handleAdminLogin} className="flex items-center space-x-3">
                <Input
                  type="password"
                  placeholder="Admin access..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-40 bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500"
                />
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={authMutation.isPending}
                  className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
                >
                  {authMutation.isPending ? "..." : <Target className="w-4 h-4" />}
                </Button>
              </form>
            )}
            
            {!showAdminAccess && (
              <div className="text-slate-500 text-sm">
                Privacy Policy • Terms of Service
              </div>
            )}
          </div>
        </div>
      </footer>
      
      {/* Duggu AI Chatbot */}
      {showPawMate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl h-[85vh] bg-white rounded-lg overflow-hidden relative">
            <div className="h-full">
              <PawMate />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowPawMate(false)}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white z-10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}