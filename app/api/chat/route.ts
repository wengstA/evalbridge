import { NextRequest, NextResponse } from 'next/server'

// Interface for chat messages
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  message: string
  history: ChatMessage[]
  context?: {
    blueprintCards?: any[]
    projectType?: string
  }
}

// For now, we'll create a simple implementation that can be enhanced with Gemini API
export async function POST(req: NextRequest) {
  try {
    const { message, history, context }: ChatRequest = await req.json()

    // System prompt for the evaluation consultant AI
    const systemPrompt = `You are an expert AI evaluation consultant helping product managers create comprehensive evaluation frameworks for AI models. Your expertise includes:

1. Translating user requirements into measurable evaluation criteria
2. Identifying key performance dimensions for AI systems
3. Creating actionable evaluation blueprints
4. Providing specific metrics and test cases

Current context: The user is working on an evaluation system for AI models, specifically focused on creating assessment frameworks.

Guidelines:
- Be specific and actionable in your responses
- Focus on measurable criteria and concrete examples
- Help prioritize evaluation dimensions based on user impact
- Suggest specific metrics, test cases, and success criteria
- Keep responses concise but comprehensive

Previous conversation history is provided for context.`

    // For now, return a structured response based on common evaluation questions
    let response = ""

    // Analyze the user message and provide contextual responses
    if (message.toLowerCase().includes("material") || message.toLowerCase().includes("texture")) {
      response = `**Material Expression & Texture Quality** measures how well the AI model generates realistic material properties and textures. This includes:

**Key Evaluation Metrics:**
• **PBR Map Quality**: Assess albedo, roughness, and normal map generation accuracy
• **Material Classification**: Test ability to distinguish between skin, fabric, metal, etc.
• **De-lighting Performance**: Measure separation of material color from lighting effects

**Specific Test Cases:**
• Input photos with various lighting conditions and measure consistency
• Compare generated materials against reference PBR datasets
• Test edge cases like reflective surfaces and translucent materials

**Success Criteria:**
• Generated textures should be free of baked-in shadows
• Material properties should be physically plausible
• Textures should maintain quality across different lighting conditions

Would you like me to suggest specific evaluation datasets or automated testing approaches for material quality?`
    } else if (message.toLowerCase().includes("identity") || message.toLowerCase().includes("face")) {
      response = `**Identity Fidelity** is crucial for user satisfaction - it measures how recognizably "you" the generated model looks. This is your product's core emotional value proposition.

**Key Evaluation Dimensions:**
• **Facial Feature Accuracy**: Geometric similarity of key landmarks (eyes, nose, mouth proportions)
• **Identity Preservation**: Perceptual similarity across different viewing angles
• **Style-Identity Disentanglement**: Ensuring stylization doesn't compromise recognizability

**Recommended Evaluation Approach:**
• **Quantitative**: Use facial recognition similarity scores (FaceNet, ArcFace embeddings)
• **Qualitative**: Human evaluation studies with identity recognition tasks
• **A/B Testing**: Compare user satisfaction across different identity preservation levels

**Critical Success Metrics:**
• >85% facial recognition accuracy maintained after stylization
• >4.0/5.0 user rating for "looks like me"
• <10% identity confusion rate in blind testing

This dimension should be your highest priority - without identity fidelity, the product loses its core value proposition.`
    } else if (message.toLowerCase().includes("priority") || message.toLowerCase().includes("important")) {
      response = `Based on your Q-Figurine project, here's my recommended priority framework:

**Critical Priority (Must-Have):**
• Identity Fidelity - This IS your product. Without it, you have a generic avatar generator.

**High Priority (Strong Differentiators):**
• Form Language & Stylization - Determines perceived quality and "professional finish"
• Technical Integrity - Basic usability requirement for 3D printing and AR

**Medium Priority (Enhancement Features):**
• Material Expression - Important for premium feel but not core to basic functionality

**Evaluation Resource Allocation:**
• 40% of testing effort on Identity Fidelity
• 30% on Technical Integrity (automated testing)
• 20% on Form Language (human evaluation)
• 10% on Material Expression (automated metrics)

This priority structure ensures you're measuring what actually drives user satisfaction and business value. Would you like me to detail specific evaluation methodologies for any of these dimensions?`
    } else {
      // General response for other questions
      response = `I understand your question about "${message}". 

As your AI evaluation consultant, I can help you with:

• **Defining Success Metrics**: What specific outcomes should we measure?
• **Creating Test Cases**: How can we systematically evaluate performance?
• **Prioritizing Dimensions**: Which evaluation criteria matter most for your users?
• **Implementation Strategy**: How to set up automated and human evaluation pipelines?

Could you be more specific about which aspect of evaluation you'd like to focus on? For example:
- Are you looking to understand a specific evaluation dimension?
- Do you need help prioritizing different quality aspects?
- Are you trying to create specific test cases or metrics?

I'm here to translate your evaluation needs into actionable, measurable frameworks.`
    }

    return NextResponse.json({
      response: response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}