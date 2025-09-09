"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ProjectSelector } from "@/components/project-selector"
import { Send, Bot, User } from "lucide-react"

/**
 * Defines the scoring rubric for a single qualitative item.
 */
interface IQualitativeRubric {
  metricId: string
  itemName: string
  perfectScore: string // The 5-point description
  acceptableScore: string // The 3-point description
  failScore: string // The 1-point description
}

/**
 * Defines a single automated, quantitative check.
 */
interface IQuantitativeMetric {
  metricId: string
  metricName: string
  tool: string
  description: string
}

/**
 * Defines the top-level Capability Dimension, which contains all other data.
 * Your UI will render an array of this object: CapabilityDimension[]
 */
interface ICapabilityDimension {
  id: string // Machine-readable ID
  icon: string // UI Emoji Icon
  title: string // The main capability dimension title
  description: string // The objective, user-friendly description of the capability
  userValue: string // The PM-facing rationale ("Why this matters")

  // A list of all automated checks for this dimension
  quantitativeMetrics: IQuantitativeMetric[]

  // A list of all human-scored rubric items for this dimension
  qualitativeMetrics: IQualitativeRubric[]
}

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface SelectedMetricInfo {
  metric: IQuantitativeMetric | IQualitativeRubric
  dimension: ICapabilityDimension
  type: "quantitative" | "qualitative"
}

