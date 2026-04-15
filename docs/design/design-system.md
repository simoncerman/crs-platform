# 🎨 Design System - Czech Rocket Society Platform

## Overview

A comprehensive design system defining the visual language, components, and patterns for the Czech Rocket Society platform. This system ensures consistency, accessibility, and a cohesive user experience across all pages.

---

## Brand Identity

### Mission Statement
*"Pushing the boundaries of Czech space technology through innovation, collaboration, and education."*

### Brand Personality
- **Innovative** - Cutting-edge, forward-thinking
- **Trustworthy** - Professional, reliable
- **Inspiring** - Aspirational, ambitious
- **Collaborative** - Open, community-driven
- **Technical** - Precise, data-driven

---

## Color System

### Primary Colors

```css
/* Space Theme Palette */
--deep-space: #0a0e27;      /* Dark navy background */
--cosmic-blue: #1a1f3a;     /* Secondary dark */
--aurora-cyan: #64f4d2;     /* Primary accent - cyan */
--aurora-blue: #4d9fff;     /* Secondary accent - blue */
--stellar-white: #f8f9fc;   /* Primary text */
--moon-gray: #a8b2d1;       /* Secondary text */
--nebula-purple: #8b5cf6;   /* Tertiary accent */
--solar-orange: #fb923c;    /* Warning/Alert */
```

### Color Usage

| Color | Usage | Example |
|-------|-------|---------|
| Deep Space | Primary background, footer | `background-color: var(--deep-space)` |
| Cosmic Blue | Secondary backgrounds, cards | Hover states, sections |
| Aurora Cyan | Primary CTA, links, highlights | Buttons, active states |
| Aurora Blue | Secondary CTA, icons | Secondary buttons, icons |
| Stellar White | Primary text, headings | All text content |
| Moon Gray | Secondary text, labels | Descriptions, metadata |
| Nebula Purple | Badges, tags | Status indicators |
| Solar Orange | Alerts, warnings | Error states |

### Gradients

```css
/* Primary Gradient */
background: linear-gradient(135deg, #64f4d2 0%, #4d9fff 100%);

/* Glow Gradient */
background: radial-gradient(circle at center, rgba(100, 244, 210, 0.2) 0%, transparent 70%);

/* Text Gradient */
background: linear-gradient(90deg, #64f4d2 0%, #4d9fff 50%, #64f4d2 100%);
background-size: 200% 100%;
animation: gradient-slide 5s linear infinite;
```

### Accessibility

- **WCAG 2.1 Level AA** compliance
- Minimum contrast ratio: **4.5:1** for normal text
- Minimum contrast ratio: **3:1** for large text (18pt+)
- Color blindness tested with Coblis simulator

---

## Typography

### Font Stack

**Headings (Raleway)**
```css
font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Body Text (Roboto Slab)**
```css
font-family: 'Roboto Slab', Georgia, 'Times New Roman', serif;
```

**Accent Text (Comfortaa)**
```css
font-family: 'Comfortaa', 'Comic Sans MS', cursive;
```

**Monospace (Code blocks)**
```css
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

| Element | Font | Weight | Size | Line Height | Letter Spacing |
|---------|------|--------|------|-------------|----------------|
| **Hero H1** | Raleway | 700 | 96px / 6rem | 1.1 | -0.02em |
| **H1** | Raleway | 700 | 60px / 3.75rem | 1.2 | -0.015em |
| **H2** | Raleway | 700 | 48px / 3rem | 1.3 | -0.01em |
| **H3** | Raleway | 600 | 36px / 2.25rem | 1.4 | -0.005em |
| **H4** | Raleway | 600 | 24px / 1.5rem | 1.5 | 0 |
| **H5** | Raleway | 600 | 20px / 1.25rem | 1.5 | 0 |
| **Body Large** | Roboto Slab | 400 | 20px / 1.25rem | 1.7 | 0 |
| **Body** | Roboto Slab | 400 | 16px / 1rem | 1.6 | 0.01em |
| **Body Small** | Roboto Slab | 400 | 14px / 0.875rem | 1.5 | 0.01em |
| **Caption** | Roboto Slab | 400 | 12px / 0.75rem | 1.4 | 0.02em |
| **Accent** | Comfortaa | 400 | Variable | 1.5 | 0.02em |
| **Button** | Raleway | 700 | 16px / 1rem | 1.2 | 0.05em |

### Responsive Typography

```css
/* Mobile (320px+) */
--font-hero: 48px;
--font-h1: 36px;
--font-h2: 30px;
--font-body: 16px;

/* Tablet (768px+) */
--font-hero: 72px;
--font-h1: 48px;
--font-h2: 36px;
--font-body: 18px;

/* Desktop (1024px+) */
--font-hero: 96px;
--font-h1: 60px;
--font-h2: 48px;
--font-body: 18px;
```

