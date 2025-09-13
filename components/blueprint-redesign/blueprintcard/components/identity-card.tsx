"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Edit, Trash2, CheckCircle, XCircle, ArrowLeft, ArrowRight, ChevronDown } from "lucide-react"
import { useState } from "react"

const tags = [
  {
    name: "Facial Recognition",
    color: "bg-blue-500 hover:bg-blue-600",
    explanation: "Advanced AI technology that identifies and analyzes facial features with high accuracy",
  },
  {
    name: "Feature Preservation",
    color: "bg-purple-500 hover:bg-purple-600",
    explanation: "Maintains key facial characteristics and unique features during style transformation",
  },
  {
    name: "Style Transfer",
    color: "bg-red-500 hover:bg-red-600",
    explanation: "Applies artistic styles while preserving the original identity and essence",
  },
  {
    name: "Style Transfer",
    color: "bg-orange-500 hover:bg-orange-600",
    explanation: "Secondary style transfer method for enhanced artistic flexibility",
  },
  {
    name: "Detail Retention",
    color: "bg-teal-500 hover:bg-teal-600",
    explanation: "Preserves fine details and subtle features that make each face unique",
  },
  {
    name: "AI Training",
    color: "bg-green-500 hover:bg-green-600",
    explanation: "Continuous learning system that improves accuracy and quality over time",
  },
]

const priorityLevels = [
  { name: "Critical", color: "bg-red-500 hover:bg-red-600", textColor: "text-white" },
  { name: "High", color: "bg-orange-500 hover:bg-orange-600", textColor: "text-white" },
  { name: "Medium", color: "bg-yellow-500 hover:bg-yellow-600", textColor: "text-white" },
  { name: "Low", color: "bg-gray-500 hover:bg-gray-600", textColor: "text-white" },
]

export function IdentityCard() {
  const [currentPriority, setCurrentPriority] = useState(0) // 0 = Critical, 1 = High, 2 = Medium, 3 = Low
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)

  const handlePrioritySelect = (index: number) => {
    setCurrentPriority(index)
    setShowPriorityDropdown(false)
  }

  const togglePriorityDropdown = () => {
    setShowPriorityDropdown(!showPriorityDropdown)
  }

  return (
    <TooltipProvider>
      <Card className="p-6 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Identity Fidelity & Artistic Appeal</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-600">
              Discuss
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-700 mb-2">
            This capability evaluates the core artistic challenge; accurately capturing and user's core facial features
            and 'essence' applying Q-version stylization.
          </p>
          <div className="flex items-center justify-between">
            <button className="text-gray-400 hover:text-gray-600 text-sm">Read More</button>
            <div className="relative">
              <Badge
                className={`${priorityLevels[currentPriority].color} ${priorityLevels[currentPriority].textColor} cursor-pointer transition-colors duration-200 flex items-center gap-1`}
                onClick={togglePriorityDropdown}
              >
                {priorityLevels[currentPriority].name} Priority
                <ChevronDown className="w-3 h-3" />
              </Badge>
              {showPriorityDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                  {priorityLevels.map((priority, index) => (
                    <button
                      key={index}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${
                        index === currentPriority ? "bg-gray-100" : ""
                      }`}
                      onClick={() => handlePrioritySelect(index)}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${priority.color.split(" ")[0]}`}></span>
                      {priority.name} Priority
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showPriorityDropdown && (
          <div className="fixed inset-0 z-5" onClick={() => setShowPriorityDropdown(false)}></div>
        )}

        {/* User Value */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Value</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span>There are some Description</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Badge className={`${tag.color} text-white cursor-help transition-colors duration-200`}>
                  {tag.name}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tag.explanation}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Comparison Images */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Good Example */}
          <div className="relative">
            <div className="bg-gray-200 rounded-lg p-4 h-64 flex items-center justify-center relative overflow-hidden">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oZ7F7ietHLvjAmhVvNX26ycaZrGoTe.png"
                alt="Good example"
                className="w-full h-full object-cover rounded"
              />
              <ArrowLeft className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <div className="absolute bottom-2 right-2 w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-pink-300 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">GOOD</div>
                <div className="text-sm text-gray-600">Identity preserved, clearly recognizable</div>
              </div>
            </div>
          </div>

          {/* Bad Example */}
          <div className="relative">
            <div className="bg-gray-200 rounded-lg p-4 h-64 flex items-center justify-center relative overflow-hidden">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oZ7F7ietHLvjAmhVvNX26ycaZrGoTe.png"
                alt="Bad example"
                className="w-full h-full object-cover rounded"
              />
              <ArrowRight className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <div className="absolute bottom-2 left-2 w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-yellow-300 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">BAD Example</div>
                <div className="text-sm text-gray-600">Identity lost, generic appearance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ask Agent Button */}
        <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3">Ask Agent</Button>
      </Card>
    </TooltipProvider>
  )
}
