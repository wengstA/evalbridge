"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/sidebar"
import { ProjectSelector } from "@/components/project-selector"
import {
  BarChart3,
  Download,
  Share,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts"

interface CapabilityScore {
  capability: string
  current: number
  baseline: number
  target: number
  trend: "up" | "down" | "stable"
}

interface TestResult {
  id: string
  name: string
  date: string
  overallScore: number
  capabilities: CapabilityScore[]
  metrics: Record<string, number>
  status: "excellent" | "good" | "needs-improvement" | "critical"
}

const mockReports: TestResult[] = [
  {
    id: "report-1",
    name: "Hunyuan v2.1",
    date: "2024-01-15",
    overallScore: 82,
    status: "good",
    capabilities: [
      { capability: "Visual Quality", current: 85, baseline: 75, target: 90, trend: "up" },
      { capability: "Geometric Accuracy", current: 78, baseline: 70, target: 85, trend: "up" },
      { capability: "Language Understanding", current: 88, baseline: 80, target: 90, trend: "stable" },
      { capability: "Response Coherence", current: 80, baseline: 75, target: 85, trend: "up" },
      { capability: "Edge Case Handling", current: 72, baseline: 65, target: 80, trend: "down" },
    ],
    metrics: {
      LPIPS: 0.15,
      FID: 12.3,
      SSIM: 0.87,
      "Human Rating": 4.2,
      "Processing Time": 2.3,
      "Success Rate": 0.94,
    },
  },
  {
    id: "report-2",
    name: "Tripo v2.5",
    date: "2024-01-10",
    overallScore: 76,
    status: "needs-improvement",
    capabilities: [
      { capability: "Classification Accuracy", current: 82, baseline: 78, target: 88, trend: "up" },
      { capability: "Context Understanding", current: 74, baseline: 70, target: 82, trend: "stable" },
      { capability: "Multi-label Handling", current: 68, baseline: 65, target: 78, trend: "down" },
      { capability: "Robustness", current: 79, baseline: 75, target: 85, trend: "up" },
      { capability: "Inference Speed", current: 85, baseline: 80, target: 88, trend: "up" },
    ],
    metrics: {
      Accuracy: 0.82,
      Precision: 0.79,
      Recall: 0.84,
      "F1 Score": 0.81,
      "Latency (ms)": 45,
      Throughput: 1200,
    },
  },
]

const historicalData = [
  { date: "Week 1", overall: 72, visual: 70, geometric: 68, language: 75, coherence: 74 },
  { date: "Week 2", overall: 75, visual: 73, geometric: 71, language: 78, coherence: 76 },
  { date: "Week 3", overall: 78, visual: 76, geometric: 74, language: 82, coherence: 78 },
  { date: "Week 4", overall: 82, visual: 85, geometric: 78, language: 88, coherence: 80 },
]

export default function EvaluationReports() {
  const [selectedReport, setSelectedReport] = useState<TestResult>(mockReports[0])
  const [timeRange, setTimeRange] = useState("last-month")

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200"
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "needs-improvement":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "excellent":
      case "good":
        return <CheckCircle className="h-4 w-4" />
      case "needs-improvement":
        return <AlertTriangle className="h-4 w-4" />
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getTrendIcon = (trend: CapabilityScore["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  const radarData = selectedReport.capabilities.map((cap) => ({
    capability: cap.capability.split(" ")[0], // Shorten for radar chart
    current: cap.current,
    target: cap.target,
    baseline: cap.baseline,
  }))

  const capabilityBarData = selectedReport.capabilities.map((cap) => ({
    name: cap.capability,
    current: cap.current,
    target: cap.target,
    baseline: cap.baseline,
  }))

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto ml-16">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-space-grotesk">Evaluation Reports</h1>
              <p className="text-muted-foreground">Comprehensive model performance analysis and capability insights</p>
            </div>
            <div className="flex items-center gap-4">
              <ProjectSelector />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Report Selector */}
              <div className="flex items-center gap-4">
                <Select
                  value={selectedReport.id}
                  onValueChange={(value) => {
                    const report = mockReports.find((r) => r.id === value)
                    if (report) setSelectedReport(report)
                  }}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockReports.map((report) => (
                      <SelectItem key={report.id} value={report.id}>
                        {report.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge className={getStatusColor(selectedReport.status)}>
                  {getStatusIcon(selectedReport.status)}
                  <span className="ml-1">{selectedReport.status.replace("-", " ")}</span>
                </Badge>
              </div>

              {/* Overall Performance */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Overall Score</p>
                        <p className="text-3xl font-bold">{selectedReport.overallScore}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Capabilities Tested</p>
                        <p className="text-3xl font-bold">{selectedReport.capabilities.length}</p>
                      </div>
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Test Date</p>
                        <p className="text-lg font-bold">{new Date(selectedReport.date).toLocaleDateString()}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Improvements</p>
                        <p className="text-3xl font-bold text-green-600">
                          {selectedReport.capabilities.filter((c) => c.trend === "up").length}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Capability Radar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-space-grotesk">Capability Performance</CardTitle>
                    <CardDescription>Current performance vs targets and baseline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="capability" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Current"
                          dataKey="current"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                        />
                        <Radar
                          name="Target"
                          dataKey="target"
                          stroke="hsl(var(--secondary))"
                          fill="hsl(var(--secondary))"
                          fillOpacity={0.1}
                        />
                        <Radar
                          name="Baseline"
                          dataKey="baseline"
                          stroke="hsl(var(--muted-foreground))"
                          fill="none"
                          strokeDasharray="5 5"
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-space-grotesk">Key Metrics</CardTitle>
                    <CardDescription>Technical performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(selectedReport.metrics).map(([metric, value]) => (
                      <div key={metric} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric}</span>
                        <span className="text-sm font-bold">{value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Capability Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-space-grotesk">Capability Breakdown</CardTitle>
                  <CardDescription>Detailed performance analysis by capability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedReport.capabilities.map((capability, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{capability.capability}</h4>
                            {getTrendIcon(capability.trend)}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              Baseline: <span className="font-medium">{capability.baseline}</span>
                            </span>
                            <span className="text-muted-foreground">
                              Target: <span className="font-medium">{capability.target}</span>
                            </span>
                            <span className="font-bold">{capability.current}/100</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Progress value={capability.current} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Baseline ({capability.baseline})</span>
                            <span>Target ({capability.target})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-space-grotesk">Capability Performance Comparison</CardTitle>
                  <CardDescription>Current vs target performance across all capabilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={capabilityBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="baseline" fill="hsl(var(--muted-foreground))" name="Baseline" />
                      <Bar dataKey="current" fill="hsl(var(--primary))" name="Current" />
                      <Bar dataKey="target" fill="hsl(var(--secondary))" name="Target" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedReport.capabilities.map((capability, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="font-space-grotesk text-lg">{capability.capability}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">{capability.current}</div>
                        <Progress value={capability.current} className="h-3" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Baseline: {capability.baseline}</span>
                        <span className="text-muted-foreground">Target: {capability.target}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        {getTrendIcon(capability.trend)}
                        <span className="text-sm font-medium">
                          {capability.trend === "up"
                            ? "Improving"
                            : capability.trend === "down"
                              ? "Declining"
                              : "Stable"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="flex items-center gap-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-week">Last Week</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-quarter">Last Quarter</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="font-space-grotesk">Performance Trends</CardTitle>
                  <CardDescription>Historical performance across all capabilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="overall"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        name="Overall"
                      />
                      <Line type="monotone" dataKey="visual" stroke="hsl(var(--chart-1))" name="Visual Quality" />
                      <Line type="monotone" dataKey="geometric" stroke="hsl(var(--chart-2))" name="Geometric" />
                      <Line type="monotone" dataKey="language" stroke="hsl(var(--chart-3))" name="Language" />
                      <Line type="monotone" dataKey="coherence" stroke="hsl(var(--chart-4))" name="Coherence" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-space-grotesk">Improvement Areas</CardTitle>
                  <CardDescription>Capabilities that need attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedReport.capabilities
                      .filter((cap) => cap.current < cap.target)
                      .sort((a, b) => a.current - b.current)
                      .map((capability, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{capability.capability}</h4>
                            <p className="text-sm text-muted-foreground">
                              Gap: {capability.target - capability.current} points to target
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{capability.current}/100</div>
                            <div className="text-sm text-muted-foreground">Target: {capability.target}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>
                  Compare performance across different model versions and test runs to track improvements over time.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="font-space-grotesk">Model Comparison</CardTitle>
                  <CardDescription>Performance comparison across different models</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockReports.map((report, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-medium">{report.name}</h4>
                            <p className="text-sm text-muted-foreground">{report.date}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{report.overallScore}</div>
                              <div className="text-sm text-muted-foreground">Overall Score</div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {report.capabilities.map((cap, capIndex) => (
                            <div key={capIndex} className="text-center">
                              <div className="text-lg font-bold">{cap.current}</div>
                              <div className="text-xs text-muted-foreground">{cap.capability}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
