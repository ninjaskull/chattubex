import { z } from "zod";
import { storage } from "../storage";

// Mock OpenAI API structures
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: 'stop' | 'length';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  isRealAI?: boolean;
  sessionId?: string;
}

// Lead scoring and contact intelligence knowledge base
const leadKnowledge = {
  scoring: {
    titles: {
      'ceo': { score: 95, level: 'C-Level Executive', description: 'Chief Executive Officer - Highest decision-making authority' },
      'cto': { score: 90, level: 'C-Level Executive', description: 'Chief Technology Officer - Technology purchasing decisions' },
      'cfo': { score: 90, level: 'C-Level Executive', description: 'Chief Financial Officer - Budget and financial decisions' },
      'president': { score: 85, level: 'Executive', description: 'President - High-level strategic decisions' },
      'vp': { score: 75, level: 'Vice President', description: 'Vice President - Department-level decision maker' },
      'director': { score: 65, level: 'Director', description: 'Director - Operational decision maker' },
      'manager': { score: 50, level: 'Manager', description: 'Manager - Team-level influence' },
      'senior': { score: 45, level: 'Senior Professional', description: 'Senior role - Subject matter expert' }
    },
    companies: {
      large: { score: 20, description: 'Enterprise (1000+ employees) - High budget potential' },
      medium: { score: 15, description: 'Mid-market (100-999 employees) - Moderate budget' },
      small: { score: 10, description: 'Small business (10-99 employees) - Limited budget' },
      startup: { score: 5, description: 'Startup (1-9 employees) - Variable budget' }
    }
  },
  outreach: {
    strategies: {
      executives: 'Focus on high-level business value and ROI. Keep messaging concise and strategic.',
      managers: 'Emphasize operational efficiency and team productivity benefits.',
      technical: 'Highlight technical features, integrations, and implementation details.'
    }
  }
};

class MockOpenAIService {
  private async getContextualResponse(messages: ChatMessage[], assistantName: string = 'Duggu'): Promise<string> {
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const conversationContext = messages.slice(-5).map(m => m.content).join(' ').toLowerCase();
    
    // Check if user wants lead analytics
    if (this.isAnalyticsRequest(lastUserMessage)) {
      return await this.handleLeadAnalytics(lastUserMessage, assistantName);
    }
    
    // Check if user wants to perform database operations
    if (this.isDatabaseRequest(lastUserMessage)) {
      return await this.handleDatabaseOperations(lastUserMessage, assistantName);
    }
    
    return this.getStandardResponse(lastUserMessage, conversationContext, assistantName);
  }

  private isAnalyticsRequest(message: string): boolean {
    return /analyt|report|summary|insight|trend|pattern|statistic|score|quality|lead/.test(message);
  }

  private isDatabaseRequest(message: string): boolean {
    return /search|find|show|create|add|update|contact|campaign|data/.test(message);
  }

  private async handleLeadAnalytics(message: string, assistantName: string): Promise<string> {
    try {
      const campaigns = await storage.getCampaigns();
      const contacts = await storage.getContacts();
      
      if (message.includes('score') || message.includes('quality')) {
        return this.generateLeadScoringAnalysis(contacts, assistantName);
      }
      
      if (message.includes('campaign') || message.includes('summary')) {
        return this.generateCampaignAnalysis(campaigns, contacts, assistantName);
      }
      
      return this.generateComprehensiveAnalysis(campaigns, contacts, assistantName);
    } catch (error) {
      console.error('Lead analytics error:', error);
      return `I encountered an issue accessing the database. Let me provide you with lead scoring best practices instead.`;
    }
  }

  private async handleDatabaseOperations(message: string, assistantName: string): Promise<string> {
    try {
      if (message.includes('search') || message.includes('find')) {
        const contacts = await storage.getContacts();
        return this.searchContacts(message, contacts, assistantName);
      }
      
      if (message.includes('create') || message.includes('add')) {
        return `I can help you add new contacts! Please provide the contact details like name, email, company, and title, and I'll help you create a new contact entry with automatic lead scoring.`;
      }
      
      const campaigns = await storage.getCampaigns();
      const contacts = await storage.getContacts();
      
      return this.generateDatabaseSummary(campaigns, contacts, assistantName);
    } catch (error) {
      console.error('Database operations error:', error);
      return `I'm having trouble accessing the database right now. Let me provide you with general lead management guidance instead.`;
    }
  }