const mockCapabilityDimensions: ICapabilityDimension[] = [
  {
    id: "identity-fidelity",
    icon: "👤",
    title: "Identity Fidelity & Artistic Appeal",
    description:
      "This capability evaluates the core artistic challenge: accurately capturing and refining the user's core facial features and 'essence' *while* applying the Q-version stylization. This is not just mechanical feature mapping; it requires the skill of a professional caricature artist to amplify the user's recognizable traits in a way that is both aesthetically pleasing and flattering, avoiding an uncanny or generic result.",
    userValue:
      "This defines the product's **Core Emotional Value**. The user demands a unique, 'Q-ified' version of *themselves*, not a generic doll. This capability determines the emotional resonance ('Wow, that's me!') that drives the product's entire value.",
    quantitativeMetrics: [
      {
        metricId: "quant-1-1",
        metricName: "Facial Identity Vector Similarity",
        tool: "Pre-trained facial recognition network (e.g., ArcFace)",
        description:
          "Measures how well the generated 3D face maintains the user's unique facial identity by comparing embedding vectors from the input photo and rendered output.",
      },
    ],
    qualitativeMetrics: [
      {
        metricId: "qual-1-1",
        itemName: 'Likeness & Essence Capture (The "Soul" Metric)',
        perfectScore:
          "Instantly recognizable. The model captures the user's unique 'essence'—their specific smile, the way their eyes are shaped, or their core expression. It feels exactly like them.",
        acceptableScore:
          "Recognizable, but generic. It matches the user's 'feature coordinates' (passing quantitative) but has lost their unique personality or 'soul' in the stylization.",
        failScore:
          'Unrecognizable. Even if the quantitative test *barely* passes, a human expert would not identify this as the same person. The "essence" is completely lost.',
      },
      {
        metricId: "qual-1-2",
        itemName: "Artistic Appeal (Anti-Uncanny Valley)",
        perfectScore:
          "The resulting stylized face is artistically excellent. It is 'cute,' appealing, and flattering. The Q-version translation has enhanced the user's appeal.",
        acceptableScore:
          "The face is 'fine.' It's not ugly or creepy, but it's also not particularly cute or appealing. It feels 'robotic' or 'doll-like' in a neutral way.",
        failScore:
          "The model falls directly into the **uncanny valley**. The features are distorted, the expression is 'creepy,' or the result is aesthetically ugly.",
      },
    ],
  },
  {
    id: "form-language",
    icon: "🎨",
    title: "Form Language & Stylization Consistency",
    description:
      "This capability evaluates the model's aesthetic discipline as a '3D Stylist.' It must strictly adhere to a unified 'Q-version art language' across *every single component* of the model. This includes a strong, readable **Silhouette**, coherent **Form Language** (e.g., rounded, appealing shapes), and correct proportions.",
    userValue:
      "This defines the product's **Artistic Integrity**. A stylistically unified work is a 'collectible figurine'; a mismatched work is just a 'model.' The user can intuitively sense which is more 'professional' and complete, which dictates its perceived quality.",
    quantitativeMetrics: [
      {
        metricId: "quant-2-1",
        metricName: "Global Proportion Adherence",
        tool: "Geometric Bounding Box analysis",
        description:
          "Ensures the model follows Q-version proportional guidelines by measuring head-to-body ratios and overall dimensional consistency.",
      },
      {
        metricId: "quant-2-2",
        metricName: "Detail Frequency Analysis (Heuristic)",
        tool: "Spectral analysis (FFT) on generated Normal Maps",
        description:
          "Detects unwanted realistic detail by analyzing high-frequency content in normal maps, ensuring clean stylized forms rather than noisy realistic textures.",
      },
    ],
    qualitativeMetrics: [
      {
        metricId: "qual-2-1",
        itemName: "Silhouette Readability & Strength",
        perfectScore:
          "The model's overall shape (silhouette) is clean, strong, and instantly readable. The pose, hair, and clothing create an appealing and dynamic shape from all major angles.",
        acceptableScore:
          "The silhouette is 'okay.' It's not confusing, but it's not strong. It may look 'boring,' 'stiff,' or slightly unbalanced.",
        failScore:
          "The silhouette is a 'mess.' It's confusing, unbalanced, has many distracting noisy parts, or forms tangent shapes that are visually awkward.",
      },
      {
        metricId: "qual-2-2",
        itemName: "Internal Form Language Cohesion",
        perfectScore:
          "Every detail serves the style. Clothing folds are simplified into clean, pleasing forms. Hair is sculpted in 'clumps' that match the Q-style. All internal shapes feel like they belong to the same 'artistic kit.'",
        acceptableScore:
          "A slight mix of styles. Proportions are correct, but some details are inconsistent (e.g., hyper-realistic fabric wrinkles on a cartoon body, or realistic hair strands).",
        failScore:
          "A 'Frankenstein' model. It's a chaotic mix of realistic and stylized parts (e.g., realistic hands on a cartoon body). The internal forms have no consistent art direction.",
      },
    ],
  },
  {
    id: "material-expression",
    icon: "💎",
    title: "Material Expression & Color Decoupling",
    description:
      "This capability evaluates the model's ability to differentiate and generate *style-appropriate* materials. It must de-light the input photo (decouple lighting from albedo) and generate a full set of PBR maps (Albedo, Roughness, Normals) that fit the figurine aesthetic.",
    userValue:
      "This dictates the **Perceived Value (Premium Feel)**. Correct material expression is the definitive line between a 'high-end collectible' and a 'cheap plastic toy.' Clean, de-lit materials are also the prerequisite for all downstream uses (like AR or dynamic lighting).",
    quantitativeMetrics: [
      {
        metricId: "quant-3-1",
        metricName: "Baked-Lighting Detection",
        tool: "Image analysis (variance calculation) on Albedo texture map",
        description:
          "Verifies that lighting information has been properly separated from material colors by detecting unwanted shadows or highlights baked into albedo textures.",
      },
      {
        metricId: "quant-3-2",
        metricName: "PBR Map Generation Check",
        tool: "Variance check on Normal and Roughness maps",
        description:
          "Confirms that the model generates proper physically-based rendering maps with meaningful variation rather than flat, uniform textures.",
      },
    ],
    qualitativeMetrics: [
      {
        metricId: "qual-3-1",
        itemName: "Material Differentiation & Logic",
        perfectScore:
          "I can instantly and clearly differentiate all materials. Skin looks like skin, cloth like cloth, metal like metal. The material choices feel logical and intentional.",
        acceptableScore:
          "I can mostly tell materials apart, but some are ambiguous (e.g., hair looks like plastic, cloth looks like paper).",
        failScore: "The entire model looks like it's made of one homogenous material (usually 'cheap plastic').",
      },
      {
        metricId: "qual-3-2",
        itemName: "Material Quality & Appeal",
        perfectScore:
          "The materials look 'premium.' Skin has a beautiful, soft, painted-resin feel (simulated SSS). Clothing normals are crisp and well-stylized. It looks like a high-end physical collectible.",
        acceptableScore:
          "The materials are 'passable.' They look like a standard, unpolished 3D asset. Skin is opaque, normals are blurry. It does the job but lacks any 'wow' factor.",
        failScore:
          "Materials fail the quantitative test (baked-in lighting) OR look cheap, flat, overly glossy, or blurry.",
      },
      {
        metricId: "qual-3-3",
        itemName: "Color Fidelity & Harmony",
        perfectScore:
          "Colors are both faithful to the source photo *and* artistically harmonious. The skin tone is accurate and vibrant. All clothing colors work well together within the Q-style palette.",
        acceptableScore:
          "Colors are technically correct (sampled from the photo) but look 'off.' Skin tone might be accurate but looks 'pale,' 'dead,' or 'washed out.'",
        failScore:
          "Colors are wrong. Skin tone is completely incorrect (e.g., green tint), or colors are wildly over-saturated or clipped.",
      },
    ],
  },
  {
    id: "technical-integrity",
    icon: "🔧",
    title: "Technical Integrity & Producibility",
    description:
      "This capability evaluates the model's professionalism as a 'Technical Artist.' The output must be a **technically clean, production-ready asset**. This includes being 'watertight' (manifold, no holes), having efficient topology, and clean, non-overlapping auto-unwrapped UVs.",
    userValue:
      "This is the **Professional Baseline and Usability Prerequisite**. Users (and the business) require a file that is not 'broken.' A clean mesh is the foundation for all subsequent applications: 3D printing, AR viewing, or import into a game engine.",
    quantitativeMetrics: [
      {
        metricId: "quant-4-1",
        metricName: "Watertight / Manifold Check",
        tool: "Standard mesh analysis (`is_manifold`)",
        description:
          "Ensures the 3D mesh is geometrically sound with no holes or non-manifold edges, making it suitable for 3D printing and other applications.",
      },
      {
        metricId: "quant-4-2",
        metricName: "Inter-penetration (Clipping) Check",
        tool: "Volumetric intersection tests",
        description:
          "Detects unwanted overlapping geometry between different mesh components (like hair clipping through the body) that would cause visual artifacts.",
      },
      {
        metricId: "quant-4-3",
        metricName: "UV Overlap Check",
        tool: "UV analysis algorithm",
        description:
          "Verifies that texture coordinates don't overlap, ensuring clean texture mapping without visual distortions or seams.",
      },
      {
        metricId: "quant-4-4",
        metricName: "Floater / Orphan Mesh Check",
        tool: "Mesh connectivity analysis",
        description:
          "Identifies disconnected mesh pieces or floating geometry that shouldn't exist in the final model, ensuring structural integrity.",
      },
    ],
    qualitativeMetrics: [
      {
        metricId: "qual-4-1",
        itemName: "Aesthetic Topology & Polygon Flow",
        perfectScore:
          "The mesh topology (polygon flow) is not only clean but *artistic*. Polygons follow the forms of the face and body perfectly. It's efficient and 'animation-ready.'",
        acceptableScore:
          "The mesh is a 'triangle soup' (e.g., from Marching Cubes), but it passes all quantitative checks (it's watertight and error-free). It's 'usable' but inefficient.",
        failScore:
          "The mesh is a chaotic mess *and* fails quantitative checks (e.g., visible polygon stretching, weird spikes).",
      },
      {
        metricId: "qual-4-2",
        itemName: "UV Seam Placement",
        perfectScore:
          "All texture seams are perfectly hidden in occluded or non-visible areas (e.g., under the arms, back of the head). Invisible to the user.",
        acceptableScore:
          'Seams are placed in somewhat visible, but not "catastrophic," locations (e.g., down the side of the arm or leg).',
        failScore:
          "A major texture seam is placed in a high-visibility, unforgivable location, like directly across the middle of the face or chest.",
      },
    ],
  },
]

