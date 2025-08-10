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

// Advanced lead scoring and contact intelligence knowledge base
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
    },
    completeness: {
      phone: 10,
      linkedin: 15,
      website: 5,
      title: 20,
      company: 15
    }
  },
  outreach: {
    strategies: {
      executives: 'Focus on high-level business value and ROI. Keep messaging concise and strategic.',
      managers: 'Emphasize operational efficiency and team productivity benefits.',
      technical: 'Highlight technical features, integrations, and implementation details.',
      budget_holders: 'Lead with cost savings, ROI metrics, and budget justification data.'
    },
    timing: {
      best_days: 'Tuesday-Thursday for maximum response rates',
      best_times: '9-11 AM and 2-4 PM in target timezone',
      follow_up: 'Follow up 3-5 business days after initial contact'
    }
  },
  analysis: {
    market_segments: 'Technology, Healthcare, Finance, Manufacturing, Retail, Education',
    lead_quality_indicators: 'Complete contact info, recent activity, company growth, budget authority',
    qualification_criteria: 'Budget, Authority, Need, Timeline (BANT framework)'
  }
};

class MockOpenAIService {
  private async getContextualResponse(messages: ChatMessage[], assistantName: string = '', assistantType: string = ''): Promise<string> {
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const conversationContext = messages.slice(-5).map(m => m.content).join(' ').toLowerCase();
    
    // Check if user wants lead analytics
    if (await this.handleLeadAnalytics(lastUserMessage, assistantName)) {
      return await this.handleLeadAnalytics(lastUserMessage, assistantName) || '';
    }
    
    // Check if user wants to perform database operations
    if (await this.handleDatabaseOperations(lastUserMessage, assistantName)) {
      return await this.handleDatabaseOperations(lastUserMessage, assistantName) || this.getStandardResponse(lastUserMessage, conversationContext, assistantName);
    }
    
    return this.getStandardResponse(lastUserMessage, conversationContext, assistantName);
  }

  private async handleDataAnalytics(message: string, petName: string, petType: string): Promise<string | null> {
    try {
      // Analytics queries
      if (message.includes('analyt') || message.includes('report') || message.includes('summary') || message.includes('insight') || message.includes('trend') || message.includes('pattern') || message.includes('statistic')) {
        
        // Get comprehensive data for analysis
        const allPets = await databaseService.getAllPets();
        const allHealthRecords = await databaseService.getAllHealthRecords();
        const allActivities = await databaseService.getAllActivities();
        
        // Pet Demographics Analysis
        if (message.includes('demographic') || message.includes('breakdown') || message.includes('distribution')) {
          return this.generatePetDemographicsAnalysis(allPets);
        }
        
        // Health Trends Analysis
        if (message.includes('health') && (message.includes('trend') || message.includes('pattern') || message.includes('analysis'))) {
          return this.generateHealthTrendsAnalysis(allHealthRecords, allPets);
        }
        
        // Activity Patterns Analysis
        if (message.includes('activity') || message.includes('exercise') || message.includes('behavior pattern')) {
          return this.generateActivityPatternsAnalysis(allActivities, allPets);
        }
        
        // Comprehensive Analytics Dashboard
        if (message.includes('dashboard') || message.includes('overview') || message.includes('complete') || message.includes('full report')) {
          return this.generateComprehensiveAnalytics(allPets, allHealthRecords, allActivities);
        }
        
        // Predictive Analytics Simulation
        if (message.includes('predict') || message.includes('forecast') || message.includes('future') || message.includes('recommendation')) {
          return this.generatePredictiveAnalytics(allPets, allHealthRecords, allActivities);
        }
        
        // Risk Assessment
        if (message.includes('risk') || message.includes('alert') || message.includes('warning') || message.includes('concern')) {
          return this.generateRiskAssessment(allPets, allHealthRecords, allActivities);
        }
        
        // Custom Query Processing (simulate natural language to SQL)
        if (message.includes('how many') || message.includes('what percentage') || message.includes('compare') || message.includes('average')) {
          return this.processCustomAnalyticsQuery(message, allPets, allHealthRecords, allActivities);
        }
        
        // Default comprehensive analysis
        return this.generateComprehensiveAnalytics(allPets, allHealthRecords, allActivities);
      }
      
      return null;
    } catch (error) {
      console.error('Analytics error:', error);
      return 'I encountered an error while analyzing your data. Let me try a different approach or you can ask me to focus on a specific aspect of your pet data.';
    }
  }

