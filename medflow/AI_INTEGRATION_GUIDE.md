# MedFlow AI Integration Guide

## 🤖 **AI Implementation Roadmap**

This guide provides step-by-step instructions for integrating OpenAI GPT-4, Claude AI, and other AI services into the MedFlow platform.

## ⚡ **Quick Start: OpenAI GPT-4 Integration**

### **Step 1: Install Dependencies**

```bash
npm install openai @types/openai
```

### **Step 2: Environment Configuration**

```bash
# Add to .env.local
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_OPENAI_ORG_ID=org-your-org-id-here
```

### **Step 3: Update AI Service Implementation**

Replace the placeholder in `src/services/aiService.ts`:

```typescript
import OpenAI from 'openai'

export class AIService {
  private openai: OpenAI
  
  constructor(config: AIConfig) {
    this.config = config
    
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      organization: import.meta.env.VITE_OPENAI_ORG_ID,
      dangerouslyAllowBrowser: true // Only for development
    })
  }

  async analyzeSymptoms(
    symptoms: string,
    patientHistory?: string[],
    currentMedications?: string[]
  ): Promise<SymptomAnalysis> {
    const prompt = `
    Analizează următoarele simptome pentru un pacient român:
    
    Simptome: ${symptoms}
    Istoric medical: ${patientHistory?.join(', ') || 'Necunoscut'}
    Medicație curentă: ${currentMedications?.join(', ') || 'Niciuna'}
    
    Ca asistent medical AI specializat pentru România, furnizează:
    1. Severitatea simptomelor (low/medium/high/urgent)
    2. Recomandări de tratament preliminar în română
    3. Semne de alarmă care necesită atenție imediată
    4. Specialitatea medicală recomandată
    5. Durata estimată a consultației (15/30/45/60 minute)
    
    IMPORTANT: Nu oferi diagnostice definitive. Recomandă întotdeauna consultația cu un medic.
    
    Răspunde în format JSON:
    {
      "severity": "low|medium|high|urgent",
      "confidence": 0.85,
      "recommendations": ["recomandare1", "recomandare2"],
      "redFlags": ["semn_alarma1", "semn_alarma2"],
      "suggestedSpecialty": "Medicina de familie",
      "estimatedAppointmentDuration": 30,
      "followUpRequired": true,
      "aiReasoning": "explicație_detaliată"
    }
    `

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: 'Ești un asistent medical AI specializat pentru sistemul medical românesc. Răspunzi profesional și empatic în română.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })

      const analysis = JSON.parse(response.choices[0].message.content || '{}')
      
      return {
        severity: analysis.severity || 'medium',
        confidence: analysis.confidence || 0.8,
        recommendations: analysis.recommendations || ['Consultați un medic pentru evaluare completă'],
        redFlags: analysis.redFlags || [],
        suggestedSpecialty: analysis.suggestedSpecialty || 'Medicina de familie',
        estimatedAppointmentDuration: analysis.estimatedAppointmentDuration || 30,
        followUpRequired: analysis.followUpRequired || true,
        aiReasoning: analysis.aiReasoning || 'Analiză AI completă'
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      // Fallback to placeholder logic
      return this.fallbackSymptomAnalysis(symptoms)
    }
  }
}
```

## 🧠 **Claude AI Integration**

### **Step 1: Install Anthropic SDK**

```bash
npm install @anthropic-ai/sdk
```

### **Step 2: Environment Setup**

```bash
# Add to .env.local
VITE_CLAUDE_API_KEY=your-claude-api-key-here
```

### **Step 3: Claude Implementation**

```typescript
import Anthropic from '@anthropic-ai/sdk'

export class AIService {
  private claude: Anthropic
  
  constructor(config: AIConfig) {
    this.claude = new Anthropic({
      apiKey: import.meta.env.VITE_CLAUDE_API_KEY
    })
  }

  async processChatbotMessage(
    message: string,
    conversationHistory: any[] = []
  ): Promise<ChatbotResponse> {
    const systemPrompt = `
    Ești un asistent medical virtual pentru MedFlow, specializat în triaj și colectarea
    informațiilor de la pacienți români. Caracteristicile tale:
    
    1. Răspunzi profesional și empatic în română
    2. Colectezi informații medicale relevante prin întrebări clare
    3. Identifici urgențe medicale și îndrepți către 112
    4. Nu oferi diagnostice sau sfaturi medicale specifice
    5. Îndrepți pacienții către consultație cu medicul
    6. Incluzi disclaimer-ul medical obligatoriu
    
    Răspunde în format JSON cu:
    - message: răspunsul tău către pacient
    - intent: tipul de intenție (greeting/symptom_inquiry/appointment_booking/emergency)
    - confidence: încrederea în clasificare (0-1)
    - followUp: întrebări suplimentare dacă este cazul
    - requiresHumanIntervention: true pentru urgențe
    - medicalAdviceDisclaimer: true întotdeauna
    `

    try {
      const response = await this.claude.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          ...conversationHistory.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          {
            role: "user",
            content: `Mesaj pacient: "${message}"\n\nRăspunde în format JSON.`
          }
        ]
      })

      const result = JSON.parse(response.content[0].text)
      
      return {
        message: result.message,
        intent: result.intent,
        confidence: result.confidence,
        followUp: result.followUp,
        requiresHumanIntervention: result.requiresHumanIntervention,
        medicalAdviceDisclaimer: result.medicalAdviceDisclaimer
      }
    } catch (error) {
      console.error('Claude API error:', error)
      return this.fallbackChatbotResponse(message)
    }
  }
}
```

