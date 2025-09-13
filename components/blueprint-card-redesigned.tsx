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
// Ant Design Colorful Tag 样式映射
const getAntdTagStyle = (color: string) => {
  const styles = {
    magenta: "bg-pink-100 text-pink-800 border border-pink-200",
    red: "bg-red-100 text-red-800 border border-red-200",
    volcano: "bg-orange-100 text-orange-800 border border-orange-200",
    orange: "bg-orange-100 text-orange-800 border border-orange-200",
    gold: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    lime: "bg-lime-100 text-lime-800 border border-lime-200",
    green: "bg-green-100 text-green-800 border border-green-200",
    cyan: "bg-cyan-100 text-cyan-800 border border-cyan-200",
    blue: "bg-blue-100 text-blue-800 border border-blue-200",
    geekblue: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    purple: "bg-purple-100 text-purple-800 border border-purple-200",
    pink: "bg-pink-100 text-pink-800 border border-pink-200",
  }
  return styles[color as keyof typeof styles] || "bg-gray-100 text-gray-800 border border-gray-200"
}

const getTechnicalFactorTags = (factors: string[]) => {
  // Ant Design Colorful Tag colors
  const colors = [
    { color: "magenta", explanation: "Core technical capability" },
    { color: "red", explanation: "Critical system component" },
    { color: "volcano", explanation: "Performance optimization" },
    { color: "orange", explanation: "Advanced feature processing" },
    { color: "gold", explanation: "Quality assurance" },
    { color: "lime", explanation: "AI/ML enhancement" },
    { color: "green", explanation: "Data processing" },
    { color: "cyan", explanation: "Algorithm optimization" },
    { color: "blue", explanation: "System architecture" },
    { color: "geekblue", explanation: "Machine learning" },
    { color: "purple", explanation: "Neural networks" },
    { color: "pink", explanation: "User experience" },
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
      <Card className="p-6 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          <div className="relative">
            <div
              className={`${priorityLevels[currentPriorityIndex].color} ${priorityLevels[currentPriorityIndex].textColor} cursor-pointer transition-all duration-200 flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium hover:opacity-80`}
              onClick={togglePriorityDropdown}
            >
              {priorityLevels[currentPriorityIndex].name} Priority
              <ChevronDown className="w-3 h-3 transition-transform duration-200" style={{
                transform: showPriorityDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
              }} />
            </div>
            {showPriorityDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[140px] py-1" style={{
                boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
              }}>
                {priorityLevels.map((priorityLevel, index) => (
                  <button
                    key={index}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center ${
                      index === currentPriorityIndex ? "bg-blue-50 text-blue-600" : "text-gray-700"
                    }`}
                    onClick={() => handlePrioritySelect(index)}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full mr-3 ${priorityLevel.color.split(" ")[0]}`}></span>
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">User Value</h2>
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
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-help transition-all duration-200 hover:scale-105 ${getAntdTagStyle(tag.color)}`}
                >
                  {tag.name}
                </span>
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

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          <button 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-all duration-200 hover:shadow-md flex items-center gap-2"
            onClick={onAskAgent}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Ask Agent
          </button>
          <button 
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-all duration-200"
            onClick={onEdit}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </TooltipProvider>
  )
}
