# Framework Vibe Coding Platform

## Overview
An interactive framework roadmap platform for structured AI-assisted development. This platform helps users master the art of Vibe Coding with professional workflow management through a comprehensive 4-module framework.

## Purpose
Guide developers through a rigorous, professional approach to AI-assisted development, combining "Vibe Coding" with structured methodology to create robust, production-ready applications.

## Current State
**Status:** MVP in Development
**Version:** 1.0
**Last Updated:** November 18, 2025

## Recent Changes
- Initial project setup with comprehensive framework structure
- Implemented complete frontend with Inter + JetBrains Mono typography
- Created 4-module roadmap visualization system
- Built project management interface with progress tracking
- Added phase detail dialogs with copyable prompt templates
- Implemented dark/light theme support
- Created export functionality (JSON and Markdown)

## Project Architecture

### Frontend Structure
```
client/src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── theme-toggle.tsx
│   ├── project-sidebar.tsx
│   ├── module-card.tsx
│   ├── phase-detail-dialog.tsx
│   ├── create-project-dialog.tsx
│   └── export-dialog.tsx
├── contexts/           # React contexts
│   └── theme-context.tsx
├── lib/                # Utilities
│   ├── framework-data.ts
│   ├── queryClient.ts
│   └── utils.ts
├── pages/              # Page components
│   ├── home.tsx
│   └── not-found.tsx
└── App.tsx             # Main app component
```

### Data Models
- **Project**: User projects with title, description, timestamps
- **ModuleProgress**: Tracks completion status of each phase within modules
- **MasterArtifact**: Stores PRDs, Style Guides, and other generated artifacts
- **Note**: User annotations and notes per project

### Framework Structure (4 Modules)
1. **Módulo I**: Estratégia e Engenharia de Requisitos (2 fases)
2. **Módulo II**: Blueprint de Design UX/UI (3 fases)
3. **Módulo III**: Engenharia de Prompt Mestra (3 fases)
4. **Módulo IV**: Execução e Validação (4 fases)

## User Preferences
- **Design System**: Professional, minimalist, developer-focused
- **Typography**: Inter (primary), JetBrains Mono (code/templates)
- **Color Scheme**: Blue primary (#2563EB), with semantic colors for status
- **Layout**: Fixed sidebar (280px), flexible main content area
- **Features Priority**: Framework visualization > Progress tracking > Export

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **UI Library**: shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: Wouter
- **Theme**: Custom dark/light mode with localStorage persistence
- **Backend**: Express.js (planned)
- **Storage**: In-memory (MVP), Supabase PostgreSQL (planned)

## Key Features
1. **Project Management**: Create, select, and manage multiple framework projects
2. **Vertical Roadmap**: Visual journey through 4 structured modules
3. **Phase Details**: Expandable phases with instructions, templates, and examples
4. **Progress Tracking**: Visual indicators (circular progress, status badges)
5. **Prompt Templates**: Copyable templates for each phase
6. **Content Saving**: Save generated artifacts and user notes
7. **Export**: Export projects as JSON or Markdown
8. **Dark Mode**: Full theme support with smooth transitions

## API Endpoints (Planned)
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/module-progress` - Get progress for all modules
- `POST /api/module-progress` - Update phase progress
- `GET /api/master-artifacts` - Get all artifacts
- `POST /api/master-artifacts` - Save new artifact

## Development Notes
- Framework data is loaded from `attached_assets/schema_framework_1763486881607.json`
- Design guidelines strictly followed from `design_guidelines.md`
- All interactive elements have proper `data-testid` attributes for testing
- Accessibility: WCAG AA compliant with keyboard navigation support
- Responsive: Mobile-friendly design with adaptive layouts

## Next Steps
1. Implement backend API with in-memory storage
2. Connect frontend to backend endpoints
3. Add loading states and error handling
4. Test all user workflows
5. Prepare for Supabase integration (future)
