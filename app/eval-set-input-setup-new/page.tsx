"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ProjectSelector } from "@/components/project-selector"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Send, 
  Bot, 
  User, 
  ArrowLeft, 
  CheckCircle, 
  Loader2, 
  ChevronDown, 
  ChevronRight,
  Settings,
  BarChart3,
  Eye,
  EyeOff,
  Plus,
  Minus,
  TrendingUp,
  Target,
  Zap,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Activity,
  Layers,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from "lucide-react"
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
    name: "Identity Fidelity",
    icon: "👤",
    testCases: [
      {
        id: "easy-1",
        tier: "Easy",
        name: "Passport Photo Set",
        rationale: "Baseline, best-case scenario inputs. High-resolution, even lighting, neutral expression.",
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
        name: "Social Media Set",
        rationale: "Tests robustness against common real-world variations like off-angle poses, expressions, and minor obstructions.",
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
        name: "Identity Killers Set",
        rationale: "Nightmare-level inputs designed to intentionally break identity-style disentanglement and expose the model's failure modes.",
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
        ],
      },
    ],
  },
  {
    id: "material-rendering",
    name: "Material Rendering",
    icon: "🎨",
    testCases: [
      {
        id: "easy-2",
        tier: "Easy",
        name: "Standard Materials",
        rationale: "Basic material properties that should be handled correctly by any competent model.",
        showcases: [
          {
            inputType: "Matte Surfaces",
            description: "Non-reflective surfaces with consistent lighting.",
            expectedOutcome: "Accurate diffuse reflection and color reproduction.",
          },
        ],
      },
      {
        id: "medium-2",
        tier: "Medium",
        name: "Complex Materials",
        rationale: "Materials with multiple properties that require sophisticated understanding.",
        showcases: [
          {
            inputType: "Metallic Surfaces",
            description: "Reflective surfaces with varying roughness.",
            expectedOutcome: "Proper specular highlights and reflection mapping.",
          },
        ],
      },
      {
        id: "hard-2",
        tier: "Hard",
        name: "Advanced Materials",
        rationale: "Cutting-edge materials that push the boundaries of current capabilities.",
        showcases: [
          {
            inputType: "Subsurface Scattering",
            description: "Materials that scatter light internally like skin or wax.",
            expectedOutcome: "Realistic light penetration and scattering effects.",
          },
        ],
      },
    ],
  },
  {
    id: "lighting-quality",
    name: "Lighting Quality",
    icon: "💡",
    testCases: [
      {
        id: "easy-3",
        tier: "Easy",
        name: "Basic Lighting",
        rationale: "Simple lighting scenarios that should be handled correctly.",
        showcases: [
          {
            inputType: "Even Lighting",
            description: "Uniform lighting across the scene.",
            expectedOutcome: "Consistent illumination and shadow casting.",
          },
        ],
      },
      {
        id: "medium-3",
        tier: "Medium",
        name: "Complex Lighting",
        rationale: "Multiple light sources and complex shadow interactions.",
        showcases: [
          {
            inputType: "Multiple Sources",
            description: "Scene with multiple light sources creating complex shadows.",
            expectedOutcome: "Realistic shadow blending and light interaction.",
          },
        ],
      },
      {
        id: "hard-3",
        tier: "Hard",
        name: "Extreme Lighting",
        rationale: "Challenging lighting conditions that test model limits.",
        showcases: [
          {
            inputType: "Harsh Shadows",
            description: "Extreme contrast lighting with deep shadows.",
            expectedOutcome: "Maintained detail in both highlights and shadows.",
          },
        ],
      },
    ],
  },
]

