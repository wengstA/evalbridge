"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ProjectSelector } from "@/components/project-selector"
import { Slider } from "@/components/ui/slider"
import { Send, Bot, User, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { useWorkflow } from "@/contexts/workflow-context"

interface TestCase {
  id: string
  tier: "Easy" | "Medium" | "Hard"
  name: string
  rationale: string
  showcases: Array<{
    inputType: string
    description: string
    expectedOutcome: string
  }>
}

interface CapabilityTestPlan {
  id: string
  name: string
  icon: string
  testCases: TestCase[]
}

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

const mockTestPlans: CapabilityTestPlan[] = [
  {
    id: "identity-fidelity",
    name: "Capturing Likeness & Appeal",
    icon: "👤",
    testCases: [
      {
        id: "easy-1",
        tier: "Easy",
        name: "The 'Passport Photo' Set",
        rationale:
          "Baseline, best-case scenario inputs. High-resolution, even lighting, neutral expression. A failure here indicates a catastrophic model collapse.",
        showcases: [
          {
            inputType: "Studio Portrait",
            description: "High-resolution studio portrait with clear lighting.",
            expectedOutcome: "Perfect facial feature mapping and identity preservation.",
          },
          {
            inputType: "Frontal, Neutral",
            description: "Standard ID-style photo, facing forward with a neutral expression.",
            expectedOutcome: "Accurate proportional scaling and baseline identity capture.",
          },
        ],
      },
      {
        id: "medium-1",
        tier: "Medium",
        name: "The 'Social Media' Set",
        rationale:
          "Tests robustness against common real-world variations like off-angle poses, expressions, and minor obstructions.",
        showcases: [
          {
            inputType: "3/4 View",
            description: "User photographed from a three-quarters angle, not front-on.",
            expectedOutcome: "Robust identity maintenance and correct 3D reconstruction from an angle.",
          },
          {
            inputType: "Expression & Glasses",
            description: "User smiling or making an expression while wearing eyeglasses.",
            expectedOutcome: "Model successfully disentangles the expression and accessory from the core identity.",
          },
        ],
      },
      {
        id: "hard-1",
        tier: "Hard",
        name: "The 'Identity Killers' Set",
        rationale:
          "Nightmare-level inputs designed to intentionally break identity-style disentanglement and expose the model's failure modes.",
        showcases: [
          {
            inputType: "Heavy Obstruction",
            description: "User's face significantly covered by a hand, mask, or heavy shadow.",
            expectedOutcome: "Intelligent reconstruction and identity inference from partial features.",
          },
          {
            inputType: "Unique Features",
            description: "Prominent features like scars, face tattoos, or distinct facial structures.",
            expectedOutcome: "Model correctly captures and stylizes unique identifiers instead of smoothing them away.",
          },
          {
            inputType: "Extreme Lighting",
            description: "Harsh side-lighting or top-down lighting that casts deep shadows.",
            expectedOutcome: "Identity preserved despite extreme lighting distortion obscuring features.",
          },
        ],
      },
    ],
  },
  {
    id: "form-language",
    name: "Unified Art Style",
    icon: "🎨",
    testCases: [
      {
        id: "easy-2",
        tier: "Easy",
        name: "The 'T-Shirt' Set",
        rationale: "Simple, clean inputs where the body silhouette is clear and clothing forms are basic.",
        showcases: [
          {
            inputType: "Simple Clothing",
            description: "User wearing a plain t-shirt or tank top with a clear silhouette.",
            expectedOutcome: "Clean conversion to simple, appealing Q-style geometric primitives.",
          },
          {
            inputType: "Simple Hair Volume",
            description: "Input with short, slicked-back, or non-complex hair volumes.",
            expectedOutcome: "Hair is correctly represented as a single, solid, stylized geometric form.",
          },
        ],
      },
      {
        id: "medium-2",
        tier: "Medium",
        name: "The 'Complex Form' Set",
        rationale:
          "Tests the model's ability to artistically simplify more complex real-world geometry like layered clothing and detailed hair.",
        showcases: [
          {
            inputType: "Layered Geometry",
            description: "Input showing layered clothing, such as a jacket over a hoodie or a scarf.",
            expectedOutcome: "Model intelligently simplifies and combines layers into distinct, stylized forms.",
          },
          {
            inputType: "Complex Hair Volume",
            description: "User with complex, curly, long, or voluminous hair.",
            expectedOutcome: "Successful artistic simplification of complex hair into a coherent, stylized shape.",
          },
        ],
      },
      {
        id: "hard-2",
        tier: "Hard",
        name: "The 'Accessory & Fusion' Set",
        rationale:
          "Inputs designed to confuse the model's geometry generation, testing its ability to handle accessories and challenging poses.",
        showcases: [
          {
            inputType: "Large Accessories",
            description: "User wearing large headphones, a wide-brimmed hat, or prominent jewelry.",
            expectedOutcome: "Model correctly identifies accessories and fuses them stylistically to the base model.",
          },
          {
            inputType: "Hand-to-Face Fusion",
            description: "User poses with a hand touching the face or chin (e.g., 'thinker' pose).",
            expectedOutcome: "Model avoids fusing the hand and face geometry, creating two distinct shapes.",
          },
        ],
      },
    ],
  },
  {
    id: "material-expression",
    name: "Material Expression",
    icon: "💎",
    testCases: [
      {
        id: "easy-3",
        tier: "Easy",
        name: "The 'Cloudy Day' Set",
        rationale:
          "Inputs with neutral, diffuse lighting where the model's de-lighting algorithm is not heavily challenged.",
        showcases: [
          {
            inputType: "Diffuse, White Lighting",
            description: "Portrait taken outdoors on an overcast day with flat, even lighting.",
            expectedOutcome: "Accurate Albedo (base color) extraction with no baked-in shadows or highlights.",
          },
        ],
      },
      {
        id: "medium-3",
        tier: "Medium",
        name: "The 'Golden Hour' Set",
        rationale:
          "The essential test for the de-lighting module. The model must be smart enough to recognize that the light is colored, not the user's skin.",
        showcases: [
          {
            inputType: "Strong, Colored Light",
            description: "Photo taken during sunset/sunrise with a strong orange or yellow light cast.",
            expectedOutcome:
              "Model correctly 'de-lights' the photo, neutralizing the colored light to find the true skin/clothing color.",
          },
        ],
      },
      {
        id: "hard-3",
        tier: "Hard",
        name: "The 'Material Killers' Set",
        rationale:
          "Inputs where lighting or the material itself will likely break the PBR generation, causing baked highlights or incorrect color.",
        showcases: [
          {
            inputType: "Extreme Colored Light",
            description: "Photo taken under saturated neon, blue, red, or concert lighting.",
            expectedOutcome: "Successful neutralization of extreme color cast (high risk of failure/color bleed).",
          },
          {
            inputType: "Specular Materials",
            description: "User wearing glasses, shiny jewelry, or metallic items with bright highlights.",
            expectedOutcome:
              "Model recognizes highlight as specularity (material property), not pure white color (Albedo).",
          },
        ],
      },
    ],
  },
  {
    id: "technical-integrity",
    name: "Technical Quality",
    icon: "🔧",
    testCases: [
      {
        id: "easy-4",
        tier: "Easy",
        name: "The 'Solid Bust' Set",
        rationale: "A simple input that should result in a single, continuous, solid mesh.",
        showcases: [
          {
            inputType: "Single, Solid Volume",
            description: "Standard, unobstructed head-and-shoulders bust shot.",
            expectedOutcome: "A single, 'watertight' (non-manifold), continuous mesh suitable for 3D printing.",
          },
        ],
      },
      {
        id: "medium-4",
        tier: "Medium",
        name: "The 'Thin Structures' Set",
        rationale:
          "Tests the robustness of the mesh extraction algorithm when dealing with thin or separate geometric elements.",
        showcases: [
          {
            inputType: "Thin, Separate Geometry",
            description: "User wearing eyeglasses, thin clothing straps, or hoop earrings.",
            expectedOutcome:
              "Model produces stylized geometry with sufficient printable thickness, avoiding zero-volume surfaces.",
          },
        ],
      },
      {
        id: "hard-4",
        tier: "Hard",
        name: "The 'Topology Killers' Set",
        rationale:
          "Inputs designed to produce non-manifold, disjointed, or incomplete meshes due to extreme occlusion or fine details.",
        showcases: [
          {
            inputType: "Extreme Occlusion",
            description: "Long hair completely covering one eye and side of the face.",
            expectedOutcome:
              "Model successfully bridges gaps behind the occlusion, creating a solid mesh without holes.",
          },
          {
            inputType: "Fine, Disconnected Detail",
            description: "Input with individual wispy strands of hair or a very thin chain necklace.",
            expectedOutcome:
              "Model correctly ignores noisy, disconnected geometry and merges it into the main solid form.",
          },
        ],
      },
    ],
  },
]

const renderMarkdown = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    } else if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      )
    }
    return part
  })
}

