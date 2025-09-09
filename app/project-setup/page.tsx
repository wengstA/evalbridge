"use client"

import type React from "react"
import { useWorkflow } from "@/contexts/workflow-context"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import { ProjectSelector } from "@/components/project-selector"
import { TagInput } from "@/components/ui/tag-input"
import {
  Sparkles,
  CheckCircle,
  ArrowRight,
  Info,
  Upload,
  FileText,
  Zap,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const mockCapabilities = [
  {
    name: "Image-to-3D Reconstruction",
    priority: "High",
    description: "Core ability to generate a 3D model from a single 2D image.",
  },
  {
    name: "Object Segmentation & Understanding",
    priority: "High",
    description: "Accurately identifies and isolates the main subject from its background in the source image.",
  },
  {
    name: "Occluded Geometry Generation",
    priority: "Medium",
    description: "Intelligently infers and creates the geometry for parts of the object not visible in the photo.",
  },
  {
    name: "Texture Projection & Synthesis",
    priority: "Medium",
    description: "Applies textures from the image to the 3D model and creates matching textures for unseen areas.",
  },
  {
    name: "Style & Aesthetic Coherence",
    priority: "High",
    description: "Ensures the final 3D model's style is consistent with the source image (e.g., realistic, cartoon).",
  },
]

export default function ProjectSetup() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    productName: "",
    productType: "",
    targetUsers: "",
    useCases: [] as string[], // Changed from string to string array for tag support
    businessGoals: "",
    technicalConstraints: "",
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false)

  const [capabilities, setCapabilities] = useState(mockCapabilities)
  const [editingCapability, setEditingCapability] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: "", description: "", priority: "Medium" })

  const { completeStep, navigateToStep } = useWorkflow()

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false)
      setAnalysisComplete(true)
      setStep(3)
    }, 200)
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    setUploadedFiles((prev) => [...prev, ...fileArray])

    // Auto-analyze uploaded files
    handleAutoAnalysis(fileArray)
  }

  const handleAutoAnalysis = (files: File[]) => {
    setIsAutoAnalyzing(true)

    // Simulate file analysis and auto-fill form
    setTimeout(() => {
      setFormData({
        productName: "Copilot3D  ",
        productType: "AIGC Image-to-3D Modeling",
        targetUsers:
          "General consumers—casual creators, students, hobbyists, small online sellers, and social media users—who want to turn photos into shareable 3D objects without 3D expertise.",
        useCases: [
          "Generate 3D models from photos for social posts",
          "AR placement for home décor visualization",
          "Quick 3D assets for indie games and modding",
          "Create printable figurines and prototypes",
          "Interactive 3D views for marketplace listings",
          "Turn selfies into avatars and stickers",
          "Classroom projects for art and science models",
        ],
        businessGoals: "",
        technicalConstraints: "Generating 3D models from text is not supported.",
      })
      setIsAutoAnalyzing(false)
    }, 2000)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const isFormValid = formData.productName && formData.productType && formData.useCases.length > 0

  const handleContinueToFeedback = () => {
    completeStep("project-setup")
    navigateToStep("feedback-analysis")
  }

  const handleEditCapability = (index: number) => {
    const capability = capabilities[index]
    setEditForm({
      name: capability.name,
      description: capability.description,
      priority: capability.priority,
    })
    setEditingCapability(index)
  }

  const handleSaveCapability = (index: number) => {
    setCapabilities((prev) => prev.map((cap, i) => (i === index ? { ...cap, ...editForm } : cap)))
    setEditingCapability(null)
    setEditForm({ name: "", description: "", priority: "Medium" })
  }

  const handleCancelEdit = () => {
    setEditingCapability(null)
    setEditForm({ name: "", description: "", priority: "Medium" })
  }

  const handleDeleteCapability = (index: number) => {
    setCapabilities((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddCapability = () => {
    const newCapability = {
      name: "New Capability",
      description: "Describe this capability...",
      priority: "Medium",
    }
    setCapabilities((prev) => [...prev, newCapability])
    setEditingCapability(capabilities.length)
    setEditForm(newCapability)
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "High":
        return { variant: "destructive" as const, color: "text-red-600" }
      case "Medium":
        return { variant: "secondary" as const, color: "text-orange-600" }
      case "Low":
        return { variant: "outline" as const, color: "text-green-600" }
      default:
        return { variant: "secondary" as const, color: "text-gray-600" }
    }
  }

  const getPriorityOrder = (priority: string) => {
    switch (priority) {
      case "High":
        return 1
      case "Medium":
        return 2
      case "Low":
        return 3
      default:
        return 4
    }
  }

  const sortedCapabilities = [...capabilities].sort(
    (a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority),
  )

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto ml-16">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-space-grotesk">Project Setup</h1>
              <p className="text-muted-foreground">
                Define your product context and discover required model capabilities
              </p>
            </div>
            <ProjectSelector />
          </div>
        </header>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <span className="font-medium">Product Context</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span className="font-medium">AI Analysis</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
              <span className="font-medium">Model Capabilities Requirement </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragOver ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold font-space-grotesk">Quick Setup with Files</h3>
                        <p className="text-muted-foreground">
                          Drop your product documents, requirements, or specifications here for instant analysis
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById("file-upload")?.click()}
                          disabled={isAutoAnalyzing}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Files
                        </Button>
                        <Button
                          onClick={() => uploadedFiles.length > 0 && handleAutoAnalysis(uploadedFiles)}
                          disabled={uploadedFiles.length === 0 || isAutoAnalyzing}
                          className="gap-2"
                        >
                          <Zap className="h-4 w-4" />
                          {isAutoAnalyzing ? "Analyzing..." : "One-Click Generation"}
                        </Button>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.md"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                    </div>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium text-sm">Uploaded Files:</h4>
                      <div className="flex flex-wrap gap-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isAutoAnalyzing && (
                    <Alert className="mt-4">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <AlertDescription>Analyzing your files and auto-filling the form fields...</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Provide details about your product and use cases. Our AI will analyze this information to identify the
                  specific model capabilities your product requires.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-space-grotesk">Basic Infomation</CardTitle>
                    <CardDescription>Tell us about your AI product</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName">AI Application Name</Label>
                      <Input
                        className="bg-white"
                        id="productName"
                        placeholder="e.g., Virtual Try-On 3D Model Generator"
                        value={formData.productName}
                        onChange={(e) => handleInputChange("productName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productType">Product Model Type</Label>
                      <Input
                        className="bg-white"
                        id="productType"
                        placeholder="e.g., text-Image Genration Model"
                        value={formData.productType}
                        onChange={(e) => handleInputChange("productType", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetUsers">Target Users</Label>
                      <Textarea
                        className="bg-white"
                        id="targetUsers"
                        placeholder="Describe your target Users!"
                        value={formData.targetUsers}
                        onChange={(e) => handleInputChange("targetUsers", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-space-grotesk">Use Cases & Requirements</CardTitle>
                    <CardDescription>Describe how your product will be used</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="useCases">Primary Use Cases</Label>
                      <TagInput
                        tags={formData.useCases}
                        onTagsChange={(tags) => handleInputChange("useCases", tags)}
                        placeholder="e.g., Generate 3D models from photos for social posts"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="font-space-grotesk">Technical Context(Optional)</CardTitle>
                  <CardDescription>Additional technical requirements and constraints</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Textarea
                      className="bg-white"
                      id="technicalConstraints"
                      placeholder="Tell me more about your Model! I could do better with more context!"
                      value={formData.technicalConstraints}
                      onChange={(e) => handleInputChange("technicalConstraints", e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!isFormValid} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Analyze Requirements
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-xl font-bold font-space-grotesk">
                      Analyzing Your Pruduct's Model Capabilities Requirements
                    </h2>
                    <p className="text-muted-foreground">
                      Our AI is processing your product context to identify the specific model capabilities you'll
                      need...
                    </p>
                    <div className="flex justify-center">
                      <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                        {isAnalyzing ? "Analyzing..." : "Start Analysis"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 3 && analysisComplete && (
            <div className="max-w-4xl mx-auto space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Analysis complete! Based on your product context, we've identified the key model capabilities you'll
                  need.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-space-grotesk">Required Model Capabilities</CardTitle>
                      <CardDescription>
                        These capabilities are essential for your "{formData.productName}" project
                      </CardDescription>
                    </div>
                    <Button onClick={handleAddCapability} variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Plus className="h-4 w-4" />
                      Add Capability
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sortedCapabilities.map((capability, index) => {
                      const originalIndex = capabilities.findIndex((cap) => cap === capability)
                      return (
                        <div
                          key={originalIndex}
                          className="p-6 bg-white border-2 border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow space-y-4"
                        >
                          {editingCapability === originalIndex ? (
                            // Edit mode
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label htmlFor={`edit-name-${originalIndex}`}>Capability Name</Label>
                                <Input
                                  id={`edit-name-${originalIndex}`}
                                  value={editForm.name}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                  className="bg-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`edit-description-${originalIndex}`}>Description</Label>
                                <Textarea
                                  id={`edit-description-${originalIndex}`}
                                  value={editForm.description}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                                  className="bg-white"
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`edit-priority-${originalIndex}`}>Priority Level</Label>
                                <select
                                  id={`edit-priority-${originalIndex}`}
                                  value={editForm.priority}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, priority: e.target.value }))}
                                  className="w-full px-3 py-2 border border-input bg-white rounded-md text-sm"
                                >
                                  <option value="High">High Priority</option>
                                  <option value="Medium">Medium Priority</option>
                                  <option value="Low">Low Priority</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button onClick={() => handleSaveCapability(originalIndex)} size="sm" className="gap-2">
                                  <Save className="h-3 w-3" />
                                  Save
                                </Button>
                                <Button
                                  onClick={handleCancelEdit}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 bg-transparent"
                                >
                                  <X className="h-3 w-3" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <>
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-slate-900 mb-2">{capability.name}</h3>
                                    <p className="text-slate-600 leading-relaxed">{capability.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <Badge
                                    variant={getPriorityVariant(capability.priority).variant}
                                    className="font-medium"
                                  >
                                    {capability.priority} Priority
                                  </Badge>
                                  <Button
                                    onClick={() => handleEditCapability(originalIndex)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteCapability(originalIndex)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      capability.priority === "High"
                                        ? "bg-red-500"
                                        : capability.priority === "Medium"
                                          ? "bg-orange-500"
                                          : "bg-green-500"
                                    }`}
                                  />
                                  <span
                                    className={`text-sm font-medium ${getPriorityVariant(capability.priority).color}`}
                                  >
                                    {capability.priority} Priority
                                  </span>
                                </div>
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      capability.priority === "High"
                                        ? "bg-red-500 w-full"
                                        : capability.priority === "Medium"
                                          ? "bg-orange-500 w-2/3"
                                          : "bg-green-500 w-1/3"
                                    }`}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-space-grotesk">Next Steps</CardTitle>
                  <CardDescription>Recommended actions based on your capability requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Create a Feedback Report </h4>
                        <p className="text-sm text-muted-foreground">
                          Gather real user feedback to identify specific issues with these capabilities
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Build Evaluation Sets</h4>
                        <p className="text-sm text-muted-foreground">
                          Create targeted evaluations for each identified Issues
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Eval & Iterate</h4>
                        <p className="text-sm text-muted-foreground">
                          Run evaluations and refine your model based on results
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back to Setup
                </Button>
                <Button className="gap-2" onClick={handleContinueToFeedback}>
                  Continue to Feedback Analysis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
