import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Lock, 
  Key, 
  Server, 
  Eye,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Activity,
  CloudLightning,
  Fingerprint,
  Mail,
  Menu
} from "lucide-react";
import { Link, useLocation } from "wouter";
import fallOwlLogo from "@assets/FallOwl_logo_1759280190715.png";
import { EnterpriseFooter } from "@/components/EnterpriseFooter";

export default function Security() {
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl mb-8 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
            Security & Infrastructure
          </h1>
          <p className="text-lg text-slate-600 mb-4">
            Enterprise-grade security with industry-leading protocols and compliance standards.
          </p>
          <p className="text-sm text-slate-500">
            Built on Twilio's trusted infrastructure
          </p>
        </div>
      </section>

      {/* Security Stats */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1" data-testid="card-security-stat-0">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">99.9%</div>
                <p className="text-sm text-slate-600">Uptime SLA</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1" data-testid="card-security-stat-1">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">AES-256</div>
                <p className="text-sm text-slate-600">Encryption</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1" data-testid="card-security-stat-2">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Server className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">SOC 2</div>
                <p className="text-sm text-slate-600">Certified</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-xl transition-all transform hover:-translate-y-1" data-testid="card-security-stat-3">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">24/7</div>
                <p className="text-sm text-slate-600">Monitoring</p>
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
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Data Encryption</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                We use military-grade encryption to protect your data at every stage, from transmission to storage.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900 rounded-2xl p-6 text-white">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <CloudLightning className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">In Transit</h3>
                  <p className="text-slate-300 mb-4">
                    All data transmitted between your devices and our servers is encrypted using TLS 1.3 protocols.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-400" />
                      <span>TLS 1.3 encryption</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-400" />
                      <span>Perfect forward secrecy</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-400" />
                      <span>Certificate pinning</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 border border-purple-200">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Server className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-900">At Rest</h3>
                  <p className="text-slate-700 mb-4">
                    All stored data is encrypted using AES-256 encryption with regularly rotated keys.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>AES-256-GCM encryption</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>Automated key rotation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>Encrypted backups</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Access Control</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                Multi-layered access controls ensure only authorized personnel can access your data.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-5">
                    <Fingerprint className="w-8 h-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">Multi-Factor Authentication</h3>
                    <p className="text-sm text-slate-600">
                      Required for all admin accounts with support for authenticator apps and hardware keys
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-5">
                    <Eye className="w-8 h-8 text-teal-600 mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">Role-Based Access</h3>
                    <p className="text-sm text-slate-600">
                      Granular permissions ensure users only access what they need
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-5">
                    <Activity className="w-8 h-8 text-orange-600 mb-3" />
                    <h3 className="font-semibold text-slate-900 mb-2">Audit Logging</h3>
                    <p className="text-sm text-slate-600">
                      Comprehensive logs of all access and changes with tamper-proof records
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Infrastructure Security</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Built on Twilio's enterprise infrastructure with multiple layers of protection.
              </p>
              <div className="bg-[#F8F7F5] rounded-2xl p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      Network Security
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700 ml-7">
                      <li>• DDoS protection</li>
                      <li>• Web application firewall (WAF)</li>
                      <li>• Network segmentation</li>
                      <li>• Intrusion detection systems</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                      Physical Security
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700 ml-7">
                      <li>• Tier IV data centers</li>
                      <li>• 24/7 security monitoring</li>
                      <li>• Biometric access controls</li>
                      <li>• Redundant power and cooling</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Continuous Monitoring</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                24/7 security monitoring with automated threat detection and response.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3 text-slate-900">Real-Time Monitoring</h3>
                    <p className="text-sm text-slate-700 mb-4">
                      Our security operations center monitors all systems around the clock for potential threats.
                    </p>
                    <div className="space-y-2 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                        <span>Automated anomaly detection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                        <span>Real-time alerting</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                        <span>Incident response team</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3 text-slate-900">Vulnerability Management</h3>
                    <p className="text-sm text-slate-700 mb-4">
                      Regular security assessments and penetration testing to identify and fix vulnerabilities.
                    </p>
                    <div className="space-y-2 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                        <span>Quarterly penetration tests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                        <span>Automated vulnerability scanning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                        <span>Bug bounty program</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section 5 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Compliance & Certifications</h2>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">
                We maintain industry-leading compliance standards to protect your data.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "SOC 2 Type II", desc: "Security, availability, and confidentiality" },
                  { name: "GDPR", desc: "European data protection compliance" },
                  { name: "HIPAA", desc: "Healthcare data security" },
                  { name: "ISO 27001", desc: "Information security management" },
                  { name: "PCI DSS", desc: "Payment card data security" },
                  { name: "CCPA", desc: "California privacy compliance" }
                ].map((cert, index) => (
                  <Card key={index} className="bg-white border-gray-200 hover:border-purple-300 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-slate-900 text-sm mb-1">{cert.name}</h3>
                          <p className="text-xs text-slate-600">{cert.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Section 6 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Incident Response</h2>
              </div>
              <p className="text-slate-700 leading-relaxed">
                We have a comprehensive incident response plan to quickly address any security events.
              </p>
              <div className="bg-slate-900 rounded-2xl p-8 text-white">
                <div className="grid md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                      &lt;15min
                    </div>
                    <p className="text-sm text-slate-300">Detection time</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                      &lt;1hr
                    </div>
                    <p className="text-sm text-slate-300">Response time</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                      24/7
                    </div>
                    <p className="text-sm text-slate-300">Team availability</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                      100%
                    </div>
                    <p className="text-sm text-slate-300">Transparency</p>
                  </div>
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
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Security Concerns?</h3>
                  <p className="text-slate-700 mb-4">
                    If you discover a security vulnerability or have security-related questions, please contact our security team:
                  </p>
                  <a 
                    href="mailto:security@fallowl.com" 
                    className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
                  >
                    security@fallowl.com
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
