"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/sidebar"
import { ProjectSelector } from "@/components/project-selector"
import {
  Play,
  Pause,
  Square,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
  Zap,
  Activity,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWorkflow } from "@/contexts/workflow-context"
import { useRouter } from "next/navigation"

interface ModelConfig {
  name: string
  endpoint: string
  apiKey: string
  modelType: string
  parameters: Record<string, any>
}

interface TestRun {
  id: string
  testSet: string
  status: "pending" | "running" | "completed" | "failed" | "paused"
  progress: number
  startTime: string
  endTime?: string
  results?: {
    passed: number
    failed: number
    total: number
    metrics: Record<string, number>
  }
}

interface LogEntry {
  timestamp: string
  level: "info" | "warning" | "error" | "success"
  message: string
  details?: string
}

const mockTestSets = [
  { id: "Material & Color Reproduction", name: "Material & Color Reproduction", samples: 300 },
  { id: "Texture Detail on Reflective or Transparent Surfaces", name: "Texture Detail on Reflective or Transparent Surfacest", samples: 250 },
  { id: "Geometric-Inconsistency-Across-Views", name: "Geometric Inconsistency Across Views", samples: 200 },
  { id: "3D Modeling-Benchmark", name: "3D-Benchmark Eval Set", samples: 900 },
]

