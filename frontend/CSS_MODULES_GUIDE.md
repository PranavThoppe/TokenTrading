# CSS Modules Guide

## What are CSS Modules?

CSS Modules are a way to write CSS that is scoped to a specific component. Each class name is automatically transformed to be unique, preventing style conflicts between components.

## How It Works

### 1. File Naming
- CSS Module files must end with `.module.css`
- Example: `PackCard.module.css`

### 2. Importing Styles
```tsx
import styles from './PackCard.module.css';
```

### 3. Using Classes
```tsx
// Single class
<div className={styles.card} />

// Multiple classes (combining)
<div className={`${styles.card} ${styles.cardStarter}`} />

// Conditional classes
<div className={`${styles.base} ${isActive ? styles.active : styles.inactive}`} />
```

### 4. What Happens Behind the Scenes

**Before (CSS Module):**
```css
.card {
  padding: 1rem;
}
```

**After (Compiled):**
```css
.PackCard_card_abc123 {
  padding: 1rem;
}
```

**In Component:**
```tsx
className={styles.card} // Becomes "PackCard_card_abc123"
```

## Benefits

1. **No Class Name Conflicts** - Styles are automatically scoped
2. **Type Safety** - TypeScript knows about available classes
3. **No Build Issues** - All classes are always available (no safelist needed)
4. **Better Organization** - Styles live next to components
5. **Easy Refactoring** - Rename classes without breaking other components

## Examples in This Project

### PackCard Component
- **File**: `PackCard.module.css`
- **Usage**: `PackCard.tsx`
- **Pattern**: Base classes + variant classes for different pack types

### PackStore Component
- **File**: `PackStore.module.css`
- **Usage**: `PackStore.tsx`
- **Pattern**: Responsive grid, loading states, animations

## Common Patterns

### Combining Classes
```tsx
// Base class + variant
className={`${styles.card} ${styles.cardStarter}`}

// Multiple classes
className={`${styles.button} ${styles.buttonPrimary} ${isDisabled ? styles.disabled : ''}`}
```

### Conditional Classes
```tsx
const variant = packType === 'starter' ? styles.starter : styles.standard;
className={`${styles.base} ${variant}`}
```

### Inline Styles (for dynamic values)
```tsx
// CSS Modules for static styles, inline for dynamic values
<div 
  className={styles.progressBar}
  style={{ width: `${percentage}%` }}
/>
```

## References

- [CSS Modules GitHub](https://github.com/css-modules/css-modules)
- [Vite CSS Modules](https://vitejs.dev/guide/features.html#css-modules)
- [MDN CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [MDN CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)

## Migration from Tailwind

### Before (Tailwind)
```tsx
<div className="rounded-xl border-2 border-green-500/50 p-6">
```

### After (CSS Modules)
```tsx
// In CSS file
.card {
  border-radius: 0.75rem;
  border: 2px solid rgba(34, 197, 94, 0.5);
  padding: 1.5rem;
}

// In component
<div className={styles.card}>
```

## Tips

1. **Use descriptive class names** - They're scoped, so be specific
2. **Group related styles** - Keep variants together
3. **Use CSS variables** - For theme colors that change
4. **Combine with inline styles** - For truly dynamic values (like percentages)
5. **Leverage CSS features** - Use `:hover`, `:disabled`, etc. in CSS files
