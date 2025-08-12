import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  User, 
  Star, 
  Copy, 
  ExternalLink,
  Grid3X3,
  List,
  Filter,
  Download,
  Search
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

interface ContactCardsProps {
  contacts: ContactData[];
  campaignName?: string;
  showActions?: boolean;
  className?: string;
}

export function ContactCards({ contacts, campaignName, showActions = true, className = "" }: ContactCardsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'score'>('name');
  const [filterBy, setFilterBy] = useState<'all' | 'contacted' | 'new'>('all');

  const getInitials = (name: string = 'Unknown') => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredContacts = contacts.filter(contact => {
    if (filterBy === 'contacted') return contact.emailSent;
    if (filterBy === 'new') return !contact.emailSent;
    return true;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'company':
        return (a.company || '').localeCompare(b.company || '');
      case 'score':
        return (b.score || 0) - (a.score || 0);
      default:
        return 0;
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const ContactCard = ({ contact, index }: { contact: ContactData; index: number }) => (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500" data-testid={`card-contact-${index}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {contact.name || 'Unknown Name'}
              </CardTitle>
              {contact.title && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {contact.title}
                </p>
              )}
              {contact.company && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 mt-1">
                  <Building2 className="w-3 h-3 mr-1" />
                  <span className="truncate">{contact.company}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {contact.score && (
              <Badge className={`${getScoreColor(contact.score)} text-white`}>
                <Star className="w-3 h-3 mr-1" />
                {contact.score}
              </Badge>
            )}
            <Badge variant={contact.emailSent ? "default" : "secondary"}>
              {contact.emailSent ? "Contacted" : "New"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Contact Information */}
          <div className="grid grid-cols-1 gap-2">
            {contact.email && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span className="flex-1 truncate">{contact.email}</span>
                {showActions && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => copyToClipboard(contact.email || '')}
                    className="h-6 w-6 p-0"
                    data-testid={`button-copy-email-${index}`}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
            
            {(contact.phone || contact.mobile) && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span className="flex-1 truncate">{contact.phone || contact.mobile}</span>
                {showActions && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => copyToClipboard((contact.phone || contact.mobile) || '')}
                    className="h-6 w-6 p-0"
                    data-testid={`button-copy-phone-${index}`}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}

            {contact.location && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span className="flex-1 truncate">{contact.location}</span>
              </div>
            )}
          </div>

          {/* Additional Information */}
          {(contact.industry || contact.website) && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-wrap gap-2 text-xs">
                {contact.industry && (
                  <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800">
                    {contact.industry}
                  </Badge>
                )}
                {contact.website && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 text-xs"
                    onClick={() => window.open(contact.website, '_blank')}
                    data-testid={`button-website-${index}`}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Website
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex space-x-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1" data-testid={`button-contact-${index}`}>
                <Mail className="w-3 h-3 mr-1" />
                Contact
              </Button>
              <Button size="sm" variant="outline" className="flex-1" data-testid={`button-profile-${index}`}>
                <User className="w-3 h-3 mr-1" />
                View Profile
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const ContactListItem = ({ contact, index }: { contact: ContactData; index: number }) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" data-testid={`row-contact-${index}`}>
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {getInitials(contact.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {contact.name || 'Unknown Name'}
            </h4>
            {contact.score && (
              <Badge className={`${getScoreColor(contact.score)} text-white text-xs`}>
                {contact.score}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
            {contact.company && (
              <span className="flex items-center">
                <Building2 className="w-3 h-3 mr-1" />
                {contact.company}
              </span>
            )}
            {contact.email && (
              <span className="flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                {contact.email}
              </span>
            )}
            {(contact.phone || contact.mobile) && (
              <span className="flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                {contact.phone || contact.mobile}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Badge variant={contact.emailSent ? "default" : "secondary"}>
          {contact.emailSent ? "Contacted" : "New"}
        </Badge>
        {showActions && (
          <div className="flex space-x-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" data-testid={`button-contact-list-${index}`}>
              <Mail className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" data-testid={`button-profile-list-${index}`}>
              <User className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (contacts.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="flex flex-col items-center space-y-3">
          <Search className="w-12 h-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No contacts found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with campaign name and stats */}
      {campaignName && (
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg border">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {campaignName}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {sortedContacts.length} contacts found
            </p>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" data-testid="button-export">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
              <TabsList className="h-8">
                <TabsTrigger value="grid" className="h-6 px-2" data-testid="tab-grid">
                  <Grid3X3 className="w-3 h-3" />
                </TabsTrigger>
                <TabsTrigger value="list" className="h-6 px-2" data-testid="tab-list">
                  <List className="w-3 h-3" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={filterBy} onValueChange={(v) => setFilterBy(v as any)}>
              <SelectTrigger className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contacts</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="h-8 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="score">Score</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contact Display */}
      <div className="space-y-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedContacts.map((contact, index) => (
              <ContactCard key={index} contact={contact} index={index} />
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <ScrollArea className="max-h-96">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {sortedContacts.map((contact, index) => (
                  <ContactListItem key={index} contact={contact} index={index} />
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {sortedContacts.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Contacts</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {sortedContacts.filter(c => c.emailSent).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Contacted</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {sortedContacts.filter(c => c.score && c.score >= 70).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">High Score</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {Math.round((sortedContacts.reduce((acc, c) => acc + (c.score || 0), 0) / sortedContacts.length) || 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
        </Card>
      </div>
    </div>
  );
}