"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Edit, Trash2, CheckCircle, XCircle, ArrowLeft, ArrowRight, ChevronDown } from "lucide-react"
import { useState } from "react"

interface BlueprintCardProps {
  id: string
  priority: "Critical" | "High" | "Medium" | "Low"
  icon: React.ReactNode
  title: string
  description: string
  userValue: string
  keyTechnicalFactors: string[]
  examples: {
    good: string
    bad: string
  }
  onAskAgent?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onPriorityChange?: (priority: "Critical" | "High" | "Medium" | "Low") => void
}

const priorityLevels = [
  { name: "Critical", color: "bg-red-500 hover:bg-red-600", textColor: "text-white" },
  { name: "High", color: "bg-orange-500 hover:bg-orange-600", textColor: "text-white" },
  { name: "Medium", color: "bg-yellow-500 hover:bg-yellow-600", textColor: "text-white" },
  { name: "Low", color: "bg-gray-500 hover:bg-gray-600", textColor: "text-white" },
]

// 渲染markdown格式的文本
const renderMarkdown = (text: string) => {
  // 处理粗体文本 (**text**)
  const parts = text.split(/(\*\*.*?\*\*)/g)
  const result: (string | JSX.Element)[] = []

  parts.forEach((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2)
      result.push(
        <strong key={`bold-${index}`} className="font-semibold">
          {boldText}
        </strong>,
      )
    } else {
      // 处理斜体文本 (*text*)
      const italicParts = part.split(/(\*[^*]+?\*)/g)
      italicParts.forEach((italicPart, italicIndex) => {
        if (italicPart.startsWith("*") && italicPart.endsWith("*") && !italicPart.startsWith("**")) {
          const italicText = italicPart.slice(1, -1)
          result.push(
            <em key={`italic-${index}-${italicIndex}`} className="italic">
              {italicText}
            </em>,
          )
        } else if (italicPart) {
          result.push(italicPart)
        }
      })
    }
  })

  return result
}

// 技术因素的标签配置，使用彩色标签
const getTechnicalFactorTags = (factors: string[]) => {
  const colors = [
    { color: "bg-blue-500 hover:bg-blue-600", explanation: "Core technical capability" },
    { color: "bg-purple-500 hover:bg-purple-600", explanation: "Advanced feature processing" },
    { color: "bg-red-500 hover:bg-red-600", explanation: "Critical system component" },
    { color: "bg-orange-500 hover:bg-orange-600", explanation: "Performance optimization" },
    { color: "bg-teal-500 hover:bg-teal-600", explanation: "Quality assurance" },
    { color: "bg-green-500 hover:bg-green-600", explanation: "AI/ML enhancement" },
  ]
  
  return factors.map((factor, index) => ({
    name: factor,
    color: colors[index % colors.length].color,
    explanation: colors[index % colors.length].explanation
  }))
}

export function BlueprintCardRedesigned({
  id,
  priority,
  icon,
  title,
  description,
  userValue,
  keyTechnicalFactors,
  examples,
  onAskAgent,
  onEdit,
  onDelete,
  onPriorityChange
}: BlueprintCardProps) {
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)

  const currentPriorityIndex = priorityLevels.findIndex(p => p.name === priority)
  const technicalFactorTags = getTechnicalFactorTags(keyTechnicalFactors)

  const handlePrioritySelect = (index: number) => {
    const newPriority = priorityLevels[index].name as "Critical" | "High" | "Medium" | "Low"
    onPriorityChange?.(newPriority)
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
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          <div className="relative">
            <Badge
              className={`${priorityLevels[currentPriorityIndex].color} ${priorityLevels[currentPriorityIndex].textColor} cursor-pointer transition-colors duration-200 flex items-center gap-1`}
              onClick={togglePriorityDropdown}
            >
              {priorityLevels[currentPriorityIndex].name} Priority
              <ChevronDown className="w-3 h-3" />
            </Badge>
            {showPriorityDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                {priorityLevels.map((priorityLevel, index) => (
                  <button
                    key={index}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${
                      index === currentPriorityIndex ? "bg-gray-100" : ""
                    }`}
                    onClick={() => handlePrioritySelect(index)}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${priorityLevel.color.split(" ")[0]}`}></span>
                    {priorityLevel.name} Priority
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-700 mb-2">
            {renderMarkdown(description)}
          </p>
          <div className="flex items-center justify-between">
            <button className="text-gray-400 hover:text-gray-600 text-sm">Read More</button>
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
            <span>{renderMarkdown(userValue)}</span>
          </div>
        </div>

        {/* Technical Factors Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {technicalFactorTags.map((tag, index) => (
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
                <div className="text-sm text-gray-600">{examples.good}</div>
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
                <div className="text-sm text-gray-600">{examples.bad}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ask Agent Button */}
        <div className="flex items-center justify-end gap-2">
          <Button 
            className="w-1/4 text-white font-semibold py-3 transition-colors duration-200"
            style={{ 
              backgroundColor: 'oklch(0.478,0.166,271.78)',
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'oklch(0.45,0.166,271.78)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'oklch(0.478,0.166,271.78)'
            }}
            onClick={onAskAgent}
          >
            Ask Agent
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-gray-600"
            onClick={onEdit}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-gray-600"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </TooltipProvider>
  )
}
