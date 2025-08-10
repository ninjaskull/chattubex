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

  // Load initial message
  useEffect(() => {
    if (messages.length === 0) {
      const icon = getPetIcon(petType);
      setMessages([{
        id: '1',
        type: 'bot',
        content: `${icon} Welcome to PawMate! I'm your advanced AI companion, powered by sophisticated pet care knowledge. I can help you with health concerns, nutrition advice, training tips, behavioral insights, grooming guidance, and so much more!\n\n${petName ? `Nice to meet ${petName}!` : 'Tell me about your pet and'} let's make sure they live their happiest, healthiest life together! 🌟`,
        timestamp: new Date()
      }]);
    }
  }, [messages.length, petType, petName]);

  const handleSendMessage = async () => {
    if (!petMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: petMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = petMessage.trim();
    setPetMessage("");
    setIsTyping(true);

    try {
      // Prepare messages for OpenAI format
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      // Add system message for context
      const systemMessage = {
        role: 'system' as const,
        content: `You are PawMate, a friendly and knowledgeable AI assistant specializing in pet care. You're helping ${petName || 'the user'} with their ${petType || 'pet'}. Provide helpful, accurate, and caring advice about pet health, nutrition, behavior, training, grooming, and general pet care. Always be encouraging and supportive. Use appropriate emojis to make your responses warm and engaging.`
      };

      const response = await fetch('/api/pawmate/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [systemMessage, ...conversationHistory],
          petName: petName || '',
          petType: petType || 'pet',
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const botResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response right now. Please try again!";
      
      // Update AI status indicator
      setIsUsingRealAI(data.isRealAI);
      
      // Save session ID for persistent chat history
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
    <div className="max-w-4xl mx-auto space-y-4">
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

      {/* Pet Profile Card - Only show if pet is configured */}
      {petName && (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-xl">{getPetIcon(petType)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{petName}</h3>
                <p className="text-sm text-slate-600 capitalize">Your adorable {petType}</p>
              </div>
              <div className="ml-auto">
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Online
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Chat Interface */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-lg">{getPetIcon(petType)}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-600">PawMate AI</h3>
                <p className="text-xs text-slate-500">Your intelligent companion for pet care and fun!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isUsingRealAI !== null && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isUsingRealAI 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {isUsingRealAI ? 'OpenAI' : 'Demo'}
                </span>
              )}
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Active
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Messages Container */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-white">
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
                
                <div className={`flex-1 max-w-xs sm:max-w-md ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`rounded-lg p-3 shadow-sm ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-white border border-slate-200'
                  }`}>
                    <p className={`text-sm ${message.type === 'user' ? 'text-white' : 'text-slate-800'}`}>
                      {message.content}
                    </p>
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
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-slate-500 ml-2">PawMate is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-white/50 backdrop-blur-sm">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  placeholder={`Ask PawMate anything about ${petName || 'your pet'}...`}
                  value={petMessage}
                  onChange={(e) => setPetMessage(e.target.value)}
                  className="resize-none min-h-[50px] max-h-32 pr-12 border-slate-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
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
                  className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  data-testid="button-send-chat"
                >
                  <Send className="h-3 w-3" />
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