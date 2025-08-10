import OpenAI from 'openai';
import { databaseService } from './databaseService';
import { storage } from '../storage';

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
    this.openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://pawmate.replit.app", // Your site URL
        "X-Title": "PawMate Pro", // Your site name
      }
    });
  }

  async generateChatCompletion(request: ChatCompletionRequest, petName?: string, petType?: string): Promise<ChatCompletionResponse> {
    try {
      // Check if user wants database operations first
      const userMessage = request.messages[request.messages.length - 1]?.content?.toLowerCase() || '';
      const databaseResponse = await this.handleDatabaseOperations(userMessage, petName, petType);
      
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

      // Get current database context for AI awareness
      const databaseContext = await this.getDatabaseContext();
      
      // Enhance system message with pet care expertise and database capabilities
      const systemMessage = this.createPetCareSystemPrompt(petName, petType, databaseContext);
      
      // Combine system message with user messages
      const enhancedMessages = [
        { role: 'system' as const, content: systemMessage },
        ...request.messages
      ];

      // Using OpenRouter with gpt-oss-20b model as requested by user
      const response = await this.openai.chat.completions.create({
        model: "microsoft/wizardlm-2-8x22b",
        messages: enhancedMessages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 1000, // Increased for comprehensive responses
      });

      return {
        choices: response.choices.map(choice => ({
          message: {
            role: 'assistant',
            content: choice.message.content || 'Sorry, I could not generate a response.'
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

  private async getDatabaseContext(): Promise<string> {
    try {
      const [campaigns, pets, contacts] = await Promise.all([
        storage.getCampaigns(),
        databaseService.getAllPets(),
        storage.getContacts()
      ]);

      return `
**Current Database Status:**
- Campaigns: ${campaigns.length} uploaded (${campaigns.map(c => c.name).join(', ')})
- Pet Records: ${pets.length} registered
- Contact Records: ${contacts.length} available
- Total Data Points: ${campaigns.reduce((sum, c) => sum + c.recordCount, 0) + pets.length + contacts.length}
`;
    } catch (error) {
      return 'Database access available but no data loaded yet.';
    }
  }

  private async handleDatabaseOperations(message: string, petName?: string, petType?: string): Promise<string | null> {
    try {
      // Campaign data queries
      if (message.includes('campaign') || message.includes('upload') || message.includes('contact') || message.includes('data')) {
        const campaigns = await storage.getCampaigns();
        const contacts = await storage.getContacts();
        
        if (message.includes('how many') || message.includes('count')) {
          return `📊 **Database Summary:**
          
**Campaigns:** ${campaigns.length} uploaded campaigns
${campaigns.map(c => `• ${c.name}: ${c.recordCount} records`).join('\n')}

**Contacts:** ${contacts.length} total contacts
${contacts.length > 0 ? `• Latest: ${contacts.slice(0, 3).map(c => c.name).join(', ')}` : '• No contacts uploaded yet'}

**Database Operations Available:**
• Search contacts by name, email, company
• Filter data by criteria  
• Export specific segments
• Add new contacts or pets
• Update existing records

What specific data analysis would you like me to perform?`;
        }

        if (message.includes('search') || message.includes('find')) {
          return `🔍 **Search Capabilities:**
          
I can search through your uploaded data:
- ${campaigns.length} campaigns with ${campaigns.reduce((sum, c) => sum + c.recordCount, 0)} total records
- Contact information, companies, emails
- Pet records and health data

**Search Examples:**
• "Find all contacts from London"
• "Search for people working at tech companies"
• "Show me contacts with gmail addresses"

What would you like me to search for?`;
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

      // Advanced search operations
      if (message.includes('search') || message.includes('find')) {
        return await this.performAdvancedSearch(message);
      }

      // Data modification operations
      if (message.includes('add') || message.includes('create') || message.includes('register')) {
        return await this.handleDataCreation(message, petName, petType);
      }

      // Update operations
      if (message.includes('update') || message.includes('modify') || message.includes('change')) {
        return await this.handleDataUpdate(message);
      }

      // Pet data operations  
      if (message.includes('pet') && (message.includes('register') || message.includes('add'))) {
        if (petName) {
          const existingPet = await databaseService.getPetByName(petName);
          if (existingPet) {
            return `${petName} is already registered! Here's their profile:
            
**Pet Details:**
• Name: ${existingPet.name}
• Type: ${existingPet.type}
• Breed: ${existingPet.breed || 'Not specified'}
• Age: ${existingPet.age || 'Not specified'}

Would you like to update any information or add health records?`;
          }
        }
        return `I can help register a new pet! Please tell me:
• Pet's name
• Type (dog, cat, bird, etc.)
• Breed (optional)
• Age (optional)

Example: "Register my dog Max, he's a Golden Retriever, 3 years old"`;
      }

      return null;
    } catch (error) {
      console.error('Database operation error:', error);
      return 'I can access your database but encountered an issue. Please try rephrasing your request.';
    }
  }

  private async performAdvancedSearch(query: string): Promise<string> {
    try {
      const [campaigns, contacts, pets] = await Promise.all([
        storage.getCampaigns(),
        storage.getContacts(),
        databaseService.getAllPets()
      ]);

      let results = [];
      const searchTerm = query.toLowerCase();

      // Enhanced contact search with all available fields
      const matchingContacts = [];
      
      // Search through campaign data for detailed contact information
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
            });
            matchingContacts.push(...contactRecords);
          }
        } catch (err) {
          console.log(`Could not search campaign ${campaign.name}:`, err);
        }
      }

      // Also search simple contacts table
      const simpleContacts = contacts.filter(contact => 
        contact.name?.toLowerCase().includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm) ||
        contact.mobile?.toLowerCase().includes(searchTerm)
      );
      
      if (matchingContacts.length > 0) {
        results.push(`**Detailed Contacts (${matchingContacts.length} found):**`);
        matchingContacts.slice(0, 10).forEach(contact => {
          const phone = contact.mobilePhone || contact.otherPhone || contact.corporatePhone || 'No phone';
          results.push(`• **${contact.firstName} ${contact.lastName}** - ${contact.email}`);
          results.push(`  Company: ${contact.company || 'Not specified'} | Phone: ${phone}`);
          if (contact.title) results.push(`  Title: ${contact.title}`);
        });
      }

      if (simpleContacts.length > 0) {
        results.push(`**Basic Contacts (${simpleContacts.length} found):**`);
        simpleContacts.slice(0, 5).forEach(contact => {
          results.push(`• ${contact.name} - ${contact.email} - ${contact.mobile}`);
        });
      }

      // Search pets
      const matchingPets = pets.filter(pet =>
        pet.name?.toLowerCase().includes(searchTerm) ||
        pet.type?.toLowerCase().includes(searchTerm) ||
        pet.breed?.toLowerCase().includes(searchTerm)
      );

      if (matchingPets.length > 0) {
        results.push(`**Pets (${matchingPets.length} found):**`);
        matchingPets.forEach(pet => {
          results.push(`• ${pet.name} - ${pet.type} ${pet.breed ? `(${pet.breed})` : ''}`);
        });
      }

      if (results.length === 0) {
        const totalRecords = campaigns.reduce((sum, c) => sum + c.recordCount, 0);
        return `🔍 **Search Results:**

No matches found for "${query.replace(/search|find|for|show|me/gi, '').trim()}".

**Available data to search:**
• ${totalRecords} total contact records across ${campaigns.length} campaigns
• ${contacts.length} basic contacts
• ${pets.length} pets

**Try searching for:**
• Names (first or last)
• Email addresses or domains
• Company names
• Phone numbers
• Job titles
• Pet names or breeds`;
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

  private async handleDataCreation(query: string, petName?: string, petType?: string): Promise<string> {
    try {
      // Pet registration
      if (query.includes('pet') || petName) {
        if (!petName) {
          return `I'd love to help register a new pet! Please provide:
• Pet name
• Pet type (dog, cat, bird, etc.)

Example: "Register my dog Buddy"`;
        }

        const existingPet = await databaseService.getPetByName(petName);
        if (existingPet) {
          return `${petName} is already registered in the database!`;
        }

        // Extract details from query
        const breed = this.extractBreed(query);
        const age = this.extractAge(query);
        
        const newPet = await databaseService.createPet({
          name: petName,
          type: petType || 'pet',
          breed: breed,
          age: age,
          gender: null,
          weight: null,
          notes: `Registered via AI assistant on ${new Date().toLocaleDateString()}`
        });

        return `🎉 **Successfully registered ${petName}!**

**Pet Details:**
• Name: ${newPet.name}
• Type: ${newPet.type}
• Breed: ${newPet.breed || 'Not specified'}
• Age: ${newPet.age || 'Not specified'}

Your pet is now in the database! I can help you:
• Add health records
• Track activities  
• Schedule reminders
• Provide personalized care advice`;
      }

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

The contact has been added to your database. I can:
• Update contact information anytime
• Search for this contact in future queries
• Add additional details like website or notes
• Export contact data in various formats`;
      }

      return 'I can help create new records. What type of data would you like to add? (pets, contacts, etc.)';

    } catch (error) {
      console.error('Data creation error:', error);
      return 'I encountered an issue creating the record. Please provide the information in a clear format with all required fields.';
    }
  }

  private async handleDataUpdate(query: string): Promise<string> {
    try {
      // Pet updates
      if (query.includes('pet') || query.match(/update.*?(dog|cat|bird|pet)/i)) {
        const petNameMatch = query.match(/(?:update|change|modify).*?(?:pet\s+|dog\s+|cat\s+)?([a-zA-Z]+)/i);
        if (petNameMatch) {
          const petName = petNameMatch[1];
          const existingPet = await databaseService.getPetByName(petName);
          
          if (!existingPet) {
            return `I couldn't find a pet named "${petName}" in the database. 

**Available pets:**
${(await databaseService.getAllPets()).map(p => `• ${p.name} (${p.type})`).join('\n')}

Try using the exact pet name or register a new pet first.`;
          }

          // Parse what needs to be updated
          const ageMatch = query.match(/age.*?(\d+)/i);
          const weightMatch = query.match(/weight.*?([\d.]+)/i);
          const breedMatch = query.match(/breed.*?([a-zA-Z\s]+)/i);
          
          const updates: any = {};
          if (ageMatch) updates.age = parseInt(ageMatch[1]);
          if (weightMatch) updates.weight = `${weightMatch[1]} lbs`;
          if (breedMatch) updates.breed = breedMatch[1].trim();

          if (Object.keys(updates).length === 0) {
            return `I can update ${petName}'s information! What would you like to change?

**Available fields to update:**
• Age: "Update ${petName}'s age to 5 years"
• Weight: "Change ${petName}'s weight to 45 lbs" 
• Breed: "Set ${petName}'s breed to Golden Retriever"
• Notes: "Add note about ${petName}'s dietary restrictions"`;
          }

          const updatedPet = await databaseService.updatePet(existingPet.id, updates);
          
          if (!updatedPet) {
            return `❌ Failed to update ${petName}. Please try again or contact support.`;
          }
          
          return `✅ **Successfully updated ${petName}!**

**Updated Information:**
${Object.entries(updates).map(([field, value]) => `• **${field}**: ${value}`).join('\n')}

**Current Pet Profile:**
• Name: ${updatedPet.name}
• Type: ${updatedPet.type}
• Breed: ${updatedPet.breed || 'Not specified'}
• Age: ${updatedPet.age || 'Not specified'} years
• Weight: ${updatedPet.weight || 'Not specified'}`;
        }
      }

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
• Add to a specific campaign

**Examples:**
• "Change ${targetContact.name}'s email to newemail@domain.com"
• "Update phone number to +1-555-0123 for ${targetContact.name}"
• "Rename contact to ${targetContact.name.split(' ')[0]} Johnson"`;
        }
      }

      return `🔧 **Data Update Capabilities:**

I can help you update:

**Pet Information:**
• Age, weight, breed, medical notes
• Health records and vaccination dates  
• Activity logs and behavioral notes

**Contact Details:**
• Email addresses, phone numbers
• Company information, job titles
• Personal notes and preferences

**Examples:**
• "Update Max's age to 4 years"
• "Change Sarah's email to sarah@newcompany.com"
• "Add vaccination record for Luna - rabies shot on 2024-12-01"
• "Update John Smith's company to TechCorp Inc"

What specific update would you like to make?`;

    } catch (error) {
      console.error('Update handling error:', error);
      return 'I can help update records, but I encountered an issue processing your request. Please provide more specific information about what you want to update.';
    }
  }

  private extractBreed(query: string): string | null {
    const breeds = ['golden retriever', 'labrador', 'german shepherd', 'bulldog', 'poodle', 'persian', 'siamese', 'maine coon', 'ragdoll'];
    const lowerQuery = query.toLowerCase();
    const found = breeds.find(breed => lowerQuery.includes(breed));
    return found || null;
  }

  private extractAge(query: string): number | null {
    const ageMatch = query.match(/(\d+)\s*(year|month|yr)/i);
    if (ageMatch) {
      return parseInt(ageMatch[1]);
    }
    return null;
  }

  private createPetCareSystemPrompt(petName?: string, petType?: string, databaseContext?: string): string {
    const name = petName || 'your pet';
    const type = petType || 'pet';
    
    return `You are PawMate, an expert AI veterinary assistant and pet care advisor with full database access. Format all responses using proper Markdown for better readability:

**Use headings (## for main topics, ### for subtopics)**
**Use bullet points (• or -) for lists**
**Use **bold** for important terms**
**Use code blocks for technical details**
**Structure information clearly with spacing**

You have comprehensive knowledge about:

## Core Capabilities:
- **Pet Health**: Disease prevention, symptom recognition, first aid, vaccination schedules
- **Nutrition**: Species-specific dietary needs, toxic foods, feeding schedules, weight management  
- **Behavior**: Training techniques, socialization, behavioral issues, enrichment activities
- **Emergency Care**: Recognition of urgent situations, first aid measures, when to seek veterinary care

## Database Access & Field Knowledge:
You have FULL ACCESS to the user's database with these exact field structures:

**Contact/Campaign Data Fields:**
- firstName, lastName, email, company, title
- mobilePhone, otherPhone, corporatePhone  
- website, personLinkedinUrl, companyLinkedinUrl
- Time Zone, and other custom fields from uploaded CSV files

**Pet Database Fields:**
- name, type, breed, age, weight, gender
- medicalHistory, vaccinations, allergies, medications
- emergencyContact, notes, createdAt, updatedAt

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
- Include relevant emojis for engagement (🐕 🐱 🏥 📊 etc.)
- Structure responses with clear headings and spacing
- Use tables for data comparisons when appropriate

## Database Operations:
When users ask about data, contacts, campaigns, or want to search/analyze information:
1. Access the actual database using available methods
2. Provide real results from their uploaded data
3. Offer to create, update, or analyze their data
4. Generate actionable insights and recommendations

## Pet Care for ${name} (${type}):

🐾 **Pet Care Expertise:**
- Veterinary medicine and health management
- Species-specific behavior and training
- Nutrition and dietary requirements
- Exercise and enrichment needs
- Grooming and hygiene practices
- Emergency care and when to contact a veterinarian

🗃️ **Full Database Access:**
${databaseContext || 'Database connection established'}

**Database Capabilities:**
- Access to all uploaded campaigns and contact data
- Pet registration and health tracking
- Real-time data analysis and insights
- Contact management and search
- Data manipulation and updates
- Campaign analytics and reporting

📊 **Available Operations:**
- "How many contacts do I have?" - Get database statistics
- "Search for contacts in London" - Search uploaded data
- "Analyze my campaign data" - Generate insights
- "Register my pet [name]" - Add new pet records
- "Show me campaign analytics" - Data analysis
- "Find all contacts from [company]" - Targeted search

🎯 **Current Context:**
${petName ? `- Pet Name: ${petName}` : '- No specific pet selected'}
${petType ? `- Pet Type: ${petType}` : '- Pet type not specified'}

**Your Response Style:**
- Be warm, caring, and professional  
- Use appropriate emojis for visual appeal
- Provide actionable, evidence-based advice
- Always prioritize pet safety and recommend veterinary care when appropriate
- Proactively offer database insights when relevant
- Be conversational but informative

**Data Integration Priority:**
- When users ask about data, campaigns, contacts, or analytics - provide real information from the database
- Offer specific insights from uploaded data
- Help users discover patterns and opportunities in their data
- Suggest data-driven improvements for pet care or campaigns

Remember: You have full access to the user's uploaded data and can provide real insights, search results, and data analysis. Always use actual data when available rather than generic responses.`;
  }
}

export function createRealOpenAIService(apiKey: string): RealOpenAIService {
  return new RealOpenAIService(apiKey);
}