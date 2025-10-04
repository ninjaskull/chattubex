import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  FileCheck, 
  Globe, 
  Building,
  CheckCircle,
  Award,
  Lock,
  Scale,
  BookOpen,
  Users,
  Mail,
  Download,
  Menu
} from "lucide-react";
import { Link, useLocation } from "wouter";
import fallOwlLogo from "@assets/FallOwl_logo_1759280190715.png";
import { EnterpriseFooter } from "@/components/EnterpriseFooter";

export default function Compliance() {
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-3xl mb-8 shadow-lg">
            <FileCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
            Compliance & Standards
          </h1>
          <p className="text-lg text-slate-600 mb-4">
            Meeting the highest industry standards for data protection and regulatory compliance.
          </p>
          <p className="text-sm text-slate-500">
            Certified and audited by leading independent organizations
          </p>
        </div>
      </section>

      {/* Certifications Grid */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Our Certifications</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1" data-testid="card-compliance-cert-0">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">SOC 2 Type II</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Comprehensive audit of security, availability, processing integrity, confidentiality, and privacy
                </p>
                <div className="flex items-center gap-2 text-xs text-purple-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Annually audited</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1" data-testid="card-compliance-cert-1">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">ISO 27001</h3>
                <p className="text-sm text-slate-600 mb-3">
                  International standard for information security management systems
                </p>
                <div className="flex items-center gap-2 text-xs text-teal-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Certified 2024</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1" data-testid="card-compliance-cert-2">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">HIPAA Compliant</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Secure handling of protected health information for healthcare organizations
                </p>
                <div className="flex items-center gap-2 text-xs text-orange-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>BAA available</span>
                </div>
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
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">GDPR Compliance</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                We are fully compliant with the European Union's General Data Protection Regulation (GDPR), 
                ensuring the highest standards of data protection for our European customers.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#F8F7F5] rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-3">Your GDPR Rights</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Right to access your personal data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Right to rectification of inaccurate data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Right to erasure ("right to be forgotten")</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Right to data portability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Right to object to processing</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Our GDPR Commitments</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Data Processing Agreements (DPAs)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>EU data residency options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Privacy by design and default</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Regular data protection impact assessments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>72-hour breach notification</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">CCPA Compliance</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                We comply with the California Consumer Privacy Act (CCPA), providing California residents 
                with enhanced privacy rights and consumer protection.
              </p>
              <Card className="bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 text-slate-900">California Consumer Rights</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 text-sm">Right to Know</p>
                          <p className="text-xs text-slate-600">What personal data we collect and how it's used</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 text-sm">Right to Delete</p>
                          <p className="text-xs text-slate-600">Request deletion of your personal information</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 text-sm">Right to Opt-Out</p>
                          <p className="text-xs text-slate-600">Opt-out of the sale of personal information</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-900 text-sm">Non-Discrimination</p>
                          <p className="text-xs text-slate-600">Equal service regardless of privacy choices</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Industry Standards</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                We adhere to telecommunications industry standards and best practices.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    title: "PCI DSS Level 1",
                    desc: "Payment card industry data security standard for secure payment processing",
                    icon: Lock
                  },
                  {
                    title: "TCPA Compliance",
                    desc: "Telephone Consumer Protection Act compliance for all calling activities",
                    icon: Shield
                  },
                  {
                    title: "STIR/SHAKEN",
                    desc: "Caller ID authentication to prevent spam and fraudulent calls",
                    icon: CheckCircle
                  }
                ].map((standard, index) => {
                  const IconComponent = standard.icon;
                  return (
                    <Card key={index} className="bg-white border-gray-200 hover:border-purple-300 transition-all">
                      <CardContent className="p-5">
                        <IconComponent className="w-8 h-8 text-purple-600 mb-3" />
                        <h3 className="font-semibold text-slate-900 mb-2">{standard.title}</h3>
                        <p className="text-sm text-slate-600">{standard.desc}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Data Processing</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                We process data in accordance with strict data protection principles and regulations.
              </p>
              <div className="bg-slate-900 rounded-2xl p-8 text-white">
                <h3 className="text-xl font-semibold mb-6">Data Protection Principles</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">Lawfulness & Transparency</p>
                        <p className="text-sm text-slate-300">All processing is lawful, fair, and transparent</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">Purpose Limitation</p>
                        <p className="text-sm text-slate-300">Data collected for specified, explicit purposes only</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">Data Minimization</p>
                        <p className="text-sm text-slate-300">Only collect data that is necessary and relevant</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">Accuracy</p>
                        <p className="text-sm text-slate-300">Keep data accurate and up to date</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">Storage Limitation</p>
                        <p className="text-sm text-slate-300">Retain data only as long as necessary</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">Integrity & Confidentiality</p>
                        <p className="text-sm text-slate-300">Appropriate security measures at all times</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Audit Reports & Documentation</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                We maintain comprehensive documentation and make audit reports available to qualified parties.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Download className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Available Documents</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                        <span>SOC 2 Type II Report</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                        <span>Data Processing Agreement (DPA)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                        <span>Business Associate Agreement (BAA)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                        <span>Security whitepaper</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                        <FileCheck className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Request Documentation</h3>
                    </div>
                    <p className="text-sm text-slate-700 mb-4">
                      Enterprise customers can request compliance documentation and audit reports through their account manager or by contacting our compliance team.
                    </p>
                    <Button 
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                      data-testid="button-request-docs"
                    >
                      Request Documents
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-8 border border-purple-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Compliance Questions?</h3>
                  <p className="text-slate-700 mb-4">
                    For questions about our compliance certifications or to request documentation, contact our compliance team:
                  </p>
                  <a 
                    href="mailto:compliance@fallowl.com" 
                    className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
                  >
                    compliance@fallowl.com
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
