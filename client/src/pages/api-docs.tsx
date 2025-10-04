import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Phone, 
  MessageSquare, 
  Users, 
  Mic,
  Key,
  Copy,
  Check,
  Play,
  Book,
  Terminal,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Database,
  FileText,
  Download
} from "lucide-react";
import { Link } from "wouter";
import fallOwlLogo from "@assets/FallOwl_logo_1759280190715.png";
import { EnterpriseFooter } from "@/components/EnterpriseFooter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ApiDocs() {
  const [apiKey, setApiKey] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState("calls");
  const { toast } = useToast();

  const [testCallTo, setTestCallTo] = useState("");
  const [testCallFrom, setTestCallFrom] = useState("");
  const [testSmsTo, setTestSmsTo] = useState("");
  const [testSmsBody, setTestSmsBody] = useState("");
  const [testContactName, setTestContactName] = useState("");
  const [testContactPhone, setTestContactPhone] = useState("");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateApiKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-api-key", {});
      return response.json();
    },
    onSuccess: (data: any) => {
      setApiKey(data.apiKey);
      toast({ title: "API Key Generated", description: "Your new API key has been created" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate API key", variant: "destructive" });
    },
  });

  const testCallMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/test/make-call", {
        apiKey,
        to: testCallTo,
        from: testCallFrom
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Call Initiated", description: `Call SID: ${data.callSid}` });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const testSmsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/test/send-sms", {
        apiKey,
        to: testSmsTo,
        body: testSmsBody
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "SMS Sent", description: `Message SID: ${data.messageSid}` });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const testContactMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/test/create-contact", {
        apiKey,
        name: testContactName,
        phone: testContactPhone
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({ title: "Contact Created", description: `Contact ID: ${data.contactId}` });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const endpoints = [
    {
      id: "calls",
      name: "Voice Calls",
      icon: Phone,
      color: "from-purple-500 to-purple-600",
      description: "Make and manage voice calls",
      endpoints: [
        {
          method: "POST",
          path: "/v1/calls",
          title: "Make a Call",
          description: "Initiate an outbound call",
          params: [
            { name: "to", type: "string", required: true, description: "Destination phone number in E.164 format" },
            { name: "from", type: "string", required: true, description: "Your FallOwl phone number" },
            { name: "url", type: "string", required: false, description: "TwiML URL for call instructions" },
            { name: "record", type: "boolean", required: false, description: "Whether to record the call" },
            { name: "statusCallback", type: "string", required: false, description: "Webhook URL for call status updates" }
          ],
          example: `curl -X POST https://api.fallowl.com/v1/calls \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+1234567890",
    "from": "+0987654321",
    "record": true,
    "url": "https://yourapp.com/twiml"
  }'`,
          response: `{
  "callSid": "CA1234567890abcdef",
  "status": "queued",
  "to": "+1234567890",
  "from": "+0987654321",
  "direction": "outbound-api",
  "dateCreated": "2024-10-04T12:00:00Z"
}`
        },
        {
          method: "GET",
          path: "/v1/calls/:callSid",
          title: "Get Call Details",
          description: "Retrieve information about a specific call",
          params: [
            { name: "callSid", type: "string", required: true, description: "Unique call identifier" }
          ],
          example: `curl -X GET https://api.fallowl.com/v1/calls/CA1234567890abcdef \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "callSid": "CA1234567890abcdef",
  "status": "completed",
  "to": "+1234567890",
  "from": "+0987654321",
  "duration": "42",
  "price": "-0.0200",
  "recordingUrl": "https://api.fallowl.com/v1/recordings/RE123..."
}`
        },
        {
          method: "GET",
          path: "/v1/calls",
          title: "List Calls",
          description: "Retrieve a list of calls made from your account",
          params: [
            { name: "limit", type: "integer", required: false, description: "Number of records to return (max 1000)" },
            { name: "status", type: "string", required: false, description: "Filter by call status (queued, ringing, in-progress, completed, failed)" },
            { name: "from", type: "string", required: false, description: "Filter by caller phone number" },
            { name: "to", type: "string", required: false, description: "Filter by recipient phone number" }
          ],
          example: `curl -X GET "https://api.fallowl.com/v1/calls?limit=20&status=completed" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "calls": [
    {
      "callSid": "CA1234567890abcdef",
      "status": "completed",
      "to": "+1234567890",
      "from": "+0987654321",
      "duration": "42"
    }
  ],
  "total": 1,
  "page": 1
}`
        }
      ]
    },
    {
      id: "sms",
      name: "SMS Messages",
      icon: MessageSquare,
      color: "from-teal-500 to-cyan-500",
      description: "Send and manage text messages",
      endpoints: [
        {
          method: "POST",
          path: "/v1/messages",
          title: "Send SMS",
          description: "Send an SMS message",
          params: [
            { name: "to", type: "string", required: true, description: "Destination phone number in E.164 format" },
            { name: "from", type: "string", required: true, description: "Your FallOwl phone number" },
            { name: "body", type: "string", required: true, description: "Message text (max 1600 characters)" },
            { name: "mediaUrl", type: "array", required: false, description: "URLs of media to send (MMS)" },
            { name: "statusCallback", type: "string", required: false, description: "Webhook URL for message status updates" }
          ],
          example: `curl -X POST https://api.fallowl.com/v1/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+1234567890",
    "from": "+0987654321",
    "body": "Hello from FallOwl!"
  }'`,
          response: `{
  "messageSid": "SM1234567890abcdef",
  "status": "queued",
  "to": "+1234567890",
  "from": "+0987654321",
  "body": "Hello from FallOwl!",
  "numSegments": "1",
  "dateCreated": "2024-10-04T12:00:00Z"
}`
        },
        {
          method: "GET",
          path: "/v1/messages/:messageSid",
          title: "Get Message Details",
          description: "Retrieve information about a specific message",
          params: [
            { name: "messageSid", type: "string", required: true, description: "Unique message identifier" }
          ],
          example: `curl -X GET https://api.fallowl.com/v1/messages/SM1234567890abcdef \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "messageSid": "SM1234567890abcdef",
  "status": "delivered",
  "to": "+1234567890",
  "from": "+0987654321",
  "body": "Hello from FallOwl!",
  "price": "-0.0075",
  "dateCreated": "2024-10-04T12:00:00Z",
  "dateSent": "2024-10-04T12:00:02Z"
}`
        },
        {
          method: "GET",
          path: "/v1/messages",
          title: "List Messages",
          description: "Retrieve a list of messages",
          params: [
            { name: "limit", type: "integer", required: false, description: "Number of records to return (max 1000)" },
            { name: "from", type: "string", required: false, description: "Filter by sender phone number" },
            { name: "to", type: "string", required: false, description: "Filter by recipient phone number" }
          ],
          example: `curl -X GET "https://api.fallowl.com/v1/messages?limit=20" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "messages": [
    {
      "messageSid": "SM1234567890abcdef",
      "status": "delivered",
      "to": "+1234567890",
      "from": "+0987654321",
      "body": "Hello from FallOwl!"
    }
  ],
  "total": 1,
  "page": 1
}`
        }
      ]
    },
    {
      id: "contacts",
      name: "Contacts",
      icon: Users,
      color: "from-orange-400 to-pink-500",
      description: "Manage your contact database",
      endpoints: [
        {
          method: "POST",
          path: "/v1/contacts",
          title: "Create Contact",
          description: "Add a new contact to your database",
          params: [
            { name: "name", type: "string", required: true, description: "Contact's full name" },
            { name: "phone", type: "string", required: true, description: "Contact's phone number" },
            { name: "email", type: "string", required: false, description: "Contact's email address" },
            { name: "company", type: "string", required: false, description: "Contact's company name" },
            { name: "tags", type: "array", required: false, description: "Tags for categorizing contact" },
            { name: "customFields", type: "object", required: false, description: "Custom metadata key-value pairs" }
          ],
          example: `curl -X POST https://api.fallowl.com/v1/contacts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "company": "Acme Inc",
    "tags": ["lead", "high-priority"]
  }'`,
          response: `{
  "contactId": "CON1234567890",
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "company": "Acme Inc",
  "tags": ["lead", "high-priority"],
  "createdAt": "2024-10-04T12:00:00Z"
}`
        },
        {
          method: "GET",
          path: "/v1/contacts/:contactId",
          title: "Get Contact",
          description: "Retrieve a specific contact's details",
          params: [
            { name: "contactId", type: "string", required: true, description: "Unique contact identifier" }
          ],
          example: `curl -X GET https://api.fallowl.com/v1/contacts/CON1234567890 \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "contactId": "CON1234567890",
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "company": "Acme Inc",
  "tags": ["lead", "high-priority"],
  "callHistory": 5,
  "lastContact": "2024-10-03T15:30:00Z"
}`
        },
        {
          method: "GET",
          path: "/v1/contacts",
          title: "List Contacts",
          description: "Retrieve all contacts with optional filters",
          params: [
            { name: "limit", type: "integer", required: false, description: "Number of records to return (max 1000)" },
            { name: "search", type: "string", required: false, description: "Search by name, phone, or email" },
            { name: "tags", type: "string", required: false, description: "Filter by tags (comma-separated)" }
          ],
          example: `curl -X GET "https://api.fallowl.com/v1/contacts?limit=20&tags=lead" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "contacts": [
    {
      "contactId": "CON1234567890",
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com"
    }
  ],
  "total": 1,
  "page": 1
}`
        },
        {
          method: "PUT",
          path: "/v1/contacts/:contactId",
          title: "Update Contact",
          description: "Update an existing contact's information",
          params: [
            { name: "contactId", type: "string", required: true, description: "Unique contact identifier" },
            { name: "name", type: "string", required: false, description: "Updated name" },
            { name: "phone", type: "string", required: false, description: "Updated phone" },
            { name: "email", type: "string", required: false, description: "Updated email" },
            { name: "tags", type: "array", required: false, description: "Updated tags" }
          ],
          example: `curl -X PUT https://api.fallowl.com/v1/contacts/CON1234567890 \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tags": ["customer", "high-priority"]
  }'`,
          response: `{
  "contactId": "CON1234567890",
  "name": "John Doe",
  "tags": ["customer", "high-priority"],
  "updatedAt": "2024-10-04T12:00:00Z"
}`
        },
        {
          method: "DELETE",
          path: "/v1/contacts/:contactId",
          title: "Delete Contact",
          description: "Remove a contact from your database",
          params: [
            { name: "contactId", type: "string", required: true, description: "Unique contact identifier" }
          ],
          example: `curl -X DELETE https://api.fallowl.com/v1/contacts/CON1234567890 \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "success": true,
  "message": "Contact deleted successfully"
}`
        }
      ]
    },
    {
      id: "recordings",
      name: "Recordings",
      icon: Mic,
      color: "from-purple-500 to-purple-600",
      description: "Access and manage call recordings",
      endpoints: [
        {
          method: "GET",
          path: "/v1/recordings",
          title: "List Recordings",
          description: "Retrieve a list of call recordings",
          params: [
            { name: "limit", type: "integer", required: false, description: "Number of records to return (max 1000)" },
            { name: "callSid", type: "string", required: false, description: "Filter by specific call SID" },
            { name: "dateCreated", type: "string", required: false, description: "Filter by creation date (YYYY-MM-DD)" }
          ],
          example: `curl -X GET "https://api.fallowl.com/v1/recordings?limit=20" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "recordings": [
    {
      "recordingSid": "RE1234567890abcdef",
      "callSid": "CA1234567890abcdef",
      "duration": "42",
      "dateCreated": "2024-10-04T12:00:00Z",
      "url": "https://api.fallowl.com/v1/recordings/RE123..."
    }
  ],
  "total": 1,
  "page": 1
}`
        },
        {
          method: "GET",
          path: "/v1/recordings/:recordingSid",
          title: "Get Recording",
          description: "Retrieve details about a specific recording",
          params: [
            { name: "recordingSid", type: "string", required: true, description: "Unique recording identifier" }
          ],
          example: `curl -X GET https://api.fallowl.com/v1/recordings/RE1234567890abcdef \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "recordingSid": "RE1234567890abcdef",
  "callSid": "CA1234567890abcdef",
  "duration": "42",
  "channels": "1",
  "source": "OutboundAPI",
  "url": "https://api.fallowl.com/v1/recordings/RE123.../download",
  "transcription": {
    "text": "Hello, this is a sample call...",
    "confidence": 0.95
  }
}`
        },
        {
          method: "GET",
          path: "/v1/recordings/:recordingSid/download",
          title: "Download Recording",
          description: "Download the audio file of a recording",
          params: [
            { name: "recordingSid", type: "string", required: true, description: "Unique recording identifier" },
            { name: "format", type: "string", required: false, description: "Audio format (mp3, wav) - default: mp3" }
          ],
          example: `curl -X GET "https://api.fallowl.com/v1/recordings/RE123.../download?format=mp3" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -o recording.mp3`,
          response: `Binary audio data (Content-Type: audio/mpeg)`
        },
        {
          method: "DELETE",
          path: "/v1/recordings/:recordingSid",
          title: "Delete Recording",
          description: "Permanently delete a call recording",
          params: [
            { name: "recordingSid", type: "string", required: true, description: "Unique recording identifier" }
          ],
          example: `curl -X DELETE https://api.fallowl.com/v1/recordings/RE1234567890abcdef \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          response: `{
  "success": true,
  "message": "Recording deleted successfully"
}`
        }
      ]
    }
  ];

  const selectedCategory = endpoints.find(e => e.id === activeEndpoint);

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
                <a href="#getting-started" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" data-testid="link-getting-started">Getting Started</a>
                <a href="#authentication" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" data-testid="link-authentication">Authentication</a>
                <a href="#endpoints" className="text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors" data-testid="link-endpoints">API Reference</a>
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
              <Code className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">API Documentation v1.0</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-purple-500 to-teal-500 bg-clip-text text-transparent">
              FallOwl API Reference
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Build powerful communication workflows with our enterprise-grade REST API. 
              Make calls, send SMS, manage contacts, and access recordings programmatically.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white" data-testid="button-get-started">
                <Book className="w-4 h-4 mr-2" />
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300" data-testid="button-view-examples">
                <Terminal className="w-4 h-4 mr-2" />
                View Examples
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {[
                { label: "Uptime", value: "99.99%", icon: Zap },
                { label: "API Calls/mo", value: "10M+", icon: Globe },
                { label: "Response Time", value: "<100ms", icon: Shield },
                { label: "Endpoints", value: "20+", icon: Database }
              ].map((stat, index) => (
                <Card key={index} className="bg-white border-gray-200 hover:shadow-lg transition-all">
                  <CardContent className="p-4 text-center">
                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
            <p className="text-lg text-slate-600 mb-8">
              Start building with the FallOwl API in minutes. Follow these steps to make your first API call.
            </p>

            <div className="space-y-6">
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Sign up for an account</h3>
                      <p className="text-slate-600 mb-3">Create a FallOwl account to get access to the API dashboard and generate your API keys.</p>
                      <Link href="/">
                        <Button variant="outline" size="sm" data-testid="button-signup">
                          Create Account <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Get your API key</h3>
                      <p className="text-slate-600 mb-3">Generate your API key from the dashboard or use the quick generator below.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Make your first API call</h3>
                      <p className="text-slate-600 mb-3">Use your API key to authenticate and start making requests to our endpoints.</p>
                      <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-white overflow-x-auto">
                        <pre>{`curl -X GET https://api.fallowl.com/v1/calls \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section id="authentication" className="py-16 bg-[#F8F7F5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Authentication</h2>
              <p className="text-lg text-slate-600 mb-6">
                All API requests must include your API key in the Authorization header using Bearer authentication.
              </p>

              <Card className="bg-white border-gray-200 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-purple-600" />
                    API Key Format
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">Include your API key in every request:</p>
                  <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-white">
                    <pre>Authorization: Bearer sk_live_1234567890abcdef</pre>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Security Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Never expose your API key in client-side code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Store keys securely using environment variables</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Rotate your keys regularly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Use separate keys for development and production</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-white border-gray-200 sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-purple-600" />
                    Quick API Key Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Generate a test API key to start exploring the API immediately. 
                    This key will have limited functionality for testing purposes.
                  </p>
                  
                  <Button 
                    onClick={() => generateApiKeyMutation.mutate()}
                    disabled={generateApiKeyMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                    data-testid="button-generate-api-key"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    {generateApiKeyMutation.isPending ? "Generating..." : "Generate Test API Key"}
                  </Button>

                  {apiKey && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Your API Key</label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(apiKey, "apikey")}
                          data-testid="button-copy-api-key"
                        >
                          {copiedCode === "apikey" ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <div className="bg-slate-100 rounded-lg p-3 font-mono text-sm break-all border border-slate-200">
                        {apiKey}
                      </div>
                      <p className="text-xs text-amber-600 flex items-start gap-2">
                        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Save this key securely. You won't be able to see it again.
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium mb-2 text-sm">Code Example</h4>
                    <Tabs defaultValue="curl" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="node">Node.js</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                      </TabsList>
                      <TabsContent value="curl">
                        <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-white overflow-x-auto relative">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 text-white hover:text-white hover:bg-slate-800"
                            onClick={() => copyToClipboard(`curl -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" https://api.fallowl.com/v1/calls`, "curl")}
                            data-testid="button-copy-curl"
                          >
                            {copiedCode === "curl" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <pre>{`curl -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  https://api.fallowl.com/v1/calls`}</pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="node">
                        <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-white overflow-x-auto relative">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 text-white hover:text-white hover:bg-slate-800"
                            onClick={() => copyToClipboard(`const fallowl = require('fallowl')('${apiKey || 'YOUR_API_KEY'}');\n\nconst calls = await fallowl.calls.list();`, "node")}
                            data-testid="button-copy-node"
                          >
                            {copiedCode === "node" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <pre>{`const fallowl = require('fallowl')('${apiKey || 'YOUR_API_KEY'}');

const calls = await fallowl.calls.list();`}</pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="python">
                        <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-white overflow-x-auto relative">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 text-white hover:text-white hover:bg-slate-800"
                            onClick={() => copyToClipboard(`from fallowl import Client\n\nclient = Client('${apiKey || 'YOUR_API_KEY'}')\ncalls = client.calls.list()`, "python")}
                            data-testid="button-copy-python"
                          >
                            {copiedCode === "python" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <pre>{`from fallowl import Client

client = Client('${apiKey || 'YOUR_API_KEY'}')
calls = client.calls.list()`}</pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section id="endpoints" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">API Reference</h2>

          {/* Category Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {endpoints.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveEndpoint(category.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  activeEndpoint === category.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                data-testid={`button-category-${category.id}`}
              >
                <category.icon className={`w-6 h-6 mb-2 ${
                  activeEndpoint === category.id ? 'text-purple-600' : 'text-slate-600'
                }`} />
                <div className={`font-semibold ${
                  activeEndpoint === category.id ? 'text-purple-900' : 'text-slate-900'
                }`}>
                  {category.name}
                </div>
                <div className="text-sm text-slate-600 mt-1">{category.description}</div>
              </button>
            ))}
          </div>

          {/* Endpoints Documentation */}
          {selectedCategory && (
            <div className="space-y-6">
              {selectedCategory.endpoints.map((endpoint, index) => (
                <Card key={index} className="border-gray-200 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-md text-xs font-bold ${
                          endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                          endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                          endpoint.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-slate-700">{endpoint.path}</code>
                      </div>
                    </div>
                    <CardTitle className="mt-3">{endpoint.title}</CardTitle>
                    <p className="text-slate-600 text-sm mt-1">{endpoint.description}</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Tabs defaultValue="params" className="w-full">
                      <TabsList>
                        <TabsTrigger value="params">Parameters</TabsTrigger>
                        <TabsTrigger value="example">Example</TabsTrigger>
                        <TabsTrigger value="response">Response</TabsTrigger>
                        {apiKey && endpoint.method === 'POST' && <TabsTrigger value="test">Test</TabsTrigger>}
                      </TabsList>

                      <TabsContent value="params" className="space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="border-b border-gray-200">
                              <tr className="text-left">
                                <th className="pb-2 font-semibold text-slate-700">Parameter</th>
                                <th className="pb-2 font-semibold text-slate-700">Type</th>
                                <th className="pb-2 font-semibold text-slate-700">Required</th>
                                <th className="pb-2 font-semibold text-slate-700">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {endpoint.params.map((param, i) => (
                                <tr key={i}>
                                  <td className="py-3 font-mono text-purple-600">{param.name}</td>
                                  <td className="py-3 text-slate-600">{param.type}</td>
                                  <td className="py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      param.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {param.required ? 'Required' : 'Optional'}
                                    </span>
                                  </td>
                                  <td className="py-3 text-slate-600">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </TabsContent>

                      <TabsContent value="example">
                        <div className="relative">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 z-10"
                            onClick={() => copyToClipboard(endpoint.example, `example-${index}`)}
                            data-testid={`button-copy-example-${index}`}
                          >
                            {copiedCode === `example-${index}` ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-white overflow-x-auto">
                            <pre>{endpoint.example}</pre>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="response">
                        <div className="relative">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 z-10"
                            onClick={() => copyToClipboard(endpoint.response, `response-${index}`)}
                            data-testid={`button-copy-response-${index}`}
                          >
                            {copiedCode === `response-${index}` ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-white overflow-x-auto">
                            <pre>{endpoint.response}</pre>
                          </div>
                        </div>
                      </TabsContent>

                      {apiKey && endpoint.method === 'POST' && (
                        <TabsContent value="test">
                          <Card className="bg-gradient-to-br from-purple-50 to-teal-50 border-purple-200">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Play className="w-5 h-5 text-purple-600" />
                                Test This Endpoint
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {endpoint.path === '/v1/calls' && (
                                <>
                                  <div>
                                    <label className="text-sm font-medium mb-1 block">To Phone Number</label>
                                    <Input
                                      placeholder="+1234567890"
                                      value={testCallTo}
                                      onChange={(e) => setTestCallTo(e.target.value)}
                                      data-testid="input-test-call-to"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium mb-1 block">From Phone Number</label>
                                    <Input
                                      placeholder="+0987654321"
                                      value={testCallFrom}
                                      onChange={(e) => setTestCallFrom(e.target.value)}
                                      data-testid="input-test-call-from"
                                    />
                                  </div>
                                  <Button
                                    onClick={() => testCallMutation.mutate()}
                                    disabled={testCallMutation.isPending || !testCallTo || !testCallFrom}
                                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600"
                                    data-testid="button-test-call"
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    {testCallMutation.isPending ? "Making Call..." : "Make Test Call"}
                                  </Button>
                                </>
                              )}

                              {endpoint.path === '/v1/messages' && (
                                <>
                                  <div>
                                    <label className="text-sm font-medium mb-1 block">To Phone Number</label>
                                    <Input
                                      placeholder="+1234567890"
                                      value={testSmsTo}
                                      onChange={(e) => setTestSmsTo(e.target.value)}
                                      data-testid="input-test-sms-to"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium mb-1 block">Message</label>
                                    <Textarea
                                      placeholder="Hello from FallOwl!"
                                      value={testSmsBody}
                                      onChange={(e) => setTestSmsBody(e.target.value)}
                                      data-testid="input-test-sms-body"
                                    />
                                  </div>
                                  <Button
                                    onClick={() => testSmsMutation.mutate()}
                                    disabled={testSmsMutation.isPending || !testSmsTo || !testSmsBody}
                                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500"
                                    data-testid="button-test-sms"
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    {testSmsMutation.isPending ? "Sending SMS..." : "Send Test SMS"}
                                  </Button>
                                </>
                              )}

                              {endpoint.path === '/v1/contacts' && (
                                <>
                                  <div>
                                    <label className="text-sm font-medium mb-1 block">Contact Name</label>
                                    <Input
                                      placeholder="John Doe"
                                      value={testContactName}
                                      onChange={(e) => setTestContactName(e.target.value)}
                                      data-testid="input-test-contact-name"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium mb-1 block">Phone Number</label>
                                    <Input
                                      placeholder="+1234567890"
                                      value={testContactPhone}
                                      onChange={(e) => setTestContactPhone(e.target.value)}
                                      data-testid="input-test-contact-phone"
                                    />
                                  </div>
                                  <Button
                                    onClick={() => testContactMutation.mutate()}
                                    disabled={testContactMutation.isPending || !testContactName || !testContactPhone}
                                    className="w-full bg-gradient-to-r from-orange-400 to-pink-500"
                                    data-testid="button-test-contact"
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    {testContactMutation.isPending ? "Creating Contact..." : "Create Test Contact"}
                                  </Button>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>
                      )}
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <EnterpriseFooter />
    </div>
  );
}
