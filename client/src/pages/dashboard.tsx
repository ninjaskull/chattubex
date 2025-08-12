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
  Dog,
  Home,
  Database
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
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);


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

  // Navigation items configuration
  const navigationItems = [
    { id: "files", label: "Campaigns", icon: FolderOpen },
    { id: "notes", label: "Documents", icon: MessageSquare },
    { id: "pawmate", label: assistantName, icon: Dog }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Hover-based Sidebar Navigation */}
      <div 
        className="hidden md:flex flex-col fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out group"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        style={{ 
          width: isSidebarHovered ? '16rem' : '4rem',
        }}
      >
        {/* Sidebar Container */}
        <div className="bg-white/95 backdrop-blur-sm border-r border-slate-200/50 shadow-lg h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow shrink-0">
                <Dog className="text-white h-4 w-4" />
              </div>
              <div className={`transition-all duration-300 overflow-hidden ${
                isSidebarHovered ? 'w-auto opacity-100' : 'w-0 opacity-0'
              }`}>
                <h1 className="text-sm font-bold text-slate-900 whitespace-nowrap">FallOwl</h1>
                <p className="text-xs text-slate-500 whitespace-nowrap">Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group/item ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title={!isSidebarHovered ? item.label : undefined}
                    data-testid={`nav-${item.id}`}
                  >
                    <Icon className={`shrink-0 transition-all duration-200 ${
                      isActive ? 'h-5 w-5' : 'h-4 w-4'
                    }`} />
                    <span className={`ml-3 text-sm font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${
                      isSidebarHovered ? 'w-auto opacity-100' : 'w-0 opacity-0'
                    }`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-200/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
              title={!isSidebarHovered ? "Logout" : undefined}
              data-testid="nav-logout"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={`ml-3 text-sm font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${
                isSidebarHovered ? 'w-auto opacity-100' : 'w-0 opacity-0'
              }`}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: '4rem' }}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">FallOwl Dashboard</h1>
              <p className="text-sm text-slate-500">AI-powered lead scoring and business intelligence</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-sm px-3 py-1">
                {totalCampaigns} Campaigns
              </Badge>
            </div>
          </div>
        </header>

        {/* Mobile Navigation (horizontal tabs on mobile) */}
        <div className="md:hidden w-full p-4 bg-white/60 backdrop-blur-sm border-b border-slate-200/50">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/80">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger key={item.id} value={item.id} className="flex items-center gap-2" data-testid={`mobile-nav-${item.id}`}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="main-content-area">
              {activeTab === "files" && <CampaignList />}
              {activeTab === "notes" && <NotesDocuments />}
              {activeTab === "pawmate" && <PawMate />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}