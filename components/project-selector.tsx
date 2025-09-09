"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Plus } from "lucide-react"

const mockProjects = [
  { id: "1", name: "Copilot 3D", status: "active" },
  { id: "2", name: "Text Classification System", status: "draft" },
  { id: "3", name: "Image Generation", status: "completed" },
]

export function ProjectSelector() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0])

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            {selectedProject.name}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {mockProjects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="flex items-center justify-between"
            >
              <span>{project.name}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  project.status === "active"
                    ? "bg-green-100 text-green-800"
                    : project.status === "draft"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {project.status}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

    
     
    </div>
  )
}
