"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface WorkflowStep {
  id: string
  name: string
  href: string
  completed: boolean
  current: boolean
}

interface WorkflowContextType {
  steps: WorkflowStep[]
  currentStep: string
  completeStep: (stepId: string) => void
  navigateToStep: (stepId: string) => boolean
  canAccessStep: (stepId: string) => boolean
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

const initialSteps: WorkflowStep[] = [
  { id: "project-setup", name: "Project Setup", href: "/project-setup", completed: false, current: true },
  { id: "feedback-analysis", name: "Feedback Analysis", href: "/feedback-analysis", completed: false, current: false },
  { id: "eval-planning", name: "Eval Configuration", href: "/eval-planning", completed: false, current: false },
  {
    id: "eval-planning-overview",
    name: "Plan Overview",
    href: "/eval-planning/overview",
    completed: false,
    current: false,
  },
  {
    id: "eval-set-input-setup",
    name: "Eval Set Input Set Up",
    href: "/eval-set-input-setup",
    completed: false,
    current: false,
  },
  { id: "model-evaluation", name: "Model Evaluation", href: "/model-evaluation", completed: false, current: false },
  { id: "reports", name: "Reports", href: "/reports", completed: false, current: false },
]

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [steps, setSteps] = useState<WorkflowStep[]>(initialSteps)
  const [currentStep, setCurrentStep] = useState("project-setup")
  const router = useRouter()

  const completeStep = (stepId: string) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, completed: true } : step)))
  }

  const canAccessStep = (stepId: string) => {
    return true
  }

  const navigateToStep = (stepId: string): boolean => {
    console.log("[v0] navigateToStep called with:", stepId)

    if (!canAccessStep(stepId)) {
      console.log("[v0] Cannot access step:", stepId)
      return false // Added missing return statement
    }

    console.log("[v0] Setting step states for:", stepId) // Added debug logging
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        current: step.id === stepId,
      })),
    )
    setCurrentStep(stepId)

    const step = initialSteps.find((s) => s.id === stepId)
    if (step) {
      console.log("[v0] Navigating to:", step.href)
      console.log("[v0] Router object:", router) // Added router debugging
      try {
        router.push(step.href)
        console.log("[v0] Router.push called successfully") // Added success logging
      } catch (error) {
        console.error("[v0] Router.push failed:", error) // Added error handling
      }
    } else {
      console.log("[v0] Step not found:", stepId)
      return false // Added return false for step not found
    }
    return true
  }

  return (
    <WorkflowContext.Provider
      value={{
        steps,
        currentStep,
        completeStep,
        navigateToStep,
        canAccessStep,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider")
  }
  return context
}
