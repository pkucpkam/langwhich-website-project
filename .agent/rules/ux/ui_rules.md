---
trigger: always_on
---

# UI/UX Engineering Rules — Next.js + React + TailwindCSS

## 1. Core Principles

* Prioritize **consistency over creativity**
* Build **reusable and scalable components**
* Avoid duplicated UI logic
* Maintain clean visual hierarchy
* Use composition instead of large monolithic components
* UI should feel modern, minimal, and production-ready

---

# 2. Design System

## Color Palette

### Primary

```txt
Primary:        #2563EB
Primary Hover:  #1D4ED8
Primary Light:  #DBEAFE
```

### Neutral

```txt
Background:     #0B1220
Card:           #111827
Border:         #1F2937
Text Primary:   #F9FAFB
Text Secondary: #9CA3AF
```

### Status Colors

```txt
Success: #22C55E
Warning: #F59E0B
Error:   #EF4444
```

## Rules

* Do NOT use random Tailwind colors
* Only use colors defined in the design system
* Maintain accessible contrast ratios

---

# 3. Typography Rules

| Usage      | Tailwind Class                   |
| ---------- | -------------------------------- |
| H1         | `text-3xl md:text-4xl font-bold` |
| H2         | `text-2xl font-semibold`         |
| H3         | `text-xl font-semibold`          |
| Body       | `text-base`                      |
| Small Text | `text-sm`                        |

## Rules

* Maintain typography consistency
* Avoid arbitrary font sizes
* Prefer semantic hierarchy

---

# 4. Spacing System (8px Grid)

Allowed spacing values only:

```txt
p-2  => 8px
p-4  => 16px
p-6  => 24px
p-8  => 32px
gap-2 gap-4 gap-6 gap-8
```

## Rules

* Follow an 8-point spacing system
* Avoid arbitrary spacing values like `p-[13px]`

---

# 5. Component Architecture Rules

## Required Structure

```txt
/components
  /ui
    Button.tsx
    Input.tsx
    Card.tsx

  /layout
    AuthLayout.tsx
    Navbar.tsx

  /features
    auth/
    landing/
```

---

# 6. Reusability Rules

## MUST

* Extract reusable UI components
* Use props and variants
* Reuse layouts and patterns
* Use composition patterns

## MUST NOT

* Duplicate JSX blocks
* Create massive page files
* Hardcode repeated UI

---

# 7. Button Standards

## Variants

```txt
primary
secondary
outline
danger
ghost
```

## Sizes

```txt
sm
md
lg
```

## Required Features

* hover state
* loading state
* disabled state
* smooth transitions

---

# 8. Input Standards

Every input component must support:

* label
* placeholder
* error state
* helper text
* disabled state

## Focus Style

```txt
focus:ring-2 focus:ring-primary
```

---

# 9. Layout Rules

## Authentication Pages

* vertically centered
* responsive
* card width: `max-w-md`
* minimal distractions

## Landing Page

```txt
max-w-6xl mx-auto
py-16 section spacing
grid-based responsive layout
```

---

# 10. Tailwind Usage Rules

## DO

* Use utility-first approach
* Use `cn()` utility for class merging
* Use Tailwind consistently

## DO NOT

* Use inline styles
* Mix Tailwind with random CSS files unnecessarily
* Over-nest containers

---

# 11. Responsive Design Rules

Required breakpoints:

```txt
sm
md
lg
xl
```

## Rules

* Mobile-first design
* Components must remain usable on small screens
* Avoid horizontal overflow

---

# 12. Animation Rules

Allowed:

```txt
transition-all duration-200
hover:scale-[1.01]
```

## Rules

* Keep animations subtle
* No excessive motion
* Prioritize performance

---

# 13. Accessibility Rules

Required:

* semantic HTML
* proper button/input labels
* keyboard accessibility
* visible focus states

---

# 14. Code Quality Rules

## MUST

* Use TypeScript types/interfaces
* Keep components small and focused
* Separate UI and business logic
* Use constants/config files for repeated values

## MUST NOT

* Use `any`
* Hardcode API URLs
* Put business logic inside UI components

---

# 15. Anti-Boilerplate Rule

> If a UI pattern appears more than twice, extract it into a reusable component.

Examples:

* form fields
* auth card wrappers
* section headers
* buttons
* modals

---

# 16. Preferred Stack

## Frontend

* Next.js (App Router)
* TypeScript
* TailwindCSS
* shadcn/ui (optional)
* Lucide Icons

---

# 17. UI Style Direction

Target style:

* Modern SaaS
* Clean
* Minimal
* Professional
* Slightly premium aesthetic

Reference inspiration:

* Vercel
* Stripe
* Linear
