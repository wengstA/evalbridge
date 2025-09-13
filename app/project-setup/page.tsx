"use client"

import type React from "react"
import { useWorkflow } from "@/contexts/workflow-context"
import { useSearchParams } from "next/navigation"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sidebar } from "@/components/sidebar"
import { ProjectSelector } from "@/components/project-selector"
import { TagInput } from "@/components/ui/tag-input"
import {
  ArrowRight,
  Info,
  Upload,
  FileText,
  Zap,
  Sparkles,
  Loader2,
  Settings,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"


export default function ProjectSetup() {
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('mode') === 'edit'
  
  // Existing product data
  const existingProductData = {
    productName: "Copilot 3D",
    productType: "AI-powered 3D asset generation platform",
    targetUsers: "Game developers, 3D artists, content creators",
    useCases: ["3D Character Generation", "Environment Creation", "Asset Optimization", "Style Transfer"],
    businessGoals: "Enable rapid 3D content creation for game development and digital media production",
    technicalConstraints: "Must generate watertight meshes suitable for 3D printing and real-time rendering",
  }
  
  // Empty data for new product
  const emptyProductData = {
    productName: "",
    productType: "",
    targetUsers: "",
    useCases: [] as string[],
    businessGoals: "",
    technicalConstraints: "",
  }
  
  const [formData, setFormData] = useState(isEditMode ? existingProductData : emptyProductData)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(
    isEditMode ? [
      // Mock existing files for edit mode
      new File(["Product Requirements Document"], "product-requirements.pdf", { type: "application/pdf" }),
      new File(["Technical Specifications"], "tech-specs.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }),
    ] : []
  )
  const [isDragOver, setIsDragOver] = useState(false)
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false)
  const [isContinuing, setIsContinuing] = useState(false)

  const { completeStep, navigateToStep } = useWorkflow()

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    setUploadedFiles((prev) => [...prev, ...fileArray])

    // Auto-analyze uploaded files
    handleAutoAnalysis()
  }

  const handleAutoAnalysis = () => {
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

  const handleContinueToFeedback = async () => {
    setIsContinuing(true)
    
    // 模拟异步处理
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (isEditMode) {
      // Navigate back to dashboard for edit mode
      window.location.href = '/'
    } else {
      // Continue to workflow for new product mode
      completeStep("project-setup")
      navigateToStep("feedback-analysis")
    }
    setIsContinuing(false)
  }


  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto ml-16">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-space-grotesk">
                {isEditMode ? "Product Settings" : "New Product Setup"}
              </h1>
              <p className="text-muted-foreground">
                {isEditMode 
                  ? "Edit your product information and configuration"
                  : "Define your product context to get started"
                }
              </p>
            </div>
            <ProjectSelector />
          </div>
        </header>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-primary">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-primary text-primary-foreground">
                <Settings className="h-4 w-4" />
              </div>
              <span className="font-medium">
                {isEditMode ? "Edit Product Information" : "Product Context Understanding"}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Product Status Indicator */}
              {isEditMode && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Editing existing product:</strong> All fields are pre-populated with current product data. Modify any information as needed.
                  </AlertDescription>
                </Alert>
              )}

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
                        {/* <Button
                          onClick={() => uploadedFiles.length > 0 && handleAutoAnalysis()}
                          disabled={uploadedFiles.length === 0 || isAutoAnalyzing}
                          className="gap-2"
                        >
                          <Zap className="h-4 w-4" />
                          {isAutoAnalyzing ? "Analyzing..." : "One-Click Generation"}
                        </Button> */}
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
                    <CardTitle className="font-space-grotesk flex items-center gap-2">
                      Basic Information
                      {isEditMode && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Pre-filled
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {isEditMode ? "Edit your AI product details" : "Tell us about your AI product"}
                    </CardDescription>
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
                    <CardTitle className="font-space-grotesk flex items-center gap-2">
                      Use Cases & Requirements
                      {isEditMode && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Pre-filled
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {isEditMode ? "Edit your product use cases and requirements" : "Describe how your product will be used"}
                    </CardDescription>
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
                <Button onClick={handleContinueToFeedback} disabled={!isFormValid || isContinuing} className="gap-2">
                  {isContinuing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEditMode ? "Saving..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      {isEditMode ? "Save Changes" : "Continue to Requirements Analysis"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
        </div>
      </main>
    </div>
  )
}
