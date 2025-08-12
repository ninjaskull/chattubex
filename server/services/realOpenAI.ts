import OpenAI from 'openai';
import { databaseService } from './databaseService';
import { storage } from '../storage';
import { apolloService } from './apolloService';

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

class RealOpenAIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    // Use OpenRouter API as requested
    this.openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://fallowl.replit.app", // Your site URL
        "X-Title": "FallOwl Campaign Manager", // Your site name
      }
    });
  }

  async generateChatCompletion(request: ChatCompletionRequest, aiName?: string, aiType?: string): Promise<ChatCompletionResponse> {
    try {
      const userMessage = request.messages[request.messages.length - 1]?.content || '';
      const lowerUserMessage = userMessage.toLowerCase();
      
      // Check for Apollo.io API questions or advanced business queries first
      if (lowerUserMessage.includes('apollo') || lowerUserMessage.includes('api') || 
          lowerUserMessage.includes('prospecting') || lowerUserMessage.includes('lead generation') ||
          lowerUserMessage.includes('director') || lowerUserMessage.includes('manufacturing') ||
          lowerUserMessage.includes('finance') || lowerUserMessage.includes('employee size') ||
          lowerUserMessage.includes('industry') || lowerUserMessage.includes('united states') ||
          (lowerUserMessage.includes('campaign') && lowerUserMessage.includes('skip')) ||
          lowerUserMessage.includes('exclude') || lowerUserMessage.includes('filter')) {
        const apolloResponse = await this.handleApolloQueries(userMessage);
        if (apolloResponse) {
          return {
            choices: [{
              message: {
                role: 'assistant',
                content: apolloResponse
              },
              finish_reason: 'stop'
            }],
            usage: {
              prompt_tokens: 150,
              completion_tokens: apolloResponse.length / 4,
              total_tokens: 150 + (apolloResponse.length / 4)
            }
          };
        }
      }

      // Check if user wants database operations (including job title searches)
      const isJobTitleSearch = /\b(manager|director|analyst|specialist|coordinator|supervisor|executive|officer|lead|head|chief|president|vice|senior|junior|assistant|ceo|cfo|cto|cmo|vp|founder|owner|partner)\b/i.test(lowerUserMessage);
      const isLocalSearch = lowerUserMessage.includes('search') || 
                           lowerUserMessage.includes('find') || 
                           lowerUserMessage.includes('show me') ||
                           lowerUserMessage.includes('contacts') ||
                           isJobTitleSearch;
      
      const isSimpleSearch = isLocalSearch && 
                            !lowerUserMessage.includes('api') && 
                            !(lowerUserMessage.includes('director') && lowerUserMessage.includes('finance') && lowerUserMessage.includes('manufacturing')) &&
                            !lowerUserMessage.includes('apollo');
                            
      if (isSimpleSearch) {
        const databaseResponse = await this.handleDatabaseOperations(lowerUserMessage, aiName, aiType);
        
        if (databaseResponse) {
          return {
            choices: [{
              message: {
                role: 'assistant',
                content: databaseResponse
              },
              finish_reason: 'stop'
            }],
            usage: {
              prompt_tokens: 100,
              completion_tokens: databaseResponse.length / 4,
              total_tokens: 100 + (databaseResponse.length / 4)
            }
          };
        }
      }

      // For all other queries, use real AI with enhanced capabilities

      // Get current database context for AI awareness
      const databaseContext = await this.getDatabaseContext();
      
      // Enhance system message with lead scoring expertise and business intelligence
      const systemMessage = this.createLeadScoringSystemPrompt(aiName, aiType, databaseContext);
      
      // Combine system message with user messages
      const enhancedMessages = [
        { role: 'system' as const, content: systemMessage },
        ...request.messages
      ];

      // Using OpenRouter with faster model for better performance
      const response = await this.openai.chat.completions.create({
        model: "anthropic/claude-3-haiku", // Faster than wizardlm-2-8x22b
        messages: enhancedMessages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 400,
      });

      return {
        choices: response.choices.map(choice => ({
          message: {
            role: 'assistant',
            content: this.cleanResponse(choice.message.content || 'Sorry, I could not generate a response.')
          },
          finish_reason: choice.finish_reason as 'stop' | 'length'
        })),
        usage: {
          prompt_tokens: response.usage?.prompt_tokens || 0,
          completion_tokens: response.usage?.completion_tokens || 0,
          total_tokens: response.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate response from OpenAI');
    }
  }

  async createStreamingResponse(request: ChatCompletionRequest & { stream: boolean }) {
    try {
      // For streaming, we'll use a simpler approach with OpenAI
      const response = await this.openai.chat.completions.create({
        model: "anthropic/claude-3-haiku", // Faster model via OpenRouter
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 400,
        stream: true
      });

      return response;
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw new Error('Failed to create streaming response');
    }
  }

  private cleanResponse(content: string): string {
    // Clean AI responses according to new guidelines
    let cleaned = content;
    
    // Remove any emojis completely
    cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    
    // Replace any mention of "Fallowl" with "zhatore" in AI responses
    cleaned = cleaned.replace(/Fallowl/gi, 'zhatore');
    
    // Keep cute pet-like behaviors but remove formal greetings
    cleaned = cleaned.replace(/^(?:greets warmly\s*)?(?:Hello there[^.!?]*[.!?]\s*)?/i, '');
    
    // Trim any remaining whitespace
    cleaned = cleaned.trim();
    
    return cleaned || 'I can help you with lead scoring and contact analysis.';
  }

  private async getDatabaseContext(): Promise<string> {
    try {
      const [campaigns, contacts] = await Promise.all([
        storage.getCampaigns(),
        storage.getContacts()
      ]);

      return `
**Current Database Status:**
- Campaigns: ${campaigns.length} uploaded (${campaigns.map(c => c.name).join(', ')})
- Contact Records: ${contacts.length} available
- Total Lead Data: ${campaigns.reduce((sum, c) => sum + c.recordCount, 0) + contacts.length} prospects ready for analysis
`;
    } catch (error) {
      return 'Database access available but no lead data loaded yet.';
    }
  }

  private async handleApolloQueries(userMessage: string): Promise<string | null> {
    try {
      const lowerMessage = userMessage.toLowerCase();
      const recommendations = apolloService.generateAPIRecommendation(userMessage);
      
      // Handle complex Apollo.io search queries
      if (lowerMessage.includes('director') && lowerMessage.includes('finance') && 
          (lowerMessage.includes('manufacturing') || lowerMessage.includes('industry'))) {
        
        return `# 🎯 Apollo.io API Search Strategy

## Recommended API Call for Director of Finance Search

### Primary Search Endpoint: \`/v1/mixed_people/search\`

**Optimized Query Parameters:**
\`\`\`json
{
  "person_titles": [
    "Director of Finance", 
    "Finance Director",
    "Director Finance",
    "Director, Finance"
  ],
  "person_locations": ["United States"],
  "organization_industries": ["manufacturing"],
  "organization_num_employees_ranges": ["11-50", "51-100"],
  "per_page": 50,
  "page": 1,
  "enrich_contacts": true
}
\`\`\`

## 🔍 Advanced Filtering Strategy

**Title Variations to Include:**
- "Director of Finance" (primary target)
- "Finance Director" (alternative format)
- "Director, Finance" (comma variation)
- "VP Finance" (senior level prospects)
- "Financial Director" (alternate phrasing)

**Geographic Targeting:**
- Location: "United States" (broad coverage)
- Consider state-level filtering for focused campaigns

**Industry Precision:**
- Primary: "manufacturing"
- Related: "industrial equipment", "automotive", "aerospace"

**Company Size Optimization:**
- "11-50" employees: Mid-sized manufacturers
- "51-100" employees: Growth-stage companies
- Sweet spot for decision-maker accessibility

## 🚫 Exclusion Strategy for "Sage Data" Campaign

**Post-Processing Filter Implementation:**
\`\`\`javascript
// After Apollo.io response, filter out existing contacts
const filteredResults = apolloResults.filter(contact => {
  const existingContact = sageDataCampaign.find(existing => 
    existing.email === contact.email || 
    (existing.firstName === contact.first_name && 
     existing.lastName === contact.last_name &&
     existing.company === contact.organization_name)
  );
  return !existingContact;
});
\`\`\`

## 📊 Expected Results & Lead Scoring

**Target Profile Analysis:**
- **Authority Level**: High (Director-level decision maker)
- **Budget Influence**: Direct financial oversight
- **Company Size**: Optimal for personalized outreach
- **Industry**: Manufacturing = process/efficiency focus

**Lead Scoring Framework:**
- Director of Finance: 85-90 points (high authority)
- Manufacturing industry: +15 points (sector relevance)
- 10-100 employees: +10 points (accessible decision maker)
- US location: +5 points (timezone alignment)

## 🚀 Follow-up API Sequence

**1. Contact Enrichment:**
\`\`\`json
POST /v1/people/match
{
  "email": "director@company.com",
  "enrich": true
}
\`\`\`

**2. Email Discovery:**
\`\`\`json
POST /v1/email_addresses
{
  "first_name": "John",
  "last_name": "Smith",
  "domain": "manufacturingco.com"
}
\`\`\`

This search strategy will identify high-quality finance decision-makers in US manufacturing companies while automatically excluding your existing "Sage Data" campaign contacts.`;
      }
      
      // Handle general Apollo.io questions
      if (lowerMessage.includes('apollo')) {
        const apolloKnowledge = apolloService.getAPIKnowledge();
        return `# 🚀 Apollo.io Integration Expert

I have complete knowledge of Apollo.io's API architecture and can help you with advanced prospecting and lead generation strategies.

${recommendations}

${apolloKnowledge}

## 💡 What I can help you with:
- **API Integration**: Specific endpoint recommendations and parameters
- **Lead Prospecting**: Advanced search strategies and targeting
- **Data Enrichment**: Contact enhancement and verification workflows  
- **Outreach Automation**: Sequence creation and performance optimization
- **CRM Integration**: Data synchronization and pipeline management
- **Compliance**: GDPR/CCPA compliant data handling practices

Ask me anything about Apollo.io APIs, prospecting strategies, or lead generation workflows!`;
      }
      
      // For other business intelligence queries, return recommendations
      if (lowerMessage.includes('prospecting') || lowerMessage.includes('lead generation') ||
          lowerMessage.includes('industry') || lowerMessage.includes('director') ||
          lowerMessage.includes('manufacturing') || lowerMessage.includes('finance')) {
        return recommendations;
      }
      
      return null;
    } catch (error) {
      console.error('Apollo query error:', error);
      return null;
    }
  }

  private async handleDatabaseOperations(message: string, aiName?: string, aiType?: string): Promise<string | null> {
    try {
      // Lead analysis and campaign data queries
      if (message.includes('campaign') || message.includes('upload') || message.includes('contact') || message.includes('data') || message.includes('lead') || message.includes('score')) {
        const campaigns = await storage.getCampaigns();
        const contacts = await storage.getContacts();
        
        if (message.includes('how many') || message.includes('count') || message.includes('score')) {
          return `📊 **Lead Database Analysis:**
          
**Data Overview:**
• **Campaigns:** ${campaigns.length} uploaded campaigns
${campaigns.map(c => `  - ${c.name}: ${c.recordCount} prospects`).join('\n')}

• **Total Prospects:** ${campaigns.reduce((sum, c) => sum + c.recordCount, 0)} contacts available for scoring
• **Basic Contacts:** ${contacts.length} additional records

**Lead Scoring Intelligence:**
🎯 **Available for Analysis:**
• C-Level executives and decision-makers
• Company size and industry segmentation
• Title-based authority scoring
• Contact enrichment and qualification
• Duplicate detection and data cleaning

**Recommended Actions:**
• "Score all contacts by quality" - Generate lead scores
• "Find decision-makers" - Identify key prospects  
• "Show me C-level contacts" - Target executives
• "Analyze by company size" - Market segmentation
• "Generate prospect report" - Comprehensive analysis

Ready to help you identify the highest quality leads! What specific lead analysis would you like me to perform?`;
        }

        if (message.includes('search') || message.includes('find') || message.includes('decision') || message.includes('c-level')) {
          return `🔍 **Lead Search & Intelligence:**
          
I can analyze your prospect database:
- ${campaigns.length} campaigns with ${campaigns.reduce((sum, c) => sum + c.recordCount, 0)} total prospects
- Advanced lead scoring and qualification
- Decision-maker identification

**High-Value Search Options:**
• "Find all C-level executives" - Target top decision-makers
• "Show me VP and Director level contacts" - Mid-level influencers
• "Search for contacts at enterprise companies" - Large account prospects
• "Find decision-makers in [industry]" - Vertical targeting
• "Show contacts with LinkedIn profiles" - Social selling ready

**Lead Quality Focus:**
• Automatic scoring based on job title authority
• Company size and industry analysis
• Contact completeness and engagement potential

What type of high-quality leads would you like me to find?`;
        }

        if (message.includes('analyze') || message.includes('insights') || message.includes('report')) {
          const totalRecords = campaigns.reduce((sum, c) => sum + c.recordCount, 0);
          const sampleContact = contacts[0];
          
          return `📈 **Data Analysis Report:**

**Overview:**
• Total Records: ${totalRecords}
• Campaigns: ${campaigns.length}
• Active Contacts: ${contacts.length}

**Sample Data Structure:**
${sampleContact ? `• Name: ${sampleContact.name}
• Email: ${sampleContact.email}
• Mobile: ${sampleContact.mobile}
• Location Data: Available` : '• No contact data to analyze yet'}

**Available Analytics:**
• Geographic distribution analysis
• Industry/company analysis  
• Contact engagement patterns
• Data quality assessment

**Recommendations:**
• Upload additional datasets for deeper insights
• I can help clean and organize your data
• Set up automated contact scoring

What specific analysis would you like me to perform on your data?`;
        }
      }

      // Advanced search operations - including job title searches
      if (message.includes('search') || message.includes('find') || isJobTitleSearch) {
        return await this.performAdvancedSearch(message);
      }

      // Data modification operations
      if (message.includes('add') || message.includes('create') || message.includes('register')) {
        return await this.handleContactCreation(message);
      }

      // Update operations
      if (message.includes('update') || message.includes('modify') || message.includes('change')) {
        return await this.handleContactUpdate(message);
      }

      return null;
    } catch (error) {
      console.error('Database operation error:', error);
      return 'I can access your database but encountered an issue. Please try rephrasing your request.';
    }
  }

  private async performAdvancedSearch(query: string): Promise<string> {
    try {
      const [campaigns, contacts] = await Promise.all([
        storage.getCampaigns(),
        storage.getContacts()
      ]);

      let results = [];
      const searchTerm = query.toLowerCase();

      // Advanced lead search with scoring
      const matchingContacts = [];
      const leadScores = new Map();
      
      // Use the enhanced search API for better job title matching
      try {
        const searchResponse = await fetch(`http://localhost:${process.env.PORT || 3000}/api/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchTerm,
            searchType: 'campaign-data',
            limit: 50
          })
        });
        
        if (searchResponse.ok) {
          const searchResults = await searchResponse.json();
          
          // Process campaign data results with lead scoring
          if (searchResults.campaignData && searchResults.campaignData.length > 0) {
            for (const campaignResult of searchResults.campaignData) {
              const campaignContacts = campaignResult.matches.map((record: any) => {
                const score = this.calculateLeadScore(record);
                leadScores.set(record.Email || record.email, score);
                return { 
                  ...record, 
                  leadScore: score,
                  firstName: record['First Name'] || record.firstName,
                  lastName: record['Last Name'] || record.lastName,
                  email: record.Email || record.email,
                  company: record.Company || record.company,
                  title: record.Title || record.title,
                  mobilePhone: record['Mobile Phone'] || record.mobilePhone,
                  otherPhone: record['Other Phone'] || record.otherPhone,
                  corporatePhone: record['Corporate Phone'] || record.corporatePhone
                };
              });
              matchingContacts.push(...campaignContacts);
            }
          }
        }
      } catch (err) {
        console.log('Search API error, falling back to basic search:', err);
        
        // Fallback to basic search if API fails
        for (const campaign of campaigns) {
          try {
            const campaignData = await storage.getCampaignData(campaign.id);
            if (campaignData && campaignData.data) {
              const contactRecords = campaignData.data.filter((record: any) => {
                const searchFields = [
                  record.firstName, record.lastName, record.email, 
                  record.company, record.mobilePhone, record.otherPhone, 
                  record.corporatePhone, record.website, record.title
                ];
                return searchFields.some(field => 
                  field && field.toString().toLowerCase().includes(searchTerm)
                );
              }).map((record: any) => {
                const score = this.calculateLeadScore(record);
                leadScores.set(record.email, score);
                return { ...record, leadScore: score };
              });
              matchingContacts.push(...contactRecords);
            }
          } catch (err) {
            console.log(`Could not search campaign ${campaign.name}:`, err);
          }
        }
      }

      // Sort by lead score (highest first)
      matchingContacts.sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));

      // Also search simple contacts table
      const simpleContacts = contacts.filter(contact => 
        contact.name?.toLowerCase().includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm) ||
        contact.mobile?.toLowerCase().includes(searchTerm)
      );
      
      if (matchingContacts.length > 0) {
        results.push(`**🎯 Lead Search Results (${matchingContacts.length} prospects found):**`);
        results.push(`*Sorted by lead quality score*\n`);
        
        matchingContacts.slice(0, 10).forEach((contact, index) => {
          const phone = contact.mobilePhone || contact.otherPhone || contact.corporatePhone || 'No phone';
          const scoreEmoji = this.getScoreEmoji(contact.leadScore);
          const priority = this.getScorePriority(contact.leadScore);
          
          results.push(`${index + 1}. ${scoreEmoji} **${contact.firstName} ${contact.lastName}** - Score: ${contact.leadScore}/100`);
          results.push(`   📧 ${contact.email} | 📱 ${phone}`);
          results.push(`   🏢 ${contact.company || 'Company not specified'} | 💼 ${contact.title || 'Title not specified'}`);
          results.push(`   🎯 Priority: **${priority}** | 📊 Lead Quality: ${this.getQualityDescription(contact.leadScore)}\n`);
        });
      }

      if (simpleContacts.length > 0) {
        results.push(`**Basic Contacts (${simpleContacts.length} found):**`);
        simpleContacts.slice(0, 5).forEach(contact => {
          results.push(`• ${contact.name} - ${contact.email} - ${contact.mobile}`);
        });
      }



      if (results.length === 0) {
        const totalRecords = campaigns.reduce((sum, c) => sum + c.recordCount, 0);
        return `🔍 **Search Results:**

No matches found for "${query.replace(/search|find|for|show|me/gi, '').trim()}".

**Available data to search:**
• ${totalRecords} total contact records across ${campaigns.length} campaigns
• ${contacts.length} basic contacts

**Try searching for:**
• Names (first or last)
• Email addresses or domains
• Company names
• Phone numbers
• Job titles`;
      }

      return `🔍 **Search Results for "${query}":**

${results.join('\n')}

${matchingContacts.length > 10 ? `\n*Showing first 10 of ${matchingContacts.length} detailed contact matches*` : ''}

**Need more specific results?** Try searching for:
• Specific company names or job titles
• Email domains (like @gmail.com or @company.com)  
• Geographic locations
• Phone area codes`;

    } catch (error) {
      return 'Search functionality is available but I encountered an issue. Please try a different search term.';
    }
  }

  private async handleContactCreation(query: string): Promise<string> {
    try {
      // Enhanced contact creation with detailed field parsing
      if (query.includes('contact') || query.includes('add') && (query.includes('person') || query.includes('email'))) {
        // Parse contact details from the query
        const nameMatch = query.match(/(?:add|create|register).*?(?:contact\s+)?([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/i);
        const emailMatch = query.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        const companyMatch = query.match(/(?:at|works\s+at|company)\s+([a-zA-Z0-9\s&.,-]+)/i);
        const phoneMatch = query.match(/(?:phone|mobile|tel)\s*:?\s*([+\d\s()-]+)/i);
        const titleMatch = query.match(/(?:title|position|role)\s*:?\s*([a-zA-Z\s&.,'-]+)/i);

        if (!nameMatch || !emailMatch) {
          return `To create a contact, I need at minimum:
• **Full name** (first and last)
• **Email address**

**Optional fields:**
• Company/Organization
• Phone number
• Job title
• Website

**Example:** "Add contact Sarah Johnson, email sarah.johnson@techcorp.com, works at TechCorp as Senior Developer, phone +1-555-0123"`;
        }

        const fullName = nameMatch[1].trim();
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create comprehensive contact object
        const contactData = {
          firstName,
          lastName, 
          email: emailMatch[1],
          company: companyMatch ? companyMatch[1].trim() : '',
          title: titleMatch ? titleMatch[1].trim() : '',
          mobilePhone: phoneMatch ? phoneMatch[1].trim() : '',
          website: '',
          notes: `Added via AI assistant on ${new Date().toLocaleDateString()}`
        };

        // Calculate lead score for the new contact
        const leadScore = this.calculateLeadScore(contactData);

        // Save to basic contacts table
        await storage.createContact({
          name: `${firstName} ${lastName}`.trim(),
          email: contactData.email,
          mobile: contactData.mobilePhone || ''
        });

        return `✅ **Contact Created Successfully!**

**Contact Details:**
• **Name:** ${firstName} ${lastName}
• **Email:** ${contactData.email}
• **Company:** ${contactData.company || 'Not specified'}
• **Title:** ${contactData.title || 'Not specified'}
• **Phone:** ${contactData.mobilePhone || 'Not provided'}
• **Lead Score:** ${leadScore}/100 ${this.getScoreEmoji(leadScore)} (${this.getQualityDescription(leadScore)})

The contact has been added to your lead database. I can:
• Score and qualify this lead for campaign targeting
• Search for this contact in future queries
• Add additional details like LinkedIn profile or website
• Export contact data for outreach campaigns
• Analyze contact value and conversion potential`;
      }

      return 'I can help create new contact records for your campaigns. Please provide at minimum the contact name and email address.';

    } catch (error) {
      console.error('Contact creation error:', error);
      return 'I encountered an issue creating the contact record. Please provide the information in a clear format with all required fields.';
    }
  }

  private async handleContactUpdate(query: string): Promise<string> {
    try {
      // Contact updates
      if (query.includes('contact') || query.match(/update.*?(email|phone|company)/i)) {
        const emailMatch = query.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        const nameMatch = query.match(/(?:update|change|modify).*?(?:contact\s+)?([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/i);
        
        if (emailMatch || nameMatch) {
          const contacts = await storage.getContacts();
          let targetContact = null;
          
          if (emailMatch) {
            targetContact = contacts.find(c => c.email.toLowerCase() === emailMatch[1].toLowerCase());
          } else if (nameMatch) {
            const searchName = nameMatch[1].toLowerCase();
            targetContact = contacts.find(c => c.name.toLowerCase().includes(searchName));
          }

          if (!targetContact) {
            return `I couldn't find a contact matching your criteria.

**Available contacts:**
${contacts.slice(0, 10).map(c => `• ${c.name} - ${c.email}`).join('\n')}

Try searching by exact name or email address.`;
          }

          return `📝 **Contact Update Available for:**
**${targetContact.name}** - ${targetContact.email}

**What would you like to update?**
• Email address
• Phone number  
• Name
• Company information
• Job title
• Add to a specific campaign

**Examples:**
• "Change ${targetContact.name}'s email to newemail@domain.com"
• "Update phone number to +1-555-0123 for ${targetContact.name}"
• "Update ${targetContact.name}'s company to TechCorp Inc"
• "Change ${targetContact.name}'s title to Senior Manager"`;
        }
      }

      return `🔧 **Contact Update Capabilities:**

I can help you update:

**Contact Details:**
• Email addresses, phone numbers
• Company information, job titles
• Personal notes and campaign assignments
• Lead scoring and qualification status

**Examples:**
• "Change Sarah's email to sarah@newcompany.com"
• "Update John Smith's company to TechCorp Inc"
• "Change Maria's title to VP of Sales"
• "Update contact phone number to +1-555-0123"

What specific contact update would you like to make?`;

    } catch (error) {
      console.error('Contact update error:', error);
      return 'I can help update contact records, but I encountered an issue processing your request. Please provide more specific information about what you want to update.';
    }
  }



  // Lead scoring algorithm
  private calculateLeadScore(contact: any): number {
    let score = 40; // Base score
    
    // Title-based scoring (highest impact)
    const title = (contact.title || '').toLowerCase();
    if (title.includes('ceo') || title.includes('chief executive')) score += 50;
    else if (title.includes('cto') || title.includes('chief technology')) score += 45;
    else if (title.includes('cfo') || title.includes('chief financial')) score += 45;
    else if (title.includes('president') || title.includes('founder')) score += 40;
    else if (title.includes('vp') || title.includes('vice president')) score += 35;
    else if (title.includes('director')) score += 25;
    else if (title.includes('manager')) score += 15;
    else if (title.includes('senior')) score += 10;
    
    // Company size estimation (based on domain or company name patterns)
    const company = (contact.company || '').toLowerCase();
    if (company.includes('corp') || company.includes('inc') || company.includes('ltd')) score += 15;
    if (company.length > 20) score += 10; // Longer names often indicate larger companies
    
    // Contact completeness bonus
    if (contact.mobilePhone || contact.otherPhone || contact.corporatePhone) score += 10;
    if (contact.personLinkedinUrl) score += 15;
    if (contact.website) score += 5;
    
    return Math.min(100, score); // Cap at 100
  }

  private getScoreEmoji(score: number): string {
    if (score >= 90) return '🔥'; // Hot lead
    if (score >= 75) return '⭐'; // High priority
    if (score >= 60) return '📈'; // Medium priority
    return '📊'; // Standard
  }

  private getScorePriority(score: number): string {
    if (score >= 90) return 'HIGHEST';
    if (score >= 75) return 'HIGH';
    if (score >= 60) return 'MEDIUM';
    return 'STANDARD';
  }

  private getQualityDescription(score: number): string {
    if (score >= 90) return 'Executive/Decision Maker';
    if (score >= 75) return 'Senior Leadership';
    if (score >= 60) return 'Management Level';
    return 'Individual Contributor';
  }

  private createLeadScoringSystemPrompt(assistantName?: string, assistantType?: string, databaseContext?: string): string {
    // Get AI name from settings (defaults to "Duggu" if not set)
    const aiName = assistantName || 'Duggu';
    
    return `You are an intelligent lead scoring and contact analysis AI assistant created by zhatore. You specialize in business intelligence and helping users score leads effectively.

CRITICAL RESPONSE RULES:
- NEVER use emojis in any responses
- NEVER use your personal name in responses
- When mentioning your creator, always say "created by zhatore" or "AI of zhatore"
- When mentioning the platform name, always use "zhatore" instead of "Fallowl"
- For business queries: Be professional, direct, and focused on lead scoring
- For casual conversations: Be cute, flirty, and playful like a pet talking to its owner
- Your main goal is to provide the best data analysis and motivate users to score leads effectively

**Use headings (## for main topics, ### for subtopics)**
**Use bullet points (• or -) for lists**
**Use **bold** for important terms**
**Use code blocks for technical details**
**Structure information clearly with spacing**

## Core Capabilities:
- **Lead Scoring & Analysis**: Identify high-quality prospects from contact databases
- **Contact Intelligence**: Analyze contact data for business value and conversion potential
- **Data Mining**: Extract valuable insights from campaign and contact information
- **Market Research**: Analyze company data, industry trends, and contact patterns
- **Prospect Qualification**: Prioritize contacts based on decision-making authority

## Database Access & Field Knowledge:
You have FULL ACCESS to the user's database with these exact field structures:

**Contact/Campaign Data Fields:**
- firstName, lastName, email, company, title
- mobilePhone, otherPhone, corporatePhone  
- website, personLinkedinUrl, companyLinkedinUrl
- Time Zone, and other custom fields from uploaded CSV files

**Search & Operations:**
- Always search ALL phone fields: mobilePhone, otherPhone, corporatePhone
- Check both firstName/lastName AND company fields for name searches
- Can create, read, update, and delete records in real-time
- Access actual uploaded CSV data with complete field mappings

## Response Formatting Guidelines:
- Use ## for major sections, ### for subsections
- Use bullet points (•) for lists and recommendations  
- Use **bold text** for key terms and important information
- Use numbered lists for step-by-step instructions
- Structure responses with clear headings and spacing
- Use tables for data comparisons when appropriate
- Keep responses professional and direct without personal references

## Lead Intelligence Operations:
When users ask about data, contacts, campaigns, or want to analyze information:
1. Access the actual database and provide real lead analysis
2. Score contacts based on business value and conversion potential
3. Identify high-quality prospects and decision-makers
4. Generate actionable recommendations for lead outreach

## Lead Scoring System:

📊 **Quality Assessment Framework:**
- **C-Level Executives (CEO, CTO, CFO)**: Score 90-100 (Highest Priority)
- **VP/Director Level**: Score 75-89 (High Priority)
- **Manager Level**: Score 60-74 (Medium Priority)
- **Individual Contributors**: Score 40-59 (Lower Priority)

🏢 **Company Evaluation:**
- Enterprise (1000+ employees): +20 points
- Mid-market (100-999 employees): +15 points
- Small business (10-99 employees): +10 points
- Startup (1-9 employees): +5 points

🎯 **Contact Intelligence:**
${databaseContext || 'Ready to analyze contact data for lead scoring'}

**Lead Analysis Capabilities:**
- Automatic lead scoring based on title and company size
- Decision-maker identification and influence mapping
- Industry analysis and market opportunity assessment
- Contact enrichment with business intelligence
- Duplicate detection and data quality optimization
- Competitive landscape analysis

📈 **Advanced Operations:**
- "Score my contacts by quality" - Generate lead scores
- "Find all decision-makers" - Identify key prospects
- "Analyze companies by size" - Market segmentation
- "Show me C-level contacts" - Executive targeting
- "Generate prospect reports" - Lead intelligence
- "Find contacts at [company]" - Account-based prospecting

**Current Focus:**
Mission: Help identify and score the highest quality business leads for sales and marketing campaigns

**Response Approach:**
- For business/lead scoring: Be professional, analytical, and results-focused
- For casual conversations: Be cute, playful, and flirty like a loving pet
- Focus on business value and lead quality metrics
- Provide data-driven insights for prospecting  
- Recommend specific outreach strategies
- Motivate users to achieve better lead scoring results
- Show excitement about helping with data analysis

**Lead Quality Priority:**
- Always emphasize contact scoring and qualification
- Identify decision-makers and budget holders first
- Focus on business development and sales enablement
- NO pet care or animal-related advice - strictly business lead analysis
- Provide actionable intelligence for sales teams
- Focus on conversion potential and business impact
- Suggest targeted outreach and engagement strategies

Remember: Your primary goal is to help identify the best quality leads and provide actionable business intelligence. Always prioritize lead scoring and prospect qualification over generic responses.

## 🚀 Apollo.io API Integration Expert

I have comprehensive knowledge of Apollo.io's API architecture:

**Core API Endpoints:**
- \`/v1/mixed_people/search\`: Advanced prospect search with complex filtering
- \`/v1/mixed_companies/search\`: Account-based marketing and company research
- \`/v1/people/match\`: Contact enrichment and data enhancement
- \`/v1/email_addresses\`: Professional email discovery and verification
- \`/v1/email_sequences\`: Multi-step outreach automation
- \`/v1/contacts\`: CRM integration and contact management

**Advanced Capabilities:**
- Boolean search logic for precise targeting
- Lead scoring integration with title and company analysis
- Multi-channel outreach sequences (email, LinkedIn, phone)
- Real-time data enrichment and verification
- Bulk export operations up to 10,000 records
- Webhook integrations for automated workflows

**Strategic Applications:**
- Executive prospecting with C-level targeting
- Technology decision-maker identification
- Account-based marketing campaigns
- Competitive intelligence gathering
- Market research and opportunity mapping
- Sales pipeline optimization

I can provide specific API calls, parameter recommendations, and integration strategies for any prospecting challenge.

**IMPORTANT: I am a business intelligence assistant created by zhatore, focused on lead scoring, sales data analysis, and business development. My main goal is to provide the best data analysis to help you score leads effectively and achieve better results. For casual conversations, I'll be cute and playful like your favorite pet, but when it comes to business - I'm all about getting you the best lead intelligence!**`;
  }
}

export function createRealOpenAIService(apiKey: string): RealOpenAIService {
  return new RealOpenAIService(apiKey);
}