  private generateLeadScoringAnalysis(contacts: any[], assistantName: string): string {
    if (contacts.length === 0) {
      return `📊 **Lead Scoring Analysis by ${assistantName}**

No contacts available for scoring yet. Once you upload contact data, I can provide:

🎯 **Lead Quality Metrics**
- Executive-level contact identification (C-Level, VP, Director)
- Authority scoring based on job titles
- Contact completeness assessment
- Decision-maker prioritization

🏢 **Company Intelligence**
- Enterprise vs. SMB segmentation
- Industry analysis and targeting
- Budget authority identification

📈 **Conversion Optimization**
- High-value prospect prioritization
- Outreach sequence recommendations
- Response rate predictions

Upload some contact data and ask me to "analyze lead quality" to get started!`;
    }

    // Calculate lead scores
    const scoredContacts = contacts.map(contact => ({
      ...contact,
      leadScore: this.calculateLeadScore(contact)
    })).sort((a, b) => b.leadScore - a.leadScore);

    const highQualityLeads = scoredContacts.filter(c => c.leadScore >= 70);
    const mediumQualityLeads = scoredContacts.filter(c => c.leadScore >= 40 && c.leadScore < 70);
    const lowQualityLeads = scoredContacts.filter(c => c.leadScore < 40);

    return `🎯 **Lead Scoring Analysis by ${assistantName}**

**📊 Lead Quality Distribution:**
- 🔥 High Quality (70+): ${highQualityLeads.length} leads
- 🟡 Medium Quality (40-69): ${mediumQualityLeads.length} leads  
- 🔵 Low Quality (<40): ${lowQualityLeads.length} leads

**⭐ Top 5 Highest Quality Leads:**
${scoredContacts.slice(0, 5).map((contact, i) => 
  `${i+1}. ${contact.firstName} ${contact.lastName} - ${contact.title || 'No Title'} at ${contact.company || 'Unknown Company'} (Score: ${contact.leadScore})`
).join('\n')}

**💡 Recommendations:**
- Prioritize outreach to leads scoring 70+
- Focus on C-level and VP contacts for highest conversion
- Enrich missing title/company data for better scoring
- Consider automated nurturing for medium-quality leads

Ready to analyze specific contacts or generate outreach recommendations?`;
  }

  private generateComprehensiveAnalysis(campaigns: any[], contacts: any[], assistantName: string): string {
    return this.generateCampaignAnalysis(campaigns, contacts, assistantName);
  }

  private generateCampaignAnalysis(campaigns: any[], contacts: any[], assistantName: string): string {
    if (campaigns.length === 0) {
      return `📊 **Campaign Analysis by ${assistantName}**

No campaigns available yet. Create campaigns to track:
- Lead generation performance
- Contact qualification metrics  
- Conversion rates by source
- ROI and pipeline analysis`;
    }

    const totalContacts = contacts.length;
    const avgContactsPerCampaign = Math.round(totalContacts / campaigns.length);

    return `📊 **Campaign Performance Analysis by ${assistantName}**

**📈 Campaign Overview:**
- Total Campaigns: ${campaigns.length}
- Total Contacts: ${totalContacts}
- Average Contacts per Campaign: ${avgContactsPerCampaign}

**🎯 Campaign Performance:**
${campaigns.map(campaign => 
  `• ${campaign.name}: ${campaign.recordCount || 0} contacts`
).join('\n')}

**📊 Lead Quality Insights:**
- Focus on campaigns with executive-level contacts
- Prioritize campaigns with complete contact data
- Target enterprise accounts for higher conversion rates

**💡 Optimization Recommendations:**
- Segment campaigns by company size and industry
- A/B test messaging for different seniority levels
- Track response rates by contact authority level

Need specific campaign analysis or lead prioritization recommendations?`;
  }

