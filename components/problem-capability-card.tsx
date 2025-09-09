"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, ChevronDown, Upload, Edit3, Check, X, Users, ChevronRight } from "lucide-react"
import metricsExplanations from "@/app/model-evaluation/metricsExplanations"
import { capabilityDetails } from "@/data/capability-details"

interface Problem {
  id: string
  title: string
  userImpact: string
  quotes: string[]
  triggers: string[]
  severity: "High" | "Medium" | "Low"
  affectedUsers: number
}

interface TechnicalReasons {
  id: string
  name: string
  description: string
  capabilities: string[] // Will now contain 3D model technology terms
  selected: boolean
  metrics: Metric[]
  groundTruth?: {
    inputImage: string
    groundTruthImage: string
    isCustomGT: boolean
    customNote?: string
  }
  allocation?: number
}

interface Metric {
  id: string
  name: string
  description: string
  type: "Auto" | "Manual"
  defaultThreshold: number
  unit: string
  selected: boolean
  customThreshold?: number
  technologyLink?: string // Added to show what technology this metric measures
  threshold?: number
}

interface EditingState {
  capabilityId: string | null
  newNote: string
  uploadedImage: string | null
}

interface ProblemCapabilityCardProps {
  problem: Problem
  technicalReasons: TechnicalReasons[]
  onTechnicalReasonsChange: (technicalReasons: TechnicalReasons[]) => void
  onMetricClick?: (metric: Metric, technicalReason: TechnicalReasons, problem: Problem) => void
}

