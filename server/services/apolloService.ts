export class ApolloService {
  private apiKey: string;
  private baseURL = 'https://api.apollo.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Apollo.io API Knowledge Base - Complete Reference
  getAPIKnowledge(): string {
    return `
## Apollo.io API Complete Reference Guide

### Authentication
- API Key required in headers: \`{"Api-Key": "your-api-key"}\`
- Base URL: \`https://api.apollo.io/v1\`

### 1. People Search API (\`/mixed_people/search\`)
**Purpose**: Find and filter prospects with advanced criteria

**Key Parameters**:
- \`person_titles[]\`: Job titles (CEO, VP Sales, Director, etc.)
- \`person_seniorities[]\`: Senior, Executive, Director, VP, C-Level
- \`organization_num_employees_ranges[]\`: 1,10-50,51-200,201-1000,1001-5000,5000+
- \`person_locations[]\`: City, State, Country filtering
- \`organization_industries[]\`: Technology, Healthcare, Finance, etc.
- \`page\`: Pagination (1-based)
- \`per_page\`: Results per page (max 100)

**Example Query**:
\`\`\`json
{
  "person_titles": ["CEO", "CTO", "VP Engineering"],
  "person_seniorities": ["c_level", "vp"],
  "organization_num_employees_ranges": ["51-200", "201-1000"],
  "organization_industries": ["technology"],
  "per_page": 25,
  "page": 1
}
\`\`\`

### 2. Organization Search API (\`/mixed_companies/search\`)
**Purpose**: Target companies for account-based marketing

**Key Parameters**:
- \`organization_num_employees_ranges[]\`: Company size filtering
- \`organization_industries[]\`: Industry targeting
- \`organization_locations[]\`: Geographic filtering
- \`organization_technologies[]\`: Tech stack identification
- \`organization_keywords[]\`: Business model keywords

### 3. Contact Enrichment APIs

**Email Finder** (\`/email_addresses\`):
- Find professional emails for prospects
- \`first_name\`, \`last_name\`, \`domain\` parameters
- Returns verified email addresses

**Person Match** (\`/people/match\`):
- Enrich existing contact data
- Match by email, LinkedIn URL, or name + company
- Returns enhanced profile information

**Person Enrichment** (\`/people/{id}/enrichment\`):
- Get detailed contact information
- Social profiles, employment history
- Contact preferences and engagement data

### 4. Sequence & Automation APIs

**Email Sequences** (\`/email_sequences\`):
- \`GET /email_sequences\`: List all sequences
- \`POST /email_sequences/{id}/add_contact\`: Add contacts to sequence
- \`DELETE /email_sequences/{id}/remove_contact\`: Remove from sequence

**Contact Management** (\`/contacts\`):
- \`GET /contacts\`: Retrieve contact database
- \`POST /contacts\`: Create new contacts
- \`PUT /contacts/{id}\`: Update contact information
- \`DELETE /contacts/{id}\`: Remove contacts

### 5. Data Export APIs

**Bulk Export** (\`/mixed_people/export\`):
- Export large datasets (up to 10,000 records)
- Same filtering as search API
- Returns CSV download link

### 6. Account & CRM Integration

**Accounts API** (\`/accounts\`):
- Manage target account lists
- Track engagement and activities
- Pipeline management integration

**Opportunities** (\`/opportunities\`):
- Sales pipeline tracking
- Deal stage management
- Revenue forecasting

### Advanced Search Strategies

**Boolean Logic**:
- Use exact matching for titles: "VP of Sales"
- Exclude terms with NOT operator
- Combine multiple criteria for precision

**Lead Scoring Framework**:
- **C-Level**: CEO, CTO, CFO, CMO (Score: 90-100)
- **VP Level**: VP Sales, VP Marketing, VP Engineering (Score: 80-90)
- **Director**: Director of Operations, Sales Director (Score: 70-80)
- **Manager**: Sales Manager, Marketing Manager (Score: 60-70)

**Company Size Targeting**:
- **Enterprise**: 1000+ employees (High budget, longer sales cycle)
- **Mid-Market**: 100-999 employees (Good balance of budget and speed)
- **SMB**: 10-99 employees (Fast decisions, lower budget)
- **Startup**: 1-9 employees (High growth potential, budget constraints)

### Integration Best Practices

**Rate Limiting**:
- Respect API rate limits (varies by plan)
- Implement exponential backoff for retries
- Monitor usage through dashboard

**Data Quality**:
- Validate email addresses before outreach
- Check contact freshness (last updated)
- Remove unsubscribed contacts

**Compliance**:
- Follow GDPR/CCPA regulations
- Maintain opt-out lists
- Include unsubscribe options in sequences

### Common Use Cases

**1. Executive Targeting**:
\`\`\`json
{
  "person_seniorities": ["c_level"],
  "organization_num_employees_ranges": ["201-1000", "1001+"],
  "person_locations": ["San Francisco", "New York", "Los Angeles"]
}
\`\`\`

**2. Technology Decision Makers**:
\`\`\`json
{
  "person_titles": ["CTO", "VP Engineering", "Director of Engineering"],
  "organization_technologies": ["React", "Node.js", "AWS"],
  "organization_industries": ["technology"]
}
\`\`\`

**3. Sales Team Targeting**:
\`\`\`json
{
  "person_titles": ["VP Sales", "Sales Director", "Head of Sales"],
  "organization_num_employees_ranges": ["51-200", "201-1000"],
  "person_keywords": ["B2B", "SaaS", "Enterprise"]
}
\`\`\`

This comprehensive knowledge base enables advanced prospecting, lead qualification, and automated outreach campaigns through Apollo.io's powerful APIs.
`;
  }

  // Generate Apollo.io API recommendations based on user query
  generateAPIRecommendation(query: string, context?: any): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('find ceo') || lowerQuery.includes('c-level') || lowerQuery.includes('executives')) {
      return this.generateExecutiveSearch(context);
    }
    
    if (lowerQuery.includes('email') && lowerQuery.includes('find')) {
      return this.generateEmailFinderRecommendation(context);
    }
    
    if (lowerQuery.includes('company') || lowerQuery.includes('organization')) {
      return this.generateCompanySearchRecommendation(context);
    }
    
    if (lowerQuery.includes('export') || lowerQuery.includes('download')) {
      return this.generateDataExportRecommendation(context);
    }
    
    if (lowerQuery.includes('sequence') || lowerQuery.includes('outreach')) {
      return this.generateSequenceRecommendation(context);
    }
    
    return this.generateGeneralRecommendation();
  }

  private generateExecutiveSearch(context?: any): string {
    return `
## 🎯 Apollo.io Executive Search Strategy

### API Endpoint: \`/v1/mixed_people/search\`

**Recommended Query for C-Level Prospects**:
\`\`\`json
{
  "person_seniorities": ["c_level"],
  "person_titles": ["CEO", "CTO", "CFO", "CMO", "COO"],
  "organization_num_employees_ranges": ["201-1000", "1001-5000", "5001+"],
  "organization_industries": ["technology", "software", "financial_services"],
  "per_page": 25,
  "page": 1
}
\`\`\`

### 🔥 High-Value Executive Titles to Target:
- **CEO**: Final decision maker, budget authority
- **CTO**: Technology decisions, innovation strategy  
- **CFO**: Financial oversight, ROI evaluation
- **VP of Sales**: Revenue growth, sales tools adoption
- **Chief Revenue Officer**: Growth strategy, market expansion

### 📊 Lead Scoring for Executives:
- **CEO/Founder**: Score 95-100 (Ultimate Authority)
- **C-Level**: Score 85-94 (High Authority)
- **VP Level**: Score 75-84 (Strong Influence)
- **Director**: Score 65-74 (Department Authority)

### 💼 Company Size Strategy:
- **Enterprise (1000+)**: Longer sales cycles, higher budgets
- **Mid-Market (100-999)**: Balance of speed and budget
- **Growth Stage (50-200)**: Fast decisions, expansion mode

### 🚀 Next Steps:
1. Execute Apollo search with executive filters
2. Enrich contacts with \`/people/match\` API
3. Score leads based on title and company size
4. Create targeted outreach sequences
5. Track engagement and conversion metrics
`;
  }

  private generateEmailFinderRecommendation(context?: any): string {
    return `
## 📧 Apollo.io Email Discovery Strategy

### API Endpoint: \`/v1/email_addresses\`

**Email Finder Parameters**:
\`\`\`json
{
  "first_name": "John",
  "last_name": "Smith", 
  "domain": "company.com"
}
\`\`\`

### 🎯 Email Enrichment Workflow:
1. **Person Match** (\`/people/match\`): Verify contact exists
2. **Email Finder**: Discover professional email addresses  
3. **Email Verification**: Validate deliverability
4. **Contact Creation**: Add to CRM/sequences

### 📈 Best Practices:
- Use company domain from LinkedIn profiles
- Cross-reference with common email patterns
- Verify emails before adding to sequences
- Maintain bounce rate below 3%

### 🔍 Advanced Email Discovery:
- Check multiple domain variations (.com, .io, .co)
- Look for personal vs corporate email preferences
- Identify email patterns: firstname.lastname@domain
- Use social signals for email validation

### ⚡ Bulk Email Discovery:
For multiple contacts, use \`/mixed_people/search\` with email enrichment:
\`\`\`json
{
  "person_titles": ["VP Sales", "Director Marketing"],
  "organization_domains": ["target-company.com"],
  "enrich_contacts": true
}
\`\`\`
`;
  }

  private generateCompanySearchRecommendation(context?: any): string {
    return `
## 🏢 Apollo.io Company Intelligence Strategy

### API Endpoint: \`/v1/mixed_companies/search\`

**Company Research Query**:
\`\`\`json
{
  "organization_num_employees_ranges": ["51-200", "201-1000"],
  "organization_industries": ["technology", "software"],
  "organization_locations": ["San Francisco", "New York"],
  "organization_technologies": ["React", "AWS", "Salesforce"],
  "per_page": 50
}
\`\`\`

### 🎯 Account-Based Marketing Filters:
- **Revenue Range**: Target companies with growth budgets
- **Technology Stack**: Find companies using complementary tools
- **Recent Funding**: Identify companies with expansion capital
- **Employee Growth**: Track rapidly scaling organizations

### 📊 Company Intelligence Metrics:
- **Market Cap**: Public company valuation insights
- **Employee Count**: Organization size and complexity
- **Tech Stack**: Integration and compatibility analysis
- **Industry Trends**: Market positioning and opportunities

### 💡 Strategic Applications:
1. **Competitive Analysis**: Monitor competitor customers
2. **Market Research**: Industry landscape mapping
3. **Partnership Opportunities**: Integration partner identification
4. **Account Prioritization**: Focus on high-value prospects

### 🚀 Company Enrichment Process:
1. Search companies with target criteria
2. Analyze technology stack compatibility
3. Identify key decision-makers within accounts
4. Create personalized account-based campaigns
5. Track account engagement across touchpoints
`;
  }

  private generateDataExportRecommendation(context?: any): string {
    return `
## 📤 Apollo.io Data Export & Integration

### API Endpoint: \`/v1/mixed_people/export\`

**Bulk Export Configuration**:
\`\`\`json
{
  "person_seniorities": ["c_level", "vp", "director"],
  "organization_num_employees_ranges": ["201-1000", "1001+"],
  "per_page": 10000,
  "export_format": "csv"
}
\`\`\`

### 📊 Export Capabilities:
- **Volume**: Up to 10,000 records per export
- **Format**: CSV, JSON, or direct API integration
- **Fields**: Contact info, company data, social profiles
- **Scheduling**: Automated exports via webhooks

### 🔄 Integration Workflows:
1. **CRM Sync**: Direct integration with Salesforce, HubSpot
2. **Marketing Automation**: Export to Pardot, Marketo, Mailchimp
3. **Custom Database**: API integration with proprietary systems
4. **Analytics Platform**: Export to data warehouses

### ⚡ Real-Time Data Pipeline:
\`\`\`javascript
// Webhook endpoint for real-time updates
POST /apollo-webhook
{
  "event": "contact_updated",
  "contact_id": "12345",
  "changes": {
    "email": "new.email@company.com",
    "title": "VP of Engineering"
  }
}
\`\`\`

### 🎯 Export Best Practices:
- Filter data to reduce noise and improve quality
- Schedule regular exports to maintain data freshness
- Implement deduplication logic for clean datasets
- Monitor export quotas and API rate limits
- Validate data integrity after each export
`;
  }

  private generateSequenceRecommendation(context?: any): string {
    return `
## 🚀 Apollo.io Outreach Automation Strategy

### API Endpoints:
- **Sequences**: \`/v1/email_sequences\`
- **Add Contacts**: \`/v1/email_sequences/{id}/add_contact\`
- **Track Performance**: \`/v1/email_sequences/{id}/analytics\`

**Sequence Creation**:
\`\`\`json
{
  "name": "Executive Outreach - Q1 2024",
  "steps": [
    {
      "type": "email",
      "delay_days": 0,
      "template": "executive_intro"
    },
    {
      "type": "email", 
      "delay_days": 3,
      "template": "value_proposition"
    },
    {
      "type": "task",
      "delay_days": 7,
      "template": "linkedin_connect"
    }
  ]
}
\`\`\`

### 📧 Multi-Channel Sequences:
1. **Email**: Personalized messaging with dynamic fields
2. **LinkedIn**: Connection requests and InMail
3. **Phone**: Automated call reminders and scripts
4. **Tasks**: Manual touchpoint triggers

### 🎯 Sequence Optimization:
- **A/B Testing**: Test subject lines, send times, content
- **Personalization**: Use prospect and company data
- **Timing**: Optimize send times by timezone
- **Follow-up**: Automated responses to engagement

### 📊 Performance Analytics:
- **Open Rates**: Email engagement tracking
- **Response Rates**: Conversation initiation metrics
- **Meeting Booked**: Conversion to sales calls
- **Revenue Attribution**: Closed deal tracking

### 🔄 Advanced Automation:
- **Behavioral Triggers**: Respond to prospect actions
- **Lead Scoring Integration**: Prioritize high-value prospects
- **CRM Sync**: Automatic record updates
- **Compliance**: GDPR/CCPA compliant unsubscribe handling
`;
  }

  private generateGeneralRecommendation(): string {
    return `
## 🚀 Apollo.io Complete Integration Guide

### 🎯 Core API Capabilities:

**1. Prospecting & Search**:
- \`/mixed_people/search\`: Find ideal prospects
- \`/mixed_companies/search\`: Target account research
- Advanced filtering by title, company, industry, location

**2. Contact Enrichment**:
- \`/people/match\`: Enhance existing contacts
- \`/email_addresses\`: Professional email discovery
- Social profile and employment history data

**3. Automation & Outreach**:
- \`/email_sequences\`: Multi-step campaign management  
- \`/contacts\`: CRM integration and management
- Behavioral triggers and performance tracking

**4. Data & Analytics**:
- \`/mixed_people/export\`: Bulk data operations
- \`/analytics\`: Campaign performance insights
- Real-time webhook integrations

### 💡 Strategic Use Cases:

**Lead Generation Pipeline**:
1. Search → Enrich → Score → Sequence → Convert

**Account-Based Marketing**:
1. Company Research → Decision-Maker Mapping → Personalized Outreach

**Sales Intelligence**:
1. Competitive Analysis → Market Research → Opportunity Identification

### 🔧 Integration Architecture:
- RESTful API with JSON responses
- OAuth 2.0 authentication
- Webhook support for real-time updates
- Rate limiting and usage monitoring
- SDK availability for popular languages

Ready to implement any specific Apollo.io integration! What's your primary use case?
`;
  }
}

export const apolloService = new ApolloService(process.env.APOLLO_API_KEY || 'demo-key');