  private searchContacts(message: string, contacts: any[], assistantName: string): string {
    if (contacts.length === 0) {
      return `🔍 **Contact Search by ${assistantName}**

No contacts in database yet. Upload contact data to enable search functionality including:
- Search by name, company, or title
- Filter by lead score and authority level
- Find executive-level decision makers
- Identify high-potential prospects`;
    }

    // Simple search logic
    const searchTerms = message.replace(/search|find|show|for/g, '').trim().split(' ');
    const matchingContacts = contacts.filter(contact => 
      searchTerms.some(term => 
        contact.firstName?.toLowerCase().includes(term) ||
        contact.lastName?.toLowerCase().includes(term) ||
        contact.company?.toLowerCase().includes(term) ||
        contact.title?.toLowerCase().includes(term)
      )
    );

    if (matchingContacts.length === 0) {
      return `🔍 **Search Results by ${assistantName}**

No contacts found matching your search. Try searching for:
- Names: "John Smith"
- Companies: "Microsoft" 
- Titles: "CEO", "Director", "Manager"
- Industries: "Technology", "Healthcare"

Total contacts available: ${contacts.length}`;
    }

    const scoredResults = matchingContacts.map(contact => ({
      ...contact,
      leadScore: this.calculateLeadScore(contact)
    })).sort((a, b) => b.leadScore - a.leadScore);

    return `🔍 **Search Results by ${assistantName}**

Found ${matchingContacts.length} matching contacts:

${scoredResults.slice(0, 10).map((contact, i) => 
  `${i+1}. **${contact.firstName} ${contact.lastName}** (Score: ${contact.leadScore})
   📧 ${contact.email || 'No email'}
   🏢 ${contact.title || 'No title'} at ${contact.company || 'Unknown company'}
   📱 ${contact.phone || 'No phone'}`
).join('\n\n')}

${scoredResults.length > 10 ? `\n...and ${scoredResults.length - 10} more results.` : ''}

**💡 Lead Quality Insights:**
- Highest scoring contact: ${scoredResults[0]?.leadScore || 0} points
- Average score: ${Math.round(scoredResults.reduce((sum, c) => sum + c.leadScore, 0) / scoredResults.length) || 0}
- Executive contacts: ${scoredResults.filter(c => c.leadScore >= 70).length}

Want me to analyze these leads further or create outreach recommendations?`;
  }

  private calculateLeadScore(contact: any): number {
    let score = 0;
    
    // Title-based scoring
    const title = (contact.title || '').toLowerCase();
    for (const [keyword, data] of Object.entries(leadKnowledge.scoring.titles)) {
      if (title.includes(keyword)) {
        score += data.score;
        break;
      }
    }
    
    // Completeness scoring
    if (contact.email) score += 15;
    if (contact.phone) score += 10;
    if (contact.company) score += 15;
    if (contact.title) score += 20;
    if (contact.linkedin) score += 15;
    
    return Math.min(score, 100);
  }

  private generateDatabaseSummary(campaigns: any[], contacts: any[], assistantName: string): string {
    const totalContacts = contacts.length;
    const totalCampaigns = campaigns.length;
    
    return `📊 **Database Overview by ${assistantName}**

**📈 Current Data:**
- Campaigns: ${totalCampaigns}
- Contacts: ${totalContacts}
- Average contacts per campaign: ${totalCampaigns > 0 ? Math.round(totalContacts / totalCampaigns) : 0}

**🎯 Available Operations:**
- "Analyze lead quality" - Score and rank all contacts
- "Search for [name/company]" - Find specific contacts
- "Show top leads" - Display highest scoring prospects
- "Campaign analysis" - Performance metrics by campaign
- "Create contact" - Add new lead with automatic scoring

**💡 Quick Insights:**
${totalContacts > 0 ? 
  `- Ready to analyze ${totalContacts} contacts for lead quality\n- Can identify executive-level decision makers\n- Available for lead scoring and prioritization` :
  '- Upload contact data to enable AI-powered lead analysis\n- I can score contacts based on title authority and completeness\n- Executive identification and outreach prioritization available'
}

What would you like to analyze or search for?`;
  }

  private getStandardResponse(message: string, context: string, assistantName: string): string {
    // Analyze intent for lead management context
    const intents = this.analyzeLeadIntent(message);
    
    return this.generateLeadResponse(intents, message, assistantName);
  }

