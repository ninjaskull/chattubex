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
  const [isScrolled, setIsScrolled] = useState(false);


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

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 100); // Show sticky sidebar after 100px scroll
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
      {/* Main Content Area with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 pt-3 flex gap-2">
        {/* Smart Sidebar Navigation */}
        <div className="hidden md:block shrink-0" style={{ width: isScrolled ? '3rem' : '8rem' }}>
          <div className={`sticky top-20 bg-white/90 backdrop-blur-sm border border-slate-200/50 transition-all duration-300 ${
            isScrolled 
              ? 'rounded-r-lg shadow-lg fixed left-0 top-20 z-40 p-0.5' 
              : 'rounded-lg p-1'
          }`}>
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
              <TabsList className={`grid w-full grid-rows-3 bg-transparent h-auto gap-0.5 ${isScrolled ? 'p-0' : 'p-0.5'}`}>
                <TabsTrigger 
                  value="files" 
                  className={`flex items-center w-full text-left data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 hover:bg-slate-50 transition-all duration-300 text-xs ${
                    isScrolled 
                      ? 'justify-center p-1.5 gap-0' 
                      : 'justify-start gap-1.5 p-2'
                  }`}
                  title={isScrolled ? "Campaigns" : undefined}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  {!isScrolled && <span>Campaigns</span>}
                </TabsTrigger>
                <TabsTrigger 
                  value="notes" 
                  className={`flex items-center w-full text-left data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 hover:bg-slate-50 transition-all duration-300 text-xs ${
                    isScrolled 
                      ? 'justify-center p-1.5 gap-0' 
                      : 'justify-start gap-1.5 p-2'
                  }`}
                  title={isScrolled ? "Documents" : undefined}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {!isScrolled && <span>Documents</span>}
                </TabsTrigger>
                <TabsTrigger 
                  value="pawmate" 
                  className={`flex items-center w-full text-left data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 hover:bg-slate-50 transition-all duration-300 text-xs ${
                    isScrolled 
                      ? 'justify-center p-1.5 gap-0' 
                      : 'justify-start gap-1.5 p-2'
                  }`}
                  title={isScrolled ? assistantName : undefined}
                >
                  <Dog className="h-3.5 w-3.5" />
                  {!isScrolled && <span>{assistantName}</span>}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Mobile Navigation (horizontal tabs on mobile) */}
        <div className="md:hidden w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
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
          </Tabs>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ${isScrolled ? 'md:ml-12' : ''}`}>
          {/* Desktop Content (hidden on mobile, uses sidebar tabs) */}
          <div className="hidden md:block">
            {activeTab === "files" && (
              <div className="mt-1">
                <CampaignList />
              </div>
            )}
            {activeTab === "notes" && (
              <div className="mt-1">
                <NotesDocuments />
              </div>
            )}
            {activeTab === "pawmate" && (
              <div className="mt-1">
                <PawMate />
              </div>
            )}
          </div>
          
          {/* Mobile Content (shown on mobile, uses mobile tabs) */}
          <div className="md:hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="files" className="mt-6">
                <CampaignList />
              </TabsContent>
              <TabsContent value="notes" className="mt-6">
                <NotesDocuments />
              </TabsContent>
              <TabsContent value="pawmate" className="mt-6">
                <PawMate />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}