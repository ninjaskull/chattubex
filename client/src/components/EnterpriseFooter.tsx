import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Twitter, 
  Github, 
  Youtube,
  Shield,
  Award,
  Lock,
  ChevronRight,
  CheckCircle2,
  X,
  Dog,
  PawPrint
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { setAuthenticated } from "@/lib/auth";
import fallOwlLogo from "@assets/FallOwl_logo_1759280190715.png";

export function EnterpriseFooter() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubscribing(true);
    
    setTimeout(() => {
      toast({
        title: "Successfully subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
      setIsSubscribing(false);
    }, 1000);
  };

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

  const productLinks = [
    { label: "Features", href: "/features", testId: "link-footer-features" },
    { label: "Capabilities", href: "/#capabilities", testId: "link-footer-capabilities" },
    { label: "Integrations", href: "/#integrations", testId: "link-footer-integrations" },
    { label: "API Documentation", href: "/api-docs", testId: "link-footer-api" },
    { label: "Pricing", href: "#", testId: "link-footer-pricing" },
    { label: "Changelog", href: "#", testId: "link-footer-changelog" },
  ];

  const resourcesLinks = [
    { label: "Help Center", href: "https://app.fallowl.com", testId: "link-footer-help" },
    { label: "Blog", href: "#", testId: "link-footer-blog" },
    { label: "Status Page", href: "#", testId: "link-footer-status" },
  ];

  const companyLinks = [
    { label: "About Us", href: "/about", testId: "link-footer-about" },
    { label: "Demo Booking", href: "/demo", testId: "link-footer-demo" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy", testId: "link-footer-privacy" },
    { label: "Terms of Service", href: "/terms", testId: "link-footer-terms" },
    { label: "Security", href: "/security", testId: "link-footer-security" },
    { label: "Compliance", href: "/compliance", testId: "link-footer-compliance" },
  ];

  const socialLinks = [
    { icon: Linkedin, href: "https://www.linkedin.com/company/fallowl", label: "LinkedIn", testId: "link-social-linkedin" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter", testId: "link-social-twitter" },
    { icon: Github, href: "https://github.com", label: "GitHub", testId: "link-social-github" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube", testId: "link-social-youtube" },
  ];

  const trustBadges = [
    { icon: Shield, label: "SOC 2 Type II", testId: "badge-soc2" },
    { icon: Lock, label: "GDPR Compliant", testId: "badge-gdpr" },
    { icon: Award, label: "ISO 27001", testId: "badge-iso" },
    { icon: Shield, label: "HIPAA Ready", testId: "badge-hipaa" },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Top Section: Logo, Newsletter, Social */}
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          {/* Company Info */}
          <div className="lg:col-span-4">
            <div className="mb-6">
              <img 
                src={fallOwlLogo} 
                alt="FallOwl" 
                className="h-12 w-auto object-contain invert mb-4"
                data-testid="img-footer-logo"
              />
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Enterprise-grade communication platform with AI-powered calling, 
                automatic recording, transcription, and advanced analytics for modern sales teams.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:info@fallowl.com" className="hover:text-white transition-colors" data-testid="link-footer-email">
                  info@fallowl.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+917588993347" className="hover:text-white transition-colors" data-testid="link-footer-phone">
                  +91 7588993347
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+16073262176" className="hover:text-white transition-colors" data-testid="link-footer-phone-us">
                  +1 607-326-2176 (US)
                </a>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span data-testid="text-footer-address">
                  Pune, Maharashtra
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    aria-label={social.label}
                    data-testid={social.testId}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                Product
              </h4>
              <ul className="space-y-3">
                {productLinks.map((link) => (
                  <li key={link.testId}>
                    {link.href.startsWith('/') ? (
                      <Link 
                        href={link.href} 
                        className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center group"
                        data-testid={link.testId}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a 
                        href={link.href} 
                        className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center group"
                        data-testid={link.testId}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                Resources
              </h4>
              <ul className="space-y-3">
                {resourcesLinks.map((link) => (
                  <li key={link.testId}>
                    {link.href.startsWith('/') ? (
                      <Link 
                        href={link.href} 
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                        data-testid={link.testId}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a 
                        href={link.href} 
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                        data-testid={link.testId}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.testId}>
                    {link.href.startsWith('/') ? (
                      <Link 
                        href={link.href} 
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                        data-testid={link.testId}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a 
                        href={link.href} 
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                        data-testid={link.testId}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                Legal
              </h4>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.testId}>
                    {link.href.startsWith('/') ? (
                      <Link 
                        href={link.href} 
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                        data-testid={link.testId}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a 
                        href={link.href} 
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                        data-testid={link.testId}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:col-span-3">
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Stay Updated
            </h4>
            <p className="text-sm text-slate-400 mb-4">
              Get the latest product updates, industry insights, and exclusive offers delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 pr-12 focus:border-purple-500"
                  required
                  data-testid="input-newsletter-email"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubscribing}
                  className="absolute right-1 top-1 bg-purple-600 hover:bg-purple-700 text-white h-8 px-3"
                  data-testid="button-newsletter-submit"
                >
                  {isSubscribing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-500">
                <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                <span>We respect your privacy. Unsubscribe at any time.</span>
              </div>
            </form>

            {/* Trust Badges */}
            <div className="mt-8">
              <h5 className="text-xs uppercase tracking-wider text-slate-500 mb-4 font-semibold">
                Trusted & Certified
              </h5>
              <div className="grid grid-cols-2 gap-3">
                {trustBadges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.testId}
                      className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-800"
                      data-testid={badge.testId}
                    >
                      <Icon className="w-4 h-4 text-green-400" />
                      <span className="font-medium">{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-800 mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
            <p data-testid="text-footer-copyright">
              © <span onClick={handleYearClick} className="cursor-pointer hover:text-white transition-colors" data-testid="text-footer-year">2025</span> FallOwl, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <select 
                className="bg-transparent border-none text-slate-400 text-sm cursor-pointer hover:text-white transition-colors focus:outline-none"
                defaultValue="en"
                data-testid="select-language"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>

          {/* Additional Links */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <a href="#" className="text-slate-400 hover:text-white transition-colors" data-testid="link-footer-sitemap">
              Sitemap
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors" data-testid="link-footer-accessibility">
              Accessibility
            </a>
            <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10" data-testid="badge-system-status">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
              All Systems Operational
            </Badge>
            
            {showPasswordField && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 animate-in fade-in slide-in-from-bottom">
                <Dog className="w-4 h-4 text-slate-400" />
                <form onSubmit={handleAdminLogin} className="flex items-center space-x-2">
                  <Input 
                    type="password"
                    placeholder="Admin access" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-32 h-8 text-xs bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    autoFocus
                    data-testid="input-admin-password"
                  />
                  <Button 
                    type="submit"
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                    disabled={authMutation.isPending}
                    data-testid="button-admin-submit"
                  >
                    {authMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <PawPrint className="w-4 h-4" />
                    )}
                  </Button>
                </form>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
                  onClick={() => setShowPasswordField(false)}
                  data-testid="button-admin-close"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
