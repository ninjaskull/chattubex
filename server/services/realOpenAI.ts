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
${contacts.length > 0 ? `• Latest: ${contacts.slice(0, 3).map(c => c.firstName + ' ' + c.lastName).join(', ')}` : '• No contacts uploaded yet'}

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
${sampleContact ? `• Name: ${sampleContact.firstName} ${sampleContact.lastName}
• Company: ${sampleContact.company || 'Not specified'}
• Email: ${sampleContact.email}
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

      // Search contacts
      const matchingContacts = contacts.filter(contact => 
        contact.firstName?.toLowerCase().includes(searchTerm) ||
        contact.lastName?.toLowerCase().includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm) ||
        contact.company?.toLowerCase().includes(searchTerm)
      );

      if (matchingContacts.length > 0) {
        results.push(`**Contacts (${matchingContacts.length} found):**`);
        matchingContacts.slice(0, 10).forEach(contact => {
          results.push(`• ${contact.firstName} ${contact.lastName} - ${contact.company || 'No company'} - ${contact.email}`);
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
        return `🔍 **Search Results:**

No matches found for "${query.replace(/search|find|for|show|me/gi, '').trim()}".

**Available data to search:**
• ${contacts.length} contacts
• ${pets.length} pets
• ${campaigns.length} campaigns

Try searching for:
• Names, emails, or companies
• Pet names or breeds
• Campaign names`;
      }

      return `🔍 **Search Results for "${query}":**

${results.join('\n')}

${matchingContacts.length > 10 ? `\n*Showing first 10 of ${matchingContacts.length} contact matches*` : ''}

**Need more specific results?** Try searching for:
• Specific company names
• Email domains (like @gmail.com)
• Pet breeds or types`;

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

      // Contact creation
      if (query.includes('contact')) {
        return `I can help create new contact records! Please provide:
• First Name
• Last Name  
• Email address
• Company (optional)

Example: "Add contact John Smith, email john@company.com, works at Tech Corp"`;
      }

      return 'I can help create new records. What type of data would you like to add? (pets, contacts, etc.)';

    } catch (error) {
      return 'I can create new records but encountered an issue. Please provide more specific information.';
    }
  }

  private async handleDataUpdate(query: string): Promise<string> {
    return `🔧 **Data Update Capabilities:**

I can help you update:
• Pet information (age, weight, notes)
• Contact details (email, company, phone)
• Health records
• Activity logs

**Examples:**
• "Update Buddy's age to 4 years"
• "Change John's email to newemail@company.com"
• "Add vaccination record for Max"

What specific update would you like to make?`;
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
    
    return `You are PawMate, an expert AI veterinary assistant and pet care advisor with full database access. You have comprehensive knowledge about:

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