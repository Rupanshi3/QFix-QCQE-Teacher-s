# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build (no type-check — plain JS project)
npm run lint       # ESLint
npm run preview    # Preview production build
```

To add a new shadcn/ui component:
```bash
npx shadcn@latest add <component-name>
```

## Architecture

This is a **React + Vite PWA prototype** for QFix Teacher's Hub — a mobile-first app for Indian school/college teachers. It runs entirely in-memory (no backend, no localStorage).

### State & Data Flow

All application state lives in `src/context/AppContext.jsx` via a single React context (`useApp()`). On mount, state is seeded from `src/data/seed.js` — every mutation (attendance save, add assignment, add post) updates only the in-memory context state and is lost on page refresh.

**Role-based branching** is central to the app. The `currentUser.role` is either `'school'` or `'college'` and determines:
- Which nav tabs render (`BottomNav.jsx`)
- Which classes/batches are returned by `getClasses()`
- Which channel list is shown
- Route access (`CollegeRoute` wrapper guards `/my-classes` and `/assignments`)

**Class ID convention**: school class IDs start with `sc-`, college with `cb-`. `AppContext` uses this prefix to determine which bucket (`assignmentsState.school` vs `assignmentsState.college`) to read/write.

**Assignment → Channel sync**: When `addAssignment()` is called, it simultaneously injects an assignment post card into the corresponding class channel. The `channelId` is stored on each class/batch object in seed data to make this mapping possible.

### Navigation Structure

Two navigation levels:

- **L0** (bottom tab bar): Home, Communication, My Classes (college only), Assignments (college only), Profile
- **L1** (full-page, no bottom nav): Class Workspace, Attendance, Channel Feed, Assignment Detail

L1 screens are entered from class card taps and back-navigate to their L0 parent. They intentionally omit `<BottomNav />`.

Routes are in `src/App.jsx`. The entire route tree is wrapped in `<PhoneFrame>` (390×844px device bezel) and `<AppProvider>`.

### Design System Rules

- **Icons**: Phosphor Icons only (`@phosphor-icons/react`). Use `weight="regular"` for inactive/default, `weight="fill"` for active/selected states. Do not use lucide icons in app UI (lucide is a dep only because shadcn's `sonner` component requires it).
- **Brand color**: `#395BC7` (teacher-brand-800) for all primary actions, active states, and brand elements. Defined as a CSS variable `--teacher-brand-800` in `src/index.css`.
- **Components**: Use shadcn/ui components from `src/components/ui/` for all form elements, buttons, tabs, sheets, badges, and avatars. Do not hand-roll equivalents.
- **Bottom sheets**: Always use `src/components/BottomSheet.jsx` (wraps shadcn `Sheet` with `side="bottom"`).
- **Toast notifications**: Call `showToast(message)` from `src/components/Toast.jsx`, which uses `sonner`'s `toast()`. The `<Toaster>` is mounted inside `PhoneFrame` so toasts appear within the device frame.
- **Tailwind**: v4 with `@tailwindcss/vite` plugin. No `tailwind.config.js` — configuration is in `src/index.css` via `@theme inline` and CSS variables.
- **Touch targets**: Minimum 44×44px on all interactive elements.
- **Page layout**: `px-4 pt-4 pb-24` padding (pb-24 accounts for bottom nav). Max container width 430px is enforced by the phone frame itself.

### Seed Data

`src/data/seed.js` exports all mock data. Key exports:
- `teachers` — two personas: `school` (Sunita Sharma) and `college` (Rahul Desai)
- `allStudents` — 10 students shared across all classes
- `schoolClasses` / `collegeBatches` — today's class schedule per role
- `schoolAssignments` / `collegeAssignments` — keyed by class ID
- `channels` — all channel objects keyed by channel ID; each class has a `channelId` field linking to its channel
- `submissionDetail` — hardcoded submitted/pending lists for the assignment detail demo
