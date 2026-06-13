# HR Management System - Modern UI Design System

## Overview

This document outlines the modern, professional design system implemented for the HR Management System. The system uses a comprehensive CSS variable-based approach for consistency, scalability, and easy maintenance.

## Design System Files

### Core Files
1. **`styles/variables.css`** - All design tokens (colors, typography, spacing, shadows, etc.)
2. **`styles/animations.css`** - Reusable animations and keyframes
3. **`styles/components.css`** - Reusable component styles (buttons, cards, forms, tables, etc.)
4. **`index.css`** - Global styles and typography
5. **`App.css`** - Main layout and page-specific styles

### Component-Specific Files
1. **`dashboard/Navbar/Navbar.css`** - Navigation bar styling
2. **`dashboard/Sidebar/Sidebar.css`** - Sidebar navigation styling
3. **`Login_Signup/login.css`** - Login page styling
4. **`Login_Signup/signup.css`** - Signup page styling

## Color Palette

### Primary Colors
- **Primary Dark**: `#1a365d` - Used for headings and primary elements
- **Primary**: `#2563eb` - Main action color
- **Primary Light**: `#1e3a8a` - Hover state

### Secondary Colors
- **Secondary**: `#06b6d4` - Accent color for highlights
- **Accent**: `#f59e0b` - Warning/attention color

### Status Colors
- **Success**: `#10b981` - Positive actions
- **Warning**: `#f97316` - Caution/warning
- **Error**: `#ef4444` - Errors/destructive actions
- **Info**: `#3b82f6` - Information

### Neutral Colors
- **Light**: `#f8fafc` - Light backgrounds
- **White**: `#ffffff` - Pure white
- **Dark**: `#0f172a` - Dark backgrounds

## Typography System

### Font Family
```css
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### Font Sizes
- `--text-xs`: 0.75rem (12px)
- `--text-sm`: 0.875rem (14px)
- `--text-base`: 1rem (16px)
- `--text-lg`: 1.125rem (18px)
- `--text-xl`: 1.25rem (20px)
- `--text-2xl`: 1.5rem (24px)
- `--text-3xl`: 1.875rem (30px)
- `--text-4xl`: 2.25rem (36px)

### Font Weights
- Light: 300
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Spacing System

Uses 8px base unit (CSS 8px grid system):
- `--spacing-1`: 0.25rem (2px)
- `--spacing-2`: 0.5rem (4px)
- `--spacing-3`: 0.75rem (6px)
- `--spacing-4`: 1rem (8px)
- `--spacing-6`: 1.5rem (12px)
- `--spacing-8`: 2rem (16px)
- `--spacing-12`: 3rem (24px)
- `--spacing-16`: 4rem (32px)

## Shadow System

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

## Border Radius

- `--radius-sm`: 0.375rem (3px)
- `--radius-md`: 0.5rem (4px)
- `--radius-lg`: 0.75rem (6px)
- `--radius-xl`: 1rem (8px)
- `--radius-2xl`: 1.5rem (12px)
- `--radius-full`: 9999px

## Reusable Components

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">Click Me</button>
```

#### Secondary Button
```html
<button class="btn btn-secondary">Secondary</button>
```

#### Outline Button
```html
<button class="btn btn-outline">Outline</button>
```

#### Button Sizes
- `.btn-sm` - Small
- `.btn` - Default
- `.btn-lg` - Large

### Cards

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    Card content goes here
  </div>
  <div class="card-footer">
    Card footer
  </div>
</div>
```

### Forms

```html
<div class="form-group">
  <label class="form-label required">Email Address</label>
  <input type="email" class="form-input" placeholder="Enter email">
  <div class="form-help">Enter a valid email address</div>
</div>
```

### Tables

```html
<div class="table-container">
  <table class="table">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Alerts

```html
<div class="alert alert-primary">
  <strong class="alert-title">Info!</strong>
  This is an informational message.
</div>
```