## 📄 **Document Analysis with OpenAI Vision**

### **Document OCR and Analysis**

```typescript
async analyzeDocument(
  fileUrl: string,
  contentType: string
): Promise<MedicalDocumentAnalysis> {
  if (contentType.startsWith('image/')) {
    // Use OpenAI Vision API for medical images
    const response = await this.openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "Ești un specialist în analiza documentelor medicale românești. Analizează imaginea și extrage informațiile relevante."
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analizează acest document medical românesc și extrage: tipul documentului, informații pacient, diagnostice, recomandări, date importante. Răspunde în format JSON." 
            },
            { 
              type: "image_url", 
              image_url: { url: fileUrl } 
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    })

    const analysis = JSON.parse(response.choices[0].message.content || '{}')
    
    return {
      documentType: this.classifyDocumentType(analysis.tip_document),
      confidence: 0.85,
      extractedData: {
        tipDocument: analysis.tip_document,
        informatiiPacient: analysis.informatii_pacient,
        diagnostice: analysis.diagnostice,
        recomandari: analysis.recomandari,
        date: analysis.date_importante
      },
      medicalRelevance: 0.9,
      suggestedActions: analysis.actiuni_sugerate || [],
      flaggedConcerns: analysis.preocupari || []
    }
  } else if (contentType === 'application/pdf') {
    // Extract text from PDF and analyze with Claude
    const documentText = await this.extractPDFText(fileUrl)
    return this.analyzePDFDocument(documentText)
  }
}
```

## 🔮 **Smart Appointment Suggestions**

### **AI-Powered Scheduling Optimization**

```typescript
async suggestAppointmentSlots(
  doctorId: string,
  patientPreferences: any = {},
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
): Promise<AppointmentSuggestion[]> {
  // Get doctor's schedule and preferences
  const doctorSchedule = await this.getDoctorSchedule(doctorId)
  const historicalData = await this.getAppointmentHistory(doctorId)
  
  const prompt = `
  Optimizează programarea pentru doctorul ${doctorId} cu următoarele date:
  
  Program doctor: ${JSON.stringify(doctorSchedule)}
  Preferințe pacient: ${JSON.stringify(patientPreferences)}
  Nivel urgență: ${urgencyLevel}
  Date istorice: ${JSON.stringify(historicalData)}
  
  Analizează și sugerează 5 slot-uri optime ținând cont de:
  1. Urgența cazului medical
  2. Preferințele de oră ale pacientului
  3. Eficiența programului doctorului
  4. Timpul necesar pentru tipul de consultație
  5. Evitarea aglomerației și optimizarea fluxului
  
  Răspunde în format JSON cu array de obiecte:
  {
    "suggestions": [
      {
        "datetime": "2024-01-15T10:00:00Z",
        "confidence": 0.95,
        "reasoning": "explicație_română",
        "duration": 30,
        "priority": "high",
        "conflicts": []
      }
    ]
  }
  `

  try {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: 'Ești un specialist în optimizarea programărilor medicale pentru România. Folosești machine learning pentru a sugera cel mai bun timp.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result.suggestions || []
  } catch (error) {
    console.error('Appointment optimization error:', error)
    return this.fallbackAppointmentSuggestions(doctorId, urgencyLevel)
  }
}
```

## 🔒 **Security Best Practices**

### **API Key Management**

```typescript
// Never expose API keys in frontend code
// Use server-side proxy for sensitive operations
class SecureAIProxy {
  async secureAnalyzeSymptoms(symptoms: string, userId: string): Promise<SymptomAnalysis> {
    // Server-side API call with rate limiting
    const response = await fetch('/api/ai/analyze-symptoms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ symptoms, userId })
    })
    
    return response.json()
  }
}
```

### **Data Privacy for AI**

```typescript
// Sanitize patient data before AI processing
function sanitizeForAI(medicalData: any): any {
  return {
    symptoms: medicalData.symptoms,
    generalAge: medicalData.age > 65 ? 'elderly' : 'adult',
    chronicConditions: medicalData.conditions?.map(c => c.category) // Remove specific details
    // Remove: specific names, addresses, phone numbers, IDs
  }
}
```

## 📊 **Monitoring AI Performance**