---

## Spacing System

### Base Unit: 4px

```css
/* Spacing Scale (4px base) */
--space-1: 4px;    /* 0.25rem */
--space-2: 8px;    /* 0.5rem */
--space-3: 12px;   /* 0.75rem */
--space-4: 16px;   /* 1rem */
--space-6: 24px;   /* 1.5rem */
--space-8: 32px;   /* 2rem */
--space-12: 48px;  /* 3rem */
--space-16: 64px;  /* 4rem */
--space-24: 96px;  /* 6rem */
--space-32: 128px; /* 8rem */
```

### Component Spacing

| Element | Padding | Margin | Gap |
|---------|---------|--------|-----|
| Button (small) | 8px 16px | - | - |
| Button (medium) | 12px 24px | - | - |
| Button (large) | 16px 32px | - | - |
| Card | 24px | 16px | - |
| Section | 48px 24px | 64px 0 | - |
| Grid | - | - | 24px |
| Form Input | 12px 16px | 0 0 16px | - |

---

## Layout System

### Container Widths

```css
/* Max widths */
--container-sm: 640px;   /* Small content */
--container-md: 768px;   /* Medium content */
--container-lg: 1024px;  /* Main content */
--container-xl: 1280px;  /* Wide content */
--container-2xl: 1536px; /* Full width sections */
```

### Grid System

**12-column grid with gaps**
```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

/* Responsive columns */
.col-span-4 { grid-column: span 4; } /* 1/3 width */
.col-span-6 { grid-column: span 6; } /* 1/2 width */
.col-span-12 { grid-column: span 12; } /* Full width */
```

### Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

---

## Elevation & Shadows

### Shadow Scale

```css
/* Elevation levels */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.2);
--shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.25);
--shadow-2xl: 0 24px 48px rgba(0, 0, 0, 0.3);

/* Glow shadows (accent colors) */
--shadow-glow-cyan: 0 0 20px rgba(100, 244, 210, 0.3);
--shadow-glow-blue: 0 0 20px rgba(77, 159, 255, 0.3);
--shadow-glow-purple: 0 0 20px rgba(139, 92, 246, 0.3);
```

### Usage

| Element | Shadow | Hover Shadow |
|---------|--------|--------------|
| Card | `shadow-md` | `shadow-lg` |
| Button | `shadow-sm` | `shadow-glow-cyan` |
| Modal | `shadow-2xl` | - |
| Dropdown | `shadow-lg` | - |
| Image | `shadow-sm` | `shadow-md` |

---

## Border Radius

```css
--radius-sm: 4px;    /* Small elements, tags */
--radius-md: 8px;    /* Buttons, inputs */
--radius-lg: 12px;   /* Cards */
--radius-xl: 16px;   /* Large cards */
--radius-2xl: 24px;  /* Modal dialogs */
--radius-full: 9999px; /* Pills, circular buttons */
```

---

## Animation & Motion

### Timing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Duration Scale

```css
--duration-fast: 150ms;    /* Micro interactions */
--duration-base: 300ms;    /* Standard transitions */
--duration-slow: 500ms;    /* Complex animations */
--duration-slower: 1000ms; /* Page transitions */
```

### Common Animations

**Fade In**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Slide Up**
```css
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
```

**Scale**
```css
@keyframes scaleIn {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}
```

**Gradient Slide**
```css
@keyframes gradientSlide {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

### Interaction States

| State | Timing | Effect |
|-------|--------|--------|
| **Hover** | 150ms | Scale 1.05, glow shadow |
| **Active** | 100ms | Scale 0.95 |
| **Focus** | 200ms | Outline ring, glow |
| **Disabled** | - | Opacity 0.5, cursor not-allowed |

---

## Iconography

### Icon Library
**Lucide React** - Consistent, customizable icons

### Sizes
```css
--icon-xs: 16px;
--icon-sm: 20px;
--icon-md: 24px;
--icon-lg: 32px;
--icon-xl: 48px;
```

### Usage Guidelines
- Icons inherit text color by default
- Use solid icons for primary actions
- Use outline icons for secondary actions
- Minimum touch target: **44x44px** (accessibility)

---

## Component Library

### Buttons

**Primary Button**
```tsx
<button className="
  px-6 py-3 rounded-full 
  bg-gradient-to-r from-aurora-cyan to-aurora-blue 
  text-deep-space font-heading font-bold text-sm uppercase tracking-wider
  shadow-md hover:shadow-glow-cyan
  transition-all duration-300
  hover:scale-105 active:scale-95
">
  Explore Projects
</button>
```

**Secondary Button**
```tsx
<button className="
  px-6 py-3 rounded-full 
  border-2 border-aurora-cyan 
  text-aurora-cyan font-heading font-bold text-sm uppercase tracking-wider
  hover:bg-aurora-cyan hover:text-deep-space
  transition-all duration-300