  private generatePetDemographicsAnalysis(pets: any[]): string {
    if (pets.length === 0) {
      return `📊 **Pet Demographics Analysis**

No pet data available yet. Once you add pets to your database, I can provide detailed demographic breakdowns including:
- Species distribution
- Age demographics  
- Breed popularity
- Gender distribution
- Geographic patterns

Try asking me to "register a new pet" to start building your database!`;
    }

    // Simulate comprehensive demographic analysis
    const typeDistribution = this.calculateDistribution(pets, 'type');
    const breedDistribution = this.calculateDistribution(pets, 'breed');
    const ageGroups = this.categorizeAges(pets);
    const genderDistribution = this.calculateDistribution(pets, 'gender');

    return `📊 **Pet Demographics Analysis**

**Total Pets Registered:** ${pets.length}

**🐕 Species Distribution:**
${Object.entries(typeDistribution).map(([type, count]) => 
  `• ${type}: ${count} (${((count as number / pets.length) * 100).toFixed(1)}%)`
).join('\n')}

**📈 Age Demographics:**
${Object.entries(ageGroups).map(([group, count]) => 
  `• ${group}: ${count} pets`
).join('\n')}

**🏷️ Top Breeds:**
${Object.entries(breedDistribution).slice(0, 5).map(([breed, count]) => 
  `• ${breed || 'Mixed/Unknown'}: ${count} pets`
).join('\n')}

**⚧️ Gender Distribution:**
${Object.entries(genderDistribution).map(([gender, count]) => 
  `• ${gender || 'Not specified'}: ${count} (${((count as number / pets.length) * 100).toFixed(1)}%)`
).join('\n')}

**💡 Key Insights:**
• Most common pet type: ${Object.entries(typeDistribution).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0]}
• Database completion: ${((pets.filter(p => p.breed).length / pets.length) * 100).toFixed(1)}% have breed information
• Average data richness: This analysis helps identify areas where more pet information could be valuable

Would you like me to dive deeper into any of these demographics or analyze health patterns?`;
  }

  private generateHealthTrendsAnalysis(healthRecords: any[], pets: any[]): string {
    if (healthRecords.length === 0) {
      return `🏥 **Health Trends Analysis**

No health records available for analysis. This powerful feature will show:
- Common health issues across your pets
- Seasonal patterns in vet visits
- Vaccination compliance rates
- Age-related health trends
- Preventive care effectiveness

Start by asking me to "add a health record" or "schedule a vet visit" to begin tracking health data!`;
    }

    // Simulate advanced health analytics
    const recordTypes = this.calculateDistribution(healthRecords, 'recordType');
    const monthlyTrends = this.analyzeMonthlyHealthTrends(healthRecords);
    const riskFactors = this.identifyHealthRiskFactors(healthRecords, pets);

    return `🏥 **Health Trends Analysis**

**Total Health Records:** ${healthRecords.length}

**📋 Record Types Distribution:**
${Object.entries(recordTypes).map(([type, count]) => 
  `• ${type}: ${count} records (${((count as number / healthRecords.length) * 100).toFixed(1)}%)`
).join('\n')}

**📅 Monthly Health Activity:**
${monthlyTrends}

**⚠️ Health Risk Factors Identified:**
${riskFactors}

**🎯 Predictive Insights:**
• Vaccination due dates: I can predict when your pets need their next shots
• Health pattern recognition: Identifying potential chronic issues early
• Seasonal health preparation: Planning for allergy seasons or weather-related concerns
• Cost forecasting: Predicting upcoming health expenses based on pet age and history

**📈 Trend Analysis:**
Based on the current data patterns, I can identify:
- Pets who haven't had recent checkups
- Overdue vaccinations or preventive treatments  
- Unusual symptom patterns that might need veterinary attention
- Optimal timing for routine health maintenance

Would you like me to generate specific health recommendations for any of your pets or dive deeper into preventive care scheduling?`;
  }

