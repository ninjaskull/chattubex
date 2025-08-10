import { z } from "zod";

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
}

// Advanced pet care knowledge base
const petKnowledge = {
  health: {
    symptoms: {
      'vomiting': 'If your pet is vomiting frequently, withhold food for 12-24 hours but keep water available. If vomiting persists or contains blood, contact a vet immediately.',
      'diarrhea': 'For diarrhea, ensure your pet stays hydrated. Feed bland foods like boiled chicken and rice. If it lasts more than 24 hours, see a veterinarian.',
      'lethargy': 'Sudden lethargy could indicate illness. Monitor for other symptoms and consider a vet visit if it persists beyond a day.',
      'coughing': 'Persistent coughing in pets can indicate respiratory issues, heart problems, or allergies. A vet examination is recommended.',
      'limping': 'Check for visible injuries, swelling, or foreign objects in paws. Rest is important, but persistent limping needs veterinary attention.'
    },
    prevention: 'Regular vet checkups, vaccinations, dental care, and maintaining a healthy weight are key to preventing health issues.',
    emergency: 'Signs that need immediate vet attention: difficulty breathing, unconsciousness, severe bleeding, suspected poisoning, seizures, or extreme pain.'
  },
  nutrition: {
    general: 'Feed high-quality pet food appropriate for your pet\'s age, size, and activity level. Maintain consistent feeding schedules.',
    toxic_foods: 'Never give pets: chocolate, grapes, raisins, onions, garlic, xylitol (artificial sweetener), alcohol, or avocado.',
    treats: 'Treats should make up no more than 10% of daily calories. Use healthy options like small pieces of cooked chicken or pet-safe vegetables.',
    hydration: 'Fresh water should always be available. Some pets prefer moving water from fountains.'
  },
  behavior: {
    training_principles: 'Use positive reinforcement, be consistent, keep sessions short (5-10 minutes), and end on a positive note.',
    common_issues: {
      'aggression': 'Address aggression immediately. Identify triggers, ensure safety, and consider professional training or behaviorist help.',
      'separation_anxiety': 'Gradually increase alone time, create positive associations with departure, and provide mental stimulation.',
      'excessive_barking': 'Identify the cause (boredom, fear, alerting). Address underlying needs and use positive training methods.'
    },
    enrichment: 'Provide mental stimulation through puzzle toys, training sessions, new experiences, and appropriate social interaction.'
  },
  exercise: {
    dogs: 'Most dogs need 30 minutes to 2 hours of exercise daily, depending on breed, age, and health. Include walks, play, and mental stimulation.',
    cats: 'Indoor cats need 10-15 minutes of active play several times daily. Use wand toys, laser pointers (with treats), and climbing structures.',
    small_pets: 'Rabbits, hamsters, and similar pets need safe spaces to run and explore, plus species-appropriate toys and activities.'
  },
  grooming: {
    frequency: 'Brushing frequency depends on coat type: daily for long-haired pets, weekly for short-haired. Nail trims every 2-4 weeks.',
    bathing: 'Most dogs need baths every 4-6 weeks unless they get dirty. Cats typically groom themselves and rarely need baths.',
    dental_care: 'Brush pet teeth regularly or provide dental chews. Professional cleanings may be needed annually.'
  }
};

class MockOpenAIService {
  private getContextualResponse(messages: ChatMessage[], petName: string = '', petType: string = 'pet'): string {
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const conversationContext = messages.slice(-5).map(m => m.content).join(' ').toLowerCase();
    
    // Advanced intent recognition
    const intents = this.analyzeIntent(lastUserMessage, conversationContext);
    
    // Generate personalized response based on intents and context
    return this.generateResponse(intents, lastUserMessage, petName, petType, conversationContext);
  }
  
