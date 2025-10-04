import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Scale, 
  AlertCircle, 
  CheckCircle, 
  UserX,
  CreditCard,
  RefreshCw,
  Shield,
  Mail,
  Menu
} from "lucide-react";
import { Link, useLocation } from "wouter";
import fallOwlLogo from "@assets/FallOwl_logo_1759280190715.png";
import { EnterpriseFooter } from "@/components/EnterpriseFooter";

export default function Terms() {
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
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-600 mb-4">
            Please read these terms carefully before using FallOwl services.
          </p>
          <p className="text-sm text-slate-500">
            Last updated: October 2, 2025
          </p>
        </div>
      </section>

      {/* Key Points */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1" data-testid="card-terms-highlight-0">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Clear Agreement</h3>
                <p className="text-sm text-slate-600">
                  Simple, straightforward terms with no hidden clauses or surprises
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1" data-testid="card-terms-highlight-1">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Fair Usage</h3>
                <p className="text-sm text-slate-600">
                  Reasonable usage policies that protect all users equally
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1" data-testid="card-terms-highlight-2">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Regular Updates</h3>
                <p className="text-sm text-slate-600">
                  We keep you informed of any changes to our terms
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
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Agreement to Terms</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                By accessing and using FallOwl services, you accept and agree to be bound by the terms and provision 
                of this agreement. If you do not agree to these terms, please do not use our services.
              </p>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900 mb-2">Important Notice</p>
                      <p className="text-sm text-slate-700">
                        These terms constitute a legally binding agreement between you and FallOwl. 
                        Please read them carefully and retain a copy for your records.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Use of Services</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                You agree to use FallOwl services only for lawful purposes and in accordance with these terms.
              </p>
              <div className="space-y-3">
                <div className="bg-[#F8F7F5] rounded-xl p-5">
                  <h3 className="font-semibold text-slate-900 mb-2">Permitted Use</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span>Making and receiving business calls</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span>Recording calls for business purposes with proper consent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span>Managing customer relationships through our CRM</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span>Integrating with your existing business tools</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Prohibited Use</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Spam, robocalls, or unsolicited marketing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Illegal activities or fraudulent purposes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Harassment, threats, or abusive behavior</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Unauthorized access or security breaches</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Billing & Payment</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                You agree to pay all fees and charges associated with your account on a timely basis.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-3">Subscription Plans</h3>
                    <p className="text-sm text-slate-700 mb-3">
                      Subscriptions are billed monthly or annually based on your selected plan.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                        <span>Auto-renewal unless canceled</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                        <span>Prorated charges for upgrades</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                        <span>No refunds for partial months</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-3">Usage Charges</h3>
                    <p className="text-sm text-slate-700 mb-3">
                      Additional charges may apply for usage beyond your plan limits.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-teal-600 rounded-full"></span>
                        <span>Per-minute calling rates</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-teal-600 rounded-full"></span>
                        <span>International call fees</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-teal-600 rounded-full"></span>
                        <span>Premium features and add-ons</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <UserX className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Account Termination</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                Either party may terminate this agreement under certain conditions.
              </p>
              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Termination by You</h3>
                <p className="text-slate-300 mb-4">
                  You may cancel your account at any time through your account settings. Upon cancellation:
                </p>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2"></span>
                    <span>Access continues until the end of your billing period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2"></span>
                    <span>You can export your data before account closure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2"></span>
                    <span>No refunds for the current billing period</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-6 border border-orange-200">
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Termination by FallOwl</h3>
                <p className="text-slate-700 mb-4">
                  We may suspend or terminate your account if you violate these terms or engage in prohibited activities:
                </p>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Immediate suspension for illegal activities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Notice provided for payment failures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Right to refuse service to anyone</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 5 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Limitation of Liability</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                To the maximum extent permitted by law, FallOwl shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages resulting from your use or inability to use the service.
              </p>
              <div className="bg-[#F8F7F5] rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Service Availability</h3>
                <p className="text-sm text-slate-700">
                  While we strive for 99.9% uptime, we do not guarantee uninterrupted service. We are not liable 
                  for service disruptions due to maintenance, updates, or circumstances beyond our control.
                </p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Changes to Terms</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify you of significant changes 
                via email or through the service. Continued use after changes constitutes acceptance of new terms.
              </p>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-8 border border-purple-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Questions About These Terms?</h3>
                  <p className="text-slate-700 mb-4">
                    If you have any questions or concerns about our terms of service, please contact us at:
                  </p>
                  <a 
                    href="mailto:legal@fallowl.com" 
                    className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
                  >
                    legal@fallowl.com
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