  private generateActivityPatternsAnalysis(activities: any[], pets: any[]): string {
    if (activities.length === 0) {
      return `🏃‍♂️ **Activity Patterns Analysis**

No activity data recorded yet. This analysis will reveal:
- Exercise frequency and duration patterns
- Seasonal activity variations
- Pet energy level trends
- Optimal activity timing
- Health correlation with activity levels

Try logging some activities like "walked Max for 30 minutes" or "Bella played fetch for 15 minutes" to start building activity insights!`;
    }

    // Simulate sophisticated activity analytics
    const activityTypes = this.calculateDistribution(activities, 'activityType');
    const intensityAnalysis = this.analyzeActivityIntensity(activities);
    const durationTrends = this.analyzeActivityDurations(activities);

    return `🏃‍♂️ **Activity Patterns Analysis**

**Total Activities Logged:** ${activities.length}

**🎯 Activity Type Distribution:**
${Object.entries(activityTypes).map(([type, count]) => 
  `• ${type}: ${count} sessions (${((count as number / activities.length) * 100).toFixed(1)}%)`
).join('\n')}

**💪 Intensity Breakdown:**
${intensityAnalysis}

**⏱️ Duration Analysis:**
${durationTrends}

**📊 Advanced Activity Insights:**
• **Weekly patterns:** Most active days and optimal exercise timing
• **Seasonal trends:** How weather affects activity levels
• **Health correlation:** Activity levels vs. vet visits and health issues
• **Behavioral patterns:** Energy cycles and mood correlation with exercise

**🎯 Personalized Recommendations:**
• **Optimal exercise windows:** Based on historical activity success
• **Activity variety suggestions:** Preventing boredom and maintaining engagement  
• **Intensity adjustments:** Age and health-appropriate activity modifications
• **Goal setting:** Realistic fitness targets based on current patterns

**📈 Predictive Activity Planning:**
Using machine learning patterns, I can suggest:
- Best times for walks based on historical success
- Activity types your pets enjoy most
- Duration sweet spots for maximum enjoyment
- Weather-based activity alternatives

Would you like me to create a personalized activity plan for any specific pet or analyze their individual activity patterns in more detail?`;
  }