export default function ModelEvaluation() {
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    name: "",
    endpoint: "",
    apiKey: "",
    modelType: "3D Modeling-generation",
    parameters: {},
  })

  const [testRuns, setTestRuns] = useState<TestRun[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isConfigured, setIsConfigured] = useState(false)
  const [activeTab, setActiveTab] = useState("config")

  const { completeStep, navigateToStep } = useWorkflow()
  const router = useRouter()

  // Simulate test execution
  const startTest = (testSetId: string) => {
    const testSet = mockTestSets.find((ts) => ts.id === testSetId)
    if (!testSet) return

    const newTestRun: TestRun = {
      id: `test-${Date.now()}`,
      testSet: testSet.name,
      status: "running",
      progress: 0,
      startTime: new Date().toISOString(),
    }

    setTestRuns((prev) => [newTestRun, ...prev])
    addLog("info", `Started test execution for ${testSet.name}`)

    // Simulate progress
    const interval = setInterval(() => {
      setTestRuns((prev) =>
        prev.map((run) => {
          if (run.id === newTestRun.id && run.status === "running") {
            const newProgress = Math.min(run.progress + Math.random() * 15, 100)

            if (newProgress >= 100) {
              clearInterval(interval)
              addLog("success", `Test completed for ${testSet.name}`)
              return {
                ...run,
                progress: 100,
                status: "completed" as const,
                endTime: new Date().toISOString(),
                results: {
                  passed: Math.floor(testSet.samples * 0.85),
                  failed: Math.floor(testSet.samples * 0.15),
                  total: testSet.samples,
                  metrics: {
                    "Average Score": 0.82,
                    LPIPS: 0.15,
                    FID: 12.3,
                    Accuracy: 0.87,
                  },
                },
              }
            }

            return { ...run, progress: newProgress }
          }
          return run
        }),
      )
    }, 1000)
  }

  const pauseTest = (testId: string) => {
    setTestRuns((prev) => prev.map((run) => (run.id === testId ? { ...run, status: "paused" as const } : run)))
    addLog("warning", "Test execution paused")
  }

  const stopTest = (testId: string) => {
    setTestRuns((prev) => prev.map((run) => (run.id === testId ? { ...run, status: "failed" as const } : run)))
    addLog("error", "Test execution stopped")
  }

  const addLog = (level: LogEntry["level"], message: string, details?: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
    }
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]) // Keep last 100 logs
  }

  const configureModel = () => {
    if (modelConfig.name && modelConfig.endpoint) {
      setIsConfigured(true)
      setActiveTab("execution")
      addLog("success", `Model "${modelConfig.name}" configured successfully`)
    }
  }

  const getStatusColor = (status: TestRun["status"]) => {
    switch (status) {
      case "running":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: TestRun["status"]) => {
    switch (status) {
      case "running":
        return <Activity className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      case "paused":
        return <Pause className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getLogIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const continueToReports = () => {
    completeStep("model-evaluation")
    navigateToStep("reports")
    router.push("/reports")
  }

  const hasCompletedTests = testRuns.some((run) => run.status === "completed")

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto ml-16">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-space-grotesk">Model Evaluation</h1>
              <p className="text-muted-foreground">
                Execute evaluation tests on your AI models with real-time monitoring
              </p>
            </div>
            <ProjectSelector />
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="config">Model Config</TabsTrigger>
              <TabsTrigger value="execution">Eval Execution</TabsTrigger>
              <TabsTrigger value="results">Live Results</TabsTrigger>
              <TabsTrigger value="logs">System Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-6">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Configure your model API endpoint and authentication. This information is used to execute tests
                  against your model.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-space-grotesk">Model Configuration</CardTitle>
                    <CardDescription>Basic model information and API settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="modelName">Model Name</Label>
                      <Input
                        id="modelName"
                        placeholder="e.g., My Image Generator v2.1"
                        value={modelConfig.name}
                        onChange={(e) => setModelConfig((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endpoint">API Endpoint</Label>
                      <Input
                        id="endpoint"
                        placeholder="https://api.example.com/v1/generate"
                        value={modelConfig.endpoint}
                        onChange={(e) => setModelConfig((prev) => ({ ...prev, endpoint: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="sk-..."
                        value={modelConfig.apiKey}
                        onChange={(e) => setModelConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-space-grotesk">Advanced Parameters</CardTitle>
                    <CardDescription>Model-specific configuration parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="parameters">Parameters (JSON)</Label>
                      <Textarea
                        id="parameters"
                        placeholder={`{
  "temperature": 0.7,
  "max_tokens": 1024,
  "top_p": 0.9
}`}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Request Timeout</Label>
                      <Input placeholder="30 seconds" />
                    </div>

                    <div className="space-y-2">
                      <Label>Batch Size</Label>
                      <Input placeholder="10" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={configureModel}
                  disabled={!modelConfig.name || !modelConfig.endpoint}
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Configure Model
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="execution" className="space-y-6">
              {!isConfigured ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Please configure your model first before running tests.</AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Model "{modelConfig.name}" is configured and ready for testing.</AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-space-grotesk">Available Eval Sets</CardTitle>
                        <CardDescription>Execute evaluation tests on your configured model</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockTestSets.map((testSet) => (
                          <div
                            key={testSet.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium">{testSet.name}</h4>
                              <p className="text-sm text-muted-foreground">{testSet.samples} test samples</p>
                            </div>
                            <Button onClick={() => startTest(testSet.id)} size="sm" className="gap-2">
                              <Play className="h-4 w-4" />
                              Run Eval 
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="font-space-grotesk">Active EvalRuns</CardTitle>
                        <CardDescription>Monitor ongoing evaluation executions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {testRuns.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Activity className="h-8 w-8 mx-auto mb-2" />
                            <p>No active test runs</p>
                          </div>
                        ) : (
                          testRuns.slice(0, 3).map((run) => (
                            <div key={run.id} className="space-y-3 p-4 border border-border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(run.status)}
                                  <span className="font-medium">{run.testSet}</span>
                                </div>
                                <Badge className={getStatusColor(run.status)}>{run.status}</Badge>
                              </div>

                              <Progress value={run.progress} className="h-2" />

                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>{Math.round(run.progress)}% complete</span>
                                <div className="flex gap-2">
                                  {run.status === "running" && (
                                    <>
                                      <Button size="sm" variant="outline" onClick={() => pauseTest(run.id)}>
                                        <Pause className="h-3 w-3" />
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => stopTest(run.id)}>
                                        <Square className="h-3 w-3" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {testRuns
                  .filter((run) => run.results)
                  .map((run) => (
                    <Card key={run.id}>
                      <CardHeader>
                        <CardTitle className="font-space-grotesk">{run.testSet}</CardTitle>
                        <CardDescription>Completed {new Date(run.endTime!).toLocaleString()}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-green-600">{run.results!.passed}</p>
                            <p className="text-sm text-muted-foreground">Passed</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-red-600">{run.results!.failed}</p>
                            <p className="text-sm text-muted-foreground">Failed</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Key Metrics</h4>
                          {Object.entries(run.results!.metrics).map(([metric, value]) => (
                            <div key={metric} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{metric}</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-space-grotesk">System Logs</CardTitle>
                  <CardDescription>Real-time execution logs and system messages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {logs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Info className="h-8 w-8 mx-auto mb-2" />
                        <p>No logs available</p>
                      </div>
                    ) : (
                      logs.map((log, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                          {getLogIcon(log.level)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{log.message}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            {log.details && <p className="text-xs text-muted-foreground">{log.details}</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {hasCompletedTests && (
            <div className="mt-8 flex justify-end">
              <Button onClick={continueToReports} size="lg" className="gap-2">
                Continue to Reports
                <CheckCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