  private analyzeIntent(userMessage: string, context: string): string[] {
    const intents: string[] = [];
    
    // Health-related intents
    if (/(sick|ill|health|vet|doctor|pain|hurt|injury|wound|blood|fever|temperature)/i.test(userMessage)) {
      intents.push('health_concern');
    }
    if (/(vomit|throw up|nausea)/i.test(userMessage)) intents.push('vomiting');
    if (/(diarrhea|loose stool|upset stomach)/i.test(userMessage)) intents.push('diarrhea');
    if (/(tired|sleepy|lethargic|weak)/i.test(userMessage)) intents.push('lethargy');
    if (/(cough|wheez|breathing|breath)/i.test(userMessage)) intents.push('breathing');
    if (/(limp|leg|paw|walk)/i.test(userMessage)) intents.push('mobility');
    
    // Nutrition intents
    if (/(food|eat|feed|hungry|nutrition|diet|meal)/i.test(userMessage)) {
      intents.push('nutrition');
    }
    if (/(toxic|poison|dangerous|can.*eat|safe.*eat)/i.test(userMessage)) intents.push('food_safety');
    if (/(treat|snack|reward)/i.test(userMessage)) intents.push('treats');
    if (/(water|drink|thirsty|dehydrat)/i.test(userMessage)) intents.push('hydration');
    
    // Behavior intents
    if (/(train|behavior|behaviour|obedien|command|sit|stay|come)/i.test(userMessage)) {
      intents.push('training');
    }
    if (/(aggressive|bite|growl|snap|angry)/i.test(userMessage)) intents.push('aggression');
    if (/(bark|loud|noise|vocal)/i.test(userMessage)) intents.push('vocalization');
    if (/(anxious|scared|afraid|nervous|stress)/i.test(userMessage)) intents.push('anxiety');
    if (/(alone|separation|leave)/i.test(userMessage)) intents.push('separation');
    
    // Exercise intents
    if (/(exercise|walk|play|active|run|energy|tired)/i.test(userMessage)) {
      intents.push('exercise');
    }
    if (/(toy|game|fun|entertainment|bored)/i.test(userMessage)) intents.push('enrichment');
    
    // Grooming intents
    if (/(groom|brush|bath|clean|hygiene|nail|claw)/i.test(userMessage)) {
      intents.push('grooming');
    }
    if (/(teeth|dental|mouth|breath|oral)/i.test(userMessage)) intents.push('dental');
    
    // General care intents
    if (/(puppy|kitten|young|baby|age)/i.test(userMessage)) intents.push('young_pet');
    if (/(old|senior|elderly|aging)/i.test(userMessage)) intents.push('senior_pet');
    if (/(breed|type|species)/i.test(userMessage)) intents.push('breed_specific');
    
    // Emotional support
    if (/(love|bond|relationship|connect|happy|joy)/i.test(userMessage)) intents.push('bonding');
    if (/(worry|concerned|scared|help|advice)/i.test(userMessage)) intents.push('reassurance');
    
    return intents;
  }
  
  private generateResponse(intents: string[], userMessage: string, petName: string, petType: string, context: string): string {
    const name = petName || `your ${petType}`;
    const icon = this.getPetIcon(petType);
    
    // Handle multiple intents with priority
    if (intents.includes('health_concern')) {
      return this.getHealthResponse(intents, userMessage, name, icon);
    }
    
    if (intents.includes('nutrition') || intents.includes('food_safety')) {
      return this.getNutritionResponse(intents, userMessage, name, icon);
    }
    
    if (intents.includes('training') || intents.includes('aggression') || intents.includes('anxiety')) {
      return this.getBehaviorResponse(intents, userMessage, name, icon);
    }
    
    if (intents.includes('exercise') || intents.includes('enrichment')) {
      return this.getExerciseResponse(intents, userMessage, name, petType, icon);
    }
    
    if (intents.includes('grooming') || intents.includes('dental')) {
      return this.getGroomingResponse(intents, userMessage, name, icon);
    }
    
    if (intents.includes('bonding') || intents.includes('reassurance')) {
      return this.getEmotionalResponse(intents, userMessage, name, icon);
    }
    
    // Breed/age-specific advice
    if (intents.includes('young_pet') || intents.includes('senior_pet') || intents.includes('breed_specific')) {
      return this.getSpecificAdvice(intents, userMessage, name, petType, icon);
    }
    
    // General conversation
    return this.getGeneralResponse(userMessage, name, petType, icon);
  }
  
