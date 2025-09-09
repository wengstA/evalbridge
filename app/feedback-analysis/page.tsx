"use client"

import { useState, useRef, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { ProjectSelector } from "@/components/project-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lightbulb, MessageSquare, BarChart3, RefreshCw, ArrowRight, Info, Send, User, Bot, Trash2, Edit, HelpCircle, Settings, ArrowUpDown } from "lucide-react"
import { useWorkflow } from "@/contexts/workflow-context"
import type { JSX } from "react"

interface ChatMessage {
  id: string
  type: "user" | "agent"
  content: string
  timestamp: Date
}

interface BlueprintExample {
  good: string
  bad: string
}

interface BlueprintCard {
  id: string // Unique machine-readable ID
  priority: "Critical" | "High" | "Medium" | "Low" // Strategic priority
  icon: JSX.Element // UI Emoji Icon
  title: string // The main capability dimension title
  description: string // The objective, user-friendly description (our new 'What')
  userValue: string // The PM-facing rationale (our new 'Why')
  keyTechnicalFactors: string[] // The expert-level Image-to-3D pipeline challenges
  examples: BlueprintExample // The concrete examples to make the dimension tangible
  order: number // The default sort order
}

const templates = [
  {
    id: "ideal-output",
    title: "Ideal Output Definition",
    description: "Define description perfect model outputs should look like for your use case",
    icon: <Lightbulb />,
    prompt: `I need to build an evaluation system for the new feature [Feature Name].

The core scenario is [describe your main use case].

Help me define:
1. What does the ideal output look like?
2. What are the key quality dimensions I should measure?
3. What are the common failure modes I need to prevent?
4. How should I structure my evaluation criteria?

Please provide specific, measurable criteria that I can use to evaluate model performance.`,
  },
  {
    id: "user-feedback",
    title: "User Feedback Analysis",
    description: "Analyze user complaints and feedback to identify improvement areas",
    icon: <MessageSquare />,
    prompt: `I have collected user feedback about [Feature/Product Name] and need help analyzing it to identify technical requirements.

Here's the feedback I've gathered:
[Paste your user feedback, complaints, or support tickets here]

Please help me:
1. Identify the main user pain points and categorize them
2. Translate user complaints into technical requirements
3. Prioritize issues based on user impact and frequency
4. Suggest specific evaluation metrics to track improvements
5. Define acceptance criteria for each identified issue

Focus on actionable insights that can guide product and engineering decisions.`,
  },
  {
    id: "competitor-analysis",
    title: "Competitor Analysis",
    description: "Compare your model performance against competitors and benchmarks",
    icon: <BarChart3 />,
    prompt: `I want to benchmark [Your Product/Feature] against competitors in [Market/Domain].

Key competitors I'm analyzing:
- [Competitor 1]
- [Competitor 2]
- [Competitor 3]

Help me:
1. Define evaluation criteria that matter for competitive positioning
2. Identify key differentiators and performance gaps
3. Set target performance levels based on market standards
4. Create evaluation frameworks for head-to-head comparisons
5. Suggest metrics that highlight our unique value proposition

Focus on measurable criteria that can guide product strategy and positioning.`,
  },
  {
    id: "model-iteration",
    title: "Model Iteration Eval",
    description: "Set up evaluation frameworks for iterative model improvements",
    icon: <RefreshCw />,
    prompt: `I'm working on iterative improvements for [Model/Feature Name] and need to establish evaluation frameworks.

Current model version: [Version/Description]
Key areas for improvement: [List main areas]

Help me design:
1. Regression testing criteria to ensure new versions don't break existing functionality
2. Progressive evaluation metrics to measure incremental improvements
3. A/B testing frameworks for comparing model versions
4. Automated evaluation pipelines for continuous assessment
5. Success criteria for each iteration cycle

Focus on scalable evaluation approaches that can guide iterative development.`,
  },
]

const initialBlueprintCards: BlueprintCard[] = [
  {
    id: "identity-and-appeal",
    priority: "Critical",
    icon: <span className="text-3xl">👤</span>,
    title: "Identity Fidelity & Artistic Appeal",
    description:
      "This capability evaluates the core artistic challenge: accurately capturing and refining the user's core facial features and 'essence' *while* applying the Q-version stylization. This is not just mechanical feature mapping; it requires the skill of a professional caricature artist to amplify the user's recognizable traits in a way that is both aesthetically pleasing and flattering, avoiding an uncanny or generic result.",
    userValue:
      "This defines the product's **Core Emotional Value**. The user demands a unique, 'Q-ified' version of *themselves*, not a generic doll. This capability determines the emotional resonance ('Wow, that's me!') that drives the product's entire value.",
    keyTechnicalFactors: [
      "Deep Facial Feature Extraction (from 2D)",
      "Disentangled Generation (Identity vs. Style)",
      "Aesthetic Appeal Scorer (Anti-Uncanny Valley)",
    ],
    examples: {
      good: "A Q-version figurine that is clearly recognizable as the input photo's person.",
      bad: 'A generic "anime" face that has lost all unique identity of the input person.',
    },
    order: 0,
  },
  {
    id: "form-and-stylization",
    priority: "High",
    icon: <span className="text-3xl">🎨</span>,
    title: "Form Language & Stylization Consistency",
    description:
      "This evaluates the model's aesthetic discipline as a '3D Stylist.' It must strictly adhere to a unified 'Q-version art language' across *every single component*. This includes a strong, readable **Silhouette**, coherent **Form Language** (e.g., rounded, appealing shapes), and correct proportions. Every detail, from hair clumps to simplified clothing folds, must serve the single artistic goal.",
    userValue:
      "This defines the product's **Artistic Integrity**. A stylistically unified work is a 'collectible figurine'; a mismatched work is just a 'model.' The user can intuitively sense which is more 'professional' and complete, which dictates its perceived quality.",
    keyTechnicalFactors: [
      "Global Style Conditioning (Geometry & Texture)",
      "Geometry Simplification & Abstraction",
      "Coherent Shape & Pose Generation",
    ],
    examples: {
      good: 'A model that is clearly stylized as "Q-version" consistently from head to toe.',
      bad: "A model with a cartoon head but hyper-realistic hands and body proportions.",
    },
    order: 1,
  },
  {
    id: "material-expression",
    priority: "Medium",
    icon: <span className="text-3xl">💎</span>,
    title: "Material Expression & Color Decoupling",
    description:
      "This evaluates the model's ability to differentiate and generate *style-appropriate* materials. It must de-light the input photo (decouple lighting from albedo) and generate a full set of PBR maps (Albedo, Roughness, Normals) that fit the figurine aesthetic. **Skin** must look like fine matte paint (with SSS), and **apparel** like textile (with simplified normals).",
    userValue:
      "This dictates the **Perceived Value (Premium Feel)**. Correct material expression is the definitive line between a 'high-end collectible' and a 'cheap plastic toy.' Clean, de-lit materials are also the prerequisite for all downstream uses (like AR or dynamic lighting).",
    keyTechnicalFactors: [
      "Neural Inverse Rendering (PBR Generation)",
      "Albedo Decoupling (De-Lighting)",
      "Stylized Normal Map & SSS Generation",
    ],
    examples: {
      good: "Figurine skin looks soft; a sweater clearly shows a generated normal map texture.",
      bad: 'Figurine skin is shiny and opaque; the sweater texture has source photo shadows "baked" into it.',
    },
    order: 2,
  },
  {
    id: "technical-integrity",
    priority: "Medium",
    icon: <span className="text-3xl">🔧</span>,
    title: "Technical Integrity & Producibility",
    description:
      "This evaluates the model's professionalism as a 'Technical Artist.' The output must be a **technically clean, production-ready asset**. This includes being 'watertight' (manifold, no holes), having efficient topology, and clean, non-overlapping auto-unwrapped UVs. It must be completely free of catastrophic defects like inter-penetration (clipping) or 'floaters'.",
    userValue:
      "This is the **Professional Baseline and Usability Prerequisite**. Users (and the business) require a file that is not 'broken.' A clean mesh is the foundation for all subsequent applications: 3D printing, AR viewing, or import into a game engine.",
    keyTechnicalFactors: [
      "High-Quality Mesh Extraction (from Implicit Field)",
      "Automated UV Unwrapping (Low-Distortion)",
      "Geometry Pruning & Artifact Removal",
    ],
    examples: {
      good: "A clean 3D model where hair rests perfectly on shoulders; all seams are invisible.",
      bad: "A model where hair clips directly through the torso and texture seams are visible on the face.",
    },
    order: 3,
  },
]

const renderMarkdown = (text: string) => {
  // First handle bold text (**text**)
  const parts = text.split(/(\*\*.*?\*\*)/g)
  const result: (string | JSX.Element)[] = []

  parts.forEach((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2)
      result.push(
        <strong key={`bold-${index}`} className="font-semibold">
          {boldText}
        </strong>,
      )
    } else {
      // Now handle italic text (*text*) in the remaining parts
      const italicParts = part.split(/(\*[^*]+?\*)/g)
      italicParts.forEach((italicPart, italicIndex) => {
        if (italicPart.startsWith("*") && italicPart.endsWith("*") && !italicPart.startsWith("**")) {
          const italicText = italicPart.slice(1, -1)
          result.push(
            <em key={`italic-${index}-${italicIndex}`} className="italic">
              {italicText}
            </em>,
          )
        } else if (italicPart) {
          result.push(italicPart)
        }
      })
    }
  })

  return result
}

