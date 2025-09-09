"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useWorkflow } from "@/contexts/workflow-context"
import { BarChart3, Settings, FileText, TestTube, Target, Home } from "lucide-react"

const workflowSteps = [
  { id: "project-setup", name: "Project Setup", href: "/project-setup", icon: Settings, step: 1 },
  { id: "feedback-analysis", name: "Problems Analysis", href: "/feedback-analysis", icon: FileText, step: 2 },
  { id: "eval-planning", name: "Eval Set Up", href: "/eval-planning", icon: Target, step: 3 },
  {
    id: "eval-planning-overview",
    name: "Evaluation Overview",
    href: "/eval-planning/overview",
    icon: FileText,
    step: 4,
  },
  { id: "model-evaluation", name: "Model Evaluation", href: "/model-evaluation", icon: TestTube, step: 5 },
  { id: "reports", name: "Reports", href: "/reports", icon: BarChart3, step: 6 },
]

const secondaryNavigation = [{ name: "HomePage", href: "/", icon: Home }]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()
  const { steps, navigateToStep } = useWorkflow()

  const handleStepClick = (stepId: string, href: string) => {
    navigateToStep(stepId)
  }

  const isExpanded = isHovered || !collapsed

  return (
    <Card
      className="fixed left-0 top-0 h-screen w-16 hover:w-64 transition-all duration-300 rounded-none border-r border-sidebar-border bg-sidebar group z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {isExpanded && (
            <h1 className="text-lg font-bold text-sidebar-foreground font-space-grotesk opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {"EvalBridge"}
            </h1>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6">
          <div className="space-y-2">
            {isExpanded && (
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Evaluation Workflow
              </h2>
            )}
            {workflowSteps.map((item, index) => {
              const workflowStep = steps.find((s) => s.id === item.id)
              const isActive = pathname === item.href
              const isCompleted = workflowStep?.completed || false
              const isCurrent = workflowStep?.current || false

              return (
                <div key={item.name}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full gap-3 text-sidebar-foreground relative",
                      isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                      !isActive && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isExpanded ? "justify-start" : "justify-center px-2",
                    )}
                    onClick={() => handleStepClick(item.id, item.href)}
                  >
                    {isExpanded && (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium",
                            isCurrent ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700",
                          )}
                        >
                          {item.step}
                        </div>
                      </div>
                    )}
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {isExpanded && (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {item.name}
                      </span>
                    )}
                  </Button>
                  {isExpanded && index < workflowSteps.length - 1 && (
                    <div className="ml-6 h-4 w-px bg-border opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="space-y-2">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full gap-3 text-sidebar-foreground",
                      isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                      !isActive && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isExpanded ? "justify-start" : "justify-center px-2",
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {isExpanded && (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