  private getHealthResponse(intents: string[], userMessage: string, name: string, icon: string): string {
    if (intents.includes('vomiting')) {
      return `${icon} I'm concerned about ${name}'s vomiting. ${petKnowledge.health.symptoms.vomiting} Monitor closely and don't hesitate to call your vet if you're worried.`;
    }
    if (intents.includes('diarrhea')) {
      return `${icon} For ${name}'s diarrhea: ${petKnowledge.health.symptoms.diarrhea} Keep me updated on how they're doing!`;
    }
    if (intents.includes('lethargy')) {
      return `${icon} ${name}'s lethargy could be concerning. ${petKnowledge.health.symptoms.lethargy} Trust your instincts - you know ${name} best.`;
    }
    if (intents.includes('breathing')) {
      return `${icon} Breathing issues in ${name} need attention. ${petKnowledge.health.symptoms.coughing} Please consider a vet visit soon.`;
    }
    if (intents.includes('mobility')) {
      return `${icon} For ${name}'s limping or mobility issues: ${petKnowledge.health.symptoms.limping} I hope they feel better soon!`;
    }
    
    return `${icon} I care about ${name}'s health! ${petKnowledge.health.prevention} If you're seeing concerning symptoms, it's always better to check with a veterinarian. What specific symptoms are you noticing?`;
  }
  
  private getNutritionResponse(intents: string[], userMessage: string, name: string, icon: string): string {
    if (intents.includes('food_safety')) {
      return `${icon} Safety first for ${name}! ${petKnowledge.nutrition.toxic_foods} Always check if a food is pet-safe before sharing. What food were you curious about?`;
    }
    if (intents.includes('treats')) {
      return `${icon} Treats for ${name}! ${petKnowledge.nutrition.treats} Some great healthy options include small pieces of cooked chicken, carrots, or blueberries (for dogs).`;
    }
    if (intents.includes('hydration')) {
      return `${icon} Hydration is so important for ${name}! ${petKnowledge.nutrition.hydration} Some pets love ice cubes as treats too!`;
    }
    
    return `${icon} Great question about ${name}'s nutrition! ${petKnowledge.nutrition.general} Every pet is unique, so what works best can vary. What specific nutrition question do you have?`;
  }
  
  private getBehaviorResponse(intents: string[], userMessage: string, name: string, icon: string): string {
    if (intents.includes('aggression')) {
      return `${icon} I understand your concern about ${name}'s behavior. ${petKnowledge.behavior.common_issues.aggression} Safety is paramount - both for ${name} and everyone around them.`;
    }
    if (intents.includes('separation')) {
      return `${icon} Separation anxiety in ${name} is manageable! ${petKnowledge.behavior.common_issues.separation_anxiety} Start with very short departures and gradually increase the time.`;
    }
    if (intents.includes('vocalization')) {
      return `${icon} ${name}'s barking/vocalization has a reason! ${petKnowledge.behavior.common_issues.excessive_barking} Understanding the 'why' is the first step to helping them.`;
    }
    
    return `${icon} Training ${name} can be such a rewarding experience! ${petKnowledge.behavior.training_principles} Patience and consistency are your best tools. What specific behavior would you like to work on?`;
  }
  
  private getExerciseResponse(intents: string[], userMessage: string, name: string, petType: string, icon: string): string {
    let exerciseAdvice = petKnowledge.exercise.dogs;
    if (petType === 'cat') exerciseAdvice = petKnowledge.exercise.cats;
    if (['rabbit', 'hamster', 'bird', 'fish'].includes(petType)) exerciseAdvice = petKnowledge.exercise.small_pets;
    
    if (intents.includes('enrichment')) {
      return `${icon} Mental stimulation for ${name} is amazing! ${petKnowledge.behavior.enrichment} Puzzle toys and training sessions can be just as tiring as physical exercise!`;
    }
    
    return `${icon} Exercise keeps ${name} healthy and happy! ${exerciseAdvice} What kind of activities does ${name} enjoy most?`;
  }
  
