"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import { ProjectSelector } from "@/components/project-selector"
import {
  Database,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  FileImage,
  Users,
  Tag,
  MoreHorizontal,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"

interface Dataset {
  id: string
  name: string
  description: string
  category: string
  samples: number
  size: string
  createdAt: string
  updatedAt: string
  tags: string[]
  previewImages: string[]
  status: "active" | "processing" | "archived"
  author: string
}

const mockDatasets: Dataset[] = [
  {
    id: "1",
    name: "3D Objects Collection",
    description: "Comprehensive collection of 3D objects for material rendering evaluation",
    category: "3D Assets",
    samples: 1250,
    size: "2.3 GB",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    tags: ["3D", "Materials", "Rendering"],
    previewImages: [
      "/3d-wireframe-model.png",
      "/abstract-geometric-shapes.png",
      "/baked-lighting-scene.png",
      "/blue-glowing-orb.png",
    ],
    status: "active",
    author: "AI Research Team",
  },
  {
    id: "2",
    name: "Material Textures",
    description: "High-resolution material textures for surface analysis",
    category: "Materials",
    samples: 850,
    size: "1.8 GB",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18",
    tags: ["Textures", "Materials", "Surfaces"],
    previewImages: [
      "/glossy-metal.png",
      "/matte-sphere.png",
      "/metallic-sphere.png",
      "/mirror-finish-steel.png",
    ],
    status: "active",
    author: "Material Science Lab",
  },
  {
    id: "3",
    name: "Lighting Scenarios",
    description: "Various lighting conditions for illumination testing",
    category: "Lighting",
    samples: 420,
    size: "950 MB",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-16",
    tags: ["Lighting", "Environment", "Shadows"],
    previewImages: [
      "/environment-lighting.png",
      "/shadowed-sphere.png",
      "/baked-lighting-scene.png",
    ],
    status: "processing",
    author: "Graphics Team",
  },
  {
    id: "4",
    name: "Color Variations",
    description: "Color temperature and saturation test cases",
    category: "Color",
    samples: 680,
    size: "1.2 GB",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-14",
    tags: ["Color", "Temperature", "Saturation"],
    previewImages: [
      "/color-saturation-comparison.png",
      "/color-temperature-shift.png",
      "/red-color-swatch.png",
      "/red-fabric-warm-light.png",
    ],
    status: "active",
    author: "Color Research",
  },
  {
    id: "5",
    name: "Surface Finishes",
    description: "Different surface finish comparisons",
    category: "Surfaces",
    samples: 320,
    size: "780 MB",
    createdAt: "2024-01-03",
    updatedAt: "2024-01-12",
    tags: ["Surfaces", "Finishes", "Comparison"],
    previewImages: [
      "/glossy-vs-matte.png",
      "/satin-paint-finish.png",
      "/material-confusion.png",
    ],
    status: "archived",
    author: "Surface Analysis",
  },
  {
    id: "6",
    name: "Subsurface Scattering",
    description: "Skin and organic material subsurface scattering examples",
    category: "Materials",
    samples: 150,
    size: "450 MB",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-10",
    tags: ["SSS", "Skin", "Organic"],
    previewImages: [
      "/skin-sss-comparison.png",
    ],
    status: "active",
    author: "Biomedical Imaging",
  },
]

export default function Datasets() {
  const [datasets, setDatasets] = useState<Dataset[]>(mockDatasets)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const categories = ["all", ...Array.from(new Set(datasets.map(d => d.category)))]

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dataset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || dataset.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: Dataset["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: Dataset["status"]) => {
    switch (status) {
      case "active":
        return "🟢"
      case "processing":
        return "🟡"
      case "archived":
        return "⚪"
      default:
        return "⚪"
    }
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
                <h1 className="text-2xl font-bold text-foreground font-space-grotesk">Datasets</h1>
                <p className="text-muted-foreground">Browse and manage evaluation datasets</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProjectSelector />
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Upload Dataset
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Dataset</DialogTitle>
                    <DialogDescription>
                      Upload a new dataset for evaluation testing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">Drag and drop your dataset files here</p>
                      <Button variant="outline">Choose Files</Button>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsUploadDialogOpen(false)}>
                        Upload
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Filters and Search */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search datasets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDatasets.map((dataset) => (
                <Card key={dataset.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="relative">
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                      <Image
                        src={dataset.previewImages[0]}
                        alt={dataset.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={getStatusColor(dataset.status)}>
                          {getStatusIcon(dataset.status)}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-2">
                          <Link href={`/data-engine/datasets/preview/${dataset.id}`}>
                            <Button size="sm" variant="secondary">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="secondary">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg truncate">{dataset.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{dataset.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            {dataset.samples} samples
                          </div>
                          <div className="flex items-center gap-1">
                            <FileImage className="h-3 w-3" />
                            {dataset.size}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Updated {dataset.updatedAt}
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {dataset.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {dataset.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{dataset.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {dataset.author}
                          </div>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDatasets.map((dataset) => (
                <Card key={dataset.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={dataset.previewImages[0]}
                          alt={dataset.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{dataset.name}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">{dataset.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Database className="h-3 w-3" />
                                {dataset.samples} samples
                              </div>
                              <div className="flex items-center gap-1">
                                <FileImage className="h-3 w-3" />
                                {dataset.size}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {dataset.updatedAt}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {dataset.author}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {dataset.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(dataset.status)}>
                              {getStatusIcon(dataset.status)} {dataset.status}
                            </Badge>
                            <div className="flex gap-1">
                              <Link href={`/data-engine/datasets/preview/${dataset.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredDatasets.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No datasets found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery || selectedCategory !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Upload your first dataset to get started"
                  }
                </p>
                {!searchQuery && selectedCategory === "all" && (
                  <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Upload Dataset
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
