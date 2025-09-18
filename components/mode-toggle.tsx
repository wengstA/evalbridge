"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Monitor, Zap, Settings, Info } from "lucide-react"

interface ModeInfo {
  mode: string
  is_demo: boolean
  is_production: boolean
}

export function ModeToggle() {
  const [modeInfo, setModeInfo] = useState<ModeInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMode()
  }, [])

  const fetchMode = async () => {
    try {
      const response = await fetch('/api/mode')
      if (response.ok) {
        const data = await response.json()
        setModeInfo(data)
      }
    } catch (err) {
      console.error('Failed to fetch mode:', err)
    }
  }

  const toggleMode = async () => {
    if (!modeInfo) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const newMode = modeInfo.is_demo ? 'production' : 'demo'
      const response = await fetch('/api/mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode: newMode }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setError(data.note)
        // Refresh mode info
        await fetchMode()
      } else {
        const errorData = await response.json()
        setError(errorData.error)
      }
    } catch (err) {
      setError('Failed to toggle mode')
    } finally {
      setIsLoading(false)
    }
  }

  if (!modeInfo) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">应用模式</CardTitle>
        </div>
        <CardDescription>
          切换演示模式和真实API模式
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Mode Display */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            {modeInfo.is_demo ? (
              <Monitor className="h-5 w-5 text-blue-600" />
            ) : (
              <Zap className="h-5 w-5 text-green-600" />
            )}
            <div>
              <div className="font-medium">
                {modeInfo.is_demo ? '演示模式' : '生产模式'}
              </div>
              <div className="text-sm text-slate-600">
                {modeInfo.is_demo 
                  ? '使用模拟数据，无需API密钥' 
                  : '使用真实AI API，需要配置密钥'
                }
              </div>
            </div>
          </div>
          
          <Badge 
            variant={modeInfo.is_demo ? "secondary" : "default"}
            className={modeInfo.is_demo ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
          >
            {modeInfo.mode.toUpperCase()}
          </Badge>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-medium">切换到{modeInfo.is_demo ? '生产' : '演示'}模式</div>
            <div className="text-sm text-slate-600">
              {modeInfo.is_demo 
                ? '启用真实AI API调用' 
                : '使用模拟数据进行演示'
              }
            </div>
          </div>
          
          <Switch
            checked={modeInfo.is_production}
            onCheckedChange={toggleMode}
            disabled={isLoading}
            className="data-[state=checked]:bg-green-600"
          />
        </div>

        {/* Error/Info Alert */}
        {error && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Mode Details */}
        <div className="pt-2 border-t">
          <div className="text-sm text-slate-600 space-y-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${modeInfo.is_demo ? 'bg-blue-500' : 'bg-green-500'}`}></div>
              <span>
                {modeInfo.is_demo 
                  ? '演示模式：快速响应，无API成本' 
                  : '生产模式：真实AI能力，需要API密钥'
                }
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
