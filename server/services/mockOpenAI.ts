import { z } from "zod";
import { databaseService } from "./databaseService";
import { InsertPet, InsertPetHealthRecord, InsertPetActivity, InsertPetDocument } from "@shared/schema";

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
  private async getContextualResponse(messages: ChatMessage[], petName: string = '', petType: string = 'pet'): Promise<string> {
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const conversationContext = messages.slice(-5).map(m => m.content).join(' ').toLowerCase();
    
    // Check if user wants to perform database operations
    if (await this.handleDatabaseOperations(lastUserMessage, petName, petType)) {
      return await this.handleDatabaseOperations(lastUserMessage, petName, petType) || this.getStandardResponse(lastUserMessage, conversationContext, petName, petType);
    }
    
    return this.getStandardResponse(lastUserMessage, conversationContext, petName, petType);
  }

  private async handleDatabaseOperations(message: string, petName: string, petType: string): Promise<string | null> {
    try {
      // Create/Register Pet
      if (message.includes('register') || message.includes('create pet') || message.includes('add pet')) {
        const pet = await databaseService.getPetByName(petName);
        if (!pet && petName) {
          const newPet: InsertPet = {
            name: petName,
            type: petType,
            breed: this.extractBreed(message),
            age: this.extractAge(message),
            weight: this.extractWeight(message),
            gender: this.extractGender(message),
            notes: `Pet registered via PawMate AI on ${new Date().toLocaleDateString()}`
          };
          
          const createdPet = await databaseService.createPet(newPet);
          return `🎉 Great! I've successfully registered ${petName} in our database! Here's what I recorded:
          
**Pet Details:**
- Name: ${createdPet.name}
- Type: ${createdPet.type}
- Breed: ${createdPet.breed || 'Not specified'}
- Age: ${createdPet.age || 'Not specified'}
- Weight: ${createdPet.weight || 'Not specified'}
- Gender: ${createdPet.gender || 'Not specified'}

Now I can help track ${petName}'s health records, activities, and provide personalized care advice! Would you like to add any health information or schedule reminders?`;
        } else if (pet) {
          return `${petName} is already registered in our database! I have all their information saved. Would you like me to show you their profile or add any new information?`;
        }
      }

      // Search database
      if (message.includes('search') || message.includes('find') || message.includes('look up')) {
        const searchTerm = this.extractSearchTerm(message);
        if (searchTerm) {
          const results = await databaseService.searchAllTables(searchTerm);
          const totalResults = results.pets.length + results.healthRecords.length + results.activities.length;
          
          if (totalResults > 0) {
            let response = `🔍 Found ${totalResults} results for "${searchTerm}":

`;
            if (results.pets.length > 0) {
              response += `**Pets (${results.pets.length}):**
`;
              results.pets.forEach(pet => {
                response += `- ${pet.name} (${pet.type}${pet.breed ? `, ${pet.breed}` : ''})
`;
              });
              response += `
`;
            }

            if (results.healthRecords.length > 0) {
              response += `**Health Records (${results.healthRecords.length}):**
`;
              results.healthRecords.slice(0, 3).forEach(record => {
                response += `- ${record.title} (${record.date?.toLocaleDateString() || 'No date'})
`;
              });
              response += `
`;
            }

            if (results.activities.length > 0) {
              response += `**Recent Activities (${results.activities.length}):**
`;
              results.activities.slice(0, 3).forEach(activity => {
                response += `- ${activity.activityType} (${activity.date?.toLocaleDateString() || 'No date'})
`;
              });
            }

            return response;
          } else {
            return `No records found for "${searchTerm}". Would you like me to help you add some information to the database?`;
          }
        }
      }

      // Add health record
      if (message.includes('health record') || message.includes('vaccination') || message.includes('vet visit') || message.includes('checkup')) {
        const pet = await databaseService.getPetByName(petName);
        if (pet) {
          const healthRecord: InsertPetHealthRecord = {
            petId: pet.id,
            recordType: this.extractHealthRecordType(message),
            title: this.extractHealthTitle(message),
            description: message,
            date: new Date(),
            aiAnalysis: `AI-generated health record based on user input: "${message}"`
          };
          
          const record = await databaseService.addHealthRecord(healthRecord);
          return `✅ Health record added for ${petName}!

**Record Details:**
- Type: ${record.recordType}
- Title: ${record.title}
- Date: ${record.date.toLocaleDateString()}
- Notes: ${record.description}

I've saved this information and will use it to provide better health advice in the future!`;
        }
      }

      // Log activity
      if (message.includes('walked') || message.includes('played') || message.includes('exercise') || message.includes('activity')) {
        const pet = await databaseService.getPetByName(petName);
        if (pet) {
          const activity: InsertPetActivity = {
            petId: pet.id,
            activityType: this.extractActivityType(message),
            duration: this.extractDuration(message),
            intensity: this.extractIntensity(message),
            notes: message,
            aiRecommendations: this.generateActivityRecommendations(message, petType)
          };
          
          const loggedActivity = await databaseService.logActivity(activity);
          return `🏃 Activity logged for ${petName}!

**Activity Details:**
- Type: ${loggedActivity.activityType}
- Duration: ${loggedActivity.duration ? `${loggedActivity.duration} minutes` : 'Not specified'}
- Intensity: ${loggedActivity.intensity || 'Not specified'}
- Date: ${loggedActivity.date?.toLocaleDateString() || 'Today'}

**AI Recommendations:**
${loggedActivity.aiRecommendations}

Great job keeping ${petName} active! Regular exercise is key to their health and happiness.`;
        }
      }

      // Show pet insights
      if (message.includes('insights') || message.includes('summary') || message.includes('report') || message.includes('analytics')) {
        const pet = await databaseService.getPetByName(petName);
        if (pet) {
          const insights = await databaseService.getPetInsights(pet.id);
          return `📊 Here's ${petName}'s comprehensive health and activity report:

**Interaction Statistics:**
- Total AI conversations: ${insights.totalInteractions}
- Top discussion topics: ${insights.commonTopics.map(t => t.intent).join(', ') || 'None yet'}

**Health Summary:**
- Total health records: ${insights.healthSummary.totalRecords}
- Last checkup: ${insights.healthSummary.lastCheckup?.toLocaleDateString() || 'None recorded'}
- Next vaccination: ${insights.healthSummary.nextVaccination?.toLocaleDateString() || 'None scheduled'}

**Recent Activity:**
- Activities logged in last 7 days: ${insights.recentActivity.length}
${insights.recentActivity.slice(0, 3).map(a => `- ${a.activityType} (${a.date?.toLocaleDateString() || 'No date'})`).join('\n')}

**Upcoming Events:**
${insights.upcomingHealthEvents.length > 0 
  ? insights.upcomingHealthEvents.slice(0, 3).map(e => `- ${e.title} (${e.nextDueDate?.toLocaleDateString()})`).join('\n') 
  : '- No upcoming events scheduled'}

Would you like me to elaborate on any of these areas or help schedule new activities?`;
        }
      }

      // Export data
      if (message.includes('export') || message.includes('backup') || message.includes('download data')) {
        const pet = await databaseService.getPetByName(petName);
        if (pet) {
          const exportData = await databaseService.exportPetData(pet.id);
          return `📋 Complete data export for ${petName}:

**Pet Profile:** ✅ Exported
**Health Records:** ${exportData.healthRecords.length} records
**Activities:** ${exportData.activities.length} activities  
**Documents:** ${exportData.documents.length} documents
**AI Interactions:** ${exportData.interactions.length} conversations

All data has been compiled successfully! This includes:
- Complete pet profile and medical history
- All health records and vaccination schedules
- Activity logs and exercise patterns
- Document uploads and analyses
- Full conversation history with AI insights

Your pet's data is safely stored and easily accessible for veterinarian visits or record keeping.`;
        }
      }

    } catch (error) {
      console.error('Database operation error:', error);
      return `I encountered an issue while accessing the database. Let me provide you with general pet care advice instead, and we can try the database operation again later.`;
    }

    return null;
  }

  // Helper methods for extracting information from messages
  private extractBreed(message: string): string | undefined {
    const breeds = ['labrador', 'golden retriever', 'german shepherd', 'bulldog', 'beagle', 'poodle', 'siamese', 'persian', 'maine coon', 'british shorthair'];
    const found = breeds.find(breed => message.toLowerCase().includes(breed));
    return found;
  }

  private extractAge(message: string): number | undefined {
    const ageMatch = message.match(/(\d+)\s*(year|month|week)/i);
    return ageMatch ? parseInt(ageMatch[1]) : undefined;
  }

  private extractWeight(message: string): string | undefined {
    const weightMatch = message.match(/(\d+(?:\.\d+)?)\s*(kg|lb|pound)/i);
    return weightMatch ? `${weightMatch[1]} ${weightMatch[2]}` : undefined;
  }

  private extractGender(message: string): string | undefined {
    if (message.toLowerCase().includes('male')) return 'male';
    if (message.toLowerCase().includes('female')) return 'female';
    return undefined;
  }

  private extractSearchTerm(message: string): string | undefined {
    const patterns = [
      /search\s+(?:for\s+)?(.+)/i,
      /find\s+(.+)/i,
      /look\s+up\s+(.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) return match[1].trim();
    }
    return undefined;
  }

  private extractHealthRecordType(message: string): string {
    if (message.includes('vaccination') || message.includes('vaccine')) return 'vaccination';
    if (message.includes('checkup') || message.includes('visit')) return 'checkup';
    if (message.includes('medication') || message.includes('medicine')) return 'medication';
    if (message.includes('symptom') || message.includes('sick')) return 'symptom';
    if (message.includes('injury') || message.includes('hurt')) return 'injury';
    return 'general';
  }

  private extractHealthTitle(message: string): string {
    if (message.includes('vaccination')) return 'Vaccination Record';
    if (message.includes('checkup')) return 'Veterinary Checkup';
    if (message.includes('medication')) return 'Medication Record';
    return 'Health Record';
  }

  private extractActivityType(message: string): string {
    if (message.includes('walk')) return 'walk';
    if (message.includes('run')) return 'run';
    if (message.includes('play')) return 'play';
    if (message.includes('swim')) return 'swimming';
    if (message.includes('train')) return 'training';
    if (message.includes('exercise')) return 'exercise';
    return 'activity';
  }

  private extractDuration(message: string): number | undefined {
    const durationMatch = message.match(/(\d+)\s*(minute|min|hour)/i);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      return unit.includes('hour') ? value * 60 : value;
    }
    return undefined;
  }

  private extractIntensity(message: string): string {
    if (message.includes('high') || message.includes('intense') || message.includes('vigorous')) return 'high';
    if (message.includes('medium') || message.includes('moderate')) return 'medium';
    if (message.includes('low') || message.includes('light') || message.includes('gentle')) return 'low';
    return 'medium';
  }

  private generateActivityRecommendations(message: string, petType: string): string {
    const activityType = this.extractActivityType(message);
    
    switch (activityType) {
      case 'walk':
        return `Great choice! Walking is excellent for ${petType}s. Try to maintain a consistent daily schedule and gradually increase distance for better fitness.`;
      case 'play':
        return `Playtime is crucial for mental stimulation! Consider rotating toys and games to keep your ${petType} engaged and prevent boredom.`;
      case 'training':
        return `Training sessions are fantastic for bonding and mental exercise. Keep sessions short (5-10 minutes) and always end on a positive note.`;
      default:
        return `Regular exercise is essential for your ${petType}'s physical and mental health. Try to maintain consistency in timing and duration.`;
    }
  }

  private getStandardResponse(message: string, context: string, petName: string, petType: string): string {
    
    // Advanced intent recognition
    const intents = this.analyzeIntent(message, context);
    
    // Generate personalized response based on intents and context
    return this.generateResponse(intents, message, petName, petType, context);
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
    const response = await this.getContextualResponse(request.messages, petName, petType || 'pet');
    
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
        prompt_tokens: Math.round(request.messages.reduce((acc, msg) => acc + msg.content.length / 4, 0)),
        completion_tokens: Math.round(response.length / 4),
        total_tokens: Math.round((request.messages.reduce((acc, msg) => acc + msg.content.length, 0) + response.length) / 4)
      }
    };
  }
}

export const mockOpenAI = new MockOpenAIService();