  private getGroomingResponse(intents: string[], userMessage: string, name: string, icon: string): string {
    if (intents.includes('dental')) {
      return `${icon} ${name}'s dental health is super important! ${petKnowledge.grooming.dental_care} Bad breath isn't just unpleasant - it can indicate health issues.`;
    }
    
    return `${icon} Grooming keeps ${name} comfortable and healthy! ${petKnowledge.grooming.frequency} Make it a positive experience with treats and gentle handling. ${petKnowledge.grooming.bathing}`;
  }
  
  private getEmotionalResponse(intents: string[], userMessage: string, name: string, icon: string): string {
    const responses = [
      `${icon} The bond you share with ${name} is so special! Pets enrich our lives in countless ways. What's your favorite memory with ${name}?`,
      `${icon} I can tell you really care about ${name}! That love and attention makes such a difference in their happiness and well-being.`,
      `${icon} ${name} is lucky to have such a caring pet parent! Your dedication to their well-being shows how much you love them.`,
      `${icon} It sounds like ${name} brings so much joy to your life! Pets have an amazing way of making every day brighter.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  private getSpecificAdvice(intents: string[], userMessage: string, name: string, petType: string, icon: string): string {
    if (intents.includes('young_pet')) {
      return `${icon} ${name} is in such an important development stage! Young pets need: frequent feeding, lots of sleep, gentle socialization, basic training, and regular vet checkups. Puppy/kitten-proof your space and be patient - they're learning about the world!`;
    }
    
    if (intents.includes('senior_pet')) {
      return `${icon} Senior pets like ${name} deserve extra love and care! They may need: more comfortable bedding, easier access to food/water, gentler exercise, more frequent vet visits, and patience with age-related changes. Their wisdom and love are precious!`;
    }
    
    return `${icon} Every ${petType} is unique, including ${name}! While breed characteristics can give us insights, individual personality and needs matter most. What specific aspects of ${name}'s care are you curious about?`;
  }
  
  private getGeneralResponse(userMessage: string, name: string, petType: string, icon: string): string {
    // Conversational responses for general chat
    const generalResponses = [
      `${icon} That's interesting! Tell me more about ${name}. How long have you had your ${petType}?`,
      `${icon} I love hearing about ${name}! What's their personality like?`,
      `${icon} ${name} sounds wonderful! What's their favorite activity or toy?`,
      `${icon} It's great that you're thinking about ${name}'s well-being. Is there anything specific you'd like to know about ${petType} care?`,
      `${icon} Every day with ${name} must bring something new! What's been your favorite part of having a ${petType}?`,
      `${icon} I'm here to help with any questions about ${name}! Whether it's health, behavior, nutrition, or just sharing stories - I'm all ears!`
    ];
    
    // Context-aware responses
    if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('hey')) {
      return `${icon} Hello there! It's wonderful to meet you and hear about ${name}! I'm here to help with any questions about ${petType} care or just to chat about your furry friend. How can I help you today?`;
    }
    
    if (userMessage.includes('thank') || userMessage.includes('thanks')) {
      return `${icon} You're so welcome! I'm always happy to help you and ${name}. Feel free to ask me anything anytime - whether it's about care tips, behavior questions, or you just want to share updates about ${name}!`;
    }
    
    if (userMessage.includes('good') || userMessage.includes('great') || userMessage.includes('awesome')) {
      return `${icon} That's fantastic to hear! ${name} is lucky to have such a caring owner. Keep up the great work - your attention to their needs makes all the difference!`;
    }
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }
  
  private getPetIcon(petType: string): string {
    const icons: Record<string, string> = {
      dog: '🐕',
      cat: '🐱',
      bird: '🐦',
      fish: '🐠',
      rabbit: '🐰',
      hamster: '🐹'
    };
    return icons[petType] || '🐕';
  }
  
  // Main method to generate chat completion
  async generateChatCompletion(request: ChatCompletionRequest, petName?: string, petType?: string): Promise<ChatCompletionResponse> {
    const response = this.getContextualResponse(request.messages, petName, petType || 'pet');
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: response
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: request.messages.reduce((acc, msg) => acc + msg.content.length / 4, 0),
        completion_tokens: response.length / 4,
        total_tokens: (request.messages.reduce((acc, msg) => acc + msg.content.length, 0) + response.length) / 4
      }
    };
  }
}

export const mockOpenAI = new MockOpenAIService();