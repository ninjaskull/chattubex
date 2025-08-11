import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  LogOut, 
  FolderOpen, 
  MessageSquare,
  Target,
  Dog
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clearAuth } from "@/lib/auth";
import NotesDocuments from "@/components/notes-documents";
import CampaignList from "@/components/campaign-list";

import PawMate from "@/components/pawmate-enhanced";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("files");
  const [assistantName, setAssistantName] = useState(() => 
    localStorage.getItem('pawmate_pet_name') || "Duggu"
  );


  const { data: campaigns = [] } = useQuery<any[]>({
    queryKey: ['/api/campaigns'],
  });

  // Listen for changes to the assistant name in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newName = localStorage.getItem('pawmate_pet_name') || "Duggu";
      setAssistantName(newName);
    };

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the same tab
    window.addEventListener('assistantNameChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('assistantNameChanged', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    setLocation("/");
  };

  // Calculate total campaigns for header badge
  const totalCampaigns = campaigns.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Compact Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-4 py-2 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow">
              <Target className="text-white h-3 w-3" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">FallOwl Dashboard</h1>
              <p className="text-xs text-slate-500">AI-powered lead scoring and business intelligence</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-2 py-0">
              {totalCampaigns} Campaigns
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-slate-900 text-sm h-7">
              <LogOut className="mr-1 h-3 w-3" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="pawmate" className="flex items-center gap-2">
              <Dog className="h-4 w-4" />
              <span className="hidden sm:inline">{assistantName}</span>
            </TabsTrigger>
          </TabsList>



          {/* Lead Campaigns Tab */}
          <TabsContent value="files" className="mt-6">
            <CampaignList />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="notes" className="mt-6">
            <NotesDocuments />
          </TabsContent>

          {/* AI Assistant Tab - Enhanced with Advanced Search */}
          <TabsContent value="pawmate" className="mt-6">
            <PawMate />
          </TabsContent>
        </Tabs>
      </div>


    </div>
  );
}