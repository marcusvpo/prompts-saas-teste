# Design Guidelines: Framework Roadmap Platform

## Design Approach
**Selected Approach**: Design System + Reference Hybrid  
**Primary References**: Linear (minimalist focus), Notion (structured content), Asana (project management patterns)  
**Rationale**: Utility-focused productivity tool requiring clean hierarchy, efficient information display, and professional aesthetic for developers/project managers.

## Core Design Principles
1. **Clarity Over Cleverness**: Information hierarchy drives every decision
2. **Breathing Room**: Strategic whitespace prevents cognitive overload in information-dense interfaces
3. **Purposeful Progression**: Visual cues guide users through the 4-module workflow
4. **Minimal Friction**: Every interaction should feel immediate and intentional

---

## Typography System

**Font Stack**:
- **Primary**: Inter (Google Fonts) - Clean, modern sans-serif for UI
- **Monospace**: JetBrains Mono (Google Fonts) - For code snippets and templates

**Hierarchy**:
- **H1 (Page Titles)**: text-3xl font-bold tracking-tight
- **H2 (Module Headers)**: text-2xl font-semibold  
- **H3 (Phase Titles)**: text-xl font-medium
- **H4 (Section Labels)**: text-sm font-semibold uppercase tracking-wide
- **Body**: text-base leading-relaxed
- **UI Labels**: text-sm font-medium
- **Captions**: text-xs text-muted-foreground

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Micro spacing (between related elements): p-2, gap-2
- Standard spacing (component padding): p-4, p-6
- Section spacing: p-8, py-12
- Major layout gaps: gap-8, gap-12, gap-16

**Grid Structure**:
- Sidebar: Fixed 280px width (w-[280px])
- Main Content: Flexible with max-w-4xl container
- Phase Cards: Full width within container
- Multi-column layouts: Avoid except for metadata display (2-column grid for stats/progress)

**Container Constraints**:
- Max content width: max-w-4xl (optimal reading width for documentation)
- Modal width: max-w-2xl
- Sidebar remains fixed, content scrolls independently

---

## Component Library

### Navigation & Structure

**Header Bar**:
- Fixed position, h-16, border-b
- Left: Logo + Project selector (dropdown)
- Right: Dark mode toggle icon button
- Clean, minimal - no clutter

**Sidebar (Left)**:
- Fixed w-[280px], full height, border-r
- Sections: Projects list, Progress indicator, Quick actions
- Project list items with status icons (✅ completed, 🔄 in-progress, ⭕ not started)
- "+ New Project" button with subtle hover state
- Circular progress indicator showing overall completion percentage

**Main Content Area**:
- Vertical scrolling roadmap
- Padding: px-8 py-12
- Background subtle grid pattern (optional, very subtle)

### Roadmap Modules

**Module Container**:
- Border-l-4 for visual anchoring (varies by module)
- Rounded-lg card design
- p-6 padding
- mb-8 spacing between modules
- Shadow: shadow-sm on hover to shadow-md

**Module Header**:
- Flex layout: Icon + Title + Status badge
- mb-4 spacing before phases
- Status badge: Small pill showing "Completed", "In Progress", "Not Started"

**Phase Items** (Collapsed State):
- List items with pl-4, py-3
- Flex: Icon + Phase name + Status indicator
- Hover: bg-accent/50 (subtle highlight)
- Border-l-2 for sub-hierarchy indication

**Phase Expanded View**:
- Full-screen or large modal overlay
- Structured sections: Instructions → Template → Example → Input
- Each section clearly separated with borders and spacing

### Forms & Inputs

**Text Areas**:
- min-h-[200px] for prompt/content input
- rounded-md, border-2
- Focus state: ring-2 ring-offset-2
- Monospace font for code/template content

**Buttons**:
- Primary: Solid fill, font-medium, px-6 py-2.5
- Secondary: Outline style, border-2
- Icon buttons: Square p-2, rounded-md
- All buttons: transition-all duration-200

**Progress Indicators**:
- Circular progress: strokeWidth={8}, size 120px for main display
- Linear progress bars: h-2, rounded-full
- Status dots: w-3 h-3 rounded-full with semantic meanings

### Content Display

**Template Prompt Boxes**:
- bg-muted/50 background
- p-6 padding
- rounded-lg borders
- Monospace font (text-sm)
- Copy button positioned top-right
- Syntax highlighting for code blocks (using Prism.js or similar)

**Instruction Sections**:
- bg-accent/10 subtle background
- border-l-4 accent border
- p-4 padding
- Clear icon indicators (📝, 🎯, 📌) for different types

**Collapsible Example Outputs**:
- Accordion pattern from shadcn/ui
- Preview first 3 lines, expand on click
- Subtle animation on expand/collapse

### Data Visualization

**Project Cards** (in sidebar):
- Compact design: p-3
- Title + timestamp
- Progress indicator (mini circular or bar)
- Status icon

**Export Options**:
- Dropdown menu with JSON/Markdown options
- Icon-based selection
- Confirmation toast on export

---

## Interaction Patterns

**Navigation Flow**:
- Click module → Smooth scroll to module section
- Click phase → Open detailed view (modal or slide-over)
- Breadcrumb trail in expanded phase views

**State Management**:
- Clear visual feedback for all states (loading, success, error)
- Toast notifications: Bottom-right, auto-dismiss in 5s
- Skeleton loaders for async content

**Editing Workflow**:
- Inline editing where possible (project titles)
- Autosave indicators (subtle "Saving..." text)
- Edit/View mode toggle for phase content

**Minimal Animations**:
- Smooth transitions: transition-all duration-200
- Fade-in for modals: opacity + scale
- Avoid distracting motion - keep it functional

---

## Responsive Behavior

**Desktop (≥1024px)**: Full three-column layout (sidebar + content + optional panel)
**Tablet (768px-1023px)**: Collapsible sidebar, full-width content
**Mobile (<768px)**: 
- Hamburger menu for sidebar
- Stack all content vertically
- Full-width cards
- Reduced padding (p-4 instead of p-8)

---

## Images

**Not Required**: This is a productivity tool focused on text content, templates, and structured data. No hero images or decorative photography needed. Focus on iconography, status indicators, and data visualization.

---

## Accessibility & Polish

- Keyboard navigation: Full tab order, visible focus states (ring-2 ring-offset-2)
- Screen reader labels: Proper ARIA labels for icons and status indicators
- High contrast ratios maintained throughout (WCAG AA minimum)
- Reduced motion preference respected: `prefers-reduced-motion: reduce`