export default function RequirementsAnalysis() {
  const { navigateToStep } = useWorkflow()
  const [inputText, setInputText] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [showBlueprint, setShowBlueprint] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [blueprintCards, setBlueprintCards] = useState<BlueprintCard[]>(initialBlueprintCards)
  const [selectedExperts, setSelectedExperts] = useState<string[]>(['3d_graphics', 'ai_researcher', 'user_experience'])
  const [availableExperts, setAvailableExperts] = useState<any>({})
  const [expertsLoaded, setExpertsLoaded] = useState(false)
  const [showExpertSelector, setShowExpertSelector] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  // Remove automatic initial message to match eval-planning page behavior

  // Load available experts
  useEffect(() => {
    const loadExperts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/experts')
        if (response.ok) {
          const data = await response.json()
          setAvailableExperts(data.experts)
          setSelectedExperts(data.default_selection)
          setExpertsLoaded(true)
        }
      } catch (error) {
        console.error('Failed to load experts:', error)
        setExpertsLoaded(true)
      }
    }
    loadExperts()
  }, [])

  // Auto-resize chat input
  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto'
      chatInputRef.current.style.height = Math.min(chatInputRef.current.scrollHeight, 150) + 'px'
    }
  }, [chatInput])

  const handleTemplateClick = (template: (typeof templates)[0]) => {
    setInputText(template.prompt)
    setSelectedTemplate(template.id)
    // Focus the textarea after setting the text
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  const handleContinue = () => {
    if (inputText.trim()) {
      setShowBlueprint(true)
    }
  }

  const handleSendMessage = async () => {
    if (chatInput.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "user",
        content: chatInput,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, newMessage])
      const currentInput = chatInput
      setChatInput("")

      try {
        // Call the backend API
        const response = await fetch('http://localhost:8080/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: currentInput,
            history: chatMessages.map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            context: {
              selected_experts: selectedExperts,
              expert_profiles: selectedExperts.map(id => availableExperts[id]).filter(Boolean),
              project: 'AI Model Evaluation',
              evaluationDimensions: blueprintCards.map(card => ({
                title: card.title,
                priority: card.priority,
                description: card.description
              })),
              availableActions: ['add', 'modify', 'delete', 'reprioritize'],
              modificationInstructions: 'Use expert-specific structured formats based on your selected specialist perspectives.'
            }
          })
        })

        if (response.ok) {
          const data = await response.json()
          
          // Parse AI response for capability modification suggestions
          await parseAndExecuteCapabilityActions(data.response)
          
          const agentResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: "agent",
            content: data.response,
            timestamp: new Date(),
          }
          setChatMessages((prev) => [...prev, agentResponse])
        } else {
          throw new Error('Failed to get response from backend')
        }
      } catch (error) {
        console.error('Chat error:', error)
        const errorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "agent",
          content: `I apologize, but I'm having trouble connecting to the evaluation consultant service. This might be a temporary issue. Please try again in a moment.`,
          timestamp: new Date(),
        }
        setChatMessages((prev) => [...prev, errorResponse])
      }
    }
  }

  const handleCardAskAgent = (card: BlueprintCard) => {
    setChatInput(`What exactly does '${card.title}' measure?`)
    chatInputRef.current?.focus()
  }

  // Template functions for quick actions
  const chatTemplates = [
    {
      id: 'explain',
      label: 'Explain All',
      icon: <HelpCircle className="h-3 w-3" />,
      template: 'Can you explain in detail what each capability dimension measures and why it matters for our Q-Figurine evaluation framework? Include specific metrics I should track for each.'
    },
    {
      id: 'adjust',
      label: 'Suggest Changes',
      icon: <Settings className="h-3 w-3" />,
      template: 'Review my current evaluation capabilities and suggest specific improvements. Use structured format: "I recommend ADDING...", "Consider MODIFYING...", "You might DELETE..." to suggest changes.'
    },
    {
      id: 'prioritize',
      label: 'Re-prioritize',
      icon: <ArrowUpDown className="h-3 w-3" />,
      template: 'Help me REPRIORITIZE these capabilities based on user impact and business value. Use the format "Let me REPRIORITIZE these based on your feedback:" and suggest which ones should be High, Medium, or Low priority with explanations.'
    },
    {
      id: 'missing',
      label: 'Find Missing',
      icon: <Lightbulb className="h-3 w-3" />,
      template: 'What important evaluation capabilities am I missing? Use structured format "I recommend ADDING a new capability: [Name] because [reason]" to suggest additional dimensions for comprehensive AI model evaluation.'
    }
  ]

  const handleChatTemplateClick = (template: typeof chatTemplates[0]) => {
    setChatInput(template.template)
    chatInputRef.current?.focus()
  }

  const handleCardClick = (card: BlueprintCard) => {
    const contextMessage = `I'd like to discuss the "${card.title}" capability in detail. This capability is currently set to ${card.priority} priority.

What it measures: ${card.description}

Why it matters: ${card.userValue}

Can you help me understand this dimension better and suggest specific evaluation metrics or improvements?`

    // Populate the chat input with the card context
    setChatInput(contextMessage)
    // Focus the chat input
    chatInputRef.current?.focus()
  }

  const characterCount = inputText.length
  const maxCharacters = 2000

  const handlePriorityChange = (cardId: string, newPriority: "High" | "Medium" | "Low") => {
    setBlueprintCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, priority: newPriority } : card)))
  }

  const getPriorityColor = (priority: "High" | "Medium" | "Low") => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  // Capability modification functions
  const addCapability = async (capabilityData: Omit<BlueprintCard, "id" | "order">) => {
    try {
      const response = await fetch('http://localhost:8080/api/capabilities/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          capability_data: capabilityData
        })
      });
      
      if (response.ok) {
        const newCard: BlueprintCard = {
          ...capabilityData,
          id: `capability-${Date.now()}`,
          order: blueprintCards.length
        };
        setBlueprintCards(prev => [...prev, newCard]);
        return { success: true, message: 'Capability added successfully' };
      }
    } catch (error) {
      console.error('Add capability error:', error);
    }
    return { success: false, message: 'Failed to add capability' };
  };

  const modifyCapability = async (cardId: string, updates: Partial<BlueprintCard>) => {
    try {
      const response = await fetch('http://localhost:8080/api/capabilities/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'modify',
          capability_id: cardId,
          capability_data: updates
        })
      });
      
      if (response.ok) {
        setBlueprintCards(prev => 
          prev.map(card => card.id === cardId ? { ...card, ...updates } : card)
        );
        return { success: true, message: 'Capability modified successfully' };
      }
    } catch (error) {
      console.error('Modify capability error:', error);
    }
    return { success: false, message: 'Failed to modify capability' };
  };

  const deleteCapability = async (cardId: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/capabilities/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          capability_id: cardId
        })
      });
      
      if (response.ok) {
        setBlueprintCards(prev => prev.filter(card => card.id !== cardId));
        return { success: true, message: 'Capability deleted successfully' };
      }
    } catch (error) {
      console.error('Delete capability error:', error);
    }
    return { success: false, message: 'Failed to delete capability' };
  };

  // Parse AI response for capability modification actions
  const parseAndExecuteCapabilityActions = async (responseText: string) => {
    try {
      // Look for structured modification suggestions from AI
      
      // ADD capability pattern: "I recommend ADDING a new capability: [Name]"
      const addMatch = responseText.match(/I recommend ADDING a new capability:\s*([^\n]+)/i);
      if (addMatch) {
        console.log('AI suggests adding capability:', addMatch[1]);
        // For now, just log - in a full implementation, this would parse more details
      }
      
      // MODIFY capability pattern: "Consider MODIFYING [capability] by [change]"
      const modifyMatch = responseText.match(/Consider MODIFYING\s+([^by]+)\s+by\s+([^\n]+)/i);
      if (modifyMatch) {
        console.log('AI suggests modifying capability:', modifyMatch[1], 'with change:', modifyMatch[2]);
      }
      
      // DELETE capability pattern: "You might DELETE [capability]"
      const deleteMatch = responseText.match(/You might DELETE\s+([^\n]+)/i);
      if (deleteMatch) {
        console.log('AI suggests deleting capability:', deleteMatch[1]);
      }
      
      // REPRIORITIZE pattern: "Let me REPRIORITIZE these"
      const reprioritizeMatch = responseText.match(/Let me REPRIORITIZE these/i);
      if (reprioritizeMatch) {
        console.log('AI suggests reprioritizing capabilities');
      }
      
    } catch (error) {
      console.error('Error parsing capability actions:', error);
    }
  };

  const handleConfirmBlueprint = () => {
    console.log("[v0] Confirming blueprint and navigating to next step")
    navigateToStep("eval-planning")
  }

  if (showBlueprint) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />

        <main className="flex-1 overflow-hidden flex flex-col ml-16">
          <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-slate-900 font-space-grotesk text-2xl">Requirements Analysis</h1>
                <p className="text-slate-600 mt-1 text-lg">
                  Define evaluation criteria and success metrics for your AI model
                </p>
              </div>
              <ProjectSelector />
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-96 bg-white border-r border-slate-200 flex flex-col shadow-lg">
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900 text-lg">Multi-Expert Consultant</h2>
                    <p className="text-slate-600 text-sm">{selectedExperts.length} specialists • Collaborative analysis</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExpertSelector(!showExpertSelector)}
                    className="text-xs h-7 px-2"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Select Experts
                  </Button>
                </div>

                {/* Expert Selection Panel */}
                {showExpertSelector && expertsLoaded && (
                  <div className="mb-4 p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-xs font-medium text-slate-700 mb-2">Choose Your Expert Panel:</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(availableExperts).map(([expertId, expert]: [string, any]) => (
                        <label key={expertId} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedExperts.includes(expertId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExperts(prev => [...prev, expertId])
                              } else {
                                setSelectedExperts(prev => prev.filter(id => id !== expertId))
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{expert.emoji}</span>
                          <div className="flex-1">
                            <div className="font-medium">{expert.title}</div>
                            <div className="text-slate-500 text-xs truncate">{expert.technical_focus.split(',')[0]}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Current Expert Panel */}
                {expertsLoaded && (
                  <div className="text-xs space-y-1">
                    <div className="font-medium text-slate-700 mb-1">Active Experts:</div>
                    {selectedExperts.map(expertId => {
                      const expert = availableExperts[expertId]
                      return expert ? (
                        <div key={expertId} className="flex items-center gap-2">
                          <span>{expert.emoji}</span>
                          <span className="text-slate-600 truncate">{expert.title}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-slate-500 mt-8">
                    <div className="p-6 bg-white rounded-xl mb-6 border border-slate-200 shadow-sm">
                      <Bot className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                      <h3 className="font-semibold text-slate-800 mb-3">Welcome to Multi-Expert Consultant!</h3>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">
                        I'm ready to help you analyze capabilities and build evaluation frameworks with multiple specialist perspectives. Click capability cards or use quick actions to start.
                      </p>
                      <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        💡 Try: "What capabilities should I focus on?" or click any card below
                      </div>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                          message.type === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-900 border border-slate-200"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.type === "agent" && <Bot className="h-4 w-4 mt-1 flex-shrink-0 text-slate-600" />}
                          {message.type === "user" && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                          <div className="text-sm whitespace-pre-wrap leading-relaxed">
                            {renderMarkdown(message.content)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-slate-200 bg-white">
                {/* Template buttons */}
                <div className="mb-3">
                  <p className="text-xs text-slate-600 mb-2 font-medium">Quick Actions:</p>
                  <div className="flex gap-2 flex-wrap">
                    {chatTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleChatTemplateClick(template)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium"
                      >
                        {template.icon}
                        <span className="ml-1">{template.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Ask about evaluation dimensions, suggest improvements..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
                    rows={1}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-white">
              <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        AI Model Evaluation Blueprint
                      </h2>
                      <p className="text-slate-600">
                        Multi-expert analysis with {selectedExperts.length} specialists
                        {selectedExperts.length > 0 && (
                          <span className="ml-2">
                            {selectedExperts.slice(0, 3).map(id => availableExperts[id]?.emoji).join(' ')}
                            {selectedExperts.length > 3 && ` +${selectedExperts.length - 3} more`}
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setChatInput("I want to add a new capability to my evaluation framework. Can you help me identify what's missing and suggest a new capability dimension?");
                        chatInputRef.current?.focus();
                      }}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      + Add New Capability
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {blueprintCards
                      .sort((a, b) => {
                        const priorityOrder = { High: 0, Medium: 1, Low: 2 }
                        return priorityOrder[a.priority] - priorityOrder[b.priority]
                      })
                      .map((card) => (
                        <Card
                          key={card.id}
                          className="border border-slate-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-lg bg-white cursor-pointer group"
                          onClick={() => handleCardClick(card)}
                        >
                          <CardContent className="p-6 space-y-6 bg-gray-50 px-[54px] py-0">
                            <div className="space-y-6">
                              <div className="flex items-start justify-between pt-6">
                                <div className="flex items-center gap-4">
                                  {card.icon}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="text-xl font-semibold text-slate-900 mb-1">{card.title}</h3>
                                      <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        💬 Click to discuss
                                      </span>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={`font-semibold ${getPriorityColor(card.priority)}`}
                                    >
                                      {card.priority} Priority
                                    </Badge>
                                  </div>
                                </div>

                                <div onClick={(e) => e.stopPropagation()}>
                                  <Select
                                    value={card.priority}
                                    onValueChange={(value: "High" | "Medium" | "Low") =>
                                      handlePriorityChange(card.id, value)
                                    }
                                  >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                  </SelectContent>
                                </Select>
                                </div>
                              </div>

                              <div className="space-y-6 bg-white rounded-lg p-6 border border-slate-200">
                                <div>
                                  <h4 className="font-semibold text-slate-900 mb-3 text-lg">Description</h4>
                                  <div className="text-slate-700 leading-relaxed">
                                    {renderMarkdown(card.description)}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-slate-900 mb-3 text-lg">User Value</h4>
                                  <div className="text-slate-700 leading-relaxed">{renderMarkdown(card.userValue)}</div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-slate-900 mb-3 text-lg">
                                    Key Technical Factors (Image-to-3D)
                                  </h4>
                                  <div className="space-y-3">
                                    {card.id === "identity-and-appeal" && (
                                      <>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                          <p className="font-medium text-slate-800 mb-1">
                                            Identity-Conditioned 3D Lifting:
                                          </p>
                                          <p className="text-slate-600 text-sm">
                                            Ability to lift 2D facial identity features (from the photo) into the 3D
                                            implicit representation.
                                          </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                          <p className="font-medium text-slate-800 mb-1">
                                            Disentangled Style & Identity:
                                          </p>
                                          <p className="text-slate-600 text-sm">
                                            Ensuring the "Q-version" style prompt only affects the style and not the
                                            core facial structure.
                                          </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                          <p className="font-medium text-slate-800 mb-1">
                                            Geometric Facial Feature Generation:
                                          </p>
                                          <p className="text-slate-600 text-sm">
                                            Accuracy of the generated 3D mesh (e.g., nose shape, eye sockets) relative
                                            to the source identity.
                                          </p>
                                        </div>
                                      </>
                                    )}
                                    {card.id === "form-and-stylization" && (
                                      <>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                          <p className="font-medium text-slate-800 mb-1">
                                            Global Style Conditioning (Geometry & Texture):
                                          </p>
                                          <p className="text-slate-600 text-sm">
                                            Ensuring the entire 3D generation process adheres to the "Q-version" art
                                            language.
                                          </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                          <p className="font-medium text-slate-800 mb-1">
                                            Geometry Simplification & Abstraction:
                                          </p>
                                          <p className="text-slate-600 text-sm">
                                            Generating simplified and appealing shapes for the model.
                                          </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                          <p className="font-medium text-slate-800 mb-1">
                                            Coherent Shape & Pose Generation:
                                          </p>
                                          <p className="text-slate-600 text-sm">
                                            Ensuring all components of the model have correct proportions and pose.
                                          </p>
                                        </div>
                                      </>
                                    )}
                                    {card.id === "material-expression" && (
                                      <>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                          <p className="font-medium text-slate-800 mb-1">
                                            Neural Material Decomposition:
                                          </p>
                                          <p className="text-slate-600 text-sm">
                                            Generating separate PBR maps (Albedo, Roughness, Normals) for the model.
                                          </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                          <p className="font-medium text-slate-800 mb-1">
                                            Albedo Decoupling (Inverse Rendering):
                                          </p>
                                          <p className="text-slate-600 text-sm">
                                            Separating the true material color from any shadows or highlights present in
                                            the 2D source photo.
                                          </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                          <p className="font-medium text-slate-800 mb-1">
                                            SSS & Translucency Generation:
                                          </p>
                                          <p className="text-slate-600 text-sm">
                                            Generating data required for renderers to simulate light passing through
                                            skin.
                                          </p>
                                        </div>
                                      </>
                                    )}
                                    {card.id === "technical-integrity" && (
                                      <>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                          <p className="font-medium text-slate-800 mb-1">Implicit Field Coherency:</p>
                                          <p className="text-slate-600 text-sm">
                                            Ensuring the underlying neural field is quality and stable, with no
                                            "floaters" or noisy artifacts in 3D space.
                                          </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                          <p className="font-medium text-slate-800 mb-1">Mesh Extraction Quality:</p>
                                          <p className="text-slate-600 text-sm">
                                            Ensuring the algorithm that converts the implicit field into an explicit
                                            polygon mesh is of high fidelity.
                                          </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                          <p className="font-medium text-slate-800 mb-1">
                                            Automated UV Unwrapping & Texturing:
                                          </p>
                                          <p className="text-slate-600 text-sm">
                                            Ensuring the automated process that applies the generated texture map
                                            without visible seams.
                                          </p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-slate-900 mb-3 text-lg">Visual Examples</h4>
                                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                    <table className="w-full">
                                      <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-700 w-1/2">
                                            👍 GOOD EXAMPLE
                                          </th>
                                          <th className="text-left px-4 py-3 text-sm font-medium text-slate-700 w-1/2">
                                            👎 BAD EXAMPLE
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr className="border-b border-slate-100">
                                          <td className="px-4 py-3 text-sm text-slate-600">{card.examples.good}</td>
                                          <td className="px-4 py-3 text-sm text-slate-600">{card.examples.bad}</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-slate-200" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCardAskAgent(card)}
                                      className="text-slate-600 hover:text-slate-800"
                                    >
                                      💬 Ask Agent
                                    </Button>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setChatInput(`I want to modify the "${card.title}" capability. Can you help me improve it?`);
                                        chatInputRef.current?.focus();
                                      }}
                                      className="text-slate-500 hover:text-blue-600 p-1 h-8 w-8"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (confirm(`Are you sure you want to delete "${card.title}"?`)) {
                                          const result = await deleteCapability(card.id);
                                          if (result.success) {
                                            const successMessage: ChatMessage = {
                                              id: Date.now().toString(),
                                              type: "agent",
                                              content: `Successfully deleted the "${card.title}" capability from your evaluation blueprint.`,
                                              timestamp: new Date(),
                                            };
                                            setChatMessages((prev) => [...prev, successMessage]);
                                          }
                                        }
                                      }}
                                      className="text-slate-500 hover:text-red-600 p-1 h-8 w-8"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  <div className="flex justify-end pt-8 border-t border-slate-200 mt-8">
                    <Button
                      onClick={handleConfirmBlueprint}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    >
                      Confirm Blueprint <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Original template selection interface
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-hidden flex flex-col ml-16">
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-slate-900 font-space-grotesk text-2xl">Requirements Analysis</h1>
              <p className="text-slate-600 mt-1 text-lg">
                Define evaluation criteria and success metrics for your AI model
              </p>
            </div>
            <ProjectSelector />
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-2">
                What do you want to evaluate from your model?
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Describe your evaluation goals and we'll help you design the perfect assessment framework with
                AI-powered insights
              </p>
            </div>

            {/* Main Input Section */}
            <Card className="mb-8 shadow-lg border-2 border-slate-200">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <Textarea
                    ref={textareaRef}
                    placeholder="I want to evaluate a new feature for [Product Name]. The feature is [describe the feature]. I need to understand if users would find this valuable, how they would use it, and description concerns they might have..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={8}
                    className="resize-none text-base leading-relaxed border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    maxLength={maxCharacters}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {selectedTemplate && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {templates.find((t) => t.id === selectedTemplate)?.title}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500">
                        {characterCount} / {maxCharacters} characters
                      </span>
                      <Button
                        onClick={handleContinue}
                        disabled={!inputText.trim()}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                      >
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Selection */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">Or choose from a template</h3>
                <p className="text-slate-600">Get started quickly with pre-built evaluation frameworks</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => {
                  return (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 ${
                        selectedTemplate === template.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => handleTemplateClick(template)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-lg ${
                              selectedTemplate === template.id ? "bg-blue-200" : "bg-slate-100"
                            }`}
                          >
                            {template.icon}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-slate-900 mb-2">
                              {template.title}
                            </CardTitle>
                            <CardDescription className="text-slate-600 leading-relaxed">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Pro Tip */}
            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Pro tip:</h4>
                  <p className="text-blue-800 leading-relaxed">
                    Be specific about what you want to evaluate. The more detailed your evaluation goals, the better
                    assessment framework we can generate. Include your target users, success criteria, and any specific
                    concerns you want to address.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
