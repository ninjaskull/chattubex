import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Heart, MessageCircle, Zap, Dog, Settings, Send, Sparkles, Bot,
  Search, Database, Target, Phone, Mail, Building, Globe, 
  ExternalLink, Users, Filter, SortAsc, Grid, List, Download,
  User, Eye, ChevronDown, ChevronUp, Upload, FileSpreadsheet
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { CsvExportModal } from './CsvExportModal';
import { CsvImportModal } from './CsvImportModal';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'search-results';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  searchResults?: any;
  searchQuery?: string;
}

interface ContactCardProps {
  contact: any;
  source: 'campaign' | 'direct';
}

const ContactCard = ({ contact, source }: ContactCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">
                {source === 'campaign' 
                  ? `${contact['First Name']} ${contact['Last Name']}`
                  : contact.name
                }
              </h3>
              <Badge variant="outline" className="text-xs">
                {source === 'campaign' ? 'Campaign Data' : 'Direct Contact'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span>{source === 'campaign' ? contact.Company : contact.company || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span>{source === 'campaign' ? contact.Title : contact.title || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{source === 'campaign' ? contact.Email : contact.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{source === 'campaign' ? contact['Mobile Phone'] : contact.mobile || 'N/A'}</span>
              </div>
            </div>
            
            {expanded && source === 'campaign' && (
              <div className="mt-3 pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {contact['Other Phone'] && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>Other: {contact['Other Phone']}</span>
                  </div>
                )}
                {contact['Corporate Phone'] && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>Corporate: {contact['Corporate Phone']}</span>
                  </div>
                )}
                {contact.Website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={contact.Website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
                {contact['Person Linkedin Url'] && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    <a href={contact['Person Linkedin Url']} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {source === 'campaign' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="ml-2"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface SearchResultsDisplayProps {
  searchResults: any;
  searchQuery: string;
}

const SearchResultsDisplay = ({ searchResults, searchQuery }: SearchResultsDisplayProps) => {
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
  const [showAll, setShowAll] = useState(false);
  
  const allContacts = [
    ...(searchResults.campaignData?.flatMap((campaign: any) => 
      campaign.matches.map((contact: any) => ({ ...contact, source: 'campaign', campaignName: campaign.campaignName }))
    ) || []),
    ...(searchResults.contacts?.map((contact: any) => ({ ...contact, source: 'direct' })) || [])
  ];
  
  const displayContacts = showAll ? allContacts : allContacts.slice(0, 10);
  
  return (
    <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-800 dark:text-green-100">
            Search Results: {searchResults.total} found
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'cards' ? 'compact' : 'cards')}
          >
            {viewMode === 'cards' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      {viewMode === 'cards' ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayContacts.map((contact: any, index: number) => (
            <ContactCard 
              key={index} 
              contact={contact} 
              source={contact.source}
            />
          ))}
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 gap-2 text-sm">
            {displayContacts.map((contact: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex items-center gap-4 flex-1">
                  <span className="font-medium min-w-[120px]">
                    {contact.source === 'campaign' 
                      ? `${contact['First Name']} ${contact['Last Name']}`
                      : contact.name
                    }
                  </span>
                  <span className="text-muted-foreground min-w-[100px]">
                    {contact.source === 'campaign' ? contact.Company : contact.company}
                  </span>
                  <span className="text-muted-foreground">
                    {contact.source === 'campaign' ? contact['Mobile Phone'] : contact.mobile}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {contact.source === 'campaign' ? 'Campaign' : 'Direct'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {allContacts.length > 10 && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All ${allContacts.length} Results`}
          </Button>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-700">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-green-700 dark:text-green-300">
            <span>Query: "{searchQuery}"</span>
            <span className="ml-4">{searchResults.total} total matches found</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setLastSearchQuery(searchQuery) || setCsvExportOpen(true)}
              disabled={!searchQuery}
              className="text-xs h-7"
              data-testid="button-export-results"
            >
              <Download className="w-3 h-3 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PawMate() {
  const [petName, setPetName] = useState(() => localStorage.getItem('pawmate_pet_name') || "Duggu");
  const [petType, setPetType] = useState(() => localStorage.getItem('pawmate_pet_type') || "assistant");
  const [petMessage, setPetMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isUsingRealAI, setIsUsingRealAI] = useState<boolean | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem('pawmate_session_id'));
  const [csvExportOpen, setCsvExportOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (sessionId) {
        try {
          const response = await fetch(`/api/pawmate/sessions/${sessionId}/history`);
          if (response.ok) {
            const history = await response.json();
            if (history.length > 0) {
              const formattedMessages: Message[] = history.map((msg: any) => ({
                id: msg.id.toString(),
                type: msg.role === 'user' ? 'user' : 'bot',
                content: msg.content,
                timestamp: new Date(msg.createdAt)
              }));
              setMessages(formattedMessages);
              return; // Don't load welcome message if history exists
            }
          }
        } catch (error) {
          console.error('Failed to load chat history:', error);
        }
      }
      
      // Load welcome message only if no history loaded
      if (messages.length === 0) {
        setMessages([{
          id: '1',
          type: 'bot',
          content: `👋 Welcome! I'm ${petName || 'Duggu'}, your AI-powered lead intelligence assistant with direct database access and advanced CSV operations.

**🔍 Advanced Search Capabilities:**
• Search through 263+ contact records instantly
• Find complete contact details with phone numbers
• Filter by name, email, phone, company, title
• Real-time search through encrypted campaign data
• Advanced data visualization for large datasets

**📊 CSV Export & Import Module:**
• Export search results to customizable CSV files
• Import new data with automatic encryption
• Create campaigns from uploaded CSV files
• Batch operations with custom naming
• Full data integrity and error handling

**💬 Conversational AI:**
• Natural business intelligence conversations
• Lead scoring and analysis insights
• Campaign optimization recommendations
• Market analysis and prospect evaluation

**Try these commands:**
• "search delonza" - Find specific contacts with full details
• "find all CEOs" - Search by job titles
• "show contacts at Dakkota" - Company-based searches
• "What's the best lead scoring strategy?" - AI conversation

**CSV Operations:**
• Use Export CSV button after any search to download results
• Use Import CSV button to add new contact data to the system

I automatically detect whether you want to search or chat - just type naturally!`,
          timestamp: new Date()
        }]);
      }
    };

    loadChatHistory();
  }, [sessionId, petType, petName]);

  // Search query detection logic
  const isSearchQuery = (query: string): boolean => {
    const searchKeywords = [
      'search', 'find', 'show', 'get', 'lookup', 'contact', 'contacts',
      'phone', 'email', 'company', 'title', 'manager', 'ceo', 'director',
      'vp', 'vice president', 'executive', 'list', 'all', 'who'
    ];
    
    const lowerQuery = query.toLowerCase();
    
    // Check if query contains search keywords
    const hasSearchKeywords = searchKeywords.some(keyword => 
      lowerQuery.includes(keyword)
    );
    
    // Check if query looks like a name, email, or company
    const looksLikeSearchTerm = (
      /^[a-zA-Z\s]{2,}$/.test(query.trim()) ||  // Name-like
      /@/.test(query) ||                        // Email-like
      /\d{3,}/.test(query) ||                   // Phone-like
      /\b(corp|inc|llc|ltd|company|co)\b/i.test(query) // Company-like
    );
    
    return hasSearchKeywords || looksLikeSearchTerm;
  };

  const handleSendMessage = async () => {
    if (!petMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: petMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = petMessage.trim();
    setPetMessage("");
    setIsTyping(true);

    // Show typing indicator
    const typingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: 'Analyzing query...',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Determine if this should be a search or AI chat
      if (isSearchQuery(query)) {
        // Perform database search
        const searchResponse = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query, 
            searchType: 'all', 
            limit: 100  // Increased limit for larger datasets
          })
        });
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          if (searchData.total > 0) {
            // Store the last search query for CSV export
            setLastSearchQuery(query);
            
            const searchResultMessage: Message = {
              id: Date.now().toString(),
              type: 'search-results',
              content: `🔍 Found ${searchData.total} results for "${query}"`,
              searchResults: searchData,
              searchQuery: query,
              timestamp: new Date()
            };
            
            // Remove typing indicator and add search results
            setMessages(prev => prev.slice(0, -1).concat([searchResultMessage]));
            setIsTyping(false);
            return;
          }
        }
      }
      
      // If no search results or not a search query, use AI chat
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      const systemMessage = {
        role: 'system' as const,
        content: `You are Duggu, an expert lead scoring and business intelligence AI assistant created by Zhatore. You have access to campaign and contact databases with 263+ records. Focus on lead analysis, contact intelligence, and campaign optimization. Provide helpful, direct answers. If the user wants to search for specific contacts, suggest they use search commands like "search for [name]" or "find [company]".`
      };

      const response = await fetch('/api/pawmate/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [systemMessage, ...conversationHistory],
          petName: petName || 'Duggu',
          petType: 'assistant',
          sessionId: sessionId || `pawmate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsUsingRealAI(data.isRealAI);
        let aiResponse = data.choices?.[0]?.message?.content || "I'm having trouble responding right now. Please try again.";
        
        // Clean up any unwanted recommendation sections
        aiResponse = aiResponse.replace(/Recommendations?:[\s\S]*?(?=\n\n|$)/gi, '');
        aiResponse = aiResponse.replace(/Next Steps?:[\s\S]*?(?=\n\n|$)/gi, '');
        
        const botMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: aiResponse,
          timestamp: new Date()
        };
        
        // Remove typing indicator and add AI response
        setMessages(prev => prev.slice(0, -1).concat([botMessage]));
      }
    } catch (error) {
      console.error('Message processing failed:', error);
      setMessages(prev => prev.slice(0, -1).concat([{
        id: Date.now().toString(),
        type: 'bot',
        content: "I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      }]));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPetIcon = (type: string) => {
    switch (type) {
      case 'assistant':
        return '🤖';
      case 'dog':
        return '🐕';
      case 'cat':
        return '🐱';
      default:
        return '🤖';
    }
  };

  // CSV Export handler
  const handleCsvExport = async (options: any) => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Get filename from content-disposition header or use default
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'export.csv'
          : 'export.csv';
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Export Successful",
          description: `CSV file "${filename}" has been downloaded`,
        });
        setCsvExportOpen(false);
      } else {
        const error = await response.json();
        toast({
          title: "Export Failed",
          description: error.message || "Failed to export CSV",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Export Error",
        description: "An error occurred while exporting CSV",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // CSV Import handler
  const handleCsvImport = async (file: File, options: any) => {
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', file);
      formData.append('customName', options.customName);
      formData.append('overwrite', options.overwrite.toString());

      const response = await fetch('/api/import/csv', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Import Successful",
          description: `Imported ${result.importedRecords} records into campaign "${result.campaign.name}"`,
        });
        setCsvImportOpen(false);
        
        // Add success message to chat
        const successMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: `✅ **CSV Import Complete!**

**Campaign Created:** ${result.campaign.name}
**Records Imported:** ${result.importedRecords}
**Headers Detected:** ${result.campaign.headers.join(', ')}

Your data has been securely encrypted and added to the system. You can now search through this data using commands like:
• "search ${result.campaign.name}"
• "find contacts in ${result.campaign.name}"`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, successMessage]);
      } else {
        if (response.status === 409) {
          toast({
            title: "Import Conflict",
            description: result.message + (result.suggestedName ? `\n\nSuggested name: ${result.suggestedName}` : ''),
            variant: "destructive"
          });
        } else {
          toast({
            title: "Import Failed",
            description: result.message || "Failed to import CSV",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "An error occurred while importing CSV",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const renderMessage = (msg: Message) => {
    const isUser = msg.type === 'user';
    
    return (
      <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
          <Avatar className="w-8 h-8 mt-1">
            <AvatarFallback className={isUser ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}>
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          
          <div className={`rounded-lg px-4 py-3 ${
            isUser 
              ? 'bg-blue-500 text-white ml-2' 
              : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 mr-2'
          }`}>
            {msg.isTyping ? (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            ) : (
              <div className="text-sm whitespace-pre-wrap">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
                
                {msg.type === 'search-results' && msg.searchResults && (
                  <SearchResultsDisplay 
                    searchResults={msg.searchResults} 
                    searchQuery={msg.searchQuery || ''} 
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">{petName || 'Duggu'} AI Assistant</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <MessageCircle className="w-3 h-3 mr-1" />
              AI Chat & Advanced Database Search
              {isUsingRealAI !== null && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {isUsingRealAI ? 'OpenAI GPT-4' : 'Basic Mode'}
                </Badge>
              )}
            </p>
          </div>
        </div>
        
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assistant Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pet-name">Assistant Name</Label>
                <Input
                  id="pet-name"
                  value={petName}
                  onChange={(e) => {
                    setPetName(e.target.value);
                    localStorage.setItem('pawmate_pet_name', e.target.value);
                  }}
                  placeholder="Enter assistant name"
                />
              </div>
              <div>
                <Label htmlFor="pet-type">Assistant Type</Label>
                <Select value={petType} onValueChange={(value) => {
                  setPetType(value);
                  localStorage.setItem('pawmate_pet_type', value);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assistant">AI Assistant</SelectItem>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={petMessage}
              onChange={(e) => setPetMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything or search your database..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!petMessage.trim() || isTyping}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isTyping ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPetMessage("search delonza")}
              className="text-xs"
            >
              <Search className="w-3 h-3 mr-1" />
              Search Example
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPetMessage("find all CEOs")}
              className="text-xs"
            >
              <Users className="w-3 h-3 mr-1" />
              Find Executives
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPetMessage("What's the best lead scoring strategy?")}
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              AI Question
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCsvExportOpen(true)}
              className="text-xs"
              disabled={!lastSearchQuery}
              data-testid="button-csv-export"
            >
              <Download className="w-3 h-3 mr-1" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCsvImportOpen(true)}
              className="text-xs"
              data-testid="button-csv-import"
            >
              <Upload className="w-3 h-3 mr-1" />
              Import CSV
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* CSV Modals */}
      <CsvExportModal 
        isOpen={csvExportOpen}
        onClose={() => setCsvExportOpen(false)}
        searchQuery={lastSearchQuery}
        onExport={handleCsvExport}
        isExporting={isExporting}
      />
      
      <CsvImportModal 
        isOpen={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImport={handleCsvImport}
        isImporting={isImporting}
      />
    </Card>
  );
}