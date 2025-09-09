"use client"

import type React from "react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface HoverInfoCardProps {
  trigger: React.ReactNode
  title: string
  category?: string
  description: string
  details?: string
  className?: string
  triggerClassName?: string
}

export function HoverInfoCard({
  trigger,
  title,
  category,
  description,
  details,
  className = "",
  triggerClassName = "",
}: HoverInfoCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <>
      <div
        className={`cursor-pointer ${triggerClassName}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {trigger}
      </div>

      {isVisible && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: position.x,
            top: position.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div
            className={`bg-white border border-slate-200 rounded-lg shadow-xl p-4 max-w-sm animate-in fade-in-0 zoom-in-95 ${className}`}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-slate-900">{title}</h4>
                {category && (
                  <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    {category}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">{description}</p>

              {details && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">{details}</p>
                </div>
              )}

              <div className="text-xs text-slate-400 italic">Click for more details</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
