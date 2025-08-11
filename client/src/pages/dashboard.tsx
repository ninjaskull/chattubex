import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  LogOut, 
  FolderOpen, 
  MessageSquare,
  Target,
  Upload
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


  const { data: campaigns = [] } = useQuery<any[]>({
    queryKey: ['/api/campaigns'],
  });

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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">FallOwl Dashboard</h1>
              <p className="text-sm text-slate-600">AI-powered lead scoring and business intelligence</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {totalCampaigns} Lead Campaigns
            </Badge>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/backup-import')}
              className="text-slate-600 hover:text-slate-900 border-blue-200 hover:bg-blue-50"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-slate-600 hover:text-slate-900">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="pawmate" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Duggu AI</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data Import</span>
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

          {/* Duggu AI Tab - Enhanced with Advanced Search */}
          <TabsContent value="pawmate" className="mt-6">
            <PawMate />
          </TabsContent>

          {/* Data Import Tab */}
          <TabsContent value="backup" className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  Database Migration & Import
                </CardTitle>
                <CardDescription>
                  Import data from your old database or backup files into FallOwl
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-600 space-y-2">
                  <p>To migrate your existing campaign data:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Use the backup tool to export your old database to JSON format</li>
                    <li>Upload the JSON files through the import interface</li>
                    <li>Monitor the import progress and verify data integrity</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={() => setLocation('/backup-import')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Open Data Import Interface
                </Button>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>Quick Access:</strong> The import interface is also available directly at 
                    <code className="bg-blue-100 px-1 rounded ml-1">/backup-import</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>


    </div>
  );
}