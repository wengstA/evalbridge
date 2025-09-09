"use client"

import { useState, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Edit2, Check, Plus } from "lucide-react"

interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export function TagInput({ tags, onTagsChange, placeholder = "Add a tag...", className = "" }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")

  const addTag = () => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onTagsChange([...tags, trimmedValue])
      setInputValue("")
    }
  }

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index))
  }

  const startEditing = (index: number) => {
    setEditingIndex(index)
    setEditValue(tags[index])
  }

  const saveEdit = () => {
    if (editingIndex !== null) {
      const trimmedValue = editValue.trim()
      if (trimmedValue && !tags.includes(trimmedValue)) {
        const newTags = [...tags]
        newTags[editingIndex] = trimmedValue
        onTagsChange(newTags)
      }
      setEditingIndex(null)
      setEditValue("")
    }
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditValue("")
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      saveEdit()
    } else if (e.key === "Escape") {
      cancelEdit()
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Input for adding new tags */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-white"
        />
        <Button type="button" onClick={addTag} disabled={!inputValue.trim()} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Display tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div key={index} className="group relative">
              {editingIndex === index ? (
                <div className="flex items-center gap-1 bg-background border border-primary rounded-md px-2 py-1">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="h-6 text-sm border-none p-0 focus-visible:ring-0"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={saveEdit}
                    className="h-5 w-5 p-0 hover:bg-green-100"
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={cancelEdit}
                    className="h-5 w-5 p-0 hover:bg-red-100"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              ) : (
                <Badge variant="secondary" className="pr-1 gap-1 hover:bg-secondary/80 transition-colors">
                  <span className="text-sm">{tag}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing(index)}
                      className="h-4 w-4 p-0 hover:bg-blue-100"
                    >
                      <Edit2 className="h-3 w-3 text-blue-600" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTag(index)}
                      className="h-4 w-4 p-0 hover:bg-red-100"
                    >
                      <X className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {tags.length === 0 && (
        <p className="text-sm text-muted-foreground italic">No use cases added yet. Add your first use case above.</p>
      )}
    </div>
  )
}
