import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/sidebar"
import { ProjectSelector } from "@/components/project-selector"
import {
  BarChart3,
  FileText,
  Target,
  TestTube,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Activity,
  Calendar,
  User,
  Settings,
  Database,
} from "lucide-react"
import Link from "next/link"

const quickStats = [
  { label: "Active Projects", value: "3", icon: BarChart3, color: "text-blue-600" },
  { label: "Pending Analysis", value: "7", icon: AlertCircle, color: "text-yellow-600" },
  { label: "Completed Evals", value: "12", icon: CheckCircle, color: "text-green-600" },
  { label: "Avg. Processing Time", value: "2.3h", icon: Clock, color: "text-purple-600" },
]

const recentActivity = [
  {
    action: "Feedback analysis completed",
    project: "3D Modeling Generation Model",
    time: "2 hours ago",
    type: "success",
    icon: CheckCircle,
  },
  {
    action: "Eval set generated",
    project: "Image Generation System",
    time: "4 hours ago",
    type: "info",
    icon: Target,
  },
  {
    action: "Model evaluation started",
    project: "Remove Background Module",
    time: "1 day ago",
    type: "progress",
    icon: TestTube,
  },
  {
    action: "New project created",
    project: "Text-to-Speech Evaluation",
    time: "2 days ago",
    type: "info",
    icon: FileText,
  },
  {
    action: "Report generated",
    project: "Copilot 3D",
    time: "3 days ago",
    type: "success",
    icon: BarChart3,
  },
]

const quickActions = [
  {
    title: "Analyze User Feedback",
    description: "Upload feedback to identify technical issues",
    icon: FileText,
    href: "/feedback-analysis",
  },
  {
    title: "Create Eval Set",
    description: "Build evaluation sets for model evaluation",
    icon: Target,
    href: "/eval-planning",
  },
  {
    title: "Data Engine",
    description: "Manage models and datasets for evaluation",
    icon: Database,
    href: "/eval-execution",
    color: "bg-green-500",
  },
  {
    title: "Run Model Eval",
    description: "Execute evaluations on your AI models",
    icon: TestTube,
    href: "/model-evaluation",
  },
  { title: "View Reports", description: "Check model performance reports", icon: BarChart3, href: "/reports" },
]

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto ml-16">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-space-grotesk">Dashboard</h1>
              <p className="text-muted-foreground">Monitor your AI model evaluation projects</p>
            </div>
            <div className="flex items-center gap-4">
              <ProjectSelector />
              <Link href="/project-setup">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 gap-2"
                >
                  <Plus className="h-5 w-5" />
                  New Product
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Product Information */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">EB</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Copilot 3D</h3>
                      <p className="text-muted-foreground">AI-powered 3D asset generation platform</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold text-foreground">3</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Evaluations</p>
                    <p className="text-2xl font-bold text-foreground">12</p>
                  </div>
                  <Link href="/project-setup?mode=edit">
                    <Button variant="outline" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Product Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Start Your Next Evaluation</h2>
                  <p className="text-muted-foreground text-lg">
                    Create a new project to analyze your AI model performance and build comprehensive evaluation sets.
                  </p>
                </div>
                <Link href="/feedback-analysis">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg gap-3"
                  >
                    <Plus className="h-6 w-6" />
                    Create New Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                  action.title === "Data Engine" ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50" : ""
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        action.color ? action.color : "bg-primary/10"
                      }`}>
                        <action.icon className={`h-6 w-6 ${
                          action.color ? "text-white" : "text-primary"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-lg ${
                          action.title === "Data Engine" ? "text-green-800" : ""
                        }`}>{action.title}</h3>
                        <p className={`${
                          action.title === "Data Engine" ? "text-green-700" : "text-muted-foreground"
                        }`}>{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <CardTitle className="font-space-grotesk">Recent Activity</CardTitle>
                </div>
                <CardDescription>Latest updates from your evaluation projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === "success"
                          ? "bg-green-100 text-green-600"
                          : activity.type === "progress"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.project}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10">
                    View All Activity
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="font-space-grotesk">Current Project: Copilot 3D</CardTitle>
                <CardDescription>Progress overview and next steps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Project Status</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm">Active - Analysis Phase</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <h4 className="font-medium">Team</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">3 members</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Completion</h4>
                      <span className="text-sm font-medium">60%</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full w-3/5" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Next Step</h4>
                      <p className="text-sm text-muted-foreground">
                        Generate evaluation set for material rendering capabilities
                      </p>
                      <Link href="/eval-planning">
                        <Button size="sm" className="mt-2">
                          Continue to Eval Planning
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