const renderMarkdown = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      // Bold text
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    } else if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      // Italic text
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      )
    }
    return part
  })
}

export default function EvalPlanning() {
  const [capabilityDimensions, setCapabilityDimensions] = useState<ICapabilityDimension[]>(mockCapabilityDimensions)
  const [selectedMetric, setSelectedMetric] = useState<SelectedMetricInfo | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [chatInput])

  const handleConfirmConfiguration = async () => {
    console.log("[v0] Confirm Configuration button clicked")
    console.log("[v0] Capability dimensions:", capabilityDimensions.length)

    try {
      const configData = JSON.stringify(capabilityDimensions)
      localStorage.setItem("evalPlanningConfig", configData)
      console.log("[v0] Configuration saved to localStorage")
      console.log("[v0] Saved data length:", configData.length)

      await new Promise((resolve) => setTimeout(resolve, 100))

      console.log("[v0] Attempting to navigate to eval-planning-overview")
      router.push("/eval-planning/overview")
      console.log("[v0] Navigation call completed")
    } catch (error) {
      console.error("[v0] Error in handleConfirmConfiguration:", error)
    }
  }

  const handleQuantitativeMetricClick = (metric: IQuantitativeMetric, dimension: ICapabilityDimension) => {
    const metricInfo: SelectedMetricInfo = { metric, dimension, type: "quantitative" }
    setSelectedMetric(metricInfo)

    const initialMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "assistant",
      content: `Selected quantitative metric: **${metric.metricName}**\n\nTool: ${metric.tool}\nDescription: ${metric.description}\n\nHow would you like to adjust this metric?`,
      timestamp: new Date(),
    }
    setChatMessages([initialMessage])
  }

  const handleQualitativeMetricClick = (metric: IQualitativeRubric, dimension: ICapabilityDimension) => {
    const metricInfo: SelectedMetricInfo = { metric, dimension, type: "qualitative" }
    setSelectedMetric(metricInfo)

    const initialMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "assistant",
      content: `Selected qualitative metric: **${metric.itemName}**\n\nPerfect (5-point): ${metric.perfectScore}\n\nAcceptable (3-point): ${metric.acceptableScore}\n\nFail (1-point): ${metric.failScore}\n\nHow would you like to adjust this rubric?`,
      timestamp: new Date(),
    }
    setChatMessages([initialMessage])
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    }

    const metricName =
      selectedMetric?.type === "quantitative"
        ? (selectedMetric.metric as IQuantitativeMetric).metricName
        : selectedMetric?.type === "qualitative"
          ? (selectedMetric.metric as IQualitativeRubric).itemName
          : null

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: selectedMetric
        ? `I understand you want to adjust the ${metricName}. Based on your request "${chatInput}", I suggest updating the ${selectedMetric.type === "quantitative" ? "threshold" : "scoring rubric"}. Would you like me to apply these changes?`
        : `I can help you configure evaluation metrics and parameters. ${chatInput.includes("threshold") || chatInput.includes("metric") ? "To adjust specific metrics, click on a metric card first, then I can help you modify its settings." : "Feel free to ask about evaluation setup, metric configuration, or click on any metric card for specific adjustments."}`,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage, assistantMessage])
    setChatInput("")
  }

  const handleTemplateOption = (templateType: "explain" | "adjust") => {
    if (!selectedMetric) return

    const metricName =
      selectedMetric.type === "quantitative"
        ? (selectedMetric.metric as IQuantitativeMetric).metricName
        : (selectedMetric.metric as IQualitativeRubric).itemName

    const templatePrompts = {
      explain: `Please explain the "${metricName}" metric to me in a user-friendly way. What does it measure and why is it important?`,
      adjust: `I want to adjust the "${metricName}" metric. Can you help me identify what would be the perfect identity or ideal ${selectedMetric.type === "quantitative" ? "threshold" : "scoring criteria"} for this metric?`,
    }

    setChatInput(templatePrompts[templateType])
  }

  const totalQuantitativeMetrics = capabilityDimensions.reduce((sum, dim) => sum + dim.quantitativeMetrics.length, 0)
  const totalQualitativeMetrics = capabilityDimensions.reduce((sum, dim) => sum + dim.qualitativeMetrics.length, 0)

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-hidden flex flex-col ml-16">
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-slate-900 font-space-grotesk text-2xl">Evaluation Set Up</h1>
              <p className="text-slate-600 mt-1 text-lg">Configure your capability dimensions and evaluation metrics</p>
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
                  <h2 className="font-semibold text-slate-900 text-lg">Metric Assistant</h2>
                  <p className="text-slate-600 text-sm">
                    {selectedMetric
                      ? `Adjusting: ${
                          selectedMetric.type === "quantitative"
                            ? (selectedMetric.metric as IQuantitativeMetric).metricName
                            : (selectedMetric.metric as IQualitativeRubric).itemName
                        }`
                      : "Click any metric to start"}
                  </p>
                </div>
              </div>
              {!selectedMetric && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 text-sm font-medium">👉 Click a metric card to activate the assistant</p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {chatMessages.length === 0 ? (
                <div className="text-center text-slate-500 mt-8">
                  <div className="p-6 bg-white rounded-xl mb-6 border border-slate-200 shadow-sm">
                    <Bot className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                    <h3 className="font-semibold text-slate-800 mb-3">Welcome to Metric Assistant!</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      I'm ready to help you configure evaluation metrics and parameters. You can start chatting right
                      away or click on specific metric cards for targeted adjustments.
                    </p>
                    <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      💡 Try: "What metrics should I use?" or "Help me understand thresholds"
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
                        {message.type === "assistant" && <Bot className="h-4 w-4 mt-1 flex-shrink-0 text-slate-600" />}
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

            {selectedMetric && (
              <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                <p className="text-xs text-slate-600 mb-2 font-medium">Quick Actions:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTemplateOption("explain")}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium"
                  >
                    📖 Explain to me
                  </button>
                  <button
                    onClick={() => handleTemplateOption("adjust")}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium"
                  >
                    ⚙️ Adjust the Metrics
                  </button>
                </div>
              </div>
            )}

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
                  placeholder={
                    selectedMetric
                      ? "Ask to adjust threshold, change settings..."
                      : "Ask about metrics, thresholds, or evaluation setup..."
                  }
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

          {/* Main Content */}
          <div className="flex-1 overflow-auto bg-white">
            <div className="max-w-7xl mx-auto px-8 py-8">
              <div className="space-y-12">
                <section className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {capabilityDimensions.map((dimension) => (
                      <div key={dimension.id} className="bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="border-b border-slate-200 p-6 rounded-t-lg bg-slate-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{dimension.icon}</span>
                                <h3 className="text-xl font-semibold text-slate-900">{dimension.title}</h3>
                              </div>
                              <p className="text-slate-600 mb-4">{dimension.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Quantitative Metrics Section */}
                        <div className="p-6">
                          <div className="space-y-4">
                            <h5 className="text-slate-900 font-semibold text-xl">Quantitative Metrics</h5>
                            <p className="text-slate-600 text-sm">
                              Automated measurements with specific tools and formulas
                            </p>

                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                  <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Metric</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Tool</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                                      Description
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {dimension.quantitativeMetrics.map((metric) => (
                                    <tr
                                      key={metric.metricId}
                                      onClick={() => handleQuantitativeMetricClick(metric, dimension)}
                                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                          <div className="font-medium text-slate-900">{metric.metricName}</div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="text-sm text-slate-600">{metric.tool}</div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="text-sm text-slate-600">
                                          {renderMarkdown(metric.description)}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Qualitative Metrics Section */}
                          <div className="space-y-4 mt-8">
                            <h5 className="text-slate-900 font-semibold text-xl">Qualitative Metrics</h5>
                            <p className="text-slate-600 text-sm">
                              Human evaluation rubrics with detailed scoring criteria
                            </p>

                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                  <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                                      {"Metric"}
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                                      Perfect (5-point)
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                                      Acceptable (3-point)
                                    </th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                                      Fail (1-point)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {dimension.qualitativeMetrics.map((metric) => (
                                    <tr
                                      key={metric.metricId}
                                      onClick={() => handleQualitativeMetricClick(metric, dimension)}
                                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                      <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900">{metric.itemName}</div>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-slate-600">
                                        {renderMarkdown(metric.perfectScore)}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-slate-600">
                                        {renderMarkdown(metric.acceptableScore)}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-slate-600">
                                        {renderMarkdown(metric.failScore)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Confirmation Button Section */}
                <section className="py-8">
                  <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <p className="text-slate-600 text-lg font-medium">
                          You've configured{" "}
                          <span className="font-semibold text-purple-600 text-2xl">{capabilityDimensions.length}</span>{" "}
                          capability dimensions with{" "}
                          <span className="font-semibold text-green-600 text-2xl">{totalQuantitativeMetrics}</span>{" "}
                          quantitative and{" "}
                          <span className="font-semibold text-blue-600 text-2xl">{totalQualitativeMetrics}</span>{" "}
                          qualitative metrics
                        </p>
                      </div>
                      <button
                        onClick={handleConfirmConfiguration}
                        className="hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors bg-slate-700"
                      >
                        Continue to Plan Overview →
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