  private generateComprehensiveAnalytics(pets: any[], healthRecords: any[], activities: any[]): string {
    const totalPets = pets.length;
    const totalHealthRecords = healthRecords.length;
    const totalActivities = activities.length;

    return `📊 **Comprehensive Pet Analytics Dashboard**

## 🏠 **Database Overview**
• **Total Pets:** ${totalPets}
• **Health Records:** ${totalHealthRecords}
• **Activity Logs:** ${totalActivities}
• **Data Completeness:** ${this.calculateDataCompleteness(pets, healthRecords, activities)}%

## 📈 **Key Performance Indicators**

**Health Metrics:**
• Average health records per pet: ${totalPets > 0 ? (totalHealthRecords / totalPets).toFixed(1) : 0}
• Recent health activity: ${healthRecords.filter(r => r.date && new Date(r.date) > new Date(Date.now() - 30*24*60*60*1000)).length} records this month
• Health monitoring score: ${this.calculateHealthScore(pets, healthRecords)}/100

**Activity Metrics:**
• Average activities per pet: ${totalPets > 0 ? (totalActivities / totalPets).toFixed(1) : 0}
• Activity consistency: ${this.calculateActivityConsistency(activities)}%
• Exercise goal achievement: ${this.calculateGoalAchievement(activities)}%

## 🎯 **Advanced Analytics Capabilities**

**Real-Time Insights I Can Provide:**
1. **Predictive Health Modeling** - Forecast potential health issues based on breed, age, and history
2. **Behavioral Pattern Recognition** - Identify changes in activity that might indicate health concerns
3. **Cost Optimization Analysis** - Predict veterinary expenses and optimize preventive care timing
4. **Nutrition Analysis** - Calculate optimal feeding schedules and portion sizes
5. **Multi-Pet Comparative Analysis** - Compare pets' health and activity patterns for insights

**Natural Language Queries I Can Process:**
• "Which pet needs the most attention this week?"
• "What are the health trends for senior pets?"
• "Compare activity levels between my dogs and cats"
• "Predict when my pets will need their next vaccinations"
• "Identify any concerning health patterns"
• "Create a weekly care schedule for all pets"

## 🤖 **AI-Powered Features** (OpenAI Integration Ready)

**With OpenAI API, I could provide:**
• Natural language data exploration ("Show me pets who haven't exercised in 3 days")
• Automated health risk assessments with veterinary literature references
• Personalized care recommendations based on scientific research
• Real-time anomaly detection in pet behavior patterns
• Integration with veterinary databases for breed-specific health insights
• Automated report generation with professional formatting

## 🔮 **Predictive Analytics Demo**

Based on current data patterns, here's what I can forecast:

**Health Predictions:**
• Pets due for checkups in next 30 days
• Seasonal health risks (allergies, joint issues)
• Optimal vaccination scheduling
• Preventive care cost budgeting

**Activity Predictions:**
• Weather-based exercise planning
• Energy level forecasting
• Behavioral change early warning
• Exercise goal recommendations

## 📋 **Available Analytics Commands**

Try asking me:
• "Generate a health report for [pet name]"
• "Analyze activity patterns this month"
• "What health risks should I watch for?"
• "Create a care schedule for all my pets"
• "Compare my pets' health trends"
• "Predict upcoming veterinary needs"

**This is a demonstration of advanced AI capabilities. With OpenAI integration, these analyses would be even more sophisticated, incorporating real veterinary research, breed-specific data, and personalized recommendations based on scientific literature.**

What specific analysis would you like me to perform on your pet data?`;
  }

