# Design Guidelines: Dynamic Dashboard & CMS Application

## Design Approach
**System-Based with Modern Productivity Influences**

Primary: Material Design principles for component structure and data density
Secondary influences: Linear (clean hierarchy), Notion (content-focused layouts), Asana (dashboard organization)

Rationale: Dashboard and CMS applications prioritize clarity, efficiency, and information density over visual spectacle. Users need quick access to data and clear workflows.

## Core Design Elements

### Typography
**Font Family:** Inter (primary), Roboto Mono (code/data)
- Headings: 600 weight, sizes 24px (h1), 20px (h2), 16px (h3)
- Body: 400 weight, 14px (main text), 12px (secondary/metadata)
- Data/Tables: 400 weight, 13px (tabular data)
- Line height: 1.5 for body, 1.2 for headings

### Layout System
**Spacing Units:** Tailwind primitives 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section gaps: gap-6 to gap-8
- Page margins: p-6 on mobile, p-8 on desktop
- Card spacing: p-6 internal, gap-4 between cards

**Grid Structure:**
- Dashboard: Sidebar (256px fixed) + Main content (flex-1)
- Content areas: 12-column grid with responsive breakpoints
- Cards: 2-column on tablet, 3-column on desktop for stats/metrics

### Component Library

**Navigation:**
- Persistent sidebar: Role-specific menu items with icons (Heroicons)
- Top bar: User profile, notifications bell, real-time status indicator
- Breadcrumbs: For deep navigation in CMS sections
- Mobile: Collapsible hamburger menu

**Dashboard Components:**
- Stat cards: Metric value (32px bold) + label + trend indicator
- Activity feed: Timeline-style with timestamps and user avatars
- Quick actions: Prominent button group in top-right of content area
- Data tables: Sortable headers, row hover states, bulk action checkboxes

**Content Management:**
- Content list: Table view with status badges (Draft/Published), action menu
- Editor interface: Full-width editing area with fixed toolbar at top
- Preview panel: Split-screen option for live preview
- Version history: Sidebar drawer with timestamp list

**Real-time Indicators:**
- Online status: Small dot indicator (8px) next to user avatars
- Live updates badge: Subtle pulse animation on notification bell
- Content lock indicator: Banner when another user is editing

**Forms & Inputs:**
- Standard height: h-10 for inputs, buttons
- Labels: Above inputs, 12px, 600 weight
- Validation: Inline messages below fields, icon indicators
- Submit buttons: Primary action (bg-blue-600), secondary (outlined)

**Role-Based Elements:**
- Admin: Full sidebar access, red accent for destructive actions
- Editor: Limited sidebar, content-focused tools prominent
- Viewer: Minimal sidebar, read-only states clearly indicated

**Modals & Overlays:**
- Confirmation dialogs: Centered, max-w-md, backdrop blur
- Slide-out panels: For user details, settings (360px width)
- Toasts: Top-right notifications for real-time updates

### Animations
**Minimal & Purposeful:**
- Loading states: Subtle spinner (not skeleton screens)
- Real-time updates: Gentle fade-in for new items (200ms)
- Navigation: Instant transitions, no page animations
- Interactive feedback: Standard hover/active states only

## Images
**Profile Avatars:** 40px circle for user profiles in navigation, 32px in content areas
**Placeholder States:** Use icon + text for empty states (no decorative illustrations)
**No Hero Images:** This is a utility application - direct dashboard access on login

## Key Principles
1. **Information First:** Maximize content density without clutter
2. **Role Clarity:** Visual differentiation between user capabilities
3. **Efficiency:** Minimal clicks to common actions
4. **Real-time Awareness:** Subtle indicators without distraction
5. **Consistency:** Unified component patterns across all dashboards