export default function EvalSetInputSetupNew() {
  const { navigateToStep } = useWorkflow()
  const router = useRouter()
  const [testPlans] = useState<CapabilityTestPlan[]>(mockTestPlans)
  const [activeTab, setActiveTab] = useState("identity-fidelity")
  const [sampleSizes, setSampleSizes] = useState<Record<string, Record<string, number>>>({
    "identity-fidelity": { Easy: 5, Medium: 10, Hard: 3 },
    "material-rendering": { Easy: 8, Medium: 12, Hard: 4 },
    "lighting-quality": { Easy: 6, Medium: 9, Hard: 2 },
  })
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [splitterWidth, setSplitterWidth] = useState(400)
  const [isDragging, setIsDragging] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "Easy":
        return "🟢"
      case "Medium":
        return "🟡"
      case "Hard":
        return "🔴"
      default:
        return "⚪"
    }
  }

  const getTierStatus = (capabilityId: string, tier: string) => {
    const count = sampleSizes[capabilityId]?.[tier] || 0
    if (count === 0) return "not-configured"
    if (count < 3) return "needs-review"
    return "configured"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "configured":
        return "bg-green-100 text-green-800"
      case "needs-review":
        return "bg-yellow-100 text-yellow-800"
      case "not-configured":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSampleSizeChange = (capabilityId: string, tier: string, newSize: number) => {
    setSampleSizes((prev) => ({
      ...prev,
      [capabilityId]: {
        ...prev[capabilityId],
        [tier]: newSize,
      },
    }))
  }

  const toggleExpanded = (cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  const expandAll = () => {
    const currentPlan = testPlans.find(plan => plan.id === activeTab)
    if (currentPlan) {
      const allCardIds = currentPlan.testCases.map(testCase => `${activeTab}-${testCase.tier}`)
      setExpandedCards(new Set(allCardIds))
    }
  }

  const collapseAll = () => {
    setExpandedCards(new Set())
  }

  const getTotalSamples = (capabilityId: string) => {
    const plan = sampleSizes[capabilityId]
    if (!plan) return 0
    return Object.values(plan).reduce((sum, count) => sum + count, 0)
  }

  const getOverallStats = () => {
    const totalSamples = testPlans.reduce((sum, plan) => sum + getTotalSamples(plan.id), 0)
    const totalEasy = testPlans.reduce((sum, plan) => sum + (sampleSizes[plan.id]?.Easy || 0), 0)
    const totalMedium = testPlans.reduce((sum, plan) => sum + (sampleSizes[plan.id]?.Medium || 0), 0)
    const totalHard = testPlans.reduce((sum, plan) => sum + (sampleSizes[plan.id]?.Hard || 0), 0)
    
    return {
      totalSamples,
      totalEasy,
      totalMedium,
      totalHard,
      easyPercentage: totalSamples > 0 ? Math.round((totalEasy / totalSamples) * 100) : 0,
      mediumPercentage: totalSamples > 0 ? Math.round((totalMedium / totalSamples) * 100) : 0,
      hardPercentage: totalSamples > 0 ? Math.round((totalHard / totalSamples) * 100) : 0,
    }
  }

  const getCapabilityStatus = (capabilityId: string) => {
    const total = getTotalSamples(capabilityId)
    if (total === 0) return "not-configured"
    if (total < 10) return "needs-review"
    return "ready"
  }

  const getOverallStatus = () => {
    const stats = getOverallStats()
    if (stats.totalSamples === 0) return "not-configured"
    if (stats.hardPercentage < 15) return "needs-review"
    return "ready"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "needs-review":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "not-configured":
        return <Clock className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }


  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, newMessage])
    setChatInput("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I understand your requirements. Let me help you optimize the test case configuration for better evaluation coverage.",
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleApproveTestSet = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    navigateToStep("model-evaluation")
    setIsGenerating(false)
  }

  const handleBack = () => {
    router.push("/eval-planning")
  }

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newWidth = Math.max(300, Math.min(800, e.clientX))
        setSplitterWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  const currentPlan = testPlans.find(plan => plan.id === activeTab)
  const overallStats = getOverallStats()

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />

      <main className="flex-1 overflow-hidden flex flex-col ml-16">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-slate-900 font-space-grotesk text-2xl flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                Evaluation Configuration
              </h1>
              <p className="text-slate-600 mt-1 text-lg">
                Configure test cases and input scenarios across all capabilities
              </p>
            </div>
            <ProjectSelector />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
            {/* Overall Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Stats */}
              <Card className="lg:col-span-2 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Evaluation Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{overallStats.totalSamples}</div>
                      <div className="text-sm text-slate-600">Total Samples</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{overallStats.totalEasy}</div>
                      <div className="text-sm text-slate-600">Easy ({overallStats.easyPercentage}%)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">{overallStats.totalMedium}</div>
                      <div className="text-sm text-slate-600">Medium ({overallStats.mediumPercentage}%)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{overallStats.totalHard}</div>
                      <div className="text-sm text-slate-600">Hard ({overallStats.hardPercentage}%)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Status */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(getOverallStatus())}
                      <div>
                        <div className="font-semibold text-slate-900">
                          {getOverallStatus() === 'ready' ? 'Ready to Evaluate' : 
                           getOverallStatus() === 'needs-review' ? 'Needs Review' : 'Not Configured'}
                        </div>
                        <div className="text-sm text-slate-600">
                          {getOverallStatus() === 'ready' ? 'All capabilities configured' : 
                           getOverallStatus() === 'needs-review' ? 'Some configurations need attention' : 'Please configure test cases'}
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={getOverallStatus() === 'ready' ? 100 : getOverallStatus() === 'needs-review' ? 70 : 0} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Capability Overview */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Capability Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {testPlans.map((plan) => {
                    const total = getTotalSamples(plan.id)
                    const status = getCapabilityStatus(plan.id)
                    const easy = sampleSizes[plan.id]?.Easy || 0
                    const medium = sampleSizes[plan.id]?.Medium || 0
                    const hard = sampleSizes[plan.id]?.Hard || 0
                    
                    return (
                      <Card 
                        key={plan.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                          activeTab === plan.id ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                        }`}
                        onClick={() => setActiveTab(plan.id)}
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{plan.icon}</span>
                                <div>
                                  <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                                  <p className="text-sm text-slate-600">{total} samples</p>
                                </div>
                              </div>
                              {getStatusIcon(status)}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-green-600">Easy: {easy}</span>
                                <span className="text-yellow-600">Medium: {medium}</span>
                                <span className="text-red-600">Hard: {hard}</span>
                              </div>
                              <Progress 
                                value={status === 'ready' ? 100 : status === 'needs-review' ? 70 : 0} 
                                className="h-1"
                              />
                            </div>
                            
                            <Badge className={getStatusColor(status)}>
                              {status === 'ready' ? 'Ready' : 
                               status === 'needs-review' ? 'Review' : 'Configure'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Configuration */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100">
                {testPlans.map((plan) => (
                  <TabsTrigger 
                    key={plan.id} 
                    value={plan.id}
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <span className="text-lg">{plan.icon}</span>
                    <span className="hidden sm:inline">{plan.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {testPlans.map((plan) => (
                <TabsContent key={plan.id} value={plan.id} className="space-y-6">
                  {/* Capability Header */}
                  <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <span className="text-3xl">{plan.icon}</span>
                            {plan.name} Configuration
                          </h2>
                          <p className="text-slate-600 mt-2">
                            Configure test cases and sample sizes for {plan.name.toLowerCase()} evaluation
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={expandAll}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Expand All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={collapseAll}
                            className="flex items-center gap-2"
                          >
                            <EyeOff className="h-4 w-4" />
                            Collapse All
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tier Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plan.testCases.map((testCase) => {
                      const count = sampleSizes[plan.id]?.[testCase.tier] || 0
                      const cardId = `${plan.id}-${testCase.tier}`
                      const isExpanded = expandedCards.has(cardId)
                      
                      return (
                        <Card 
                          key={testCase.tier}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                            isExpanded ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                          }`}
                          onClick={() => toggleExpanded(cardId)}
                        >
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{getTierIcon(testCase.tier)}</span>
                                  <div>
                                    <h3 className="font-semibold text-slate-900">{testCase.tier} Tier</h3>
                                    <p className="text-sm text-slate-600">{testCase.name}</p>
                                  </div>
                                </div>
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-primary" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-slate-400" />
                                )}
                              </div>
                              
                              <div className="space-y-3">
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-slate-900">{count}</div>
                                  <div className="text-sm text-slate-600">samples</div>
                                </div>
                                
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSampleSizeChange(plan.id, testCase.tier, Math.max(0, count - 1))
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <input
                                    type="number"
                                    value={count}
                                    onChange={(e) => {
                                      e.stopPropagation()
                                      const value = Math.max(0, Math.min(1000, parseInt(e.target.value) || 0))
                                      handleSampleSizeChange(plan.id, testCase.tier, value)
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-16 px-2 py-1 text-sm text-center font-medium border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    min="0"
                                    max="1000"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSampleSizeChange(plan.id, testCase.tier, count + 1)
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <Badge className={getTierColor(testCase.tier)}>
                                  {testCase.tier}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Expanded Details */}
                  {plan.testCases.map((testCase) => {
                    const cardId = `${plan.id}-${testCase.tier}`
                    const isExpanded = expandedCards.has(cardId)
                    
                    if (!isExpanded) return null
                    
                    return (
                      <Card key={testCase.id} className="bg-white/80 backdrop-blur-sm border-slate-200/50">
                        <CardContent className="p-6">
                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getTierIcon(testCase.tier)}</span>
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900">{testCase.name}</h3>
                                <p className="text-sm text-slate-600">{testCase.rationale}</p>
                              </div>
                            </div>
                            
                            
                            {/* Showcases Gallery */}
                            <div>
                              <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                                <span className="text-lg">📸</span>
                                Input Showcases
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {testCase.showcases.slice(0, 3).map((showcase, index) => (
                                  <Card key={index} className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                                    <CardContent className="p-4">
                                      <div className="space-y-4">
                                        {/* Image Preview */}
                                        <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden flex items-center justify-center group cursor-pointer">
                                          <img
                                            src={`/abstract-geometric-shapes.png?key=hixhb&height=200&width=200&query=${encodeURIComponent(showcase.inputType + " " + showcase.description)}`}
                                            alt={showcase.inputType}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                          />
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="space-y-2">
                                          <h5 className="font-semibold text-slate-900 text-sm leading-tight">
                                            {showcase.inputType}
                                          </h5>
                                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                            {showcase.description}
                                          </p>
                                          <div className="pt-2 border-t border-slate-200/50">
                                            <div className="text-xs text-primary font-medium flex items-center gap-1">
                                              <span className="text-slate-500">Expected:</span>
                                              <span className="text-primary">{showcase.expectedOutcome}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </TabsContent>
              ))}
            </Tabs>

            {/* Action Buttons */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Planning
                  </Button>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-slate-600">Total Configuration</div>
                      <div className="text-lg font-semibold text-slate-900">
                        {overallStats.totalSamples} samples across {testPlans.length} capabilities
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleApproveTestSet}
                      disabled={isGenerating}
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
