# 🧩 Component Library Specifications

## Overview

Detailed specifications for all reusable UI components in the Czech Rocket Society platform. Each component includes variants, states, props, and usage guidelines.

---

## Button Component

### Variants

**Primary Button**
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  onClick?: () => void;
}

// Usage
<Button variant="primary" size="md">
  Explore Projects
</Button>

<Button variant="primary" size="lg" icon={<Rocket />} iconPosition="right">
  Launch
</Button>
```

### States

| State | Visual | Interaction |
|-------|--------|-------------|
| **Default** | Gradient background, shadow | - |
| **Hover** | Scale 1.05, glow shadow | Cursor: pointer |
| **Active** | Scale 0.95 | Pressed effect |
| **Focus** | Ring outline (aurora-cyan) | Keyboard navigation |
| **Loading** | Spinner animation | Cursor: wait, disabled |
| **Disabled** | Opacity 0.5 | Cursor: not-allowed |

### Sizes

| Size | Padding | Font Size | Min Width |
|------|---------|-----------|-----------|
| **sm** | 8px 16px | 14px | 80px |
| **md** | 12px 24px | 16px | 120px |
| **lg** | 16px 32px | 18px | 160px |

### Accessibility
- ARIA label for icon-only buttons
- Focus visible with keyboard
- Disabled state announced to screen readers
- Minimum touch target: 44x44px

---

## Card Component

### Variants

**Glass Card (Glassmorphism)**
```tsx
interface CardProps {
  variant?: 'glass' | 'solid' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Usage
<Card variant="glass" hoverable>
  <CardHeader>
    <h3>Rockets</h3>
  </CardHeader>
  <CardBody>
    <p>Description...</p>
  </CardBody>
</Card>
```

### States

| State | Transform | Border | Shadow |
|-------|-----------|--------|--------|
| **Default** | - | aurora-cyan/20 | md |
| **Hover** | Scale 1.02 | aurora-cyan/40 | lg |
| **Active** | Scale 0.98 | aurora-cyan/60 | sm |
| **Focus** | - | aurora-cyan/80 | glow |

### Sub-components

**CardHeader**
```tsx
<CardHeader
  title="Project Title"
  subtitle="Status: In Progress"
  action={<Button variant="ghost">Edit</Button>}
/>
```

**CardBody**
```tsx
<CardBody spacing="md">
  {children}
</CardBody>
```

**CardFooter**
```tsx
<CardFooter align="right">
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary">Save</Button>
</CardFooter>
```

---

## Input Component

### Text Input

```tsx
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  value?: string;
  onChange?: (value: string) => void;
}

// Usage
<Input
  label="Email Address"
  type="email"
  placeholder="your@email.com"
  required
  error={errors.email}
  icon={<Mail size={20} />}
  iconPosition="left"
/>
```

### States

| State | Border | Background | Text Color |
|-------|--------|------------|------------|
| **Default** | moon-gray/30 | cosmic-blue | stellar-white |
| **Focus** | aurora-cyan + ring | cosmic-blue | stellar-white |
| **Error** | solar-orange | cosmic-blue | stellar-white |
| **Disabled** | moon-gray/20 | cosmic-blue/50 | moon-gray |
| **Success** | green-500 | cosmic-blue | stellar-white |

### Variants

**Textarea**
```tsx
<Textarea
  label="Description"
  rows={5}
  maxLength={500}
  showCharCount
/>
```

**Select Dropdown**
```tsx
<Select
  label="Field of Study"
  options={[
    { value: 'cs', label: 'Computer Science' },
    { value: 'ee', label: 'Electrical Engineering' },
  ]}
  placeholder="Select field"
/>
```

---

## Badge Component

```tsx
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  children: React.ReactNode;
}

// Usage
<Badge variant="success">In Progress</Badge>
<Badge variant="warning" dot>3</Badge>
```

### Variants

| Variant | Background | Text | Use Case |
|---------|------------|------|----------|
| **default** | cosmic-blue/30 | moon-gray | General tags |
| **success** | green-500/20 | green-400 | Completed, Active |
| **warning** | solar-orange/20 | solar-orange | In Progress, Pending |
| **error** | red-500/20 | red-400 | Failed, Rejected |
| **info** | aurora-cyan/20 | aurora-cyan | New, Updated |

---

## Modal / Dialog Component

```tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
}

// Usage
<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <ModalBody>
    <p>Are you sure you want to delete this project?</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={onClose}>Cancel</Button>
    <Button variant="danger" onClick={onConfirm}>Delete</Button>
  </ModalFooter>
