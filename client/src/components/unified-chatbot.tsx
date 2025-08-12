import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  X, Send, Database, User, Mail, Phone, Building, 
  Target, Bot, Search, MessageSquare, Sparkles, Download 
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { ContactCards } from './contact-cards';
import { ContactCanvas } from './contact-canvas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UnifiedChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'search-results';
  content: string;
  searchResults?: any;
  timestamp: Date;
  isTyping?: boolean;
}

export default function UnifiedChatbot({ isOpen, onClose }: UnifiedChatbotProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `👋 Welcome! I'm Duggu, your AI-powered lead intelligence assistant. I can help you with:

**🔍 Database Search & Analysis**
- Search through your 263+ contact records instantly
- Find contact details including phone numbers, emails, companies
- Search by name, company, title, or any field

**💬 Natural Conversation**
- Answer questions about your data and campaigns
- Provide insights and recommendations
- Help with lead scoring and analysis

**Try asking me:**
- "Search for delonza" (database search)
- "Find contacts at Dakkota" (company search)  
- "What's the best way to score leads?" (conversational AI)
- "Show me all plant managers" (title search)

How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUsingRealAI, setIsUsingRealAI] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isSearchQuery = (query: string): boolean => {
    const searchKeywords = [
      'search', 'find', 'show', 'get', 'lookup', 'contact',
      'phone', 'email', 'company', 'title', 'manager', 'ceo',
      'director', 'vp', 'vice president', 'executive'
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
      /\d{3,}/.test(query)                      // Phone-like
    );
    
    return hasSearchKeywords || looksLikeSearchTerm;
  };

  const performSearch = async (query: string): Promise<any> => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: query.trim(), 
          searchType: 'all', 
          limit: 100 
        })
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
    return null;
  };

  const performAIChat = async (query: string): Promise<string> => {
    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await fetch('/api/pawmate/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are Duggu, an expert lead scoring and business intelligence AI assistant created by Fallowl. You have access to campaign and contact databases with 263+ records. Focus on lead analysis, contact intelligence, and campaign optimization. Provide helpful, direct answers without generic recommendations. If the user wants to search for specific contacts, suggest they use search commands like "search for [name]" or "find [company]".`
            },
            ...conversationHistory,
            {
              role: 'user',
              content: query
            }
          ],
          petName: 'Duggu',
          petType: 'assistant',
          sessionId: `unified_${Date.now()}`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsUsingRealAI(data.isRealAI);
        let aiResponse = data.choices?.[0]?.message?.content || "I'm having trouble responding right now. Please try again.";
        
        // Clean up any unwanted recommendation sections
        aiResponse = aiResponse.replace(/Recommendations?:[\s\S]*?(?=\n\n|$)/gi, '');
        aiResponse = aiResponse.replace(/Next Steps?:[\s\S]*?(?=\n\n|$)/gi, '');
        aiResponse = aiResponse.replace(/Please remember to respect[\s\S]*?(?=\n\n|$)/gi, '');
        
        return aiResponse;
      }
    } catch (error) {
      console.error('AI chat failed:', error);
    }
    
    return "I'm experiencing technical difficulties. Please try again in a moment.";
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = message.trim();
    setMessage('');
    setIsProcessing(true);

    // Show typing indicator
    const typingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: 'Typing...',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Determine if this should be a search or AI chat
      if (isSearchQuery(query)) {
        // Try database search first
        const searchResults = await performSearch(query);
        
        if (searchResults && searchResults.total > 0) {
          let responseContent = `🔍 Found ${searchResults.total} results for "${query}":\n\n`;
          
          // Display campaign data results with phone numbers
          if (searchResults.campaignData && searchResults.campaignData.length > 0) {
            searchResults.campaignData.forEach((campaign: any) => {
              responseContent += `**${campaign.campaignName} Campaign (${campaign.totalMatches} matches):**\n\n`;
              campaign.matches.slice(0, 5).forEach((contact: any) => {
                responseContent += `📋 **${contact['First Name']} ${contact['Last Name']}**\n`;
                responseContent += `🏢 ${contact.Company || 'N/A'}\n`;
                responseContent += `💼 ${contact.Title || 'N/A'}\n`;
                responseContent += `📧 ${contact.Email || 'N/A'}\n`;
                responseContent += `📱 Mobile: ${contact['Mobile Phone'] || 'Not Available'}\n`;
                responseContent += `☎️ Other: ${contact['Other Phone'] || 'Not Available'}\n`;
                responseContent += `🏢 Corporate: ${contact['Corporate Phone'] || 'Not Available'}\n`;
                responseContent += `🌐 Website: ${contact.Website || 'N/A'}\n`;
                if (contact['Person Linkedin Url']) {
                  responseContent += `🔗 LinkedIn: ${contact['Person Linkedin Url']}\n`;
                }
                responseContent += `\n`;
              });
            });
          }
          
          // Display direct contacts
          if (searchResults.contacts && searchResults.contacts.length > 0) {
            responseContent += `**Direct Contacts:**\n\n`;
            searchResults.contacts.forEach((contact: any) => {
              responseContent += `📋 **${contact.name}**\n`;
              responseContent += `📧 ${contact.email}\n`;
              responseContent += `📱 ${contact.mobile}\n\n`;
            });
          }
          
          // Remove typing indicator and add search results
          setMessages(prev => prev.slice(0, -1).concat([{
            id: Date.now().toString(),
            type: 'search-results',
            content: responseContent,
            searchResults,
            timestamp: new Date()
          }]));
        } else {
          // No search results, fall back to AI
          const aiResponse = await performAIChat(`No direct results found for "${query}". ${query}`);
          setMessages(prev => prev.slice(0, -1).concat([{
            id: Date.now().toString(),
            type: 'assistant',
            content: aiResponse,
            timestamp: new Date()
          }]));
        }
      } else {
        // Use AI chat for general conversation
        const aiResponse = await performAIChat(query);
        setMessages(prev => prev.slice(0, -1).concat([{
          id: Date.now().toString(),
          type: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        }]));
      }
    } catch (error) {
      console.error('Message processing failed:', error);
      setMessages(prev => prev.slice(0, -1).concat([{
        id: Date.now().toString(),
        type: 'assistant',
        content: "I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      }]));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (msg: ChatMessage) => {
    const isUser = msg.type === 'user';
    
    return (
      <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
          <Avatar className="w-8 h-8 mt-1">
            <AvatarFallback className={isUser ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}>
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          
          <div className={`rounded-lg px-4 py-3 ${
            isUser 
              ? 'bg-blue-500 text-white ml-2' 
              : msg.type === 'search-results'
                ? 'bg-green-50 border border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100 mr-2'
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
              </div>
            )}
            
            {msg.type === 'search-results' && msg.searchResults && (
              <div className="mt-4 space-y-4">
                {/* Search Results Header */}
                <div className="flex items-center justify-between border-t border-green-200 dark:border-green-700 pt-3">
                  <div className="flex items-center space-x-4 text-sm text-green-700 dark:text-green-300">
                    <div className="flex items-center">
                      <Database className="w-4 h-4 mr-1" />
                      {msg.searchResults.total} total results
                    </div>
                    {msg.searchResults.campaignData?.length > 0 && (
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        {msg.searchResults.campaignData.length} campaigns
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Text Results */}
                {msg.searchResults.contacts?.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Direct Contacts ({msg.searchResults.contacts.length})
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {msg.searchResults.contacts.map((contact: any, index: number) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded border">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {contact.name || 'Unknown Name'}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              {contact.email && (
                                <div className="flex items-center">
                                  <Mail className="w-3 h-3 mr-2" />
                                  <span>Email: {contact.email}</span>
                                </div>
                              )}
                              {(contact.phone || contact.mobile) && (
                                <div className="flex items-center">
                                  <Phone className="w-3 h-3 mr-2" />
                                  <span>Phone: {contact.phone || contact.mobile}</span>
                                </div>
                              )}
                              {contact.company && (
                                <div className="flex items-center">
                                  <Building className="w-3 h-3 mr-2" />
                                  <span>Company: {contact.company}</span>
                                </div>
                              )}
                              {contact.title && (
                                <div>Title: {contact.title}</div>
                              )}
                              {contact.linkedin && (
                                <div>LinkedIn: {contact.linkedin}</div>
                              )}
                            </div>
                            <div className="mt-2">
                              <Badge variant={contact.emailSent ? "default" : "secondary"}>
                                {contact.emailSent ? "Contacted" : "New"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {msg.searchResults.campaignData?.map((campaignData: any, campaignIndex: number) => (
                  <div key={campaignIndex} className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      {campaignData.campaignName} ({campaignData.totalMatches} matches)
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {campaignData.matches.map((contact: any, index: number) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded border">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {contact.name || contact.Name || contact.first_name || contact['First Name'] || 'Unknown Name'}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              {(contact.email || contact.Email || contact['Email Address']) && (
                                <div className="flex items-center">
                                  <Mail className="w-3 h-3 mr-2" />
                                  <span>Email: {contact.email || contact.Email || contact['Email Address']}</span>
                                </div>
                              )}
                              {(contact.phone || contact.Phone || contact.mobile || contact.Mobile || contact['Phone Number']) && (
                                <div className="flex items-center">
                                  <Phone className="w-3 h-3 mr-2" />
                                  <span>Phone: {contact.phone || contact.Phone || contact.mobile || contact.Mobile || contact['Phone Number']}</span>
                                </div>
                              )}
                              {(contact.company || contact.Company || contact.organization || contact.Organization) && (
                                <div className="flex items-center">
                                  <Building className="w-3 h-3 mr-2" />
                                  <span>Company: {contact.company || contact.Company || contact.organization || contact.Organization}</span>
                                </div>
                              )}
                              {(contact.title || contact.Title || contact.job_title || contact['Job Title']) && (
                                <div>Title: {contact.title || contact.Title || contact.job_title || contact['Job Title']}</div>
                              )}
                              {(contact.linkedin || contact.LinkedIn || contact['LinkedIn Profile']) && (
                                <div>LinkedIn: {contact.linkedin || contact.LinkedIn || contact['LinkedIn Profile']}</div>
                              )}
                              {(contact.location || contact.Location || contact.city || contact.City) && (
                                <div>Location: {contact.location || contact.Location || contact.city || contact.City}</div>
                              )}
                              {(contact.industry || contact.Industry) && (
                                <div>Industry: {contact.industry || contact.Industry}</div>
                              )}
                              {/* Show other available fields */}
                              {campaignData.headers.filter((header: string) => 
                                !['name', 'Name', 'first_name', 'First Name', 'email', 'Email', 'Email Address', 
                                  'phone', 'Phone', 'mobile', 'Mobile', 'Phone Number', 'company', 'Company', 
                                  'organization', 'Organization', 'title', 'Title', 'job_title', 'Job Title',
                                  'linkedin', 'LinkedIn', 'LinkedIn Profile', 'location', 'Location', 'city', 'City',
                                  'industry', 'Industry'].includes(header) && contact[header]
                              ).slice(0, 3).map((header: string) => (
                                <div key={header}>
                                  {header}: {contact[header]}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Duggu AI Assistant</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center mt-1">
                <MessageSquare className="w-3 h-3 mr-1" />
                AI Chat & Database Search
                {isUsingRealAI !== null && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {isUsingRealAI ? 'OpenAI GPT-4' : 'Basic Mode'}
                  </Badge>
                )}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
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
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything or search your database..."
                className="flex-1"
                disabled={isProcessing}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!message.trim() || isProcessing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isProcessing ? (
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
                onClick={() => setMessage("Search for delonza")}
                className="text-xs"
              >
                <Search className="w-3 h-3 mr-1" />
                Search Example
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setMessage("What's the best way to score leads?")}
                className="text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI Question
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setMessage("Find contacts at Dakkota")}
                className="text-xs"
              >
                <Building className="w-3 h-3 mr-1" />
                Company Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}