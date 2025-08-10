import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Zap, Dog } from "lucide-react";

export default function PawMate() {
  const [petName, setPetName] = useState("");
  const [petMessage, setPetMessage] = useState("");

  const handleSendMessage = () => {
    if (petMessage.trim()) {
      // Add logic for pet interaction
      setPetMessage("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <Dog className="text-white h-8 w-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">PawMate</h2>
        <p className="text-slate-600">Your AI companion for pet care and fun!</p>
      </div>

      {/* Pet Profile Card */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Heart className="h-5 w-5 text-red-500" />
            Your Pet Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Pet Name
            </label>
            <Input
              placeholder="What's your pet's name?"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="bg-white"
              data-testid="input-pet-name"
            />
          </div>
          {petName && (
            <div className="mt-4 p-4 bg-white/60 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    <Dog className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-900">{petName}</h3>
                  <p className="text-sm text-slate-600">Your adorable companion</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Chat with PawMate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sample Messages */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-orange-100 text-orange-600">
                  <Dog className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-slate-900">
                    Woof! 🐕 Welcome to PawMate! I'm here to help you with pet care tips, 
                    fun activities, and answer any questions about your furry friend!
                  </p>
                </div>
              </div>
            </div>

            {petName && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    <Dog className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-slate-900">
                      Nice to meet {petName}! 🎾 Would you like some fun activity ideas 
                      or health tips for your pet?
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask PawMate anything about your pet..."
              value={petMessage}
              onChange={(e) => setPetMessage(e.target.value)}
              className="resize-none min-h-[60px] max-h-32"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              data-testid="textarea-pet-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!petMessage.trim()}
              className="px-6"
              data-testid="button-send-message"
            >
              <Zap className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-blue-800 mb-2">Health Tips</h3>
            <p className="text-sm text-blue-700">Get personalized health advice for your pet</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-green-800 mb-2">Activities</h3>
            <p className="text-sm text-green-700">Fun games and exercises to try</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-purple-800 mb-2">Ask Anything</h3>
            <p className="text-sm text-purple-700">Chat about pet care and behavior</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}