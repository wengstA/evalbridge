"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useWorkflow } from "@/contexts/workflow-context"
import { BarChart3, Settings, FileText, TestTube, Target, Home, Database, ChevronDown, ChevronRight } from "lucide-react"

interface NavigationStep {
  id: string
  name: string
  href: string
  icon: any
  step?: number
}

const tailoredMetricsSteps: NavigationStep[] = [
  { id: "requirements-analysis", name: "Requirements Analysis", href: "/feedback-analysis", icon: FileText, step: 1 },
  { id: "eval-set-up", name: "Eval Set Up", href: "/eval-planning", icon: Target, step: 2 },
  {
    id: "eval-set-input-setup",
    name: "Eval Set Input Set Up",
    href: "/eval-set-input-setup",
    icon: Target,
    step: 3,
  },
]

const dataEngineSteps: NavigationStep[] = [
  { id: "models-configuration", name: "Models Configuration", href: "/data-engine/models", icon: Settings },
  { id: "datasets", name: "Datasets", href: "/data-engine/datasets", icon: Database },
  { id: "eval-execution", name: "Eval Execution", href: "/eval-execution", icon: TestTube },
]

const performanceSteps: NavigationStep[] = [
  { id: "reports", name: "Reports", href: "/reports", icon: BarChart3, step: 4 },
]

const navigationSections = [
  {
    id: "tailored-metrics",
    title: "Tailored Metrics",
    steps: tailoredMetricsSteps,
    icon: Target,
  },
  {
    id: "data-engine",
    title: "Data Engine",
    steps: dataEngineSteps,
    icon: Database,
  },
  {
    id: "performance",
    title: "Performance",
    steps: performanceSteps,
    icon: BarChart3,
  },
]

const secondaryNavigation = [
  { name: "HomePage", href: "/", icon: Home }
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["tailored-metrics"]))
  const pathname = usePathname()
  const router = useRouter()
  const { steps, navigateToStep } = useWorkflow()

  const handleStepClick = (stepId: string, href: string) => {
    // Check if this is a Data Engine step (not in workflow)
    const isDataEngineStep = dataEngineSteps.some(step => step.id === stepId)
    
    if (isDataEngineStep) {
      // For Data Engine steps, use direct router navigation
      router.push(href)
    } else if (href.includes('#')) {
      // For anchor links, use direct router navigation
      router.push(href)
    } else {
      // For workflow steps, use workflow navigation
      navigateToStep(stepId)
    }
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const isExpanded = isHovered || !collapsed

  return (
    <Card
      className="fixed left-0 top-0 h-screen w-16 hover:w-72 transition-all duration-300 rounded-none border-r border-sidebar-border bg-sidebar group z-50 shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border bg-sidebar-accent">
          {isExpanded && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sidebar-primary rounded-md flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-semibold text-sm">EB</span>
              </div>
              <h1 className="text-lg font-semibold text-sidebar-foreground font-space-grotesk opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                EvalBridge
              </h1>
            </div>
          )}
          {!isExpanded && (
            <div className="w-8 h-8 bg-sidebar-primary rounded-md flex items-center justify-center mx-auto">
              <span className="text-sidebar-primary-foreground font-semibold text-sm">EB</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="space-y-1">
            {navigationSections.map((section, sectionIndex) => {
              const isSectionExpanded = expandedSections.has(section.id)
              const hasActiveStep = section.steps.some(step => pathname === step.href)
              
              return (
                <div key={section.id} className="space-y-1">
                  {/* Section Header */}
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full gap-3 text-sidebar-foreground relative transition-all duration-200",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isExpanded ? "justify-start px-3 py-2 h-auto" : "justify-center px-2 py-2",
                      "border-0 rounded-md text-sm font-medium",
                      hasActiveStep && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                    onClick={() => isExpanded && toggleSection(section.id)}
                  >
                    <section.icon className={cn(
                      "flex-shrink-0 transition-colors duration-200",
                      hasActiveStep ? "text-sidebar-accent-foreground" : "text-sidebar-foreground",
                      isExpanded ? "h-4 w-4" : "h-4 w-4"
                    )} />
                    {isExpanded && (
                      <>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium truncate flex-1 min-w-0">
                          {section.title}
                        </span>
                        {isSectionExpanded ? (
                          <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        ) : (
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                      </>
                    )}
                  </Button>

                  {/* Section Steps */}
                  {isExpanded && isSectionExpanded && (
                    <div className="ml-4 space-y-1">
                      {section.steps.map((item, index) => {
                        const workflowStep = steps.find((s) => s.id === item.id)
                        const isActive = pathname === item.href
                        const isCompleted = workflowStep?.completed || false
                        const isCurrent = workflowStep?.current || false

                        return (
                          <div key={item.name} className="relative">
                            <Button
                              variant={isActive ? "default" : "ghost"}
                              className={cn(
                                "w-full gap-3 text-sidebar-foreground relative transition-all duration-200",
                                isActive && "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm",
                                !isActive && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                "justify-start px-3 py-2 h-auto",
                                "border-0 rounded-md text-sm"
                              )}
                              onClick={() => handleStepClick(item.id, item.href)}
                            >
                              {item.step && (
                                <div className="flex items-center justify-center w-5 h-5 rounded-full mr-2 flex-shrink-0">
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200",
                                      isCurrent 
                                        ? "bg-sidebar-primary-foreground text-sidebar-primary" 
                                        : isCompleted
                                        ? "bg-green-100 text-green-700 border border-green-200"
                                        : "bg-slate-200 text-slate-600"
                                    )}
                                  >
                                    {isCompleted ? "✓" : item.step}
                                  </div>
                                </div>
                              )}
                              <item.icon className={cn(
                                "flex-shrink-0 transition-colors duration-200",
                                isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground",
                                "h-4 w-4"
                              )} />
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium truncate flex-1 min-w-0">
                                {item.name}
                              </span>
                            </Button>
                            
                            {/* Connection line */}
                            {index < section.steps.length - 1 && (
                              <div className="ml-6 h-4 w-px bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent">
          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full gap-3 text-sidebar-foreground transition-all duration-200",
                      isActive && "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm",
                      !isActive && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isExpanded ? "justify-start px-3 py-2.5" : "justify-center px-2 py-2.5",
                      "border-0 rounded-md text-sm"
                    )}
                  >
                    <item.icon className={cn(
                      "flex-shrink-0 transition-colors duration-200",
                      isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground",
                      isExpanded ? "h-4 w-4" : "h-4 w-4"
                    )} />
                    {isExpanded && (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium truncate flex-1 min-w-0">
                        {item.name}
                      </span>
                    )}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
