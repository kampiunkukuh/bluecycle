# Design Guidelines: BlueCycle - Waste Management Platform

## Design Approach
**Modern, Clean, and User-Centric (Inspired by Gojek & Premium Apps)**

Primary: Modern mobile-first design with vibrant colors and generous spacing
Secondary influences: Gojek, Grab, modern waste management platforms

Rationale: Professional waste management platform that feels accessible and modern. Design emphasizes visual clarity, engaging interactions, and delightful user experience while maintaining operational efficiency.

Key Characteristics:
- Generous whitespace and breathing room
- Bold, clear typography with strong hierarchy
- Vibrant accent colors with professional neutrals
- Card-based layouts with subtle shadows
- Visual status indicators (colors, icons, badges)
- Mobile-friendly touch targets

## Core Design Elements

### Typography
**Font Family:** Inter (primary), rounded and modern
- Headings: 700 weight (bold), sizes 32px (h1), 24px (h2), 18px (h3)
- Body: 400 weight, 15px (main text), 13px (secondary/metadata)
- Buttons/CTAs: 600 weight (semibold)
- Line height: 1.6 for body, 1.2 for headings
- Use sentence case for most UI text, Title Case for major headings

### Layout System
**Spacing Units:** Generous spacing for modern feel
- Component padding: p-6 to p-8
- Section gaps: gap-6 to gap-8
- Page margins: p-6 on mobile, p-8 on desktop
- Card spacing: p-6 to p-8 internal, gap-6 between cards
- Minimum touch target: 44px x 44px for mobile

**Visual Design:**
- Card shadows: Subtle elevation (shadow-sm to shadow-md)
- Border radius: Larger radius for modern feel (rounded-lg to rounded-xl)
- Status indicators: Color-coded with icons
- Accent colors used strategically for CTAs and important elements

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
- Admin: Full platform access, analytics and user management
- User: Waste pickup requests, tracking, and history
- Driver: Route management, pickup completion, real-time updates

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