import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  FileText, 
  UserCheck,
  AlertCircle,
  CheckCircle,
  Globe,
  Mail,
  Menu
} from "lucide-react";
import { Link, useLocation } from "wouter";
import fallOwlLogo from "@assets/FallOwl_logo_1759280190715.png";
import { EnterpriseFooter } from "@/components/EnterpriseFooter";

export default function Privacy() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-slate-900">
      {/* Navigation */}
      <nav className="relative top-4 left-0 right-0 z-50 px-4 md:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg shadow-slate-900/5">
          <div className="px-4 md:px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center cursor-pointer" onClick={() => setLocation("/")}>
                <img 
                  src={fallOwlLogo} 
                  alt="FallOwl" 
                  className="h-10 w-auto object-contain"
                />
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="/features" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" onClick={(e) => { e.preventDefault(); setLocation("/features"); }}>Features</a>
                <a href="/#integrations" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors">Integrations</a>
                <a href="/about" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" onClick={(e) => { e.preventDefault(); setLocation("/about"); }}>About</a>
                <a href="/api-docs" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" onClick={(e) => { e.preventDefault(); setLocation("/api-docs"); }}>API Doc</a>
                <Button 
                  size="sm" 
                  className="bg-slate-900 hover:bg-slate-800 text-white text-sm rounded-xl"
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
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            {isMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-200">
                <div className="flex flex-col space-y-3">
                  <a href="/features" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 rounded-lg hover:bg-slate-50 transition-colors" onClick={(e) => { e.preventDefault(); setLocation("/features"); }}>Features</a>
                  <a href="/#integrations" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 rounded-lg hover:bg-slate-50 transition-colors">Integrations</a>
                  <a href="/about" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 rounded-lg hover:bg-slate-50 transition-colors" onClick={(e) => { e.preventDefault(); setLocation("/about"); }}>About</a>
                  <a href="/api-docs" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 rounded-lg hover:bg-slate-50 transition-colors" onClick={(e) => { e.preventDefault(); setLocation("/api-docs"); }}>API Doc</a>
                  <div className="px-4 pt-2">
                    <Button 
                      size="sm" 
                      className="bg-slate-900 hover:bg-slate-800 text-white w-full rounded-xl"
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
      <section className="pt-20 pb-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-3xl mb-8">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 mb-4">
            Your privacy is our priority. Learn how we collect, use, and protect your data.
          </p>
          <p className="text-sm text-slate-500">
            Last updated: October 2, 2025
          </p>
        </div>
      </section>

      {/* Key Highlights */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1" data-testid="card-privacy-highlight-0">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Data Encryption</h3>
                <p className="text-sm text-slate-600">
                  All data is encrypted in transit and at rest using industry-standard protocols
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1" data-testid="card-privacy-highlight-1">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Your Control</h3>
                <p className="text-sm text-slate-600">
                  You have full control over your data with the ability to export or delete anytime
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1" data-testid="card-privacy-highlight-2">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Transparency</h3>
                <p className="text-sm text-slate-600">
                  Clear and transparent practices with no hidden data collection or usage
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {/* Section 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Information We Collect</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                We collect information that you provide directly to us, including when you create an account, 
                make calls, send messages, or contact our support team.
              </p>
              <div className="bg-[#F8F7F5] rounded-2xl p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">Account Information</p>
                    <p className="text-sm text-slate-600">Name, email address, phone number, and company details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">Usage Data</p>
                    <p className="text-sm text-slate-600">Call records, message history, and platform interactions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">Technical Information</p>
                    <p className="text-sm text-slate-600">IP address, device type, browser information, and location data</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">How We Use Your Information</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                We use the information we collect to provide, maintain, and improve our services, 
                as well as to protect FallOwl and our users.
              </p>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Provide and deliver the products and services you request</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Send you technical notices, updates, security alerts, and support messages</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Respond to your comments, questions, and customer service requests</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Monitor and analyze trends, usage, and activities in connection with our services</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Detect, investigate, and prevent fraudulent transactions and other illegal activities</span>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Information Sharing</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-2">With Your Consent</h3>
                    <p className="text-sm text-slate-700">
                      We share information with your explicit consent or at your direction
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-2">Service Providers</h3>
                    <p className="text-sm text-slate-700">
                      With third-party vendors who need access to provide services on our behalf
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-2">Legal Requirements</h3>
                    <p className="text-sm text-slate-700">
                      When required by law or to protect rights, property, or safety
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Data Security</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5" />
                    <div>
                      <p className="font-medium">AES-256 Encryption</p>
                      <p className="text-sm text-slate-300">Military-grade encryption for data at rest</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5" />
                    <div>
                      <p className="font-medium">TLS/SSL Protocols</p>
                      <p className="text-sm text-slate-300">Secure data transmission</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Regular Audits</p>
                      <p className="text-sm text-slate-300">Third-party security assessments</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Access Controls</p>
                      <p className="text-sm text-slate-300">Strict role-based permissions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Your Rights & Choices</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                You have certain rights regarding your personal information:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#F8F7F5] rounded-xl p-5">
                  <h3 className="font-semibold text-slate-900 mb-2">Access & Portability</h3>
                  <p className="text-sm text-slate-600">Request a copy of your personal data in a portable format</p>
                </div>
                <div className="bg-[#F8F7F5] rounded-xl p-5">
                  <h3 className="font-semibold text-slate-900 mb-2">Correction</h3>
                  <p className="text-sm text-slate-600">Update or correct inaccurate information</p>
                </div>
                <div className="bg-[#F8F7F5] rounded-xl p-5">
                  <h3 className="font-semibold text-slate-900 mb-2">Deletion</h3>
                  <p className="text-sm text-slate-600">Request deletion of your personal data</p>
                </div>
                <div className="bg-[#F8F7F5] rounded-xl p-5">
                  <h3 className="font-semibold text-slate-900 mb-2">Opt-Out</h3>
                  <p className="text-sm text-slate-600">Unsubscribe from marketing communications</p>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-8 border border-purple-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Questions About Privacy?</h3>
                  <p className="text-slate-700 mb-4">
                    If you have any questions or concerns about our privacy practices, please contact us at:
                  </p>
                  <a 
                    href="mailto:privacy@fallowl.com" 
                    className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
                  >
                    privacy@fallowl.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EnterpriseFooter />
    </div>
  );
}
