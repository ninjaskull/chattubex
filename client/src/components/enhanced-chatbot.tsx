import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search, Send, Database, Filter, Download, User, Mail, Phone, Building, Clock, Target, Grid3X3, List, Eye, Dog } from "lucide-react";
import { ContactCards } from './contact-cards';
import { ContactCanvas } from './contact-canvas';
import { ModernContactCanvas } from './modern-contact-canvas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EnhancedChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  contacts: any[];
  campaigns: any[];
  campaignData: any[];
  total: number;
}

interface ChatMessage {
  type: 'user' | 'assistant' | 'search-results';
  content: string;
  searchResults?: SearchResult;
  timestamp: Date;
}

export default function EnhancedChatbot({ isOpen, onClose }: EnhancedChatbotProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: 'assistant',
      content: "👋 Hi! I'm Duggu, your AI lead scoring assistant. I can help you search and analyze your contact database instantly. Try searching for names, emails, companies, or any other contact details!",
      timestamp: new Date()
    }
  ]);
  const [searchType, setSearchType] = useState<'all' | 'contacts' | 'campaigns' | 'campaign-data'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchMutation = useMutation({
    mutationFn: async ({ query, searchType }: { query: string; searchType: string }) => {
      const response = await apiRequest("POST", "/api/search", { query, searchType, limit: 100 });
      return response.json();
    },
    onSuccess: (results: SearchResult) => {
      setIsSearching(false);
      
      // Add user message
      setMessages(prev => [...prev, {
        type: 'user',
        content: `Search: "${query}" (${searchType})`,
        timestamp: new Date()
      }]);

      // Add search results
      const totalResults = results.total;
      let responseContent = `Found ${totalResults} results for "${query}":`;
      
      if (totalResults === 0) {
        responseContent = `No results found for "${query}". Try different keywords or check spelling.`;
      } else {
        if (results.contacts.length > 0) {
          responseContent += `\n\n📞 Direct Contacts (${results.contacts.length}):`;
        }
        if (results.campaigns.length > 0) {
          responseContent += `\n\n📊 Campaigns (${results.campaigns.length}):`;
        }
        if (results.campaignData.length > 0) {
          const totalMatches = results.campaignData.reduce((sum, c) => sum + c.totalMatches, 0);
          responseContent += `\n\n🎯 Campaign Data (${totalMatches} matches across ${results.campaignData.length} campaigns):`;
        }
      }

      setMessages(prev => [...prev, {
        type: 'search-results',
        content: responseContent,
        searchResults: results,
        timestamp: new Date()
      }]);

      setQuery('');
    },
    onError: () => {
      setIsSearching(false);
      toast({ 
        title: "Search Failed", 
        description: "Unable to search database. Please try again.", 
        variant: "destructive" 
      });
    },
  });

  const suggestionsMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/search/suggestions", { query });
      return response.json();
    },
  });

  const handleSearch = () => {
    if (!query.trim() || query.length < 2) {
      toast({ 
        title: "Invalid Search", 
        description: "Please enter at least 2 characters to search.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSearching(true);
    searchMutation.mutate({ query: query.trim(), searchType });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleQuickSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsSearching(true);
    searchMutation.mutate({ query: searchQuery, searchType: 'all' });
  };

  const renderSearchResults = (results: SearchResult) => {
    const allContacts = [
      ...(results.contacts || []),
      ...(results.campaignData?.flatMap((cd: any) => cd.matches || []) || [])
    ];

    return (
      <div className="space-y-4 mt-4">
        {/* Modern Contact Canvas Results */}
        {(() => {
          const allContacts = [
            ...(results.contacts || []),
            ...(results.campaignData?.flatMap((cd: any) => cd.matches || []) || [])
          ];
          
          if (allContacts.length > 0) {
            return (
              <ModernContactCanvas 
                contacts={allContacts}
                campaignName={results.campaignData?.[0]?.campaignName || 'Search Results'}
              />
            );
          }
          
          // Show available campaigns if no contact results
          if (results.campaigns.length > 0) {
            return (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Available Campaigns ({results.campaigns.length})
                </h4>
                <div className="space-y-2">
                  {results.campaigns.map((campaign, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mt-1">
                            <Dog className="w-3 h-3 mr-1" />
                            {campaign.recordCount} contacts
                            <Clock className="w-3 h-3 ml-3 mr-1" />
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickSearch(campaign.name)}
                        >
                          View Data
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          
          return null;
        })()}
      </div>
    );
  };

  const quickSearchOptions = [
    { label: "Show all contacts", query: "*", type: "campaign-data" },
    { label: "Find emails", query: "@", type: "campaign-data" },
    { label: "Show companies", query: "company", type: "campaign-data" },
    { label: "List campaigns", query: "", type: "campaigns" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col bg-white dark:bg-gray-900">
        <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Duggu - Lead Intelligence Assistant</CardTitle>
                <p className="text-blue-100 text-sm">Search through 263+ contact records instantly</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Search Controls */}
          <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
            <div className="flex space-x-2 mb-3">
              {(['all', 'contacts', 'campaigns', 'campaign-data'] as const).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={searchType === type ? "default" : "outline"}
                  onClick={() => setSearchType(type)}
                >
                  {type === 'all' && 'All'}
                  {type === 'contacts' && 'Direct Contacts'}
                  {type === 'campaigns' && 'Campaigns'}
                  {type === 'campaign-data' && 'Contact Records'}
                </Button>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search contacts, emails, companies, or any field..."
                className="flex-1"
                disabled={isSearching}
              />
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || query.length < 2}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Quick Search Options */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickSearchOptions.map((option, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (option.query === "") {
                      setSearchType("campaigns");
                      setQuery("*");
                      handleQuickSearch("*");
                    } else {
                      handleQuickSearch(option.query);
                    }
                  }}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : message.type === 'search-results'
                      ? 'bg-gray-100 dark:bg-gray-800 border'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    {message.searchResults && renderSearchResults(message.searchResults)}
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Footer */}
          <div className="p-3 border-t bg-gray-50 dark:bg-gray-800 text-center text-xs text-gray-500">
            🚀 Powered by FallOwl Intelligence • Real-time database search
          </div>
        </CardContent>
      </Card>
    </div>
  );
}