"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import {
  ArrowLeft,
  Search,
  Grid3X3,
  List,
  Download,
  Eye,
  Filter,
  Folder,
  Image as ImageIcon,
  Calendar,
  FileImage,
  Users,
  Tag,
  ChevronRight,
  ChevronDown,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DatasetPreview {
  id: string
  name: string
  description: string
  category: string
  samples: number
  size: string
  createdAt: string
  updatedAt: string
  tags: string[]
  author: string
  folders: FolderStructure[]
}

interface FolderStructure {
  name: string
  type: "folder" | "image"
  path: string
  children?: FolderStructure[]
  imageUrl?: string
  size?: string
  modifiedAt?: string
}

// 动态加载数据集图片的函数
const loadDatasetImages = (category: string): string[] => {
  // 使用我们下载的真实数据集图片
  const imageUrls = {
    "3D Assets": [
      "/images/datasets/material_textures/material_textures_9480590_1.jpg",
      "/images/datasets/material_textures/material_textures_10786902_2.jpg",
      "/images/datasets/material_textures/material_textures_8935894_3.jpg",
      "/images/datasets/material_textures/material_textures_5503877_1.jpg",
      "/images/datasets/material_textures/material_textures_5253420_2.jpg",
      "/images/datasets/material_textures/material_textures_26736142_3.jpg",
    ],
    "Materials": [
      "/images/datasets/material_textures/material_textures_129722_1.jpg",
      "/images/datasets/material_textures/material_textures_129723_2.jpg",
      "/images/datasets/material_textures/material_textures_129728_3.jpg",
      "/images/datasets/material_textures/material_textures_33927540_1.jpg",
      "/images/datasets/material_textures/material_textures_33918437_2.jpg",
      "/images/datasets/material_textures/material_textures_978503_3.jpg",
      "/images/datasets/material_textures/material_textures_12495668_1.jpg",
      "/images/datasets/material_textures/material_textures_4452377_2.jpg",
      "/images/datasets/material_textures/material_textures_27256452_3.jpg",
    ],
    "Lighting": [
      "/images/datasets/lighting_scenarios/lighting_scenarios_19946597_1.jpg",
      "/images/datasets/lighting_scenarios/lighting_scenarios_10416279_2.jpg",
      "/images/datasets/lighting_scenarios/lighting_scenarios_27256462_3.jpg",
      "/images/datasets/lighting_scenarios/lighting_scenarios_3532440_1.jpg",
      "/images/datasets/lighting_scenarios/lighting_scenarios_13037086_2.jpg",
      "/images/datasets/lighting_scenarios/lighting_scenarios_27671544_3.jpg",
      "/images/datasets/lighting_scenarios/lighting_scenarios_29436768_1.jpg",
      "/images/datasets/lighting_scenarios/lighting_scenarios_3761178_2.jpg",
      "/images/datasets/lighting_scenarios/lighting_scenarios_33336631_3.jpg",
    ],
    "Color": [
      "/images/datasets/material_textures/material_textures_18311092_1.jpg",
      "/images/datasets/material_textures/material_textures_926705_2.jpg",
      "/images/datasets/material_textures/material_textures_31407906_3.jpg",
      "/images/datasets/material_textures/material_textures_2611817_1.jpg",
      "/images/datasets/material_textures/material_textures_4062274_2.jpg",
    ],
    "Surfaces": [
      "/images/datasets/material_textures/material_textures_29399429_3.jpg",
      "/images/datasets/material_textures/material_textures_129733_1.jpg",
      "/images/datasets/material_textures/material_textures_1561020_2.jpg",
      "/images/datasets/material_textures/material_textures_129731_3.jpg",
      "/images/datasets/material_textures/material_textures_5253420_2.jpg",
      "/images/datasets/material_textures/material_textures_26736142_3.jpg",
    ],
  }
  
  return imageUrls[category as keyof typeof imageUrls] || imageUrls["3D Assets"]
}

