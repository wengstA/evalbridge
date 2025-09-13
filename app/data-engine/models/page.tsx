"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import { ProjectSelector } from "@/components/project-selector"
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Database,
  Activity,
  AlertTriangle,
  Info,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"

interface ModelConfig {
  id: string
  name: string
  endpoint: string
  apiKey: string
  modelType: string
  description: string
  status: "active" | "inactive" | "testing"
  lastUsed: string
  parameters: Record<string, any>
}

const mockModels: ModelConfig[] = [
  {
    id: "1",
    name: "GPT-4 Vision",
    endpoint: "https://api.openai.com/v1/chat/completions",
    apiKey: "sk-***...***",
    modelType: "Text-to-Image",
    description: "Advanced multimodal model for image generation and analysis",
    status: "active",
    lastUsed: "2 hours ago",
    parameters: { temperature: 0.7, max_tokens: 1024 },
  },
  {
    id: "2",
    name: "DALL-E 3",
    endpoint: "https://api.openai.com/v1/images/generations",
    apiKey: "sk-***...***",
    modelType: "Image Generation",
    description: "High-quality image generation from text prompts",
    status: "active",
    lastUsed: "1 day ago",
    parameters: { size: "1024x1024", quality: "hd" },
  },
  {
    id: "3",
    name: "Stable Diffusion XL",
    endpoint: "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
    apiKey: "sk-***...***",
    modelType: "Image Generation",
    description: "Open-source image generation model",
    status: "testing",
    lastUsed: "Never",
    parameters: { steps: 20, cfg_scale: 7 },
  },
  {
    id: "4",
    name: "Midjourney API",
    endpoint: "https://api.midjourney.com/v1/generate",
    apiKey: "mj-***...***",
    modelType: "Image Generation",
    description: "Creative image generation with artistic styles",
    status: "inactive",
    lastUsed: "1 week ago",
    parameters: { style: "vivid", aspect_ratio: "1:1" },
  },
]

export default function ModelsConfiguration() {
  const [models, setModels] = useState<ModelConfig[]>(mockModels)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testingModelId, setTestingModelId] = useState<string | null>(null)

  const [newModel, setNewModel] = useState({
    name: "",
    endpoint: "",
    apiKey: "",
    modelType: "",
    description: "",
    parameters: "{}",
  })

  const getStatusColor = (status: ModelConfig["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "testing":
        return "bg-blue-100 text-blue-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: ModelConfig["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "testing":
        return <Clock className="h-4 w-4" />
      case "inactive":
        return <XCircle className="h-4 w-4" />
      default:
        return <XCircle className="h-4 w-4" />
    }
  }

  const testConnection = async (modelId: string) => {
    setIsTestingConnection(true)
    setTestingModelId(modelId)
    
    // Update model status to testing
    setModels(prev => prev.map(model => 
      model.id === modelId ? { ...model, status: "testing" as const } : model
    ))

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success
      setModels(prev => prev.map(model => 
        model.id === modelId ? { ...model, status: "active" as const, lastUsed: "Just now" } : model
      ))
    } catch (error) {
      setModels(prev => prev.map(model => 
        model.id === modelId ? { ...model, status: "inactive" as const } : model
      ))
    } finally {
      setIsTestingConnection(false)
      setTestingModelId(null)
    }
  }

  const addModel = () => {
    const model: ModelConfig = {
      id: Date.now().toString(),
      name: newModel.name,
      endpoint: newModel.endpoint,
      apiKey: newModel.apiKey,
      modelType: newModel.modelType,
      description: newModel.description,
      status: "inactive",
      lastUsed: "Never",
      parameters: JSON.parse(newModel.parameters || "{}"),
    }
    
    setModels(prev => [model, ...prev])
    setNewModel({ name: "", endpoint: "", apiKey: "", modelType: "", description: "", parameters: "{}" })
    setIsAddDialogOpen(false)
  }

  const deleteModel = (modelId: string) => {
    setModels(prev => prev.filter(model => model.id !== modelId))
  }

  const editModel = (model: ModelConfig) => {
    setEditingModel(model)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto ml-16">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/data-engine">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Data Engine
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground font-space-grotesk">Models Configuration</h1>
                <p className="text-muted-foreground">Manage and configure AI models for evaluation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProjectSelector />
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Model
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Model</DialogTitle>
                    <DialogDescription>
                      Configure a new AI model for evaluation testing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Model Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g., GPT-4 Vision"
                          value={newModel.name}
                          onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="modelType">Model Type</Label>
                        <Input
                          id="modelType"
                          placeholder="e.g., Image Generation"
                          value={newModel.modelType}
                          onChange={(e) => setNewModel(prev => ({ ...prev, modelType: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endpoint">API Endpoint</Label>
                      <Input
                        id="endpoint"
                        placeholder="https://api.example.com/v1/generate"
                        value={newModel.endpoint}
                        onChange={(e) => setNewModel(prev => ({ ...prev, endpoint: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="sk-..."
                        value={newModel.apiKey}
                        onChange={(e) => setNewModel(prev => ({ ...prev, apiKey: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the model..."
                        value={newModel.description}
                        onChange={(e) => setNewModel(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="parameters">Parameters (JSON)</Label>
                      <Textarea
                        id="parameters"
                        placeholder='{"temperature": 0.7, "max_tokens": 1024}'
                        value={newModel.parameters}
                        onChange={(e) => setNewModel(prev => ({ ...prev, parameters: e.target.value }))}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addModel} disabled={!newModel.name || !newModel.endpoint}>
                        Add Model
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Configure your AI models by adding API endpoints and authentication details. Test connections to ensure models are ready for evaluation.
            </AlertDescription>
          </Alert>

          {/* Models Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {models.map((model) => (
              <Card key={model.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-space-grotesk">{model.name}</CardTitle>
                      <CardDescription>{model.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(model.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(model.status)}
                          {model.status}
                        </div>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{model.modelType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Last used:</span>
                      <span className="font-medium">{model.lastUsed}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Endpoint</Label>
                    <div className="p-2 bg-muted rounded-md">
                      <code className="text-xs text-muted-foreground break-all">{model.endpoint}</code>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testConnection(model.id)}
                      disabled={isTestingConnection && testingModelId === model.id}
                      className="flex-1 gap-2"
                    >
                      {isTestingConnection && testingModelId === model.id ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3" />
                          Test Connection
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editModel(model)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteModel(model.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {models.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No models configured</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add your first AI model to start building evaluation sets
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Model
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
