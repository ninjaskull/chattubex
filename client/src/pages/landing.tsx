import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  PhoneCall,
  Mic,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Globe,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  X,
  Menu,
  Play,
  TrendingUp,
  Lock,
  Headphones,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  Clock,
  Target,
  Award
} from "lucide-react";
import { setAuthenticated } from "@/lib/auth";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [clickCount, setClickCount] = useState(0);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [password, setPassword] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-white text-slate-900">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <PhoneCall className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">FallOwl</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors" data-testid="link-features">Features</a>
              <a href="#integrations" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors" data-testid="link-integrations">Integrations</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors" data-testid="link-pricing">Pricing</a>
              <Button variant="ghost" size="sm" className="text-sm" data-testid="button-signin">Sign in</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-sm" data-testid="button-get-started">Get Started</Button>
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
            <div className="md:hidden py-4 border-t border-slate-200">
              <div className="flex flex-col space-y-3">
                <a href="#features" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900" data-testid="link-mobile-features">Features</a>
                <a href="#integrations" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900" data-testid="link-mobile-integrations">Integrations</a>
                <a href="#pricing" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900" data-testid="link-mobile-pricing">Pricing</a>
                <div className="px-4 pt-2 flex flex-col space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start" data-testid="button-mobile-signin">Sign in</Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full" data-testid="button-mobile-get-started">Get Started</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full text-sm font-medium text-blue-600 mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Twilio</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Call smarter.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Close faster.</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              The CRM with HD calling and automatic recording. Built for modern sales teams.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base" data-testid="button-hero-trial">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 h-12 text-base" data-testid="button-hero-demo">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative">
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-8 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <PhoneCall className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">HD Calling</h3>
                    <p className="text-sm text-slate-600">Crystal-clear voice quality</p>
                    <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 w-4/5"></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                      <Mic className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Auto Recording</h3>
                    <p className="text-sm text-slate-600">Every call saved instantly</p>
                    <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 w-3/5"></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-slate-200">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Analytics</h3>
                    <p className="text-sm text-slate-600">Real-time insights</p>
                    <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-600 w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg px-4 py-3 border border-slate-200 hidden lg:block">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>10M+ Calls Made</span>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg px-4 py-3 border border-slate-200 hidden lg:block">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-slate-600">
              Powerful features to help your team perform at their best
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: PhoneCall, title: "Twilio Dialer", desc: "Enterprise-grade calling infrastructure" },
              { icon: Mic, title: "Call Recording", desc: "Automatic recording with transcription" },
              { icon: Users, title: "Contact Management", desc: "Smart organization and segmentation" },
              { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time performance metrics" },
              { icon: Calendar, title: "Call Scheduling", desc: "Schedule calls with one click" },
              { icon: FileText, title: "Call Notes", desc: "Take notes during calls automatically" },
              { icon: MessageSquare, title: "SMS Integration", desc: "Send follow-up messages instantly" },
              { icon: Search, title: "Advanced Search", desc: "Find any contact or call in seconds" },
              { icon: Zap, title: "Workflow Automation", desc: "Automate repetitive tasks" }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="bg-white border-slate-200 hover:shadow-lg transition-shadow" data-testid={`card-feature-${index}`}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2" data-testid={`text-feature-title-${index}`}>{feature.title}</h3>
                    <p className="text-sm text-slate-600" data-testid={`text-feature-desc-${index}`}>{feature.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            {[
              { number: "10M+", label: "Calls Made" },
              { number: "5K+", label: "Active Users" },
              { number: "99.9%", label: "Uptime" },
              { number: "45%", label: "Avg. Increase in Sales" }
            ].map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Integrates with your stack
            </h2>
            <p className="text-lg text-slate-600">
              Connect with tools you already use
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              "Salesforce", "HubSpot", "Zapier", "Slack", "Google", "Microsoft",
              "Stripe", "Intercom", "Zendesk", "Pipedrive", "Zoom", "Calendly"
            ].map((integration, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-6 flex items-center justify-center h-24 border border-slate-200 hover:border-blue-300 transition-colors" data-testid={`integration-${index}`}>
                <span className="font-semibold text-slate-700">{integration}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by sales teams
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "Call quality is outstanding. We've increased connect rates by 45%.", author: "Sarah Chen", role: "Head of Sales, TechCorp" },
              { quote: "Auto recording saved us hours. Best CRM investment we made.", author: "Marcus Lee", role: "Sales Director, GrowthHub" },
              { quote: "Analytics helped us double conversion rate in 3 months.", author: "Emily Watson", role: "VP Sales, LeadGen" }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white border-slate-200" data-testid={`testimonial-${index}`}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.author}</div>
                      <div className="text-xs text-slate-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-slate-600">
              Start free, upgrade as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Starter", price: "$29", features: ["Up to 1,000 calls/mo", "Call recording", "Basic analytics", "Email support"] },
              { name: "Professional", price: "$99", features: ["Unlimited calls", "Advanced analytics", "Team collaboration", "Priority support"], popular: true },
              { name: "Enterprise", price: "Custom", features: ["Custom volume", "Dedicated support", "SLA guarantee", "Custom integrations"] }
            ].map((plan, index) => (
              <Card key={index} className={`${plan.popular ? 'border-blue-600 shadow-xl' : 'border-slate-200'} bg-white relative`} data-testid={`card-pricing-${index}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.price !== "Custom" && <span className="text-slate-600">/month</span>}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
                    data-testid={`button-pricing-${index}`}
                  >
                    {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to transform your sales?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of teams making better calls with FallOwl
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 h-12" data-testid="button-cta-trial">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 h-12" data-testid="button-cta-sales">
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <PhoneCall className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">FallOwl</span>
              </div>
              <p className="text-sm mb-6">
                The modern CRM with Twilio-powered calling and automatic recording.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" data-testid="button-footer-email">
                  <Mail className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" data-testid="button-footer-phone">
                  <Phone className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors" data-testid="link-footer-features">Features</a></li>
                <li><a href="#integrations" className="hover:text-white transition-colors" data-testid="link-footer-integrations">Integrations</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors" data-testid="link-footer-pricing">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-updates">Updates</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-about">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-blog">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-careers">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-contact">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-privacy">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-terms">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="link-footer-security">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © <span onClick={handleYearClick} className="cursor-pointer hover:text-white transition-colors" data-testid="text-footer-year">2025</span> FallOwl. All rights reserved.
            </p>
            
            {showPasswordField && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
                <form onSubmit={handleAdminLogin} className="flex items-center space-x-2">
                  <Input 
                    type="password"
                    placeholder="Admin access" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-28 h-7 text-xs bg-slate-700 border-slate-600 text-white"
                    autoFocus
                    data-testid="input-admin-password"
                  />
                  <Button 
                    type="submit"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                    disabled={authMutation.isPending}
                    data-testid="button-admin-submit"
                  >
                    {authMutation.isPending ? (
                      <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-3 h-3" />
                    )}
                  </Button>
                </form>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300"
                  onClick={() => setShowPasswordField(false)}
                  data-testid="button-admin-close"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