</Modal>
```

### Sizes

| Size | Width | Max Height |
|------|-------|------------|
| **sm** | 400px | 300px |
| **md** | 600px | 500px |
| **lg** | 800px | 700px |
| **xl** | 1000px | 900px |
| **full** | 95vw | 95vh |

### Animations

- **Enter:** Fade in + scale from 0.95 to 1 (300ms)
- **Exit:** Fade out + scale to 0.95 (200ms)
- **Backdrop:** Fade in/out (150ms)

### Accessibility
- Focus trap (keyboard nav stays inside modal)
- ESC key to close
- Focus returns to trigger element on close
- `aria-modal="true"` and `role="dialog"`

---

## Navigation Component

### Header / Navbar

```tsx
interface NavbarProps {
  logo?: React.ReactNode;
  links?: NavLink[];
  actions?: React.ReactNode;
  sticky?: boolean;
  transparent?: boolean;
}

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
  icon?: React.ReactNode;
}

// Usage
<Navbar
  logo={<Logo />}
  links={[
    { label: 'Projects', href: '/projects' },
    { label: 'Team', href: '/team' },
    { label: 'News', href: '/news', badge: '3' },
  ]}
  actions={<Button variant="primary">Sign In</Button>}
  sticky
/>
```

### Mobile Menu

- Hamburger icon (☰) triggers slide-in menu
- Full-screen overlay on mobile
- Slide-in animation from right (300ms)
- Close on link click or backdrop click

### States

| State | Background | Border | Shadow |
|-------|------------|--------|--------|
| **Transparent (top)** | transparent | none | none |
| **Scrolled** | deep-space/95 + blur | cosmic-blue | sm |
| **Mobile Open** | deep-space | cosmic-blue | lg |

---

## Tabs Component

```tsx
interface TabsProps {
  defaultValue?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'line' | 'pills' | 'enclosed';
  onChange?: (value: string) => void;
}

// Usage
<Tabs defaultValue="overview" variant="line">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="specs">Specifications</TabsTrigger>
    <TabsTrigger value="team">Team</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview">
    <p>Project overview...</p>
  </TabsContent>
  
  <TabsContent value="specs">
    <p>Technical specifications...</p>
  </TabsContent>
</Tabs>
```

### Variants

**Line Tabs** (default)
- Bottom border on active tab (aurora-cyan)
- Hover: opacity 0.7
- Smooth slide animation of active indicator

**Pill Tabs**
- Background on active tab (aurora-cyan/20)
- Rounded corners
- Smooth background transition

---

## Avatar Component

```tsx
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallback?: string; // Initials
  status?: 'online' | 'offline' | 'busy' | 'away';
  badge?: number | string;
  shape?: 'circle' | 'square';
}

// Usage
<Avatar
  src="/images/member.jpg"
  alt="Jan Novák"
  size="lg"
  status="online"
/>

<Avatar
  fallback="JN"
  alt="Jan Novák"
  size="md"
  badge={5}
/>
```

### Sizes

| Size | Dimensions | Font Size (fallback) |
|------|------------|----------------------|
| **xs** | 24x24px | 10px |
| **sm** | 32x32px | 12px |
| **md** | 48x48px | 16px |
| **lg** | 64x64px | 20px |
| **xl** | 96x96px | 28px |
| **2xl** | 128x128px | 36px |

### Status Indicator

- Small dot in bottom-right corner
- Colors: online (green), offline (gray), busy (red), away (orange)

---

## Toast / Notification Component

```tsx
interface ToastProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  duration?: number; // ms, default 5000
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

// Usage
toast({
  variant: 'success',
  title: 'Project saved!',
  description: 'Your changes have been saved successfully.',
  duration: 3000,
});

toast({
  variant: 'error',
  title: 'Error',
  description: 'Failed to upload image. Please try again.',
  action: {
    label: 'Retry',
    onClick: handleRetry,
  },
});
```

### Position
- Bottom-right corner
- Stack vertically if multiple toasts
- Slide in from right

### Animations
- **Enter:** Slide in from right + fade in (300ms)
- **Exit:** Slide out to right + fade out (200ms)

---

## Skeleton Loader Component

```tsx
interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  count?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

