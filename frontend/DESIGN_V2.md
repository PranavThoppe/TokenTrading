# 🎨 Modern Design System

## Overview
Clean, modern design with subtle gradients and refined aesthetics.

## Design Philosophy
- **Minimalist**: Clean lines, ample whitespace
- **Modern**: Gradient accents, smooth transitions
- **Professional**: Refined color palette, consistent spacing
- **Accessible**: High contrast, clear hierarchy

## Color Palette

### Primary Colors
- **Violet**: `#8b5cf6` - Primary accent
- **Fuchsia**: `#d946ef` - Secondary accent
- **Emerald**: `#10b981` - Success states
- **Red**: `#ef4444` - Error/warning states

### Background
- **Dark Gradient**: `from-slate-950 via-slate-900 to-slate-950`
- **Subtle Overlay**: Violet/Fuchsia gradient at 5% opacity

### Text
- **Primary**: Pure white (`#ffffff`)
- **Secondary**: Slate-400 (`#94a3b8`)
- **Tertiary**: Slate-500 (`#64748b`)

## Typography

### Font Family
- **Primary**: Space Grotesk - Modern, geometric sans-serif
- **Fallback**: System fonts for performance

### Hierarchy
- **Hero**: 5xl-6xl, bold
- **Headings**: xl-2xl, bold
- **Body**: base-lg, regular
- **Small**: sm-xs, regular

## Components

### Buttons
- **Primary**: Gradient (violet to fuchsia)
- **Secondary**: Transparent with border
- **Danger**: Red with low opacity background
- **States**: Hover, active, disabled

### Cards
- **Background**: Gradient with border
- **Border**: Violet/purple with 30% opacity
- **Hover**: Increased opacity, scale transform
- **Shadow**: Subtle, no heavy glows

### Status Indicators
- **Connected**: Emerald dot with pulse
- **Error**: Red dot with pulse
- **Size**: 2x2 (8px)

### Layout
- **Max Width**: 6xl (1152px)
- **Padding**: 6 (24px) horizontal
- **Spacing**: Consistent 4-8-12-16-20 scale

## Animations
- **Transitions**: 300ms ease
- **Hover Scale**: 1.05 for cards
- **Pulse**: For status indicators
- **No**: Heavy glows, excessive shadows

## Accessibility
- **Contrast**: WCAG AA compliant
- **Focus States**: Visible outlines
- **Touch Targets**: Minimum 44x44px
- **Semantic HTML**: Proper heading hierarchy

## Performance
- **Font Loading**: Google Fonts with display=swap
- **Animations**: GPU-accelerated transforms
- **Images**: Optimized, lazy-loaded
- **Bundle**: Tree-shaken, code-split
