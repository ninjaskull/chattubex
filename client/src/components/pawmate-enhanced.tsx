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
                <Dog className="w-4 h-4 text-muted-foreground" />
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
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100">
          {displayContacts.map((contact: any, index: number) => (
            <ContactCard 
              key={index} 
              contact={contact} 
              source={contact.source}
            />
          ))}
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100">
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
              onClick={() => {
                // This will be handled by the parent component
                const event = new CustomEvent('exportSearchResults', { 
                  detail: { query: searchQuery } 
                });
                window.dispatchEvent(event);
              }}
              disabled={!searchQuery}
              className="text-xs h-7"
              data-testid="button-export-results"
            >
              <Download className="w-3 h-3 mr-1" />
              Save Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PawMate() {
  const [petName, setPetName] = useState(() => localStorage.getItem('pawmate_pet_name') || "Duggu");
  const [userName, setUserName] = useState(() => localStorage.getItem('pawmate_user_name') || "");
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
  const [historyInitialized, setHistoryInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history on component mount
  useEffect(() => {
    if (historyInitialized) return; // Prevent re-initialization
    
    const loadChatHistory = async () => {
      let historyLoaded = false;
      
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
              historyLoaded = true;
            }
          }
        } catch (error) {
          console.error('Failed to load chat history:', error);
        }
      }
      
      // Load welcome message only if no history was loaded
      if (!historyLoaded) {
        const userGreeting = userName ? ` ${userName}` : '';
        setMessages([{
          id: '1',
          type: 'bot',
          content: `# 👋 Hi${userGreeting}! I'm ${petName || 'Duggu'}

**Your Advanced AI Business Intelligence Assistant** - Created by Fallowl

I'm your comprehensive solution for lead generation, data analysis, and business intelligence with Apollo.io API expertise.

## 🚀 Advanced Capabilities:
- **Lead Scoring & Analysis**: AI-powered prospect qualification with authority scoring
- **Apollo.io Integration**: Complete API knowledge for advanced prospecting
- **Campaign Management**: Create, analyze, and optimize marketing campaigns
- **Data Operations**: Search, filter, export with complex multi-criteria queries
- **Contact Enrichment**: Enhanced data with LinkedIn profiles and social signals
- **Business Intelligence**: Market analysis, competitive insights, strategic recommendations
- **Automation Workflows**: Process optimization and efficiency recommendations

## 🎯 Apollo.io API Expertise:
- **People Search API**: Advanced filtering with Boolean logic and complex criteria
- **Organization Search**: Account-based marketing and company intelligence
- **Contact Enrichment**: Email discovery, data enhancement, verification
- **Sequence Automation**: Multi-channel outreach with performance tracking
- **Bulk Operations**: Export up to 10,000 records with custom filtering
- **CRM Integration**: Seamless data synchronization workflows

## 📊 Current Database Status:
- **Lead Intelligence**: Advanced scoring algorithms ready
- **Campaign Data**: Multi-source analysis capabilities
- **Search Engine**: Complex queries with Boolean operators
- **Export Functions**: Custom campaign creation with automated naming

## 💡 Smart Actions Available:
- "How do I target C-level executives with Apollo.io?"
- "Generate comprehensive prospect scoring report"
- "Create automated prospecting workflow recommendations"
- "Find high-value prospects with executive authority"
- "Show me Apollo.io API examples for lead generation"
- "Analyze my contact database for quality scoring"

**I combine database operations, Apollo.io expertise, and strategic business intelligence to drive your lead generation success!** 🎯

*What advanced prospecting challenge can I help you solve today?*`,
          timestamp: new Date()
        }]);
      }
      
      setHistoryInitialized(true);
    };

    loadChatHistory();
  }, [sessionId, historyInitialized]); // Only depend on sessionId to avoid reloading when name changes

  // Search query detection logic - only trigger for explicit search or clear contact data
  const isSearchQuery = (query: string): boolean => {
    const lowerQuery = query.toLowerCase().trim();
    
    // Explicit search keywords - user must use these to trigger search
    const searchKeywords = [
      'search', 'find', 'lookup', 'show me', 'get me', 
      'list all', 'find all', 'search for', 'who is'
    ];
    
    // Check for explicit search intent
    const hasSearchKeywords = searchKeywords.some(keyword => 
      lowerQuery.includes(keyword)
    );
    
    // Check for identifiable personal/contact information patterns
    const hasContactInfo = (
      /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(query) ||  // Complete email address
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(query) ||  // Phone number pattern
      /\b[A-Z][a-z]+ [A-Z][a-z]+@/.test(query) ||  // Name with email
      /\b(corp|corporation|inc|incorporated|llc|ltd|limited|company|co\.)\b/i.test(query) ||  // Company identifiers
      (/\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(query) && query.split(' ').length <= 3 && query.length > 6)  // Likely full name (2-3 words, proper case)
    );
    
    // Common conversational phrases should NOT trigger search
    const conversationalPhrases = [
      'hello', 'hi', 'hey', 'thank you', 'thanks', 'please', 'yes', 'no',
      'how are you', 'what can you do', 'help me', 'tell me about', 'explain',
      'i need help', 'can you help', 'what is', 'how do i', 'how to'
    ];
    
    const isConversational = conversationalPhrases.some(phrase => 
      lowerQuery === phrase || lowerQuery.startsWith(phrase + ' ')
    );
    
    // Only trigger search for explicit keywords or clear contact information
    return (hasSearchKeywords || hasContactInfo) && !isConversational;
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

      const userNameContext = userName ? ` The user's name is ${userName}, so address them by name when appropriate.` : '';
      const systemMessage = {
        role: 'system' as const,
        content: `You are ${petName || 'Duggu'}, an expert lead scoring and business intelligence AI assistant created by Fallowl. You have access to campaign and contact databases with 263+ records. Focus on lead analysis, contact intelligence, and campaign optimization. Provide helpful, direct answers.${userNameContext} If the user wants to search for specific contacts, suggest they use search commands like "search for [name]" or "find [company]".`
      };

      // Use streaming endpoint for real-time responses
      const response = await fetch('/api/pawmate/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [systemMessage, ...conversationHistory],
          petName: petName || 'Duggu',
          userName: userName || '',
          petType: 'assistant',
          sessionId: sessionId || `pawmate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamedContent = '';
        let currentBotMessageId = Date.now().toString();
        
        // Remove typing indicator and add empty bot message for streaming
        setMessages(prev => prev.slice(0, -1).concat([{
          id: currentBotMessageId,
          type: 'bot',
          content: '',
          timestamp: new Date()
        }]));

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'session' && data.sessionId && data.sessionId !== sessionId) {
                    setSessionId(data.sessionId);
                    localStorage.setItem('pawmate_session_id', data.sessionId);
                  } else if (data.type === 'content') {
                    streamedContent += data.content;
                    // Update the bot message with streaming content
                    setMessages(prev => prev.map(msg => 
                      msg.id === currentBotMessageId 
                        ? { ...msg, content: streamedContent }
                        : msg
                    ));
                  } else if (data.type === 'done') {
                    setIsUsingRealAI(true);
                  } else if (data.type === 'error') {
                    console.error('Streaming error:', data.message);
                    // Update message with error content
                    setMessages(prev => prev.map(msg => 
                      msg.id === currentBotMessageId 
                        ? { ...msg, content: "I encountered an error processing your request. Please try again." }
                        : msg
                    ));
                  }
                } catch (parseError) {
                  // Ignore parsing errors for incomplete chunks
                }
              }
            }
          }
        } catch (streamError) {
          console.error('Stream reading error:', streamError);
          setMessages(prev => prev.map(msg => 
            msg.id === currentBotMessageId 
              ? { ...msg, content: "I encountered an error processing your request. Please try again." }
              : msg
          ));
        }
      } else {
        // Fallback to original endpoint if streaming fails
        const fallbackResponse = await fetch('/api/pawmate/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [systemMessage, ...conversationHistory],
            petName: petName || 'Duggu',
            userName: userName || '',
            petType: 'assistant',
            sessionId: sessionId || `pawmate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }),
        });

        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          setIsUsingRealAI(data.isRealAI);
          
          // Update session ID if returned from server
          if (data.sessionId && data.sessionId !== sessionId) {
            setSessionId(data.sessionId);
            localStorage.setItem('pawmate_session_id', data.sessionId);
          }
          
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
        return '🐕';
      case 'dog':
        return '🐕';
      case 'cat':
        return '🐱';
      default:
        return '🐕';
    }
  };

  // Listen for export events from search results
  useEffect(() => {
    const handleExportEvent = (event: any) => {
      setLastSearchQuery(event.detail.query);
      setCsvExportOpen(true);
    };
    
    window.addEventListener('exportSearchResults', handleExportEvent);
    return () => window.removeEventListener('exportSearchResults', handleExportEvent);
  }, []);

  // CSV Export handler - now saves directly to records
  const handleCsvExport = async (options: any) => {
    setIsExporting(true);
    try {
      // Add saveToRecords flag to save directly to records
      const exportOptions = {
        ...options,
        saveToRecords: true
      };

      const response = await fetch('/api/export-save/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportOptions)
      });

      if (response.ok) {
        const result = await response.json();
        
        toast({
          title: "Export & Save Successful",
          description: `Exported ${result.exportedRecords} records and saved to campaign "${result.campaign.name}"`,
        });
        setCsvExportOpen(false);
        
        // Add success message to chat
        const successMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: `✅ **Export & Save Complete!**

**Search Query:** "${result.searchQuery}"
**Campaign Created:** ${result.campaign.name}
**Records Exported:** ${result.exportedRecords}
**Headers:** ${result.campaign.headers.join(', ')}

Your search results have been exported and saved as a new campaign record. You can now search through this data anytime!`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, successMessage]);
        
        // Invalidate campaigns cache to refresh the list immediately
        import('@/lib/queryClient').then(({ queryClient }) => {
          queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
          // Force refetch to update immediately
          queryClient.refetchQueries({ queryKey: ['/api/campaigns'] });
        });
      } else {
        const error = await response.json();
        toast({
          title: "Export Failed",
          description: error.message || "Failed to export and save data",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Export Error",
        description: "An error occurred while exporting data",
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
        
        // Invalidate campaigns cache to refresh the list immediately for CSV import
        import('@/lib/queryClient').then(({ queryClient }) => {
          queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
          // Force refetch to update immediately
          queryClient.refetchQueries({ queryKey: ['/api/campaigns'] });
        });
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
        <div className={`flex w-full max-w-none ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
          <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
            <AvatarFallback className={isUser ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}>
              {isUser ? <User className="w-4 h-4" /> : <Dog className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          
          <div className={`rounded-lg px-4 py-3 min-w-0 flex-1 ${
            isUser 
              ? 'bg-blue-500 text-white ml-2 max-w-[80%] self-end' 
              : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 mr-2'
          }`}>
            {msg.isTyping ? (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            ) : (
              <div className="text-sm break-words overflow-wrap-anywhere">
                <ReactMarkdown 
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    pre: ({ children }) => <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto">{children}</pre>,
                    code: ({ children }) => <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">{children}</code>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
                
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
    <Card className="w-full h-[calc(100vh-160px)] flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-4 border-b flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Dog className="w-3 h-3 text-white" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium">{petName || 'Duggu'}</CardTitle>
            <p className="text-xs text-muted-foreground flex items-center">
              <MessageCircle className="w-2 h-2 mr-1" />
              AI Chat
              {isUsingRealAI !== null && (
                <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 h-4">
                  {isUsingRealAI ? 'GPT-4' : 'Basic'}
                </Badge>
              )}
            </p>
          </div>
        </div>
        
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Settings className="w-3 h-3" />
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
                    // Dispatch event to notify other components about the name change
                    window.dispatchEvent(new CustomEvent('assistantNameChanged'));
                  }}
                  placeholder="Enter assistant name"
                />
              </div>
              <div>
                <Label htmlFor="user-name">Your Name (How assistant addresses you)</Label>
                <Input
                  id="user-name"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    localStorage.setItem('pawmate_user_name', e.target.value);
                  }}
                  placeholder="Enter your name (optional)"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
        <ScrollArea className="flex-1 p-4 overflow-y-auto" style={{ height: '460px', maxHeight: '460px' }}>
          <div className="space-y-4 pr-2">
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-3 flex-shrink-0 bg-white">
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
          
          <div className="flex flex-wrap gap-1 mt-2 max-h-16 overflow-y-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPetMessage("Show me comprehensive lead analysis with scoring")}
              className="text-xs"
            >
              <Search className="w-3 h-3 mr-1" />
              Lead Analysis
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPetMessage("Find all C-level executives and VPs")}
              className="text-xs"
            >
              <Users className="w-3 h-3 mr-1" />
              Executive Search
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPetMessage("How do I use Apollo.io API for prospecting?")}
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Apollo.io Guide
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
              Save Results
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