// Usage
<Skeleton variant="rect" width="100%" height={200} />
<Skeleton variant="circle" width={64} height={64} />
<Skeleton variant="text" count={3} />
```

### Animation

**Pulse**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

**Wave**
```css
@keyframes wave {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

---

## Breadcrumb Component

```tsx
interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

// Usage
<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'CRS Rocket Alpha', active: true },
  ]}
  separator={<ChevronRight size={16} />}
/>
```

---

## Pagination Component

```tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  siblingCount?: number; // Pages shown on each side
}

// Usage
<Pagination
  currentPage={3}
  totalPages={10}
  onPageChange={handlePageChange}
  siblingCount={1}
/>

// Renders: [First] [<] [2] [3] [4] [>] [Last]
```

---

## Search Component

```tsx
interface SearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  loading?: boolean;
  suggestions?: string[];
  size?: 'sm' | 'md' | 'lg';
}

// Usage
<Search
  placeholder="Search projects..."
  value={query}
  onChange={setQuery}
  onSubmit={handleSearch}
  suggestions={recentSearches}
/>
```

### Features
- Clear button (X icon) when value exists
- Loading spinner when `loading={true}`
- Dropdown suggestions on focus
- Keyboard navigation (↑↓ for suggestions, Enter to select)

---

## File Upload Component

```tsx
interface FileUploadProps {
  accept?: string; // 'image/*', '.pdf', etc.
  maxSize?: number; // bytes
  multiple?: boolean;
  onUpload?: (files: File[]) => void;
  preview?: boolean;
}

// Usage
<FileUpload
  accept="image/jpeg,image/png"
  maxSize={5 * 1024 * 1024} // 5MB
  preview
  onUpload={handleUpload}
/>
```

### States
- **Idle:** Dashed border, upload icon, "Drop files or click to upload"
- **Drag Over:** Solid border (aurora-cyan), background highlight
- **Uploading:** Progress bar
- **Success:** Checkmark, file name, preview (if image)
- **Error:** Error message, retry button

---

## Progress Bar Component

```tsx
interface ProgressProps {
  value: number; // 0-100
  variant?: 'default' | 'gradient' | 'striped';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

// Usage
<Progress value={65} variant="gradient" showLabel />
```

### Variants

**Gradient**
```css
background: linear-gradient(90deg, #64f4d2 0%, #4d9fff 100%);
```

**Striped** (animated stripes)
```css
background: repeating-linear-gradient(
  45deg,
  #64f4d2,
  #64f4d2 10px,
  #4d9fff 10px,
  #4d9fff 20px
);
animation: progress-stripes 1s linear infinite;
```

---

## Accordion Component

```tsx
interface AccordionProps {
  type?: 'single' | 'multiple'; // single: only one open
  defaultValue?: string | string[];
}

// Usage
<Accordion type="single" defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>What is Czech Rocket Society?</AccordionTrigger>
    <AccordionContent>
      <p>We are a student organization...</p>
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="item-2">
    <AccordionTrigger>How can I join?</AccordionTrigger>
    <AccordionContent>
      <p>Fill out our recruitment form...</p>
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Animations
- **Expand:** Height 0 → auto (300ms ease-out)
- **Collapse:** Height auto → 0 (200ms ease-in)
- **Icon rotation:** 0deg → 180deg

---

## Table Component

```tsx
interface TableProps {
  data: any[];
  columns: Column[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: {
    pageSize: number;
    currentPage: number;
  };
  onRowClick?: (row: any) => void;
}

// Usage
<Table
  data={projects}
  columns={[
    { key: 'name', label: 'Project Name', sortable: true },
    { key: 'status', label: 'Status', render: (val) => <Badge>{val}</Badge> },
    { key: 'date', label: 'Start Date', sortable: true },
  ]}
  sortable
  pagination={{ pageSize: 10, currentPage: 1 }}
/>
```

### Features
- Sortable columns (↑↓ icons)
- Row hover effect (background highlight)
- Sticky header on scroll
- Responsive (horizontal scroll on mobile)

---

## Tooltip Component

```tsx
interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number; // ms
  children: React.ReactNode;
}

// Usage
<Tooltip content="View project details" position="top">
  <Button variant="ghost">
    <Eye size={20} />
  </Button>
</Tooltip>
```

### Behavior
- Appears on hover (after delay)
- Keyboard trigger on focus
- Arrow pointing to element
- Auto-positioning if near viewport edge

---

## Component File Structure

```
/apps/web/components/
  /ui/
    Button.tsx
    Card.tsx
    Input.tsx
    Badge.tsx
    Modal.tsx
    Navbar.tsx
    Tabs.tsx
    Avatar.tsx
    Toast.tsx
    Skeleton.tsx
    Breadcrumb.tsx
    Pagination.tsx
    Search.tsx
    FileUpload.tsx
    Progress.tsx
    Accordion.tsx
    Table.tsx
    Tooltip.tsx
  
  /features/
    ArticleCard.tsx
    ProjectCard.tsx
    MemberProfile.tsx
    RecruitmentForm.tsx
    TelemetryChart.tsx
```

---

**Version:** 1.0  
**Date:** 8.12.2025  
**Author:** Simon Cerman
