import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  User, 
  Star, 
  Copy, 
  ExternalLink,
  Save,
  Download,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  Award,
  Briefcase,
  Globe
} from 'lucide-react';

interface ContactData {
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  title?: string;
  location?: string;
  industry?: string;
  website?: string;
  linkedin?: string;
  score?: number;
  emailSent?: boolean;
  [key: string]: any;
}

interface ModernContactCanvasProps {
  contacts: ContactData[];
  campaignName?: string;
  className?: string;
  onSaveAsCampaign?: (campaignName: string, contacts: ContactData[]) => void;
}

export function ModernContactCanvas({ 
  contacts, 
  campaignName, 
  className = "",
  onSaveAsCampaign 
}: ModernContactCanvasProps) {
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
  const [newCampaignName, setNewCampaignName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveCampaignMutation = useMutation({
    mutationFn: async ({ name, contactsData }: { name: string; contactsData: ContactData[] }) => {
      // Convert contacts to CSV-like format for campaign storage
      const headers = ['name', 'email', 'phone', 'company', 'title', 'location', 'industry', 'linkedin'];
      const rows = contactsData.map(contact => {
        const row: Record<string, string> = {};
        headers.forEach(header => {
          row[header] = String(contact[header] || '');
        });
        return row;
      });

      return apiRequest('POST', '/api/campaigns/save-search-results', {
        name,
        headers,
        rows,
        recordCount: contactsData.length
      });
    },
    onSuccess: () => {
      toast({
        title: "Campaign Saved",
        description: `Successfully saved ${selectedContacts.size > 0 ? selectedContacts.size : contacts.length} contacts to campaign "${newCampaignName}"`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      setIsDialogOpen(false);
      setNewCampaignName('');
      setSelectedContacts(new Set());
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save campaign",
        variant: "destructive"
      });
    }
  });

  const getInitials = (name: string = 'Unknown') => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getCompanyInitials = (company?: string) => {
    if (!company) return 'UN';
    return company.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const toggleContactSelection = (index: number) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedContacts(newSelected);
  };

  const selectAllContacts = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map((_, index) => index)));
    }
  };

  const handleSaveCampaign = () => {
    if (!newCampaignName.trim()) {
      toast({
        title: "Campaign Name Required",
        description: "Please enter a name for the campaign",
        variant: "destructive"
      });
      return;
    }

    const contactsToSave = selectedContacts.size > 0 
      ? contacts.filter((_, index) => selectedContacts.has(index))
      : contacts;

    saveCampaignMutation.mutate({
      name: newCampaignName.trim(),
      contactsData: contactsToSave
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Actions */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {campaignName || 'Contact Results'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {contacts.length} contacts found
            {selectedContacts.size > 0 && ` • ${selectedContacts.size} selected`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={selectAllContacts}
            data-testid="button-select-all"
          >
            {selectedContacts.size === contacts.length ? 'Deselect All' : 'Select All'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-save-campaign">
                <Save className="w-4 h-4 mr-1" />
                Save as Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save as New Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Campaign Name</label>
                  <Input
                    placeholder="Enter campaign name..."
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {selectedContacts.size > 0 
                    ? `${selectedContacts.size} selected contacts will be saved`
                    : `All ${contacts.length} contacts will be saved`
                  }
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveCampaign}
                    disabled={saveCampaignMutation.isPending}
                  >
                    {saveCampaignMutation.isPending ? 'Saving...' : 'Save Campaign'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Modern Contact Canvas */}
      <ScrollArea className="h-[600px] w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {contacts.map((contact, index) => {
            const isSelected = selectedContacts.has(index);
            const contactName = contact.name || contact.Name || contact.first_name || contact['First Name'] || 'Unknown Name';
            const contactEmail = contact.email || contact.Email || contact['Email Address'] || '';
            const contactPhone = contact.phone || contact.Phone || contact.mobile || contact.Mobile || contact['Phone Number'] || '';
            const contactCompany = contact.company || contact.Company || contact.organization || contact.Organization || '';
            const contactTitle = contact.title || contact.Title || contact.job_title || contact['Job Title'] || '';
            const contactLocation = contact.location || contact.Location || contact.city || contact.City || '';
            const contactLinkedIn = contact.linkedin || contact.LinkedIn || contact['LinkedIn Profile'] || '';
            const contactIndustry = contact.industry || contact.Industry || '';
            const contactWebsite = contact.website || contact.Website || '';

            return (
              <Card 
                key={index} 
                className={`group relative transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                }`}
                onClick={() => toggleContactSelection(index)}
                data-testid={`contact-card-${index}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                          {getInitials(contactName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                          {contactName}
                        </h4>
                        {contactTitle && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {contactTitle}
                          </p>
                        )}
                      </div>
                    </div>
                    {contact.score && (
                      <div className={`flex items-center text-xs ${getScoreColor(contact.score)}`}>
                        <Star className="w-3 h-3 mr-1" />
                        {contact.score}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-2">
                  {/* Company */}
                  {contactCompany && (
                    <div className="flex items-center space-x-2 text-xs">
                      <Building2 className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 truncate">{contactCompany}</span>
                    </div>
                  )}

                  {/* Email */}
                  {contactEmail && (
                    <div className="flex items-center space-x-2 text-xs group/email">
                      <Mail className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{contactEmail}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover/email:opacity-100 p-1 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(contactEmail, 'Email');
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {/* Phone */}
                  {contactPhone && (
                    <div className="flex items-center space-x-2 text-xs group/phone">
                      <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{contactPhone}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover/phone:opacity-100 p-1 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(contactPhone, 'Phone');
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {/* Location */}
                  {contactLocation && (
                    <div className="flex items-center space-x-2 text-xs">
                      <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 truncate">{contactLocation}</span>
                    </div>
                  )}

                  {/* Industry */}
                  {contactIndustry && (
                    <div className="flex items-center space-x-2 text-xs">
                      <Briefcase className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 truncate">{contactIndustry}</span>
                    </div>
                  )}

                  {/* Contact Status */}
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant={contact.emailSent ? "default" : "secondary"} className="text-xs">
                      {contact.emailSent ? "Contacted" : "New"}
                    </Badge>
                    
                    <div className="flex items-center space-x-1">
                      {contactLinkedIn && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(contactLinkedIn, '_blank');
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                      {contactWebsite && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(contactWebsite, '_blank');
                          }}
                        >
                          <Globe className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {contacts.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Contacts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {contacts.filter(c => c.emailSent).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Contacted</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {contacts.filter(c => !c.emailSent).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">New Leads</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {selectedContacts.size}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Selected</div>
        </div>
      </div>
    </div>
  );
}