export function ProblemCapabilityCard({
  problem,
  technicalReasons,
  onTechnicalReasonsChange,
  onMetricClick,
}: ProblemCapabilityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedCapabilityConfig, setExpandedCapabilityConfig] = useState<string | null>(null)
  const [expandedGroundTruth, setExpandedGroundTruth] = useState<string | null>(null)
  const [selectedMetricPreview, setSelectedMetricPreview] = useState<string | null>(null)
  const [editingState, setEditingState] = useState<EditingState>({
    capabilityId: null,
    newNote: "",
    uploadedImage: null,
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [animatingThresholds, setAnimatingThresholds] = useState<string | null>(null)
  const [hoveredMetric, setHoveredMetric] = useState<{
    metricName: string
    explanation: any
    position: { x: number; y: number }
  } | null>(null)
  const [hoveredCapability, setHoveredCapability] = useState<{
    capabilityName: string
    explanation: any
    position: { x: number; y: number }
  } | null>(null)

  const handleCapabilityToggle = (capabilityId: string) => {
    const updatedTechnicalReasons = technicalReasons.map((cap) =>
      cap.id === capabilityId ? { ...cap, selected: !cap.selected } : cap,
    )
    onTechnicalReasonsChange(updatedTechnicalReasons)
  }

  const handleCapabilityExpand = (capabilityId: string) => {
    setExpandedCapabilityConfig(expandedCapabilityConfig === capabilityId ? null : capabilityId)
  }

  const handleMetricToggle = (capabilityId: string, metricId: string) => {
    const updatedTechnicalReasons = technicalReasons.map((cap) =>
      cap.id === capabilityId
        ? {
            ...cap,
            metrics: cap.metrics.map((metric) =>
              metric.id === metricId ? { ...metric, selected: !metric.selected } : metric,
            ),
          }
        : cap,
    )
    onTechnicalReasonsChange(updatedTechnicalReasons)
  }

  const handleEditGroundTruth = (capabilityId: string) => {
    setEditingState({
      capabilityId,
      newNote: "",
      uploadedImage: null,
    })
    setExpandedGroundTruth(capabilityId)
  }

  const handleSaveGroundTruth = () => {
    if (!editingState.capabilityId) return

    setAnimatingThresholds(editingState.capabilityId)

    const updatedTechnicalReasons = technicalReasons.map((cap) => {
      if (cap.id === editingState.capabilityId) {
        const updatedMetrics = cap.metrics.map((metric) => {
          const qualityFactor = editingState.uploadedImage ? 0.8 : 1.0
          const newThreshold = metric.defaultThreshold * qualityFactor

          console.log(
            `[v0] Auto-adjusting ${metric.name} threshold from ${metric.defaultThreshold} to ${newThreshold.toFixed(2)}`,
          )

          return {
            ...metric,
            customThreshold: newThreshold,
          }
        })

        return {
          ...cap,
          metrics: updatedMetrics,
          groundTruth: {
            inputImage: cap.groundTruth?.inputImage || "/placeholder.svg?height=200&width=200",
            groundTruthImage:
              editingState.uploadedImage ||
              cap.groundTruth?.groundTruthImage ||
              "/placeholder.svg?height=200&width=200",
            isCustomGT: !!editingState.uploadedImage,
            customNote: editingState.newNote,
          },
        }
      }
      return cap
    })

    onTechnicalReasonsChange(updatedTechnicalReasons)

    setTimeout(() => setAnimatingThresholds(null), 2000)

    setEditingState({ capabilityId: null, newNote: "", uploadedImage: null })
    setExpandedGroundTruth(null)
  }

  const handleCancelEdit = () => {
    uploadedFiles.forEach((file) => {
      if (editingState.uploadedImage) {
        URL.revokeObjectURL(editingState.uploadedImage)
      }
    })
    setUploadedFiles([])
    setEditingState({ capabilityId: null, newNote: "", uploadedImage: null })
    setExpandedGroundTruth(null)
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    setUploadedFiles((prev) => [...prev, ...fileArray])

    // Create object URLs for preview
    const firstFileUrl = URL.createObjectURL(fileArray[0])
    setEditingState((prev) => ({ ...prev, uploadedImage: firstFileUrl }))

    console.log(
      "[v0] Files uploaded:",
      fileArray.map((f) => f.name),
    )
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index)
      // Update preview image if removing the first file
      if (index === 0 && newFiles.length > 0) {
        const newPreviewUrl = URL.createObjectURL(newFiles[0])
        setEditingState((prev) => ({ ...prev, uploadedImage: newPreviewUrl }))
      } else if (newFiles.length === 0) {
        setEditingState((prev) => ({ ...prev, uploadedImage: null }))
      }
      return newFiles
    })
  }

  const handleCapabilityAllocation = (capabilityId: string, allocation: number) => {
    const updatedTechnicalReasons = technicalReasons.map((cap) =>
      cap.id === capabilityId ? { ...cap, allocation } : cap,
    )
    onTechnicalReasonsChange(updatedTechnicalReasons)
  }

  const handleMetricThresholdChange = (capabilityId: string, metricId: string, newThreshold: number) => {
    const updatedTechnicalReasons = technicalReasons.map((cap) =>
      cap.id === capabilityId
        ? {
            ...cap,
            metrics: cap.metrics.map((metric) =>
              metric.id === metricId ? { ...metric, customThreshold: newThreshold } : metric,
            ),
          }
        : cap,
    )
    onTechnicalReasonsChange(updatedTechnicalReasons)
  }

  const handleMetricClick = (metric: Metric, technicalReason: TechnicalReasons) => {
    console.log("[v0] Metric clicked:", metric.name, "from capability:", technicalReason.name)
    if (onMetricClick) {
      console.log("[v0] Calling onMetricClick with metric data")
      onMetricClick(metric, technicalReason, problem)
    } else {
      console.log("[v0] onMetricClick is not available")
    }
  }

  const selectedCapabilities = technicalReasons.filter((cap) => cap.selected)
  const totalAllocation = selectedCapabilities.reduce((sum, cap) => sum + (cap.allocation || 0), 0)

  const getMetricExplanation = (metricName: string) => {
    console.log("[v0] Looking for explanation for metric:", metricName)

    // Handle special cases first
    let key = metricName.toLowerCase()

    // Special mappings for specific metric names
    if (key.includes("δe2000") || key.includes("delta e2000") || key.includes("color difference")) {
      key = "delta-e2000"
    } else if (key.includes("glossiness") && key.includes("accuracy")) {
      key = "glossiness-accuracy"
    } else if (key.includes("roughness") && key.includes("consistency")) {
      key = "roughness-consistency"
    } else if (key.includes("reflection") && key.includes("accuracy")) {
      key = "reflection-accuracy"
    } else if (key.includes("fresnel") && key.includes("consistency")) {
      key = "fresnel-consistency"
    } else if (key.includes("transparency") && key.includes("accuracy")) {
      key = "transparency-accuracy"
    } else if (key.includes("depth") && key.includes("accuracy")) {
      key = "depth-accuracy"
    } else if (key.includes("depth") && key.includes("consistency")) {
      key = "depth-consistency"
    } else if (key.includes("mesh") && key.includes("accuracy")) {
      key = "mesh-accuracy"
    } else if (key.includes("perspective") && key.includes("consistency")) {
      key = "perspective-consistency"
    } else if (key.includes("saturation") && key.includes("balance")) {
      key = "saturation-balance"
    } else if (key.includes("refraction") && key.includes("index")) {
      key = "refraction-index"
    } else {
      // Fallback: general conversion
      key = key
        .replace(/[()%]/g, "") // Remove parentheses and %
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^\w-]/g, "") // Remove non-word characters except hyphens
    }

    console.log("[v0] Converted key:", key)
    const explanation = metricsExplanations[key as keyof typeof metricsExplanations]
    console.log("[v0] Found explanation:", !!explanation)

    return explanation
  }

  const handleMetricMouseEnter = (event: React.MouseEvent, metricName: string) => {
    const explanation = getMetricExplanation(metricName)
    if (explanation) {
      const rect = event.currentTarget.getBoundingClientRect()
      setHoveredMetric({
        metricName,
        explanation,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        },
      })
    }
  }

  const handleMetricMouseLeave = () => {
    setHoveredMetric(null)
  }

  const getCapabilityExplanation = (capabilityName: string) => {
    console.log("[v0] Looking for capability explanation for:", capabilityName)
    const key = capabilityName.toLowerCase().replace(/[^a-z0-9]/g, "-")
    console.log("[v0] Converted capability key:", key)
    const explanation = capabilityDetails[key as keyof typeof capabilityDetails]
    console.log("[v0] Found capability explanation:", !!explanation)
    return explanation
  }

  const handleCapabilityMouseEnter = (event: React.MouseEvent, capabilityName: string) => {
    const explanation = getCapabilityExplanation(capabilityName)
    if (explanation) {
      const rect = event.currentTarget.getBoundingClientRect()
      setHoveredCapability({
        capabilityName,
        explanation,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        },
      })
    }
  }

  const handleCapabilityMouseLeave = () => {
    setHoveredCapability(null)
  }

  const getMetricPreviewImages = (metricName: string) => {
    const metricType = metricName.toLowerCase()

    if (metricType.includes("glossiness") || metricType.includes("roughness")) {
      return [
        {
          id: 1,
          inputDesc: "Glossy metal surface under studio lighting",
          gtDesc: "Reference: mirror-finish steel",
          inputImg: "/glossy-sphere.png",
          gtImg: "https://cozendbromejxawm.public.blob.vercel-storage.com/sphere%E2%80%94%E2%80%943d.png",
        },
        {
          id: 2,
          inputDesc: "Rough concrete texture",
          gtDesc: "Reference: sandpaper roughness",
          inputImg: "https://cozendbromejxawm.public.blob.vercel-storage.com/stone%20sphere.png",
          gtImg: "https://cozendbromejxawm.public.blob.vercel-storage.com/rough_sphere3D.png",
        },
      ]
    } else if (metricType.includes("color") || metricType.includes("δe2000")) {
      return [
        {
          id: 1,
          inputDesc: "Red fabric under warm light",
          gtDesc: "Reference: true red color swatch",
          inputImg: "/red-fabric-warm-light.png",
          gtImg: "/red-color-swatch.png",
        },
        {
          id: 2,
          inputDesc: "Blue object under cool light",
          gtDesc: "Reference: standard blue",
          inputImg: "/blue-glowing-orb.png",
          gtImg: "/standard-blue.png",
        },
        {
          id: 3,
          inputDesc: "Green surface mixed lighting",
          gtDesc: "Reference: calibrated green",
          inputImg: "/placeholder.svg?height=120&width=120",
          gtImg: "/placeholder.svg?height=120&width=120",
        },
      ]
    } else if (metricType.includes("depth") || metricType.includes("mesh")) {
      return [
        {
          id: 1,
          inputDesc: "3D object with depth variation",
          gtDesc: "Reference: LiDAR depth map",
          inputImg: "/placeholder.svg?height=120&width=120",
          gtImg: "/placeholder.svg?height=120&width=120",
        },
        {
          id: 2,
          inputDesc: "Complex geometric surface",
          gtDesc: "Reference: CAD model mesh",
          inputImg: "/placeholder.svg?height=120&width=120",
          gtImg: "/placeholder.svg?height=120&width=120",
        },
        {
          id: 3,
          inputDesc: "Curved surface topology",
          gtDesc: "Reference: 3D scan data",
          inputImg: "/placeholder.svg?height=120&width=120",
          gtImg: "/placeholder.svg?height=120&width=120",
        },
      ]
    } else {
      // Default images for other metrics
      return [
        {
          id: 1,
          inputDesc: "Cat under red light, fur texture",
          gtDesc: "Reference: real ginger cat fur",
          inputImg: "/placeholder.svg?height=120&width=120",
          gtImg: "/placeholder.svg?height=120&width=120",
        },
        {
          id: 2,
          inputDesc: "Metal sphere, blue lighting",
          gtDesc: "Reference: brushed steel material",
          inputImg: "/placeholder.svg?height=120&width=120",
          gtImg: "/placeholder.svg?height=120&width=120",
        },
        {
          id: 3,
          inputDesc: "Fabric under warm light",
          gtDesc: "Reference: cotton weave pattern",
          inputImg: "/placeholder.svg?height=120&width=120",
          gtImg: "/placeholder.svg?height=120&width=120",
        },
      ]
    }
  }

  return (
    <>
      <Card className="border border-slate-200 bg-gray-100 shadow-lg w-full">
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center text-slate-900 leading-tight text-xl font-semibold">
                {problem.title}
                {totalAllocation > 0 && (
                  <Badge className="ml-auto bg-blue-50 text-blue-700 border-blue-200 font-medium text-base">
                    Total: {totalAllocation} samples
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-base text-zinc-600 mx-0 mr-2.5">{problem.userImpact}</CardDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={`font-medium text-sm ${
                      problem.severity === "High"
                        ? "border-red-200 text-red-700 bg-red-50"
                        : problem.severity === "Medium"
                          ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                          : "border-green-200 text-green-700 bg-green-50"
                    }`}
                  >
                    {problem.severity} Priority
                  </Badge>

                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>{problem.affectedUsers} users affected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          <CardContent className="space-y-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2 hover:text-slate-900 px-4 py-3 h-auto flex items-center bg-[rgba(63,80,185,1)] text-slate-100 w-60 justify-center ml-auto text-left text-base"
            >
              {isExpanded ? "Collapse" : "Adjust Setting"}
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            </Button>
          </CardContent>

          {isExpanded && (
            <div className="border-t border-slate-200 pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-slate-900 text-xl font-semibold">Capability Breakdown</h2>
              </div>

              <div className="space-y-4">
                {technicalReasons.map((capability) => (
                  <div key={capability.id} className="space-y-0">
                    <Card
                      className={`transition-all duration-300 ease-in-out overflow-hidden bg-[rgba(251,252,253,1)] border shadow-lg ${
                        capability.selected
                          ? "border-blue-200 bg-blue-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <CardContent
                        className="p-4 cursor-pointer py-1.5"
                        onClick={() => handleCapabilityExpand(capability.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                capability.selected ? "border-blue-600 bg-blue-600" : "border-slate-300"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCapabilityToggle(capability.id)
                              }}
                            >
                              {capability.selected && <Check className="h-3 w-3 text-white" />}
                            </div>

                            <div className="space-y-1">
                              <h3 className="text-slate-900 py-[5px] font-semibold text-lg">{capability.name}</h3>
                              <div className="flex items-center gap-2">
                                {(() => {
                                  console.log("[v0] Rendering capability badges for:", capability.name)
                                  console.log("[v0] Capabilities array:", capability.capabilities)
                                  console.log("[v0] Is array?", Array.isArray(capability.capabilities))

                                  if (!capability.capabilities) {
                                    console.log("[v0] No capabilities array found")
                                    return null
                                  }

                                  if (!Array.isArray(capability.capabilities)) {
                                    console.log("[v0] Capabilities is not an array, converting...")
                                    const caps =
                                      typeof capability.capabilities === "string"
                                        ? [capability.capabilities]
                                        : Object.values(capability.capabilities || {})
                                    return caps.map((cap, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="border-slate-200 text-slate-600 font-mono py-0 font-semibold bg-sky-100 text-sm cursor-help hover:bg-sky-200 transition-colors"
                                        onMouseEnter={(e) => handleCapabilityMouseEnter(e, cap)}
                                        onMouseLeave={handleCapabilityMouseLeave}
                                      >
                                        {cap}
                                      </Badge>
                                    ))
                                  }

                                  return capability.capabilities.map((cap, index) => {
                                    console.log("[v0] Rendering badge for capability:", cap)
                                    return (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="border-slate-200 text-slate-600 font-mono py-0 font-semibold bg-sky-100 text-sm cursor-help hover:bg-sky-200 transition-colors"
                                        onMouseEnter={(e) => handleCapabilityMouseEnter(e, cap)}
                                        onMouseLeave={handleCapabilityMouseLeave}
                                      >
                                        {cap}
                                      </Badge>
                                    )
                                  })
                                })()}
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                                {capability.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {capability.selected && (
                              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                <div className="text-right">
                                  <div className="text-slate-600 mb-1 text-base">Samples</div>
                                  <Badge
                                    variant="outline"
                                    className="bg-white border-slate-200 text-slate-700 font-medium text-sm"
                                  >
                                    {capability.allocation || 50}
                                  </Badge>
                                </div>
                                <div className="w-20">
                                  <Slider
                                    value={[capability.allocation || 50]}
                                    onValueChange={([value]) => handleCapabilityAllocation(capability.id, value)}
                                    max={200}
                                    min={10}
                                    step={10}
                                    className="w-full"
                                  />
                                </div>
                              </div>
                            )}
                            <ChevronDown
                              className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                                expandedCapabilityConfig === capability.id ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </CardContent>

                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          expandedCapabilityConfig === capability.id
                            ? "max-h-[2000px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                        style={{
                          overflow: "hidden",
                        }}
                      >
                        <div className="border-t border-slate-200 bg-slate-50/50">
                          <CardContent className="p-6 space-y-6 bg-gray-50 px-[54px] py-0">
                            <div className="space-y-6">
                              <div className="space-y-4">
                                <h5 className="text-slate-900 font-semibold text-xl">Quantitative Metrics</h5>
                                <p className="text-slate-600 text-sm">
                                  Numerical measurements calculated by mathematical formulas and algorithms
                                </p>

                                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                  <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                      <tr>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                                          Metric & Formula
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                                          Recommend Threshold
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {capability.metrics
                                        .filter(
                                          (metric) =>
                                            metric.type === "Auto" || metric.unit === "%" || metric.unit === "RMSE",
                                        )
                                        .map((metric, index) => {
                                          const currentValue = metric.customThreshold || metric.defaultThreshold

                                          return (
                                            <tr
                                              key={metric.id}
                                              className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                                              onClick={() => handleMetricClick(metric, capability)}
                                            >
                                              <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                  <div
                                                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                                                      metric.selected
                                                        ? "border-blue-600 bg-blue-600"
                                                        : "border-slate-300"
                                                    }`}
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      handleMetricToggle(capability.id, metric.id)
                                                    }}
                                                  >
                                                    {metric.selected && <Check className="h-2.5 w-2.5 text-white" />}
                                                  </div>
                                                  <div>
                                                    <div className="flex items-center gap-2">
                                                      <span className="font-medium text-slate-900 text-sm">
                                                        {metric.name}
                                                      </span>
                                                      <Badge
                                                        variant="default"
                                                        className="text-xs bg-green-100 text-green-700 border-green-200"
                                                      >
                                                        Formula-based
                                                      </Badge>
                                                      {metric.technologyLink && (
                                                        <Badge
                                                          variant="outline"
                                                          className="text-xs bg-blue-50 border-blue-200 text-blue-700 font-mono"
                                                        >
                                                          {metric.technologyLink}
                                                        </Badge>
                                                      )}
                                                    </div>
                                                    <p className="text-slate-600 text-xs mt-1">{metric.description}</p>
                                                  </div>
                                                </div>
                                              </td>
                                              <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                  <span className="font-medium text-slate-900">
                                                    {currentValue}
                                                    {metric.unit === "%" ? "%" : ` ${metric.unit}`}
                                                  </span>
                                                </div>
                                              </td>
                                            </tr>
                                          )
                                        })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h5 className="text-slate-900 font-semibold text-xl">Qualitative Assessments</h5>
                                <p className="text-slate-600 text-sm">
                                  Subjective evaluations requiring human judgment and visual assessment
                                </p>

                                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                  <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                      <tr>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                                          Assessment Item
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
                                      {capability.metrics.map((metric, index) => {
                                        const qualitativeExamples = {
                                          "Glossiness Accuracy (%)": {
                                            perfect:
                                              "Surface glossiness perfectly matches reference material properties",
                                            acceptable:
                                              "Minor differences in glossiness that don't affect overall appearance",
                                            fail: "Completely wrong glossiness (matte appears mirror-like or vice versa)",
                                          },
                                          "Roughness Consistency": {
                                            perfect:
                                              "Surface roughness consistent across all viewing angles and lighting",
                                            acceptable: "Slight variations in roughness that are barely noticeable",
                                            fail: "Roughness changes dramatically between viewpoints",
                                          },
                                          "Reflection Accuracy (%)": {
                                            perfect: "Reflection clarity and blurriness perfectly matches reference",
                                            acceptable: "Visible differences in reflection clarity/blurriness",
                                            fail: "Reflective properties completely wrong (mirror instead of matte)",
                                          },
                                          "Transparency Accuracy": {
                                            perfect: "Light transmission and refraction perfectly accurate",
                                            acceptable: "Minor distortions in transparency or refraction",
                                            fail: "Opaque material appears transparent or vice versa",
                                          },
                                        }

                                        const examples = qualitativeExamples[metric.name] || {
                                          perfect: "Visual quality perfectly matches reference standards",
                                          acceptable: "Minor visual deviations that don't impact overall quality",
                                          fail: "Significant visual defects that make output unusable",
                                        }

                                        return (
                                          <tr
                                            key={metric.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                                            onClick={() => handleMetricClick(metric, capability)}
                                          >
                                            <td className="px-4 py-3">
                                              <div className="font-medium text-slate-900 text-sm">{metric.name}</div>
                                              <div className="text-slate-600 text-xs mt-1">
                                                Visual assessment criteria
                                              </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                                              {examples.perfect}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                                              {examples.acceptable}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                                              {examples.fail}
                                            </td>
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4 w-full max-w-4xl">
                              <div className="flex items-center">
                                <h5 className="text-slate-900 font-semibold text-xl mx-3.5 ml-1">{"Example Input"}</h5>
                                {(() => {
                                  // Default to first metric if none selected
                                  const selectedMetric = selectedMetricPreview
                                    ? capability.metrics.find((m) => m.id === selectedMetricPreview)
                                    : capability.metrics[0] // Default to first metric

                                  return selectedMetric ? (
                                    <Badge
                                      variant="outline"
                                      className="text-sm bg-blue-50 border-blue-200 text-blue-700"
                                    >
                                      {selectedMetric.name}
                                    </Badge>
                                  ) : null
                                })()}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                                {(() => {
                                  const selectedMetric = selectedMetricPreview
                                    ? capability.metrics.find((m) => m.id === selectedMetricPreview)
                                    : capability.metrics[0] // Default to first metric

                                  const imagesToShow = selectedMetric
                                    ? getMetricPreviewImages(selectedMetric.name)
                                    : [
                                        {
                                          id: 1,
                                          inputDesc: "Cat under red light, fur texture",
                                          gtDesc: "Reference: real ginger cat fur",
                                          inputImg: "/placeholder.svg?height=120&width=120",
                                          gtImg: "/placeholder.svg?height=120&width=120",
                                        },
                                        {
                                          id: 2,
                                          inputDesc: "Metal sphere, blue lighting",
                                          gtDesc: "Reference: brushed steel material",
                                          inputImg: "/placeholder.svg?height=120&width=120",
                                          gtImg: "/placeholder.svg?height=120&width=120",
                                        },
                                        {
                                          id: 3,
                                          inputDesc: "Fabric under warm light",
                                          gtDesc: "Reference: cotton weave pattern",
                                          inputImg: "/placeholder.svg?height=120&width=120",
                                          gtImg: "/placeholder.svg?height=120&width=120",
                                        },
                                      ]

                                  return imagesToShow.map((example) => (
                                    <Card
                                      key={example.id}
                                      className="border border-slate-200 bg-white shadow-lg rounded-md"
                                    >
                                      <CardContent className="p-3 py-0">
                                        <div className="font-medium text-slate-900 mb-3 text-center text-base">
                                          Preview {example.id}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div className="text-center space-y-2">
                                            <div className="font-medium text-slate-700 text-sm">Input</div>
                                            <div className="aspect-square w-full border border-slate-200 rounded overflow-hidden">
                                              <img
                                                src={example.inputImg || "/placeholder.svg"}
                                                alt="Input preview"
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                            <div className="text-xs text-slate-600 leading-tight">
                                              {example.inputDesc}
                                            </div>
                                          </div>
                                          <div className="text-center space-y-2">
                                            <div className="font-medium text-slate-700 text-sm">Ground Truth</div>
                                            <div className="aspect-square w-full border border-slate-200 rounded overflow-hidden">
                                              <img
                                                src={example.gtImg || "/placeholder.svg"}
                                                alt="Ground truth preview"
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                            <div className="text-xs text-slate-600 leading-tight">{example.gtDesc}</div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))
                                })()}
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditGroundTruth(capability.id)}
                                className="gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 leading-[2.75rem] py-0 my-1.5"
                              >
                                <Edit3 className="h-3 w-3" />
                                Customize Ground Truth References
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {expandedGroundTruth && editingState.capabilityId && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={handleCancelEdit} />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-xl animate-in slide-in-from-bottom duration-300">
              <div className="container mx-auto max-w-4xl p-6">
                <Card className="border-2 border-blue-200 bg-blue-50/30">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-900">
                          Edit Ground Truth Reference
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-600">
                          {" Just upload what U think is good cases!Or Describe them with text!😉"}
                        </CardDescription>
                        <CardDescription className="text-sm text-slate-600 py-2 ">
                          {"Automatically adjust all metric thresholds for your need"}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="gap-1 text-slate-600 hover:text-slate-900"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-900">Upload Reference Image</Label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-white">
                          <Upload className="h-6 w-6 mx-auto text-slate-400 mb-2" />
                          <p className="text-sm text-slate-600 mb-3">Drag & drop or click to upload multiple files</p>
                          <input
                            type="file"
                            id="file-upload"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files)}
                            className="hidden"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white border-slate-200 text-slate-700"
                            onClick={() => document.getElementById("file-upload")?.click()}
                          >
                            Choose Files
                          </Button>
                          {uploadedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <p className="text-xs text-green-600 font-medium">
                                ✅ {uploadedFiles.length} file(s) uploaded
                              </p>
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {uploadedFiles.map((file, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between bg-slate-50 rounded px-2 py-1 text-xs"
                                  >
                                    <span className="text-slate-700 truncate">{file.name}</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRemoveFile(index)}
                                      className="h-4 w-4 p-0 text-slate-400 hover:text-red-500"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-900">Add Note</Label>
                        <Textarea
                          value={editingState.newNote}
                          onChange={(e) => setEditingState((prev) => ({ ...prev, newNote: e.target.value }))}
                          placeholder="Add any notes about this ground truth reference..."
                          className="bg-white border-slate-200"
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button size="sm" onClick={handleSaveGroundTruth} className="gap-2">
                        <Save className="h-3 w-3" />
                        Save & Auto-adjust Thresholds
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="gap-2 bg-white border-slate-200 text-slate-700"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </Card>

      {hoveredMetric && (
        <div
          className="fixed z-[9999] bg-white border border-slate-200 rounded-lg shadow-xl p-4 max-w-80 pointer-events-none"
          style={{
            left: hoveredMetric.position.x - 160, // Center the tooltip
            top: hoveredMetric.position.y - 10,
            transform: "translateY(-100%)",
          }}
        >
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">{hoveredMetric.explanation.userFriendlyName}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{hoveredMetric.explanation.explanation}</p>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <p className="text-sm text-slate-700 font-medium mb-2">What it means:</p>
              <p className="text-sm text-slate-600">{hoveredMetric.explanation.whatItMeans}</p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                Recommended: <span className="font-medium">{hoveredMetric.explanation.recommendedValue}</span>
              </span>
              <Badge variant={hoveredMetric.explanation.higherIsBetter ? "default" : "secondary"} className="text-xs">
                {hoveredMetric.explanation.higherIsBetter ? "Higher is better" : "Lower is better"}
              </Badge>
            </div>

            {hoveredMetric.explanation.examples && (
              <div className="border-t border-slate-200 pt-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-green-700">✓ Good:</span>
                    <p className="text-slate-600 mt-1">{hoveredMetric.explanation.examples.good}</p>
                  </div>
                  <div>
                    <span className="font-medium text-red-700">✗ Bad:</span>
                    <p className="text-slate-600 mt-1">{hoveredMetric.explanation.examples.bad}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {hoveredCapability && (
        <div
          className="fixed z-[9999] bg-white border border-slate-200 rounded-lg shadow-xl p-4 max-w-96 pointer-events-none"
          style={{
            left: hoveredCapability.position.x - 192, // Center the tooltip
            top: hoveredCapability.position.y - 10,
            transform: "translateY(-100%)",
          }}
        >
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">{hoveredCapability.explanation.name}</h4>
              <Badge variant="outline" className="text-xs mb-2">
                {hoveredCapability.explanation.category}
              </Badge>
              <p className="text-sm text-slate-600 leading-relaxed">
                {hoveredCapability.explanation.businessExplanation}
              </p>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <p className="text-sm text-slate-700 font-medium mb-2">Technical Details:</p>
              <p className="text-sm text-slate-600">{hoveredCapability.explanation.technicalExplanation}</p>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <p className="text-sm text-slate-700 font-medium mb-2">Business Impact:</p>
              <p className="text-sm text-slate-600">{hoveredCapability.explanation.impact}</p>
            </div>

            {hoveredCapability.explanation.examples && hoveredCapability.explanation.examples.length > 0 && (
              <div className="border-t border-slate-200 pt-3">
                <p className="text-sm text-slate-700 font-medium mb-2">Examples:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {hoveredCapability.explanation.examples.slice(0, 2).map((example: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