">
  Learn More
</button>
```

**Ghost Button**
```tsx
<button className="
  px-4 py-2 
  text-moon-gray font-heading text-sm
  hover:text-stellar-white
  transition-colors duration-200
">
  Cancel
</button>
```

### Cards

**Glass Card**
```tsx
<div className="
  p-6 rounded-xl
  bg-cosmic-blue/30 backdrop-blur-lg
  border border-aurora-cyan/20
  shadow-lg hover:shadow-xl
  hover:border-aurora-cyan/40
  transition-all duration-300
">
  {/* Content */}
</div>
```

**Project Card**
```tsx
<div className="
  group relative overflow-hidden rounded-xl
  bg-cosmic-blue shadow-md
  hover:shadow-2xl hover:scale-105
  transition-all duration-500
">
  <img className="w-full h-48 object-cover" />
  <div className="p-6">
    <h3 className="font-heading font-bold text-xl text-stellar-white">
      Project Name
    </h3>
    <p className="mt-2 text-moon-gray text-sm">
      Description...
    </p>
  </div>
</div>
```

### Forms

**Input Field**
```tsx
<div className="space-y-2">
  <label className="block text-sm font-heading text-moon-gray">
    Email Address
  </label>
  <input 
    type="email"
    className="
      w-full px-4 py-3 rounded-lg
      bg-cosmic-blue border border-moon-gray/30
      text-stellar-white placeholder-moon-gray
      focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20
      transition-all duration-200
    "
    placeholder="your@email.com"
  />
</div>
```

**Select Dropdown**
```tsx
<select className="
  w-full px-4 py-3 rounded-lg
  bg-cosmic-blue border border-moon-gray/30
  text-stellar-white
  focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20
  transition-all duration-200
">
  <option>Select option</option>
</select>
```

### Badges

```tsx
{/* Status badge */}
<span className="
  inline-flex items-center px-3 py-1 rounded-full
  bg-nebula-purple/20 border border-nebula-purple/50
  text-nebula-purple text-xs font-heading font-bold uppercase
">
  In Progress
</span>

{/* Count badge */}
<span className="
  inline-flex items-center justify-center
  w-6 h-6 rounded-full
  bg-aurora-cyan text-deep-space
  text-xs font-bold
">
  5
</span>
```

---

## Responsive Design

### Mobile First Approach

```css
/* Mobile (default) */
.container { padding: 16px; }

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container { padding: 24px; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container { padding: 48px; }
}
```

### Touch Targets

- Minimum size: **44x44px**
- Spacing between: **8px minimum**
- Thumb zone optimization for mobile

### Performance

- Lazy load images below fold
- Optimize font loading (preload critical fonts)
- Use CSS animations over JavaScript when possible
- Implement skeleton screens for loading states

---

## Accessibility

### ARIA Labels

```tsx
<button aria-label="Close dialog">
  <X size={24} />
</button>

<nav aria-label="Main navigation">
  {/* Nav items */}
</nav>
```

### Keyboard Navigation

- All interactive elements focusable
- Visible focus states (ring with accent color)
- Logical tab order
- Skip to content link

### Screen Readers

- Semantic HTML (`<article>`, `<section>`, `<nav>`)
- Alt text for all images
- `aria-live` regions for dynamic content
- Proper heading hierarchy (h1 → h2 → h3)

---

## Dark Mode (Default)

Platform uses dark mode by default. Optional light mode for future:

```css
/* Light mode overrides */
@media (prefers-color-scheme: light) {
  :root {
    --deep-space: #f8f9fc;
    --stellar-white: #0a0e27;
    /* ... other colors inverted */
  }
}
```

---

## Design Tokens (JSON)

```json
{
  "colors": {
    "deep-space": "#0a0e27",
    "cosmic-blue": "#1a1f3a",
    "aurora-cyan": "#64f4d2",
    "aurora-blue": "#4d9fff",
    "stellar-white": "#f8f9fc",
    "moon-gray": "#a8b2d1"
  },
  "spacing": {
    "1": "4px",
    "2": "8px",
    "4": "16px",
    "6": "24px",
    "8": "32px"
  },
  "typography": {
    "heading": "Raleway",
    "body": "Roboto Slab",
    "accent": "Comfortaa"
  }
}
```

---

## File Organization

```
/apps/web/
  /components/
    /ui/              # Base components
      Button.tsx
      Card.tsx
      Input.tsx
      Badge.tsx
    /features/        # Feature-specific components
      ArticleCard.tsx
      ProjectCard.tsx
      MemberProfile.tsx
    /layout/          # Layout components
      Header.tsx
      Footer.tsx
      Sidebar.tsx
  /styles/
    globals.css       # Tailwind + global styles
```

---

**Version:** 1.0  
**Date:** 8.12.2025  
**Author:** Simon Cerman