export default function EvalSetInputSetup() {
  const [testPlans, setTestPlans] = useState<CapabilityTestPlan[]>(mockTestPlans)
  const [activeTab, setActiveTab] = useState(testPlans[0]?.id || "")
  const [sampleSizes, setSampleSizes] = useState<Record<string, Record<string, number>>>({
    "identity-fidelity": { Easy: 5, Medium: 3, Hard: 2 },
    "material-expression": { Easy: 5, Medium: 3, Hard: 2 },
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      type: "assistant",
      content: `Welcome to **Evaluation Set Input Setup**! 🎯

I've generated a comprehensive test strategy for your Q-Figurine Generator evaluation. Here's what we're building:

**Strategic Approach:**
• **3-Tier Difficulty System**: Easy → Medium → Hard test cases
• **Capability-Focused Testing**: Each tab represents a core capability dimension
• **Realistic Input Scenarios**: From studio photos to challenging real-world conditions

**What You'll See:**
• **Test Case Rationale**: Why each difficulty tier matters
• **Input Showcases**: Specific examples with expected outcomes
• **Progressive Complexity**: Building from baseline to edge cases

Click through the capability tabs to review the test cases. Ask me questions about any test scenario, or request adjustments to better match your product requirements.

Ready to dive into the test strategy? 🚀`,
      timestamp: new Date(),
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const router = useRouter()
  const { navigateToStep } = useWorkflow()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [chatInput])

  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    }

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: `I understand you want to discuss: "${chatInput}". 

For test case adjustments, I can help you:
• **Modify difficulty tiers** - Add or remove complexity levels
• **Update input scenarios** - Change the types of test inputs
• **Adjust expected outcomes** - Refine what constitutes success
• **Add new test cases** - Include additional edge cases or scenarios

Which capability dimension would you like to focus on, and what specific changes are you considering?`,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage, assistantMessage])
    setChatInput("")
  }

  const handleBack = () => {
    navigateToStep("eval-planning-overview")
  }

  const handleApproveTestSet = async () => {
    setIsGenerating(true)
    console.log("[v0] Eval set approved, generating evaluation...")
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    navigateToStep("model-evaluation")
    setIsGenerating(false)
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleSampleSizeChange = (capabilityId: string, tier: string, newSize: number) => {
    setSampleSizes((prev) => ({
      ...prev,
      [capabilityId]: {
        ...prev[capabilityId],
        [tier]: Math.max(1, Math.min(10000, newSize)), // Limit between 1-10
      },
    }))
  }

  const handleSampleSizeInputChange = (capabilityId: string, tier: string, value: string) => {
    const numValue = Number.parseInt(value) || 1
    handleSampleSizeChange(capabilityId, tier, numValue)
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-hidden flex flex-col ml-16">
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-slate-900 font-space-grotesk text-2xl">Eval Input Set Up</h1>
              <p className="text-slate-600 mt-1 text-lg">
                Configure test cases and input scenarios for each capability
              </p>
            </div>
            <ProjectSelector />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Interface */}
          <div className="w-96 bg-white border-r border-slate-200 flex flex-col shadow-lg">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 text-lg">Eval Strategy Agent</h2>
                  <p className="text-slate-600 text-sm">Evaluation set planning & optimization</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-900 border border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === "assistant" && <Bot className="h-4 w-4 mt-1 flex-shrink-0 text-slate-600" />}
                      {message.type === "user" && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {renderMarkdown(message.content)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={textareaRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask about test cases, difficulty tiers, or input scenarios..."
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

          {/* Main Canvas */}
          <div className="flex-1 overflow-auto bg-white">
            <div className="max-w-7xl mx-auto px-8 py-8">
              {/* Capability Tabs */}
              <div className="mb-8">
                <div className="border-b border-slate-200">
                  <nav className="-mb-px flex space-x-8">
                    {testPlans.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => setActiveTab(plan.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                          activeTab === plan.id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-lg">{plan.icon}</span>
                        {plan.name}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Active Test Plan Content */}
              {testPlans
                .filter((plan) => plan.id === activeTab)
                .map((plan) => (
                  <div key={plan.id} className="space-y-8">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {plan.icon} {plan.name} Test Cases
                      </h2>
                      <p className="text-slate-600">
                        Progressive difficulty tiers to comprehensively evaluate {plan.name.toLowerCase()} capabilities
                      </p>
                    </div>

                    {/* Test Cases */}
                    <div className="grid gap-8">
                      {plan.testCases.map((testCase) => (
                        <div key={testCase.id} className="bg-white border border-slate-200 rounded-lg shadow-sm">
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(testCase.tier)}`}
                                >
                                  {testCase.tier} Tier
                                </span>
                                <h3 className="text-lg font-semibold text-slate-900">
                                  {testCase.tier} Difficulty Test Cases
                                </h3>
                              </div>

                              <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-slate-700">Sample Size:</label>
                                <div className="flex items-center gap-3">
                                  <Slider
                                    value={[sampleSizes[plan.id]?.[testCase.tier] || 3]}
                                    onValueChange={(value) => handleSampleSizeChange(plan.id, testCase.tier, value[0])}
                                    max={10000}
                                    min={1}
                                    step={1}
                                    className="w-24"
                                  />
                                  <input
                                    type="number"
                                    min="1"
                                    max="10000"
                                    value={sampleSizes[plan.id]?.[testCase.tier] || 3}
                                    onChange={(e) =>
                                      handleSampleSizeInputChange(plan.id, testCase.tier, e.target.value)
                                    }
                                    className="w-16 px-2 py-1 text-center border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="mb-6">
                              <h4 className="font-medium text-slate-900 mb-2">Rationale:</h4>
                              <p className="text-slate-600 leading-relaxed">{testCase.rationale}</p>
                            </div>

                            <div>
                              <h4 className="font-medium text-slate-900 mb-4">Input Showcases:</h4>
                              <div className="grid grid-cols-2 gap-6">
                                {testCase.showcases.map((showcase, index) => (
                                  <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                    <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg mb-3 flex items-center justify-center">
                                      <img
                                        src={`/abstract-geometric-shapes.png?key=hixhb&height=200&width=300&query=${encodeURIComponent(showcase.inputType + " " + showcase.description)}`}
                                        alt={showcase.inputType}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <h5 className="font-semibold text-slate-900 text-sm">{showcase.inputType}</h5>
                                      <p className="text-xs text-slate-600 leading-relaxed">{showcase.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              {/* Action Buttons */}
              <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-200">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Overview
                </button>

                <button
                  onClick={handleApproveTestSet}
                  disabled={isGenerating}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Approve Eval Set & Continue
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