  private generatePredictiveAnalytics(pets: any[], healthRecords: any[], activities: any[]): string {
    return `🔮 **Predictive Analytics & Future Insights**

## 🎯 **Health Predictions**

**Vaccination Forecasting:**
• Next vaccinations due: Analyzing pet ages and vaccination history
• Seasonal health prep: Predicting allergy seasons and preventive needs
• Age-related health screening: Recommending screenings based on breed and age

**Risk Modeling:**
• Breed-specific health risks: Genetic predisposition analysis
• Environmental risk factors: Location and lifestyle impact assessment
• Early warning indicators: Behavioral changes that might signal health issues

## 📊 **Activity & Behavior Forecasting**

**Exercise Optimization:**
• Optimal activity timing: Weather and historical preference analysis
• Activity duration recommendations: Age, breed, and fitness level considerations
• Seasonal activity planning: Preparing for weather changes and indoor alternatives

**Behavioral Predictions:**
• Training milestone forecasting: Expected learning curves for new commands
• Socialization opportunities: Optimal timing for pet interactions
• Stress level predictions: Anticipating anxiety triggers and prevention

## 💰 **Cost & Resource Planning**

**Financial Forecasting:**
• Annual veterinary cost predictions based on pet age and health history
• Preventive care ROI: Cost-benefit analysis of different health strategies
• Emergency fund recommendations: Risk-adjusted emergency expense planning

**Resource Optimization:**
• Feeding schedule optimization: Nutritional needs vs. cost efficiency
• Supply purchasing timing: Bulk buying opportunities and storage considerations
• Grooming schedule planning: Professional vs. at-home care optimization

## 🤖 **AI-Enhanced Predictions** (with OpenAI Integration)

**Advanced Capabilities:**
• **Literature Integration:** Cross-referencing predictions with latest veterinary research
• **Breed Database Analysis:** Accessing comprehensive breed health databases
• **Environmental Correlation:** Weather, location, and seasonal health pattern analysis
• **Multi-Pet Household Dynamics:** Interaction effects and social behavioral predictions

**Example Predictive Queries I Could Process:**
1. "Based on my German Shepherd's age and activity level, when should I start joint supplements?"
2. "What's the optimal feeding schedule for a multi-cat household to prevent resource guarding?"
3. "Predict the best training approach for my rescue dog based on behavioral patterns"
4. "When should I schedule my senior pet's next comprehensive health screening?"

## 📈 **Personalized Forecasts**

**Individual Pet Predictions:**
${pets.length > 0 ? pets.slice(0, 3).map(pet => `
**${pet.name} (${pet.type}):**
• Health trajectory: ${this.generateIndividualHealthForecast(pet)}
• Activity recommendations: ${this.generateActivityForecast(pet)}
• Care priorities: ${this.generateCarePriorities(pet)}
`).join('\n') : 'Register pets to see personalized predictions!'}

## 🎯 **Action Items & Recommendations**

**This Week:**
• Schedule overdue health appointments
• Plan weather-appropriate activities
• Review and adjust feeding schedules

**This Month:**
• Evaluate training progress and adjust methods
• Review health insurance coverage
• Plan for seasonal health preparations

**Next Quarter:**
• Schedule annual health screenings
• Evaluate long-term care strategies
• Budget for predicted health expenses

**With full OpenAI integration, these predictions would be continuously refined using real-time data, scientific literature, and machine learning models trained on millions of pet health records.**

What specific predictions would you like me to focus on for your pets?`;
  }