### **AI Analytics Dashboard**

```typescript
// Track AI performance metrics
class AIAnalytics {
  async trackSymptomAnalysis(analysis: SymptomAnalysis, userFeedback?: boolean) {
    await analytics.track('ai_symptom_analysis', {
      severity: analysis.severity,
      confidence: analysis.confidence,
      accuracy: userFeedback ? 'accurate' : 'needs_improvement',
      language: 'romanian',
      timestamp: Date.now()
    })
  }

  async trackChatbotInteraction(intent: string, confidence: number, resolved: boolean) {
    await analytics.track('ai_chatbot_interaction', {
      intent,
      confidence,
      resolved,
      language: 'romanian',
      timestamp: Date.now()
    })
  }
}
```

## 🎯 **Testing AI Features**

### **Unit Tests for AI Services**

```typescript
// tests/ai-service.test.ts
describe('AIService', () => {
  test('analyzeSymptoms returns valid medical analysis', async () => {
    const aiService = new AIService(mockConfig)
    const result = await aiService.analyzeSymptoms('durere de cap și febră')
    
    expect(result.severity).toBeOneOf(['low', 'medium', 'high', 'urgent'])
    expect(result.confidence).toBeGreaterThan(0)
    expect(result.recommendations).toBeInstanceOf(Array)
    expect(result.aiReasoning).toContain('AI')
  })

  test('chatbot handles emergency keywords correctly', async () => {
    const aiService = new AIService(mockConfig)
    const result = await aiService.processChatbotMessage('durere acută în piept')
    
    expect(result.intent).toBe('emergency')
    expect(result.requiresHumanIntervention).toBe(true)
    expect(result.message).toContain('urgență')
  })
})
```

## 🚀 **Production Deployment**

### **Environment Configuration**

```bash
# production.env
NODE_ENV=production
VITE_AI_SERVICE_URL=https://ai-api.medflow.care
VITE_OPENAI_API_VERSION=2024-02-15-preview
VITE_CLAUDE_MODEL=claude-3-sonnet-20240229
VITE_AI_RATE_LIMIT=100 # requests per minute
VITE_AI_TIMEOUT=30000 # 30 seconds
```

### **Rate Limiting and Caching**

```typescript
class AIRateLimiter {
  private cache = new Map()
  private rateLimits = new Map()

  async callWithRateLimit(
    userId: string, 
    aiFunction: () => Promise<any>,
    cacheKey?: string
  ): Promise<any> {
    // Check rate limit
    if (this.isRateLimited(userId)) {
      throw new Error('Rate limit exceeded. Please wait before making another request.')
    }

    // Check cache
    if (cacheKey && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    // Execute AI function
    const result = await aiFunction()

    // Cache result
    if (cacheKey) {
      this.cache.set(cacheKey, result)
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000) // 5 min cache
    }

    // Update rate limit
    this.updateRateLimit(userId)

    return result
  }
}
```

## 📋 **AI Integration Checklist**

### **Pre-Integration**
- [ ] Obtain OpenAI API keys and set up billing
- [ ] Configure Claude API access
- [ ] Set up secure environment variables
- [ ] Review Romanian medical terminology
- [ ] Prepare test datasets with Romanian medical scenarios

### **Integration Phase**
- [ ] Replace placeholder functions with live AI calls
- [ ] Implement error handling and fallbacks
- [ ] Add rate limiting and caching
- [ ] Set up monitoring and analytics
- [ ] Test with Romanian medical professionals

### **Post-Integration**
- [ ] Monitor AI performance and accuracy
- [ ] Collect user feedback and improve prompts
- [ ] Optimize response times and costs
- [ ] Plan advanced AI features
- [ ] Ensure GDPR compliance for AI processing

## 🎓 **Training and Fine-tuning**

### **Romanian Medical Dataset Preparation**

```typescript
// Prepare Romanian medical training data
const romanianMedicalData = {
  symptoms: [
    { ro: 'durere de cap', en: 'headache', severity: 'low' },
    { ro: 'durere acută în piept', en: 'acute chest pain', severity: 'urgent' },
    { ro: 'febră înaltă', en: 'high fever', severity: 'medium' }
  ],
  specialties: [
    { ro: 'Medicina de familie', en: 'Family Medicine' },
    { ro: 'Cardiologie', en: 'Cardiology' },
    { ro: 'Neurologie', en: 'Neurology' }
  ]
}
```

## 🔗 **Useful Resources**

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude API Guide](https://docs.anthropic.com/)
- [Romanian Medical Terminology](https://www.cmr.ro/)
- [GDPR AI Guidelines](https://gdpr-info.eu/)
- [Medical AI Best Practices](https://www.who.int/publications/i/item/ethics-and-governance-of-artificial-intelligence-for-health)

---

**Ready to integrate AI and transform medical practice in Romania! 🇷🇴⚕️🤖**
