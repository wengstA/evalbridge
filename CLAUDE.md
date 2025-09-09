# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI PM Evaluation System called "EvalBridge" - a Next.js application for analyzing AI model problems and building comprehensive evaluation sets. The system provides a workflow-driven interface for evaluating AI model performance through structured processes.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## Architecture & Structure

### Core Framework
- **Next.js 14.2.16** with App Router
- **TypeScript** with strict configuration
- **Tailwind CSS** with custom configuration
- **shadcn/ui** component library (New York style)
- **pnpm** as package manager

### Key Directories
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components and shadcn/ui components
- `components/ui/` - shadcn/ui component library
- `contexts/` - React Context providers for state management
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and configurations
- `data/` - Static data and configurations
- `public/` - Static assets

### Workflow System
The application is built around a sequential workflow managed by `WorkflowContext`:

**Workflow Steps:**
1. Project Setup (`/project-setup`)
2. Problems Analysis (`/feedback-analysis`)
3. Eval Set Up (`/eval-planning`)
4. Evaluation Overview (`/eval-planning/overview`)
5. Model Evaluation (`/model-evaluation`)
6. Reports (`/reports`)

The `WorkflowProvider` manages step progression, completion status, and navigation between steps.

### State Management
- **WorkflowContext** (`contexts/workflow-context.tsx`): Central workflow state management
- Navigation between steps is controlled through the context's `navigateToStep` function
- Each step tracks completion status and accessibility

### UI Components
- Built on **shadcn/ui** with extensive Radix UI primitives
- **Lucide React** for icons
- Custom sidebar with hover expansion (`components/sidebar.tsx`)
- Project selector component for multi-project support

### Styling System
- **Tailwind CSS** with custom design tokens
- **CSS Variables** for theming
- **Inter** and **Space Grotesk** fonts loaded via Next.js font optimization
- Component styling follows shadcn/ui patterns with `cn()` utility for conditional classes

### Page Structure
- Dashboard homepage with quick stats, recent activity, and current project overview
- Each workflow step has its own dedicated page under `/app`
- Sidebar navigation with step indicators and hover states

### Development Configuration
- **TypeScript** strict mode enabled with path aliases (`@/*`)
- **ESLint** and **TypeScript** errors ignored during builds (configured in `next.config.mjs`)
- **Images** unoptimized for deployment flexibility
- **PostCSS** with Tailwind integration

## Key Files to Understand
- `app/layout.tsx` - Root layout with WorkflowProvider
- `contexts/workflow-context.tsx` - Core workflow state management
- `components/sidebar.tsx` - Main navigation component
- `app/page.tsx` - Dashboard with project overview
- `components.json` - shadcn/ui configuration

## Development Notes
- The project uses v0.app generator patterns (indicated in metadata)
- Console logging is present in workflow context for debugging navigation
- All workflow steps are accessible by default (`canAccessStep` returns true)
- The system is designed for multi-project evaluation workflows