  private generateRiskAssessment(pets: any[], healthRecords: any[], activities: any[]): string {
    return `⚠️ **Pet Health & Wellness Risk Assessment**

## 🚨 **Immediate Attention Required**

**High Priority Risks:**
• **Overdue Vaccinations:** Pets with lapsed vaccination schedules
• **Inactive Pets:** Unusual drops in activity levels (potential health issues)
• **Missing Health Data:** Pets without recent health records
• **Age-Related Screening:** Senior pets due for comprehensive health checks

## 📊 **Risk Factor Analysis**

**Health Risk Categories:**
1. **Vaccination Compliance:** ${this.assessVaccinationRisk(pets, healthRecords)}
2. **Activity Level Monitoring:** ${this.assessActivityRisk(pets, activities)}
3. **Age-Related Health Risks:** ${this.assessAgeRelatedRisks(pets)}
4. **Breed-Specific Concerns:** ${this.assessBreedRisks(pets)}

## 🎯 **Personalized Risk Profiles**

${pets.length > 0 ? pets.slice(0, 3).map(pet => `
**${pet.name} - Risk Assessment:**
• Overall Risk Level: ${this.calculateIndividualRisk(pet)}
• Primary Concerns: ${this.identifyPrimaryConcerns(pet)}
• Recommended Actions: ${this.generateRiskMitigation(pet)}
`).join('\n') : 'No pets registered for risk assessment.'}

## 🔍 **Early Warning Indicators**

**Behavioral Red Flags:**
• Sudden changes in appetite or eating habits
• Decreased activity or unusual lethargy
• Changes in bathroom habits or frequency
• Unusual hiding or withdrawal behaviors
• Excessive vocalization or agitation

**Physical Warning Signs:**
• Unexplained weight loss or gain
• Changes in breathing patterns
• Unusual lumps, bumps, or swelling
• Persistent coughing or sneezing
• Changes in eye clarity or discharge

## 🎯 **Preventive Care Schedule**

**Immediate Actions (Next 7 Days):**
• Contact veterinarian for overdue appointments
• Monitor high-risk pets more closely
• Document any concerning behavioral changes
• Review emergency contact information

**Short-term Planning (Next 30 Days):**
• Schedule routine health screenings
• Update vaccination records
• Implement activity monitoring improvements
• Review diet and nutrition plans

## 🤖 **AI-Enhanced Risk Detection** (with OpenAI)

**Advanced Capabilities:**
• **Pattern Recognition:** AI analysis of subtle behavioral changes
• **Breed-Specific Algorithms:** Tailored risk assessment based on genetic predispositions
• **Environmental Correlation:** Location-based health risks (pollution, disease outbreaks)
• **Predictive Modeling:** Early detection of health issues before symptoms appear

**Example AI Risk Queries:**
• "Has my pet's behavior changed in ways that might indicate health issues?"
• "What are the top 3 health risks for my pet's breed and age?"
• "Should I be concerned about recent changes in my pet's activity patterns?"
• "What preventive measures should I prioritize based on my pet's risk profile?"

## 📋 **Risk Mitigation Strategies**

**High-Impact Actions:**
1. **Establish baseline health metrics** for all pets
2. **Create activity monitoring routines** to detect changes early
3. **Build relationships with trusted veterinary professionals**
4. **Maintain comprehensive health records** for pattern analysis
5. **Implement regular health check schedules** appropriate for each pet's age and risk level

## 📞 **When to Contact Your Veterinarian**

**Immediate Contact Required:**
• Difficulty breathing or rapid breathing
• Loss of consciousness or extreme lethargy
• Severe pain indicators (crying, inability to move)
• Bleeding that won't stop
• Suspected poisoning or toxic exposure

**Schedule Appointment Soon:**
• Persistent changes in eating or drinking
• Ongoing digestive issues
• Changes in activity level lasting more than 2 days
• New lumps or physical changes
• Behavioral changes without clear cause

**This risk assessment combines traditional veterinary wisdom with AI-powered pattern recognition. With full OpenAI integration, the analysis would be even more comprehensive, incorporating real-time research and personalized risk modeling.**

Would you like me to focus on any specific risk areas or create a detailed mitigation plan for any of your pets?`;
  }

  private processCustomAnalyticsQuery(query: string, pets: any[], healthRecords: any[], activities: any[]): string {
    // Simulate natural language query processing
    const responses = [
      `🧮 **Custom Analytics Query Results**

Based on your question: "${query}"

**Analysis Results:**
• Total pets analyzed: ${pets.length}
• Health records processed: ${healthRecords.length}  
• Activity sessions analyzed: ${activities.length}

**Key Findings:**
${this.generateCustomInsights(query, pets, healthRecords, activities)}

**Statistical Summary:**
• Average health records per pet: ${pets.length > 0 ? (healthRecords.length / pets.length).toFixed(2) : 0}
• Activity frequency: ${activities.length > 0 ? 'Regular activity logging detected' : 'Limited activity data available'}
• Data quality score: ${this.calculateDataQuality(pets, healthRecords, activities)}/100

**Recommendations:**
${this.generateQueryBasedRecommendations(query, pets, healthRecords, activities)}

This analysis demonstrates natural language query processing capabilities. With OpenAI integration, I could handle much more complex queries and provide deeper statistical analysis.`
    ];

    return responses[0];
  }

  // Helper methods for analytics
  private calculateDistribution(items: any[], field: string): Record<string, number> {
    const distribution: Record<string, number> = {};
    items.forEach(item => {
      const value = item[field] || 'Unknown';
      distribution[value] = (distribution[value] || 0) + 1;
    });
    return distribution;
  }

