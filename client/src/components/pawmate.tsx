import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MessageCircle, Zap, Dog, Settings, Send, Sparkles, Bot } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export default function PawMate() {
  const [petName, setPetName] = useState(() => localStorage.getItem('pawmate_pet_name') || "");
  const [petType, setPetType] = useState(() => localStorage.getItem('pawmate_pet_type') || "dog");
  const [petMessage, setPetMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isUsingRealAI, setIsUsingRealAI] = useState<boolean | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem('pawmate_session_id'));
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        const icon = getPetIcon(petType);
        setMessages([{
          id: '1',
          type: 'bot',
          content: `Welcome to Duggu AI! I'm your lead intelligence assistant with direct database access. I can search through your 263+ contact records instantly.\n\n**🔍 Database Search Capabilities:**\n- Search by name, email, phone, company, title\n- Find complete contact details with phone numbers\n- Filter by any field in your campaign data\n- Real-time search through encrypted records\n\n**Try searching for:**\n- "delonza" - Find specific contacts\n- "@company.com" - Find all employees at a company\n- "CEO" or "Manager" - Search by job titles\n- Phone numbers to find contact details\n\nType your search query and I'll return the exact contact information with phone numbers instantly!`,
          timestamp: new Date()
        }]);
      }
    };

    loadChatHistory();
  }, [sessionId, petType, petName]); // Don't include messages.length to avoid infinite loop

  // Clear chat and create new session function
  const clearChatHistory = async () => {
    try {
      // Create a new session
      const newSessionId = `pawmate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      localStorage.setItem('pawmate_session_id', newSessionId);
      
      // Clear messages and show welcome message
      const icon = getPetIcon(petType);
      setMessages([{
        id: '1',
        type: 'bot',
        content: `${icon} Welcome! I'm ${petName || 'Duggu'}, your intelligent lead scoring and contact analysis AI assistant created by Zhatore. I have full database access and can help you with:\n\n**📊 Lead Scoring & Analysis**\n- Score contacts by business value and conversion potential\n- Identify C-level executives and decision-makers\n- Analyze contact completeness and qualification\n\n**🔍 Database Intelligence**\n- Search and analyze your uploaded contact data\n- Generate insights from campaign data\n- Contact enrichment and data quality assessment\n\n**🎯 Campaign Optimization**\n- Prospect prioritization and segmentation\n- Market analysis and competitive intelligence\n- Outreach recommendations and lead qualification\n\nI have access to all your campaign and contact data - ready to help you identify the highest quality leads! What would you like to analyze?`,
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
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

    // Try database search first for direct contact results
    try {
      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          searchType: 'all', 
          limit: 10 
        })
      });
      
      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();
        
        if (searchResults.total > 0) {
          let responseContent = `Found ${searchResults.total} results for "${query}":\n\n`;
          
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
          
          const botMessage: Message = {
            id: Date.now().toString(),
            type: 'bot',
            content: responseContent,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
          return;
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
    }

    // Fallback to AI assistant for general queries
    try {
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      const systemMessage = {
        role: 'system' as const,
        content: `You are Duggu, an expert lead scoring and business intelligence AI assistant created by Zhatore. Focus exclusively on lead analysis, contact intelligence, and campaign optimization. Provide direct, actionable business insights without generic recommendations.`
      };

      const response = await fetch('/api/pawmate/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [systemMessage, ...conversationHistory],
          petName: petName || 'Duggu',
          petType: petType || 'assistant',
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      let botResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response right now. Please try again!";
      
      // Remove all recommendation sections
      botResponse = botResponse.replace(/Recommendations?:[\s\S]*?(?=\n\n|$)/gi, '');
      botResponse = botResponse.replace(/Next Steps?:[\s\S]*?(?=\n\n|$)/gi, '');
      botResponse = botResponse.replace(/Please remember to respect[\s\S]*?(?=\n\n|$)/gi, '');
      botResponse = botResponse.replace(/Outreach:[\s\S]*?(?=\n\n|$)/gi, '');
      botResponse = botResponse.replace(/Engagement Strategy:[\s\S]*?(?=\n\n|$)/gi, '');
      botResponse = botResponse.replace(/Data Completion:[\s\S]*?(?=\n\n|$)/gi, '');
      botResponse = botResponse.replace(/Email Engagement:[\s\S]*?(?=\n\n|$)/gi, '');
      botResponse = botResponse.replace(/Data Enrichment:[\s\S]*?(?=\n\n|$)/gi, '');
      botResponse = botResponse.replace(/Follow-Up:[\s\S]*?(?=\n\n|$)/gi, '');
      
      setIsUsingRealAI(data.isRealAI);
      
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem('pawmate_session_id', data.sessionId);
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback to simple response
      const fallbackResponse = generateBotResponse(currentMessage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: fallbackResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('health') || input.includes('sick') || input.includes('vet')) {
      return `🏥 For health concerns, I recommend consulting with a veterinarian. Meanwhile, ensure ${petName || 'your pet'} has fresh water, proper nutrition, and regular exercise. Watch for any changes in behavior or appetite.`;
    }
    
    if (input.includes('food') || input.includes('eat') || input.includes('nutrition')) {
      return `🍖 Great question about nutrition! ${petName || 'Your pet'} needs a balanced diet appropriate for their age and size. Avoid chocolate, grapes, onions, and garlic. Fresh water should always be available!`;
    }
    
    if (input.includes('exercise') || input.includes('walk') || input.includes('play')) {
      return `🎾 Exercise is fantastic for pets! Try interactive toys, fetch games, or nature walks. ${petName || 'Your pet'} will love the mental and physical stimulation. Aim for at least 30 minutes of activity daily!`;
    }
    
    if (input.includes('training') || input.includes('behavior')) {
      return `🎯 Training tip: Use positive reinforcement with treats and praise! Be consistent and patient. Short, frequent sessions work best. ${petName || 'Your pet'} is learning and wants to please you!`;
    }
    
    if (input.includes('grooming') || input.includes('bath') || input.includes('brush')) {
      return `✨ Regular grooming keeps ${petName || 'your pet'} healthy and happy! Brush regularly to prevent matting, trim nails carefully, and bathe when needed. Make it a positive experience with treats and gentle handling.`;
    }

    // Default responses with personality
    const responses = [
      `🐕 That's interesting! Tell me more about ${petName || 'your pet'} - I'd love to help you both!`,
      `🎉 ${petName || 'Your furry friend'} is lucky to have such a caring owner! What specific help do you need?`,
      `🐾 I'm here to help with anything pet-related! Whether it's training, health, or just fun activities for ${petName || 'your companion'}.`,
      `💝 Every pet is special! ${petName || 'Your pet'} must bring so much joy to your life. How can I assist you today?`,
      `🌟 Great question! I'm always excited to chat about pets. ${petName || 'Your buddy'} sounds wonderful!`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const savePetSettings = () => {
    localStorage.setItem('pawmate_pet_name', petName);
    localStorage.setItem('pawmate_pet_type', petType);
    setSettingsOpen(false);
    
    // Add welcome message if pet name was just set
    if (petName && messages.length === 1) {
      const welcomeMessage: Message = {
        id: (Date.now()).toString(),
        type: 'bot',
        content: `Nice to meet ${petName}! 🎾 I'm so excited to help you take care of your ${petType}. Would you like some fun activity ideas or health tips?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, welcomeMessage]);
    }
  };

  const getPetIcon = (type: string) => {
    switch (type) {
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'fish': return '🐠';
      case 'rabbit': return '🐰';
      case 'hamster': return '🐹';
      default: return '🐕';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Settings Dialog */}
      <div className="flex justify-end">
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Pet Settings
            </Button>
          </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Pet Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pet-name">Pet Name</Label>
                  <Input
                    id="pet-name"
                    placeholder="What's your pet's name?"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    data-testid="input-settings-pet-name"
                  />
                </div>
                <div>
                  <Label htmlFor="pet-type">Pet Type</Label>
                  <Select value={petType} onValueChange={setPetType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog 🐕</SelectItem>
                      <SelectItem value="cat">Cat 🐱</SelectItem>
                      <SelectItem value="bird">Bird 🐦</SelectItem>
                      <SelectItem value="fish">Fish 🐠</SelectItem>
                      <SelectItem value="rabbit">Rabbit 🐰</SelectItem>
                      <SelectItem value="hamster">Hamster 🐹</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={savePetSettings} className="w-full" data-testid="button-save-settings">
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
      </div>

      {/* Advanced Chat Interface */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-lg">{getPetIcon(petType)}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{petName || 'Duggu'}</h3>
                <p className="text-xs text-slate-600 capitalize">
                  {petName ? `Your Adorable ${petType}` : 'Your Lead Scoring Assistant'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                OpenAI GPT-4
              </span>
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Online
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChatHistory}
                className="text-xs px-2 py-1 h-6 text-slate-500 hover:text-slate-700"
                title="Start new conversation"
              >
                New Chat
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Messages Container */}
          <div className="h-[360px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className={`h-8 w-8 ${message.type === 'user' ? 'ring-2 ring-blue-200' : ''}`}>
                  <AvatarFallback className={
                    message.type === 'user' 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-gradient-to-br from-orange-400 to-red-500 text-white"
                  }>
                    {message.type === 'user' ? (
                      <span className="text-sm font-semibold">U</span>
                    ) : (
                      <span className="text-sm">{getPetIcon(petType)}</span>
                    )}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-sm sm:max-w-lg ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`rounded-lg p-2 shadow-sm ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-white border border-slate-200'
                  }`}>
                    {message.type === 'user' ? (
                      <p className="text-sm text-white whitespace-pre-wrap">
                        {message.content}
                      </p>
                    ) : (
                      <div className="text-sm text-slate-800 prose prose-sm max-w-none">
                        <ReactMarkdown 
                          components={{
                            p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-slate-700">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-2 pl-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-2 pl-2">{children}</ol>,
                            li: ({ children }) => <li className="text-sm text-slate-700 leading-relaxed">{children}</li>,
                            strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
                            em: ({ children }) => <em className="font-medium text-slate-800">{children}</em>,
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-3 text-slate-900 border-b border-slate-200 pb-1">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-slate-900">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-2 text-slate-800">{children}</h3>,
                            h4: ({ children }) => <h4 className="text-sm font-semibold mb-1 text-slate-700">{children}</h4>,
                            code: ({ children, inline }: any) => 
                              inline 
                                ? <code className="bg-orange-50 text-orange-800 px-1.5 py-0.5 rounded text-xs font-mono border border-orange-200">{children}</code>
                                : <pre className="bg-slate-100 p-3 rounded-lg mb-3 overflow-x-auto border"><code className="text-xs font-mono text-slate-800">{children}</code></pre>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-orange-300 pl-4 py-2 mb-3 bg-orange-50 rounded-r-lg">{children}</blockquote>,
                            hr: () => <hr className="my-4 border-slate-200" />,
                            table: ({ children }) => <table className="w-full border-collapse border border-slate-200 mb-3 rounded-lg overflow-hidden">{children}</table>,
                            th: ({ children }) => <th className="border border-slate-200 px-3 py-2 bg-slate-50 font-semibold text-left text-sm">{children}</th>,
                            td: ({ children }) => <td className="border border-slate-200 px-3 py-2 text-sm">{children}</td>,
                            a: ({ children, href }) => <a href={href} className="text-orange-600 hover:text-orange-700 underline font-medium" target="_blank" rel="noopener noreferrer">{children}</a>
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white">
                    <span className="text-sm">{getPetIcon(petType)}</span>
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-xs text-slate-500 ml-2">Duggu is analyzing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-white/50 backdrop-blur-sm">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Ask about lead scoring, contact analysis, or campaign optimization..."
                  value={petMessage}
                  onChange={(e) => setPetMessage(e.target.value)}
                  className="resize-none min-h-[50px] max-h-24 pr-12 border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  data-testid="textarea-chat-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!petMessage.trim() || isTyping}
                  size="sm"
                  className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg"
                  data-testid="button-send-chat"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}