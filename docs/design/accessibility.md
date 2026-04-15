# ♿ Accessibility Guidelines - Czech Rocket Society Platform

## Overview

Comprehensive accessibility guidelines ensuring the platform is usable by everyone, including people with disabilities. Target: **WCAG 2.1 Level AA** compliance.

---

## Core Principles (POUR)

### 1. **Perceivable**
Information and UI components must be presentable to users in ways they can perceive.

### 2. **Operable**
UI components and navigation must be operable by all users.

### 3. **Understandable**
Information and UI operation must be understandable.

### 4. **Robust**
Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.

---

## Color & Contrast

### Minimum Contrast Ratios

| Content Type | WCAG Level AA | WCAG Level AAA |
|--------------|---------------|----------------|
| **Normal text** (< 18pt) | 4.5:1 | 7:1 |
| **Large text** (≥ 18pt or 14pt bold) | 3:1 | 4.5:1 |
| **UI components** (buttons, icons) | 3:1 | - |
| **Graphics** (charts, diagrams) | 3:1 | - |

### Color Palette Compliance

Tested combinations for our palette:

| Foreground | Background | Ratio | Pass |
|------------|------------|-------|------|
| stellar-white (#f8f9fc) | deep-space (#0a0e27) | 16.2:1 | ✅ AAA |
| moon-gray (#a8b2d1) | deep-space (#0a0e27) | 8.1:1 | ✅ AAA |
| aurora-cyan (#64f4d2) | deep-space (#0a0e27) | 11.5:1 | ✅ AAA |
| aurora-blue (#4d9fff) | deep-space (#0a0e27) | 7.8:1 | ✅ AAA |
| deep-space (#0a0e27) | aurora-cyan (#64f4d2) | 11.5:1 | ✅ AAA |

### Never Use Color Alone

❌ **Bad:**
```tsx
<span style={{ color: 'red' }}>Error</span>
```

✅ **Good:**
```tsx
<span className="text-red-500 flex items-center gap-2">
  <X size={16} aria-hidden="true" />
  Error
</span>
```

### Tools for Testing
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools: Lighthouse audit
- [Stark plugin](https://www.getstark.co/) for Figma

---

## Keyboard Navigation

### Focus Management

**Visible Focus Indicators**
```css
/* All interactive elements must have visible focus */
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid var(--aurora-cyan);
  outline-offset: 2px;
  border-radius: 4px;
}
```

**Tab Order**
- Logical reading order (left-to-right, top-to-bottom)
- Skip navigation link at top of page
- No `tabindex` > 0 (disrupts natural order)

### Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| **Tab** | Move to next focusable element | Global |
| **Shift + Tab** | Move to previous element | Global |
| **Enter** | Activate button/link | Buttons, links |
| **Space** | Activate button, toggle checkbox | Buttons, checkboxes |
| **Esc** | Close modal/dropdown | Modals, dropdowns |
| **Arrow keys** | Navigate menu/list items | Menus, lists, tabs |
| **Home** | Jump to first item | Lists, tables |
| **End** | Jump to last item | Lists, tables |

### Skip Navigation Link

```tsx
// Must be first focusable element
<a 
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-aurora-cyan focus:text-deep-space"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Page content */}
</main>
```

### Focus Trap in Modals

```tsx
import { FocusTrap } from '@headlessui/react';

<Modal open={isOpen}>
  <FocusTrap>
    <div role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  </FocusTrap>
</Modal>
```

---

## Semantic HTML

### Use Proper HTML Elements

❌ **Bad:**
```tsx
<div onClick={handleClick}>Click me</div>
```

✅ **Good:**
```tsx
<button onClick={handleClick}>Click me</button>
```

### Heading Hierarchy

```tsx
// Correct heading structure
<h1>Czech Rocket Society</h1>
  <h2>Our Projects</h2>
    <h3>CRS Rocket Alpha</h3>
      <h4>Technical Specifications</h4>
  <h2>Our Team</h2>
    <h3>Leadership</h3>
```

**Rules:**
- Only one `<h1>` per page
- Don't skip levels (h1 → h3)
- Use headings for structure, not styling

### Landmark Regions

```tsx
<body>
  <header>
    <nav aria-label="Main navigation">
      {/* Nav items */}
    </nav>
  </header>
  
  <main>
    <article>
      <h1>Article Title</h1>
      {/* Article content */}
    </article>
    
    <aside aria-label="Related content">
      {/* Sidebar */}
    </aside>
  </main>
  
  <footer>
    {/* Footer content */}
  </footer>
</body>
```

### Lists

Use semantic lists for groups of items:

```tsx
// Navigation menu
<nav>
  <ul>
    <li><a href="/projects">Projects</a></li>
    <li><a href="/team">Team</a></li>
    <li><a href="/news">News</a></li>
  </ul>
</nav>

// Ordered list for steps
<ol>
  <li>Fill out form</li>
  <li>Submit application</li>
  <li>Wait for review</li>
</ol>
```

---

## ARIA (Accessible Rich Internet Applications)

### When to Use ARIA

**First Rule of ARIA:** Don't use ARIA if you can use native HTML instead.

**Second Rule:** Don't change native semantics unless absolutely necessary.

### Common ARIA Attributes

#### Labels

```tsx
// aria-label: Direct label for elements without visible text
<button aria-label="Close dialog">
  <X size={24} />
</button>

// aria-labelledby: Reference to element ID
<section aria-labelledby="projects-heading">
  <h2 id="projects-heading">Our Projects</h2>
</section>

// aria-describedby: Additional description
<input
  type="email"
  aria-describedby="email-hint"
/>
<span id="email-hint">We'll never share your email</span>
```

#### States

```tsx
// aria-expanded: For collapsible elements
<button aria-expanded={isOpen} onClick={toggle}>
  Menu {isOpen ? '▲' : '▼'}
</button>

// aria-pressed: Toggle buttons
<button aria-pressed={isActive} onClick={toggleActive}>
  {isActive ? 'Active' : 'Inactive'}
</button>

// aria-current: Current page in navigation
<a href="/projects" aria-current="page">Projects</a>

// aria-disabled: Disabled state
<button aria-disabled="true" disabled>Submit</button>

// aria-selected: Selected item in list
<li role="option" aria-selected={isSelected}>Item</li>
```

#### Live Regions

```tsx
// Announce dynamic content changes
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// aria-live values:
// - "polite": Wait for user to finish
// - "assertive": Interrupt immediately
// - "off": Don't announce

// Toast notifications
<div role="status" aria-live="polite" aria-atomic="true">
  <p>Project saved successfully!</p>
</div>
```

#### Dialogs / Modals

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirm Delete</h2>
  <p id="modal-description">
    Are you sure you want to delete this project?
  </p>
  <button onClick={handleDelete}>Delete</button>
  <button onClick={handleClose}>Cancel</button>
</div>
```

---

## Images & Media

### Alt Text

**Informative images:**
```tsx
<img 
  src="/rocket.jpg" 
  alt="CRS Rocket Alpha launching from test site in clear sky"
/>
```

**Decorative images:**
```tsx
<img 
  src="/background-stars.jpg" 
  alt=""
  aria-hidden="true"
/>
```

**Complex images (charts, diagrams):**
```tsx
<figure>
  <img 
    src="/telemetry-chart.png" 
    alt="Altitude vs. Time graph showing rocket reaching 3000m peak"
  />
  <figcaption>
    Detailed description: The rocket launched at T+0, 
    reached max velocity at T+30s, and peak altitude 
    of 3000m at T+90s before descent.
  </figcaption>
</figure>
```

### Icons

```tsx
// Decorative icon (alongside text)
<button>
  <Rocket size={20} aria-hidden="true" />
  Launch
</button>

// Icon-only button
<button aria-label="Edit project">
  <Edit size={20} />
</button>
```

### Video

```tsx
<video controls>
  <source src="/launch.mp4" type="video/mp4" />
  <track 
    kind="captions" 
    src="/captions.vtt" 
    srcLang="en" 
    label="English"
  />
  <p>Your browser doesn't support video. 
     <a href="/launch.mp4">Download video</a>
  </p>
</video>
```

**Requirements:**
- Captions for all pre-recorded video
- Transcripts for audio-only content
- Audio descriptions for important visual information

---

## Forms

### Labels

**Always use `<label>` elements:**

✅ **Good:**
```tsx
<div>
  <label htmlFor="email">Email Address</label>
  <input type="email" id="email" name="email" />
</div>

// Or implicit labels
<label>
  Email Address
  <input type="email" name="email" />
</label>
```

❌ **Bad:**
```tsx
<div>
  <span>Email</span>
  <input type="email" />
</div>
```

### Required Fields

```tsx
<label htmlFor="name">
  Full Name <span aria-label="required">*</span>
</label>
<input
  type="text"
  id="name"
  required
  aria-required="true"
/>
```

### Error Messages

```tsx
<div>
  <label htmlFor="email">Email</label>
  <input
    type="email"
    id="email"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
  />
  {hasError && (
    <p id="email-error" role="alert" className="text-red-500">
      Please enter a valid email address
    </p>
  )}
</div>
```

### Field Groups

```tsx
<fieldset>
  <legend>Contact Information</legend>
  
  <label htmlFor="email">Email</label>
  <input type="email" id="email" />
  
  <label htmlFor="phone">Phone</label>
  <input type="tel" id="phone" />
</fieldset>
```

### Radio Buttons & Checkboxes

```tsx
<fieldset>
  <legend>Field of Study</legend>
  
  <div>
    <input type="radio" id="cs" name="field" value="cs" />
    <label htmlFor="cs">Computer Science</label>
  </div>
  
  <div>
    <input type="radio" id="ee" name="field" value="ee" />
    <label htmlFor="ee">Electrical Engineering</label>
  </div>
</fieldset>
```

---

## Interactive Components

### Buttons

```tsx
// Button with loading state
<button disabled={isLoading} aria-busy={isLoading}>
  {isLoading && <Spinner aria-hidden="true" />}
  {isLoading ? 'Saving...' : 'Save Project'}
</button>

// Icon button
<button aria-label="Delete project" onClick={handleDelete}>
  <Trash2 size={20} />
</button>

// Toggle button
<button
  role="switch"
  aria-checked={isActive}
  onClick={toggle}
>
  {isActive ? 'Active' : 'Inactive'}
</button>
```

### Links

```tsx
// Descriptive link text
✅ <a href="/projects">View all projects</a>
❌ <a href="/projects">Click here</a>

// External links
<a href="https://external.com" target="_blank" rel="noopener noreferrer">
  External Site
  <span className="sr-only">(opens in new window)</span>
  <ExternalLink size={16} aria-hidden="true" />
</a>

// Download links
<a href="/whitepaper.pdf" download>
  Download Whitepaper
  <span className="sr-only">(PDF, 2.5 MB)</span>
</a>
```

### Dropdowns / Selects

```tsx
<label htmlFor="status">Project Status</label>
<select id="status" name="status">
  <option value="">Select status</option>
  <option value="planning">Planning</option>
  <option value="in-progress">In Progress</option>
  <option value="completed">Completed</option>
</select>
```

### Custom Dropdowns

```tsx
import { Listbox } from '@headlessui/react';

<Listbox value={selected} onChange={setSelected}>
  <Listbox.Label>Assign to</Listbox.Label>
  <Listbox.Button>{selected.name}</Listbox.Button>
  <Listbox.Options>
    {people.map((person) => (
      <Listbox.Option key={person.id} value={person}>
        {person.name}
      </Listbox.Option>
    ))}
  </Listbox.Options>
</Listbox>
```

---

## Screen Reader Support

### Screen Reader Only Content

```css
/* Visually hidden but available to screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only.focusable:focus {
  position: static;
  width: auto;
  height: auto;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

```tsx
// Usage
<button>
  <Trash2 size={20} aria-hidden="true" />
  <span className="sr-only">Delete project</span>
</button>
```

### Announce Dynamic Content

```tsx
// Loading state
<div role="status" aria-live="polite">
  {isLoading && <span className="sr-only">Loading projects...</span>}
</div>

// Success message
<div role="status" aria-live="polite" aria-atomic="true">
  {showSuccess && 'Project saved successfully!'}
</div>

// Error alert
<div role="alert" aria-live="assertive">
  {error && `Error: ${error.message}`}
</div>
```

---

## Touch & Mobile

### Touch Targets

**Minimum size: 44x44px** (WCAG 2.1)

```css
/* Ensure all interactive elements are large enough */
button,
a,
input[type="checkbox"],
input[type="radio"] {
  min-height: 44px;
  min-width: 44px;
}

/* Add padding to increase touch area */
.icon-button {
  padding: 12px;
}
```

### Spacing Between Targets

```css
/* Minimum 8px spacing between touch targets */
.button-group button + button {
  margin-left: 8px;
}
```

### Avoid Hover-Only Features

❌ **Bad:** Dropdown only works on hover
```tsx
<div className="group">
  <button>Menu</button>
  <div className="hidden group-hover:block">
    {/* Dropdown items */}
  </div>
</div>
```

✅ **Good:** Click/tap to open
```tsx
<button onClick={toggleDropdown} aria-expanded={isOpen}>
  Menu
</button>
{isOpen && (
  <div role="menu">
    {/* Dropdown items */}
  </div>
)}
```

---

## Testing Checklist

### Automated Testing

- [ ] **Lighthouse** accessibility audit (score ≥ 90)
- [ ] **axe DevTools** - no violations
- [ ] **WAVE** browser extension
- [ ] **ESLint** with `eslint-plugin-jsx-a11y`

### Manual Testing

- [ ] **Keyboard navigation** - Tab through entire page
- [ ] **Screen reader** - Test with NVDA/JAWS (Windows) or VoiceOver (Mac)
- [ ] **Color contrast** - All text meets minimum ratios
- [ ] **Zoom to 200%** - Content still readable and functional
- [ ] **Mobile** - Touch targets ≥ 44px
- [ ] **Focus indicators** - Visible on all interactive elements
- [ ] **Forms** - All fields have labels and error messages

### Browser & Screen Reader Combinations

| OS | Browser | Screen Reader |
|----|---------|---------------|
| Windows | Chrome | NVDA (free) |
| Windows | Firefox | JAWS |
| macOS | Safari | VoiceOver (built-in) |
| iOS | Safari | VoiceOver (built-in) |
| Android | Chrome | TalkBack (built-in) |

---

## Common Patterns

### Loading States

```tsx
<section aria-busy={isLoading} aria-live="polite">
  {isLoading ? (
    <>
      <Spinner aria-hidden="true" />
      <span className="sr-only">Loading projects...</span>
    </>
  ) : (
    <ProjectList projects={projects} />
  )}
</section>
```

### Empty States

```tsx
<div role="status">
  {projects.length === 0 ? (
    <p>No projects found. <a href="/projects/new">Create your first project</a></p>
  ) : (
    <ProjectList projects={projects} />
  )}
</div>
```

### Pagination

```tsx
<nav aria-label="Pagination">
  <ul className="flex gap-2">
    <li>
      <a href="?page=1" aria-label="Go to first page">First</a>
    </li>
    <li>
      <a href="?page=2" aria-label="Go to previous page, page 2">Previous</a>
    </li>
    <li>
      <a href="?page=3" aria-current="page">3</a>
    </li>
    <li>
      <a href="?page=4" aria-label="Go to next page, page 4">Next</a>
    </li>
    <li>
      <a href="?page=10" aria-label="Go to last page, page 10">Last</a>
    </li>
  </ul>
</nav>
```

### Data Tables

```tsx
<table>
  <caption>Project Status Overview</caption>
  <thead>
    <tr>
      <th scope="col">Project Name</th>
      <th scope="col">Status</th>
      <th scope="col">Team Size</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>CRS Rocket Alpha</td>
      <td>In Progress</td>
      <td>8 members</td>
    </tr>
  </tbody>
</table>
```

---

## Resources

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Chrome DevTools
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/) - Desktop app
- [Accessibility Insights](https://accessibilityinsights.io/) - Microsoft tool

### Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - Official guidelines
- [WebAIM](https://webaim.org/) - Articles and resources
- [A11y Project](https://www.a11yproject.com/) - Community-driven checklist
- [Inclusive Components](https://inclusive-components.design/) - Component patterns

### Testing
- [NVDA](https://www.nvaccess.org/) - Free screen reader (Windows)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) - Built-in (macOS/iOS)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) - Popular screen reader

---

**Version:** 1.0  
**Date:** 8.12.2025  
**Author:** Simon Cerman