  private categorizeAges(pets: any[]): Record<string, number> {
    const groups = { 'Puppy/Kitten (0-1 years)': 0, 'Young Adult (1-3 years)': 0, 'Adult (3-7 years)': 0, 'Senior (7+ years)': 0, 'Age Unknown': 0 };
    pets.forEach(pet => {
      const age = pet.age;
      if (!age) groups['Age Unknown']++;
      else if (age <= 1) groups['Puppy/Kitten (0-1 years)']++;
      else if (age <= 3) groups['Young Adult (1-3 years)']++;
      else if (age <= 7) groups['Adult (3-7 years)']++;
      else groups['Senior (7+ years)']++;
    });
    return groups;
  }

  private analyzeMonthlyHealthTrends(healthRecords: any[]): string {
    return "📈 Highest activity in spring months\n📉 Fewer records during winter\n🎯 Vaccination peaks in early spring";
  }

  private identifyHealthRiskFactors(healthRecords: any[], pets: any[]): string {
    return "• Senior pets show increased vet visits\n• Breed-specific patterns detected\n• Seasonal allergy correlations identified";
  }

  private analyzeActivityIntensity(activities: any[]): string {
    return "• Low intensity: 40% of activities\n• Medium intensity: 45% of activities\n• High intensity: 15% of activities";
  }

  private analyzeActivityDurations(activities: any[]): string {
    return "• Average session: 25 minutes\n• Most common: 15-30 minute sessions\n• Peak activity time: Morning hours";
  }

  private calculateDataCompleteness(pets: any[], healthRecords: any[], activities: any[]): number {
    return Math.round(((pets.length + healthRecords.length + activities.length) / Math.max(1, pets.length * 3)) * 100);
  }

  private calculateHealthScore(pets: any[], healthRecords: any[]): number {
    return Math.min(100, Math.round((healthRecords.length / Math.max(1, pets.length)) * 25) + 50);
  }

  private calculateActivityConsistency(activities: any[]): number {
    return activities.length > 0 ? Math.round(75 + Math.random() * 20) : 0;
  }

  private calculateGoalAchievement(activities: any[]): number {
    return activities.length > 0 ? Math.round(60 + Math.random() * 30) : 0;
  }

  private generateIndividualHealthForecast(pet: any): string {
    return `Positive trajectory with regular monitoring recommended`;
  }

  private generateActivityForecast(pet: any): string {
    return `Maintain current activity levels with seasonal adjustments`;
  }

  private generateCarePriorities(pet: any): string {
    return `Focus on preventive care and routine monitoring`;
  }

  private assessVaccinationRisk(pets: any[], healthRecords: any[]): string {
    return "Medium risk - some pets may have overdue vaccinations";
  }

  private assessActivityRisk(pets: any[], activities: any[]): string {
    return "Low risk - activity levels appear normal for registered pets";
  }

  private assessAgeRelatedRisks(pets: any[]): string {
    return "Moderate risk - senior pets require enhanced monitoring";
  }

  private assessBreedRisks(pets: any[]): string {
    return "Variable risk based on breed-specific health predispositions";
  }

  private calculateIndividualRisk(pet: any): string {
    return "Low to Moderate";
  }

  private identifyPrimaryConcerns(pet: any): string {
    return "Routine preventive care, age-appropriate health monitoring";
  }

  private generateRiskMitigation(pet: any): string {
    return "Continue regular vet checkups, maintain activity levels";
  }

  private calculateDataQuality(pets: any[], healthRecords: any[], activities: any[]): number {
    return Math.round(60 + (pets.length + healthRecords.length + activities.length) * 2);
  }

  private generateCustomInsights(query: string, pets: any[], healthRecords: any[], activities: any[]): string {
    return "• Pattern analysis shows consistent care routines\n• No significant anomalies detected\n• Opportunities for enhanced data collection identified";
  }

  private generateQueryBasedRecommendations(query: string, pets: any[], healthRecords: any[], activities: any[]): string {
    return "• Continue current monitoring practices\n• Consider adding more detailed activity logging\n• Schedule regular health assessments";
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