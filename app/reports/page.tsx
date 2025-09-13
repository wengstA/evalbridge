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
    name: "Q-Figurine Generator v1.0",
    date: "2024-01-15",
    overallScore: 82,
    status: "good",
    capabilities: [
      { capability: "Capturing Likeness & Appeal", current: 85, baseline: 83, target: 90, trend: "up" },
      { capability: "Unified Art Style", current: 78, baseline: 76, target: 85, trend: "down" },
      { capability: "Material Expression", current: 88, baseline: 87, target: 90, trend: "stable" },
      { capability: "Technical Quality", current: 80, baseline: 78, target: 85, trend: "up" },
    ],
    metrics: {
      "Facial Landmark Accuracy": 0.87,
      "Identity Preservation Score": 0.82,
      "Texture Detail Preservation": 0.15,
      "Material Realism Score": 4.2,
      "Processing Time": 2.3,
      "Success Rate": 0.94,
    },
  },
  {
    id: "report-2",
    name: "Q-Figurine Generator v0.9",
    date: "2024-01-10",
    overallScore: 79,
    status: "needs-improvement",
    capabilities: [
      { capability: "Capturing Likeness & Appeal", current: 83, baseline: 81, target: 90, trend: "down" },
      { capability: "Unified Art Style", current: 76, baseline: 74, target: 85, trend: "up" },
      { capability: "Material Expression", current: 87, baseline: 85, target: 90, trend: "down" },
      { capability: "Technical Quality", current: 78, baseline: 76, target: 85, trend: "stable" },
    ],
    metrics: {
      "Facial Landmark Accuracy": 0.83,
      "Identity Preservation Score": 0.78,
      "Texture Detail Preservation": 0.18,
      "Material Realism Score": 4.0,
      "Processing Time": 2.5,
      "Success Rate": 0.91,
    },
  },
]