// 根据类别生成真实的图片URL数据
const generateMockImageData = (category: string): FolderStructure[] => {
  const urls = loadDatasetImages(category)
  
  return [
    {
      name: "Training Data",
      type: "folder" as const,
      path: "/training",
      children: [
        {
          name: "Batch_001",
          type: "folder" as const,
          path: "/training/batch_001",
          children: urls.slice(0, Math.ceil(urls.length / 2)).map((url, index) => ({
            name: `sample_${String(index + 1).padStart(3, '0')}.jpg`,
            type: "image" as const,
            path: `/training/batch_001/sample_${String(index + 1).padStart(3, '0')}.jpg`,
            imageUrl: url,
            size: "2.4 MB",
            modifiedAt: "2024-01-20",
          })),
        },
        {
          name: "Batch_002",
          type: "folder" as const,
          path: "/training/batch_002",
          children: urls.slice(Math.ceil(urls.length / 2)).map((url, index) => ({
            name: `sample_${String(index + Math.ceil(urls.length / 2) + 1).padStart(3, '0')}.jpg`,
            type: "image" as const,
            path: `/training/batch_002/sample_${String(index + Math.ceil(urls.length / 2) + 1).padStart(3, '0')}.jpg`,
            imageUrl: url,
            size: "2.1 MB",
            modifiedAt: "2024-01-19",
          })),
        },
      ],
    },
    {
      name: "Validation Data",
      type: "folder" as const,
      path: "/validation",
      children: urls.map((url, index) => ({
        name: `val_${String(index + 1).padStart(3, '0')}.jpg`,
        type: "image" as const,
        path: `/validation/val_${String(index + 1).padStart(3, '0')}.jpg`,
        imageUrl: url,
        size: "1.8 MB",
        modifiedAt: "2024-01-18",
      })),
    },
    {
      name: "Test Data",
      type: "folder" as const,
      path: "/test",
      children: urls.map((url, index) => ({
        name: `test_${String(index + 1).padStart(3, '0')}.jpg`,
        type: "image" as const,
        path: `/test/test_${String(index + 1).padStart(3, '0')}.jpg`,
        imageUrl: url,
        size: "2.0 MB",
        modifiedAt: "2024-01-17",
      })),
    },
  ]
}

const mockDatasets: DatasetPreview[] = [
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
    author: "AI Research Team",
    folders: [],
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
    author: "Material Science Lab",
    folders: [],
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
    author: "Graphics Team",
    folders: [],
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
    author: "Color Research",
    folders: [],
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
    author: "Surface Analysis",
    folders: [],
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
    author: "Biomedical Imaging",
    folders: [],
  },
]

export default function DatasetPreview({ params }: { params: { id: string } }) {
  const [dataset, setDataset] = useState<DatasetPreview | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]))
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState<string[]>(["/"])

  useEffect(() => {
    const foundDataset = mockDatasets.find(d => d.id === params.id)
    if (foundDataset) {
      const datasetWithFolders = {
        ...foundDataset,
        folders: generateMockImageData(foundDataset.category),
      }
      setDataset(datasetWithFolders)
    }
  }, [params.id])

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const getAllImages = (folders: FolderStructure[]): FolderStructure[] => {
    let images: FolderStructure[] = []
    folders.forEach(folder => {
      if (folder.type === "image") {
        images.push(folder)
      } else if (folder.children) {
        images = [...images, ...getAllImages(folder.children)]
      }
    })
    return images
  }

  const filteredImages = dataset ? getAllImages(dataset.folders).filter(img => 
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []

  if (!dataset) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto ml-16 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading dataset...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto ml-16">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/data-engine/datasets">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Datasets
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground font-space-grotesk">{dataset.name}</h1>
                <p className="text-muted-foreground">Dataset Preview - {dataset.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Download All
              </Button>
            </div>
          </div>
        </header>

        {/* Dataset Info */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileImage className="h-4 w-4" />
                {dataset.samples} samples
              </div>
              <div className="flex items-center gap-1">
                <Folder className="h-4 w-4" />
                {dataset.size}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Updated {dataset.updatedAt}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {dataset.author}
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {dataset.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredImages.map((image) => (
                <Card key={image.path} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="aspect-square relative overflow-hidden rounded-lg">
                    <Image
                      src={image.imageUrl!}
                      alt={image.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onClick={() => setSelectedImage(image.imageUrl!)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button size="sm" variant="secondary">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs text-muted-foreground truncate">{image.name}</p>
                    <p className="text-xs text-muted-foreground">{image.size}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredImages.map((image) => (
                <Card key={image.path} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={image.imageUrl!}
                          alt={image.name}
                          fill
                          className="object-cover rounded-lg"
                          onClick={() => setSelectedImage(image.imageUrl!)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{image.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{image.size}</span>
                          <span>{image.modifiedAt}</span>
                          <span className="truncate">{image.path}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredImages.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No images found</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery 
                    ? "Try adjusting your search criteria"
                    : "This dataset doesn't contain any images"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Image Preview Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Image Preview</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <div className="relative aspect-video">
                <Image
                  src={selectedImage}
                  alt="Preview"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
