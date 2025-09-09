"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import { ProjectSelector } from "@/components/project-selector"
import { ArrowLeft, Download, ChevronDown } from "lucide-react"
import { useWorkflow } from "@/contexts/workflow-context"

interface IQuantitativeMetric {
  metricId: string
  metricName: string
  tool: string
  formula: string
  threshold: string
  description: string
}

interface IQualitativeRubric {
  metricId: string
  itemName: string
  perfectScore: string
  acceptableScore: string
  failScore: string
}

interface ICapabilityDimension {
  id: string
  icon: string
  title: string
  description: string
  userValue: string
  quantitativeMetrics: IQuantitativeMetric[]
  qualitativeMetrics: IQualitativeRubric[]
}

interface IEvaluationTestCase {
  capability: string
  goal: string
  tiers: {
    name: string
    rationale: string
    examples: {
      name: string
      description: string
    }[]
  }[]
}

export default function EvalPlanningOverview() {
  const [capabilityDimensions, setCapabilityDimensions] = useState<ICapabilityDimension[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const { completeStep, navigateToStep } = useWorkflow()
  const router = useRouter()

  const defaultCapabilityDimensions: ICapabilityDimension[] = [
    {
      id: "identity-fidelity",
      icon: "👤",
      title: "Identity Fidelity & Artistic Appeal",
      description:
        "This capability evaluates the core artistic challenge: accurately capturing and refining the user's core facial features and 'essence' while applying the Q-version stylization.",
      userValue:
        "**Core Emotional Value**: Users want to see themselves (or their subject) clearly recognizable in the final figurine, but elevated to be more attractive, charming, and memorable than a literal translation.",
      quantitativeMetrics: [
        {
          metricId: "facial-landmark-accuracy",
          metricName: "Facial Landmark Accuracy",
          tool: "MediaPipe Face Mesh",
          formula: "IoU of detected vs ground truth landmarks",
          threshold: "> 0.85",
          description: "Measures how accurately key facial features (eyes, nose, mouth) are detected and preserved",
        },
        {
          metricId: "identity-preservation",
          metricName: "Identity Preservation Score",
          tool: "FaceNet Embeddings",
          formula: "Cosine similarity between input and output face embeddings",
          threshold: "> 0.75",
          description:
            "Evaluates whether the generated figurine maintains the recognizable identity of the input person",
        },
      ],
      qualitativeMetrics: [
        {
          metricId: "artistic-appeal",
          itemName: "Artistic Appeal & Charm",
          perfectScore:
            "The figurine captures the subject's essence while being significantly more charming and appealing than the source photo",
          acceptableScore: "The figurine is recognizable and has some enhanced charm, though not dramatically improved",
          failScore: "The figurine fails to capture the subject's likeness or appears less appealing than the source",
        },
      ],
    },
    {
      id: "material-expression",
      icon: "💎",
      title: "Material Expression & Texture Fidelity",
      description:
        "This capability focuses on accurately representing different material properties like **Skin**, **apparel**, hair, and accessories with appropriate textures and surface qualities.",
      userValue:
        "**Perceived Value (Premium Feel)**: Users expect the figurine to look and feel premium, with realistic material representation that justifies the product's value proposition.",
      quantitativeMetrics: [
        {
          metricId: "texture-detail-preservation",
          metricName: "Texture Detail Preservation",
          tool: "LPIPS Perceptual Loss",
          formula: "Perceptual similarity between input and output textures",
          threshold: "< 0.3",
          description: "Measures how well fine texture details are preserved in the generated figurine",
        },
      ],
      qualitativeMetrics: [
        {
          metricId: "material-realism",
          itemName: "Material Realism",
          perfectScore: "All materials (skin, clothing, hair) look realistic and appropriate for their type",
          acceptableScore: "Most materials look realistic with minor inconsistencies",
          failScore: "Materials look artificial or inappropriate (e.g., plastic-looking skin)",
        },
      ],
    },
  ]

  const evaluationTestCases: IEvaluationTestCase[] = [
    {
      capability: "Identity Fidelity & Artistic Appeal",
      goal: "This set is designed to test how well the model maintains recognizability and artistic appeal when the user's identity signal is weak, obstructed, or confusing.",
      tiers: [
        {
          name: 'Tier 1 (Easy): The "Passport Photo" Set',
          rationale:
            "Baseline, best-case scenario inputs. High-resolution, even lighting, neutral expression. A failure here indicates a catastrophic model collapse.",
          examples: [
            { name: "Studio Portrait", description: "High-res, professional lighting" },
            { name: "Frontal, Neutral", description: "Direct face view, neutral expression" },
          ],
        },
        {
          name: 'Tier 2 (Medium): The "Social Media" Set',
          rationale:
            "Tests robustness against common real-world variations like off-angle poses, expressions, and minor obstructions.",
          examples: [
            { name: "3/4 View", description: "Angled pose, natural lighting" },
            { name: "Expression & Glasses", description: "Smile with accessories" },
          ],
        },
        {
          name: 'Tier 3 (Hard): The "Identity Killers" Set',
          rationale:
            "Nightmare-level inputs designed to intentionally break identity-style disentanglement and expose the model's failure modes.",
          examples: [
            { name: "Heavy Obstruction", description: "Partial face coverage" },
            { name: "Unique Features", description: "Distinctive characteristics" },
            { name: "Extreme Lighting", description: "Harsh shadows/highlights" },
          ],
        },
      ],
    },
    {
      capability: "Material Expression & Texture Fidelity",
      goal: "This set tests the model's ability to accurately represent different material properties and surface qualities across various difficulty levels.",
      tiers: [
        {
          name: "Tier 1 (Easy): Standard Materials",
          rationale: "Common materials with clear visual properties. Basic test for material recognition capabilities.",
          examples: [
            { name: "Cotton Fabric", description: "Simple, matte textile" },
            { name: "Smooth Skin", description: "Even skin tone, good lighting" },
          ],
        },
        {
          name: "Tier 2 (Medium): Complex Textures",
          rationale: "Materials with more complex surface properties that require nuanced understanding.",
          examples: [
            { name: "Denim & Leather", description: "Textured materials" },
            { name: "Hair Variations", description: "Different hair types and styles" },
          ],
        },
        {
          name: "Tier 3 (Hard): Challenging Materials",
          rationale: "Materials that are notoriously difficult for AI models to represent accurately.",
          examples: [
            { name: "Reflective Surfaces", description: "Metal, glass, mirrors" },
            { name: "Translucent Materials", description: "Semi-transparent fabrics" },
            { name: "Complex Patterns", description: "Intricate designs and textures" },
          ],
        },
      ],
    },
  ]

  useEffect(() => {
    console.log("[v0] Overview page useEffect running")
    const savedConfig = localStorage.getItem("evalPlanningConfig")
    console.log("[v0] Saved config from localStorage:", savedConfig ? "found" : "not found")

    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        console.log("[v0] Parsed config:", parsedConfig)
        setCapabilityDimensions(parsedConfig)
      } catch (error) {
        console.error("[v0] Error parsing saved config:", error)
        console.log("[v0] Using default demo data due to parse error")
        setCapabilityDimensions(defaultCapabilityDimensions)
      }
    } else {
      console.log("[v0] No saved config found, using default demo data")
      setCapabilityDimensions(defaultCapabilityDimensions)
    }

    setIsLoading(false)
    console.log("[v0] Overview page loaded successfully")
  }, [router])

  const handleGenerateEvalSet = () => {
    console.log("[v0] Generate Evaluation Set button clicked!")
    console.log("[v0] Navigating to eval-set-input-setup page")
    navigateToStep("eval-set-input-setup")
  }

  const handleBackToConfiguration = () => {
    router.push("/eval-planning")
  }

  const handleExportJSON = () => {
    const exportData = {
      title: "Evaluation Plan Overview",
      timestamp: new Date().toISOString(),
      capabilityDimensions: capabilityDimensions,
      summary: {
        totalCapabilityDimensions: capabilityDimensions.length,
        totalQuantitativeMetrics: totalQuantitativeMetrics,
        totalQualitativeMetrics: totalQualitativeMetrics,
        totalMetrics: totalMetrics,
      },
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `evaluation-plan-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setShowExportDropdown(false)
  }

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Evaluation Plan Overview</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .capability { margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
            .capability-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
            .metrics-section { margin-top: 15px; }
            .metric-item { background: #f8fafc; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 4px solid #3b82f6; }
            .quantitative { border-left-color: #8b5cf6; }
            .qualitative { border-left-color: #10b981; }
            .summary { background: #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 30px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center; }
            .summary-item { font-weight: bold; }
            .summary-number { font-size: 24px; color: #3b82f6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Evaluation Plan Overview</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          ${capabilityDimensions
            .map(
              (dimension) => `
            <div class="capability">
              <div class="capability-title">
                <span>${dimension.icon}</span>
                <span>${dimension.title}</span>
              </div>
              
              ${
                dimension.quantitativeMetrics.length > 0
                  ? `
                <div class="metrics-section">
                  <h3 style="color: #8b5cf6;">Quantitative Metrics</h3>
                  ${dimension.quantitativeMetrics
                    .map(
                      (metric) => `
                    <div class="metric-item quantitative">
                      <strong>${metric.metricName}</strong>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
              
              ${
                dimension.qualitativeMetrics.length > 0
                  ? `
                <div class="metrics-section">
                  <h3 style="color: #10b981;">Qualitative Metrics</h3>
                  ${dimension.qualitativeMetrics
                    .map(
                      (metric) => `
                    <div class="metric-item qualitative">
                      <strong>${metric.itemName}</strong>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
            </div>
          `,
            )
            .join("")}
          
          <div class="summary">
            <h2>Summary</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-number">${capabilityDimensions.length}</div>
                <div>Capability Dimensions</div>
              </div>
              <div class="summary-item">
                <div class="summary-number">${totalQuantitativeMetrics}</div>
                <div>Quantitative Metrics</div>
              </div>
              <div class="summary-item">
                <div class="summary-number">${totalQualitativeMetrics}</div>
                <div>Qualitative Metrics</div>
              </div>
              <div class="summary-item">
                <div class="summary-number">${totalMetrics}</div>
                <div>Total Metrics</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
    setShowExportDropdown(false)
  }

  const totalQuantitativeMetrics = capabilityDimensions.reduce(
    (sum, dimension) => sum + dimension.quantitativeMetrics.length,
    0,
  )
  const totalQualitativeMetrics = capabilityDimensions.reduce(
    (sum, dimension) => sum + dimension.qualitativeMetrics.length,
    0,
  )
  const totalMetrics = totalQuantitativeMetrics + totalQualitativeMetrics

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600">Loading configuration...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col ml-16">
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-slate-900 font-space-grotesk text-2xl">Evaluation Plan Overview</h1>
              <p className="text-slate-600 mt-1 text-lg">Review your evaluation plan before generation</p>
            </div>
            <ProjectSelector />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="space-y-8">
              <section className="space-y-6">
                <Card className="bg-white shadow-lg border-slate-200">
                  <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-bold text-slate-900 text-2xl">Evaluation Plan Structure</CardTitle>
                        <CardDescription className="text-slate-600">
                          Complete breakdown of your evaluation dataset
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{capabilityDimensions.length}</div>
                        <div className="text-sm text-slate-500">Capability Dimensions</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="max-h-[800px] overflow-y-auto pr-2">
                        <div className="space-y-6">
                          {capabilityDimensions.map((dimension) => (
                            <div key={dimension.id} className="relative">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="text-2xl">{dimension.icon}</span>
                                        <h4 className="text-slate-900 text-base font-semibold">{dimension.title}</h4>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                                          {dimension.quantitativeMetrics.length + dimension.qualitativeMetrics.length}{" "}
                                          metrics
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {dimension.quantitativeMetrics.length > 0 && (
                                    <div className="ml-8 mb-4">
                                      <h5 className="font-semibold text-purple-700 text-sm mb-2">
                                        Quantitative Metrics
                                      </h5>
                                      <div className="space-y-2">
                                        {dimension.quantitativeMetrics.map((metric) => (
                                          <div
                                            key={metric.metricId}
                                            className="bg-purple-50 border border-purple-200 rounded-lg p-3"
                                          >
                                            <div className="font-medium text-sm text-slate-900">
                                              {metric.metricName}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {dimension.qualitativeMetrics.length > 0 && (
                                    <div className="ml-8">
                                      <h5 className="font-semibold text-green-700 text-sm mb-2">Qualitative Metrics</h5>
                                      <div className="space-y-2">
                                        {dimension.qualitativeMetrics.map((metric) => (
                                          <div
                                            key={metric.metricId}
                                            className="bg-green-50 border border-green-200 rounded-lg p-3"
                                          >
                                            <div className="font-medium text-sm text-slate-900">{metric.itemName}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                        <div className="grid grid-cols-4 gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{capabilityDimensions.length}</div>
                            <div className="text-sm text-slate-600 font-medium">Capability Dimensions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{totalQuantitativeMetrics}</div>
                            <div className="text-sm text-slate-600 font-medium">Quantitative Metrics</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{totalQualitativeMetrics}</div>
                            <div className="text-sm text-slate-600 font-medium">Qualitative Metrics</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{totalMetrics}</div>
                            <div className="text-sm text-slate-600 font-medium">Total Metrics</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <div className="flex justify-between items-center py-6 px-4 bg-white border border-slate-200 rounded-lg shadow-sm sticky bottom-4 z-10">
                <button
                  onClick={handleBackToConfiguration}
                  className="flex items-center gap-2 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold text-base transition-colors bg-gray-500"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      className="flex items-center gap-2 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-base transition-colors bg-green-600"
                    >
                      <Download className="h-4 w-4" />
                      Export
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {showExportDropdown && (
                      <div className="absolute bottom-full mb-2 right-0 bg-white border border-slate-200 rounded-lg shadow-lg py-2 min-w-[120px]">
                        <button
                          onClick={handleExportJSON}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                        >
                          Export JSON
                        </button>
                        <button
                          onClick={handleExportPDF}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                        >
                          Export PDF
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleGenerateEvalSet}
                    disabled={isGenerating}
                    className="hover:bg-blue-700 disabled:bg-blue-400 text-white px-12 py-3 rounded-lg font-bold text-base transition-colors bg-blue-600"
                  >
                    {isGenerating ? "Generating Eval Set..." : "Generate Evaluation Set"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