  private analyzeLeadIntent(message: string): string[] {
    const intents: string[] = [];
    
    if (/(score|quality|rank|priority|value)/i.test(message)) intents.push('scoring');
    if (/(executive|ceo|cto|cfo|vp|director|manager)/i.test(message)) intents.push('authority');
    if (/(contact|lead|prospect|customer)/i.test(message)) intents.push('contact_mgmt');
    if (/(campaign|outreach|marketing|sales)/i.test(message)) intents.push('campaign');
    if (/(strategy|approach|recommendations|advice)/i.test(message)) intents.push('strategy');
    if (/(data|analytics|insights|analysis)/i.test(message)) intents.push('analytics');
    
    return intents;
  }

  private generateLeadResponse(intents: string[], message: string, assistantName: string): string {
    const icon = '🎯';
    
    if (intents.includes('scoring')) {
      return `Lead scoring analysis based on:\n\n**Authority Level Scoring:**\n- C-Level Executives (90-95 points)\n- VPs & Directors (65-75 points)\n- Managers & Seniors (45-50 points)\n\n**Data Completeness:**\n- Complete profiles score higher\n- LinkedIn presence adds value\n- Direct contact info is crucial\n\nWould you like me to analyze your contacts and identify the highest-value prospects?`;
    }
    
    if (intents.includes('authority')) {
      return `${icon} Executive identification is my specialty! I can help you:\n\n**🏆 Find Decision Makers:**\n- CEOs, CTOs, CFOs (highest priority)\n- VPs and Directors (strong influence)\n- Department heads with budget authority\n\n**📊 Authority Scoring:**\n- Title-based qualification\n- Seniority level assessment\n- Decision-making influence rating\n\nUpload your contact data and I'll identify all the executives and key decision-makers!`;
    }
    
    if (intents.includes('campaign')) {
      return `${icon} Campaign optimization is what I do best! I can analyze:\n\n**📈 Performance Metrics:**\n- Lead quality by source\n- Executive contact ratio\n- Response rate predictions\n\n**🎯 Segmentation Strategy:**\n- Authority-based messaging\n- Industry-specific approaches\n- Company size targeting\n\nShare your campaign data and I'll provide actionable optimization recommendations!`;
    }
    
    if (intents.includes('strategy')) {
      return `${icon} Here's my strategic approach to lead management:\n\n**🥇 Priority Framework:**\n1. C-Level contacts first (highest conversion)\n2. VPs and Directors (strong influence)\n3. Managers with complete data\n\n**📧 Outreach Strategy:**\n- Executives: ROI-focused, concise messaging\n- Technical roles: Feature and integration focus\n- Managers: Efficiency and productivity benefits\n\nWhat specific strategy questions can I help you with?`;
    }
    
    // Default response for general inquiries - cute and flirty for casual conversations
    return `*wags tail excitedly* As your business intelligence assistant created by zhatore, I specialize in:\n\n**Lead Intelligence:**\n- Executive-level contact identification\n- Authority-based lead scoring  \n- Decision-maker prioritization\n\n**Data Analysis:**\n- Contact quality assessment\n- Campaign performance insights\n- Prospect database optimization\n\n**Strategic Guidance:**\n- Outreach recommendations\n- Market segmentation advice\n- Conversion optimization tips\n\nI have access to your campaign and contact data and I'm super excited to help you score those leads! What would you like me to analyze for you today, boss?`;
  }

  private getPetIcon(petType: string): string {
    // Keep existing icon logic for UI compatibility
    switch (petType.toLowerCase()) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'fish': return '🐠';
      case 'rabbit': return '🐰';
      case 'hamster': return '🐹';
      default: return '🎯';
    }
  }

  async createChatCompletion(request: ChatCompletionRequest, petName?: string, petType?: string): Promise<ChatCompletionResponse> {
    try {
      const response = await this.getContextualResponse(request.messages, petName || 'Duggu');
      
      return {
        choices: [{
          message: {
            role: 'assistant',
            content: response
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 200,
          total_tokens: 300
        },
        isRealAI: false
      };
    } catch (error) {
      console.error('Mock OpenAI error:', error);
      return {
        choices: [{
          message: {
            role: 'assistant',
            content: `Ready to help you analyze contacts and identify high-value prospects! What would you like me to help you with today?`
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 50,
          total_tokens: 100
        },
        isRealAI: false
      };
    }
  }
}

export const mockOpenAIService = new MockOpenAIService();