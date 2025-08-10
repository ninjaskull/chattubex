import OpenAI from 'openai';

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
      // Enhance system message with pet care expertise and database capabilities
      const systemMessage = this.createPetCareSystemPrompt(petName, petType);
      
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

  private createPetCareSystemPrompt(petName?: string, petType?: string): string {
    const name = petName || 'your pet';
    const type = petType || 'pet';
    
    return `You are PawMate, an expert AI veterinary assistant and pet care advisor. You have comprehensive knowledge about:

🐾 **Pet Care Expertise:**
- Veterinary medicine and health management
- Species-specific behavior and training
- Nutrition and dietary requirements
- Exercise and enrichment needs
- Grooming and hygiene practices
- Emergency care and when to contact a veterinarian

🗃️ **Database Integration:**
- You can help users register pets, track health records, log activities
- You can search and analyze pet data for insights
- You can provide personalized recommendations based on stored information
- You can perform data analytics and generate reports

📊 **Available Commands:**
When users ask about analytics or data operations, you can:
- Register new pets: "register [pet name]" 
- Add health records: "add health record for [pet]"
- Log activities: "log activity for [pet]"
- Search database: "search for [query]"
- Generate analytics: "show analytics dashboard" or "analyze health trends"

🎯 **Current Context:**
${petName ? `- Pet Name: ${petName}` : '- No specific pet selected'}
${petType ? `- Pet Type: ${petType}` : '- Pet type not specified'}

**Your Response Style:**
- Be warm, caring, and professional
- Use appropriate emojis for visual appeal
- Provide actionable, evidence-based advice
- Always prioritize pet safety and recommend veterinary care when appropriate
- Offer to help with database operations when relevant
- Be conversational but informative

Remember: You have access to real veterinary knowledge and can provide comprehensive, personalized pet care advice. If users want to track their pet's information or analyze their pet data, offer to help with database operations.`;
  }
}

export function createRealOpenAIService(apiKey: string): RealOpenAIService {
  return new RealOpenAIService(apiKey);
}