const historicalData = [
  { date: "Week 1", overall: 78, likeness: 81, artStyle: 74, material: 85, technical: 76 },
  { date: "Week 2", overall: 72, likeness: 75, artStyle: 68, material: 79, technical: 71 },
  { date: "Week 3", overall: 85, likeness: 88, artStyle: 82, material: 91, technical: 84 },
  { date: "Week 4", overall: 79, likeness: 82, artStyle: 76, material: 86, technical: 78 },
  { date: "Week 5", overall: 91, likeness: 94, artStyle: 88, material: 95, technical: 90 },
  { date: "Week 6", overall: 74, likeness: 77, artStyle: 71, material: 82, technical: 73 },
  { date: "Week 7", overall: 88, likeness: 91, artStyle: 85, material: 92, technical: 87 },
  { date: "Week 8", overall: 82, likeness: 85, artStyle: 79, material: 88, technical: 81 },
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
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Overall Score</p>
                        <p className="text-4xl font-bold text-blue-900">{selectedReport.overallScore}</p>
                        <p className="text-xs text-blue-700 mt-1">out of 100</p>
                      </div>
                      <div className="p-3 bg-blue-200 rounded-full">
                        <BarChart3 className="h-8 w-8 text-blue-700" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={selectedReport.overallScore} className="h-2 bg-blue-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Capabilities Tested</p>
                        <p className="text-4xl font-bold text-green-900">{selectedReport.capabilities.length}</p>
                        <p className="text-xs text-green-700 mt-1">dimensions</p>
                      </div>
                      <div className="p-3 bg-green-200 rounded-full">
                        <Target className="h-8 w-8 text-green-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Test Date</p>
                        <p className="text-lg font-bold text-purple-900">{new Date(selectedReport.date).toLocaleDateString()}</p>
                        <p className="text-xs text-purple-700 mt-1">latest run</p>
                      </div>
                      <div className="p-3 bg-purple-200 rounded-full">
                        <Calendar className="h-8 w-8 text-purple-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600 font-medium">Improvements</p>
                        <p className="text-4xl font-bold text-orange-900">
                          {selectedReport.capabilities.filter((c) => c.trend === "up").length}
                        </p>
                        <p className="text-xs text-orange-700 mt-1">trending up</p>
                      </div>
                      <div className="p-3 bg-orange-200 rounded-full">
                        <TrendingUp className="h-8 w-8 text-orange-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Capability Radar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                    <CardTitle className="font-space-grotesk text-xl">Capability Performance</CardTitle>
                    <CardDescription className="text-slate-600">Current performance vs targets and baseline</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={radarData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis 
                          dataKey="capability" 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          className="text-slate-600"
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]} 
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          axisLine={false}
                        />
                        <Radar
                          name="Current"
                          dataKey="current"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                        <Radar
                          name="Target"
                          dataKey="target"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.1}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                        <Radar
                          name="Baseline"
                          dataKey="baseline"
                          stroke="#f59e0b"
                          fill="none"
                          strokeDasharray="3 3"
                          strokeWidth={1}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-600">Current</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-slate-600">Target</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span className="text-slate-600">Baseline</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                    <CardTitle className="font-space-grotesk text-xl">Key Metrics</CardTitle>
                    <CardDescription className="text-slate-600">Technical performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {Object.entries(selectedReport.metrics).map(([metric, value], index) => (
                      <div key={metric} className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-800">{metric}</span>
                          <span className="text-lg font-bold text-blue-600">{value}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((value / 1) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Capability Details */}
              <Card className="border-2 border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                  <CardTitle className="font-space-grotesk text-xl">Capability Breakdown</CardTitle>
                  <CardDescription className="text-slate-600">Detailed performance analysis by capability</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {selectedReport.capabilities.map((capability, index) => (
                      <div key={index} className="p-6 bg-gradient-to-r from-white to-slate-50 border-2 border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {index + 1}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg text-slate-900">{capability.capability}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                {getTrendIcon(capability.trend)}
                                <span className="text-sm text-slate-600">
                                  {capability.trend === "up" ? "Improving" : capability.trend === "down" ? "Declining" : "Stable"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">{capability.current}</div>
                            <div className="text-sm text-slate-500">/ 100</div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="relative">
                            <Progress value={capability.current} className="h-3 bg-slate-200" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-semibold text-slate-700">{capability.current}%</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <span className="text-slate-600">
                                Baseline: <span className="font-semibold text-amber-600">{capability.baseline}</span>
                              </span>
                              <span className="text-slate-600">
                                Target: <span className="font-semibold text-green-600">{capability.target}</span>
                              </span>
                            </div>
                            <div className="text-slate-600">
                              Gap: <span className="font-semibold text-red-600">{capability.target - capability.current}</span> points
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-6">
              <Card className="border-2 border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                  <CardTitle className="font-space-grotesk text-xl">Capability Performance Comparison</CardTitle>
                  <CardDescription className="text-slate-600">Current vs target performance across all capabilities</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={capabilityBarData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        interval={0}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="baseline" fill="#f59e0b" name="Baseline" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="current" fill="#3b82f6" name="Current" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="target" fill="#10b981" name="Target" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {selectedReport.capabilities.map((capability, index) => (
                  <Card key={index} className="border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b pb-3">
                      <CardTitle className="font-space-grotesk text-lg text-slate-900">{capability.capability}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">{capability.current}</div>
                        <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${capability.current}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-slate-500">Current Performance</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Baseline:</span>
                          <span className="font-semibold text-amber-600">{capability.baseline}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Target:</span>
                          <span className="font-semibold text-green-600">{capability.target}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Gap:</span>
                          <span className="font-semibold text-red-600">{capability.target - capability.current}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200">
                        {getTrendIcon(capability.trend)}
                        <span className="text-sm font-medium text-slate-700">
                          {capability.trend === "up" ? "Improving" : capability.trend === "down" ? "Declining" : "Stable"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-slate-900">Performance Trends</h3>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-48 border-2 border-slate-200">
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
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Overall</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
                  <span>Likeness</span>
                  <div className="w-3 h-3 bg-purple-500 rounded-full ml-4"></div>
                  <span>Art Style</span>
                  <div className="w-3 h-3 bg-orange-500 rounded-full ml-4"></div>
                  <span>Material</span>
                  <div className="w-3 h-3 bg-red-500 rounded-full ml-4"></div>
                  <span>Technical</span>
                </div>
              </div>

              <Card className="border-2 border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                  <CardTitle className="font-space-grotesk text-xl">Performance Trends Over Time</CardTitle>
                  <CardDescription className="text-slate-600">Historical performance across all capabilities</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={450}>
                    <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        domain={[60, 100]}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line
                        type="linear"
                        dataKey="overall"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        name="Overall"
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                      />
                      <Line 
                        type="linear" 
                        dataKey="likeness" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="Likeness & Appeal" 
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2 }}
                      />
                      <Line 
                        type="linear" 
                        dataKey="artStyle" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        name="Art Style" 
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7, stroke: '#8b5cf6', strokeWidth: 2 }}
                      />
                      <Line 
                        type="linear" 
                        dataKey="material" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        name="Material Expression" 
                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7, stroke: '#f59e0b', strokeWidth: 2 }}
                      />
                      <Line 
                        type="linear" 
                        dataKey="technical" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        name="Technical Quality" 
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7, stroke: '#ef4444', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-2 border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                  <CardTitle className="font-space-grotesk text-xl">Improvement Areas</CardTitle>
                  <CardDescription className="text-slate-600">Capabilities that need attention</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {selectedReport.capabilities
                      .filter((cap) => cap.current < cap.target)
                      .sort((a, b) => a.current - b.current)
                      .map((capability, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-full">
                              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {index + 1}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg text-slate-900">{capability.capability}</h4>
                              <p className="text-sm text-slate-600">
                                Gap: <span className="font-semibold text-red-600">{capability.target - capability.current}</span> points to target
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">{capability.current}/100</div>
                            <div className="text-sm text-slate-600">Target: {capability.target}</div>
                            <div className="w-24 bg-slate-200 rounded-full h-2 mt-2">
                              <div 
                                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
                                style={{ width: `${capability.current}%` }}
                              ></div>
                            </div>
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