### Badges

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
```

## Animations

### Fade Animations
- `fadeIn` - Simple fade in
- `fadeInUp` - Fade in from bottom
- `fadeInDown` - Fade in from top
- `fadeInLeft` - Fade in from left
- `fadeInRight` - Fade in from right

### Utility Classes
- `.animate-fade-in` - Apply fade animation
- `.animate-fade-in-up` - Apply fade in up
- `.animate-scale-in` - Apply scale animation
- `.hover-lift` - Lift on hover
- `.hover-grow` - Grow on hover

### Animation Duration
- Fast: `0.15s ease-in-out`
- Base: `0.3s ease-in-out`
- Slow: `0.5s ease-in-out`

## Layout

### Navbar
- Height: `60px` (variable: `--navbar-height`)
- Fixed position at top
- z-index: 1030 (fixed)
- Responsive on mobile (< 768px)

### Sidebar
- Width: `250px` (variable: `--sidebar-width`)
- Collapsed width: `80px` (variable: `--sidebar-width-collapsed`)
- Fixed position on left
- z-index: 1030 (fixed)
- Transforms to hidden on mobile (< 768px)

### Content Wrapper
- Margin left: Accounts for sidebar
- Margin top: Accounts for navbar
- Padding: 32px (variable: `--spacing-8`)
- Scrollable (overflow-y: auto)

## Responsive Breakpoints

### Mobile First Approach
- **Mobile**: < 640px - Single column, full width
- **Tablet**: 640px - 1024px - Two columns, adjusted layouts
- **Desktop**: > 1024px - Full layouts, sidebars visible

### Media Queries Used
- `@media (max-width: 1024px)` - Large mobile/small tablet
- `@media (max-width: 768px)` - Tablet
- `@media (max-width: 640px)` - Small tablet/large mobile
- `@media (max-width: 480px)` - Mobile phone

## Best Practices

### 1. Use CSS Variables
Always use CSS variables instead of hardcoding values:
```css
/* ✅ Good */
color: var(--primary);
padding: var(--spacing-4);
font-size: var(--text-base);

/* ❌ Avoid */
color: #2563eb;
padding: 8px;
font-size: 16px;
```

### 2. Consistent Spacing
Maintain consistent spacing using the spacing scale:
```css
/* ✅ Good */
margin-bottom: var(--spacing-6);
padding: var(--spacing-4) var(--spacing-8);

/* ❌ Avoid */
margin-bottom: 20px;
padding: 15px 25px;
```

### 3. Reuse Components
Use pre-built component classes:
```html
<!-- ✅ Good -->
<button class="btn btn-primary">Submit</button>

<!-- ❌ Avoid -->
<button style="background: blue; padding: 10px 20px;">Submit</button>
```

### 4. Meaningful Class Names
```css
/* ✅ Good */
.employee-table { }
.welcome-card { }

/* ❌ Avoid */
.table-1 { }
.card-blue { }
```

### 5. Mobile First
Always design mobile first, then add media queries for larger screens:
```css
/* ✅ Good */
.navbar { /* Mobile styles */ }
@media (min-width: 768px) {
  .navbar { /* Tablet+ styles */ }
}

/* ❌ Avoid */
@media (max-width: 480px) {
  /* Only mobile-specific overrides */
}
```

## Importing Styles

### In React Components
```javascript
// In App.js or main component
import './styles/variables.css';
import './styles/animations.css';
import './styles/components.css';
import './index.css';
import './App.css';
import './dashboard/Navbar/Navbar.css';
import './dashboard/Sidebar/Sidebar.css';
```

### In Component Files
```javascript
import './Login_Signup/login.css';
import './Login_Signup/signup.css';
```

## Dark Mode Support

The design system includes dark mode support through `prefers-color-scheme`:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-light: #1a1a2e;
    --bg-white: #2d2d44;
    --border-light: #3f3f5a;
  }
}
```

## Accessibility

### Color Contrast
All text colors meet WCAG AA standards for contrast:
- Normal text: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio

### Focus States
All interactive elements have clear focus states:
```css
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Reduced Motion
Respects user's motion preferences:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Customization

To customize the design system:

1. **Colors**: Edit color variables in `styles/variables.css`
2. **Typography**: Modify font sizes and weights in `styles/variables.css`
3. **Spacing**: Adjust spacing scale in `styles/variables.css`
4. **Components**: Update component styles in `styles/components.css`

All changes will automatically propagate throughout the application.

## Troubleshooting

### Styles Not Applied
1. Ensure CSS files are imported in correct order
2. Check for CSS specificity issues
3. Verify variable names are correct (case-sensitive)

### Layout Issues
1. Check that layout variables are properly set
2. Verify media queries are working in dev tools
3. Clear browser cache and rebuild

### Performance
- CSS is minimized in production build
- Variables reduce CSS file size
- Reusable components prevent code duplication

## Support & Maintenance

For updates or changes to the design system:
1. Update variables.css first
2. Update related component styles
3. Test across all pages
4. Update this documentation

---

**Last Updated**: June 2024
**Version**: 1.0
