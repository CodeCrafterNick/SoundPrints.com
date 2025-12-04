/**
 * SoundPrints Color Schemes
 * 5 different color palette options for the brand
 */

export interface ColorScheme {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    accent: string
    accentForeground: string
    background: string
    foreground: string
    muted: string
    mutedForeground: string
    card: string
    cardForeground: string
    border: string
    destructive: string
  }
  gradient: string
  preview: {
    light: string[]
    dark: string[]
  }
}

export const colorSchemes: ColorScheme[] = [
  {
    id: 'rose-classic',
    name: 'Rose Classic',
    description: 'Warm and inviting rose/pink tones. The current default - romantic and memorable.',
    colors: {
      primary: '#e11d48',           // Rose 600
      primaryForeground: '#ffffff',
      secondary: '#f1f5f9',         // Slate 100
      secondaryForeground: '#0f172a',
      accent: '#fda4af',            // Rose 300
      accentForeground: '#881337',
      background: '#ffffff',
      foreground: '#0f172a',        // Slate 900
      muted: '#f1f5f9',             // Slate 100
      mutedForeground: '#64748b',   // Slate 500
      card: '#ffffff',
      cardForeground: '#0f172a',
      border: '#e2e8f0',            // Slate 200
      destructive: '#dc2626',
    },
    gradient: 'from-rose-500 via-rose-600 to-pink-600',
    preview: {
      light: ['#e11d48', '#fda4af', '#fff1f2', '#f1f5f9'],
      dark: ['#fb7185', '#e11d48', '#881337', '#0f172a'],
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Cool and professional blue tones. Trust-inspiring and modern.',
    colors: {
      primary: '#0ea5e9',           // Sky 500
      primaryForeground: '#ffffff',
      secondary: '#f0f9ff',         // Sky 50
      secondaryForeground: '#0c4a6e',
      accent: '#38bdf8',            // Sky 400
      accentForeground: '#075985',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f0f9ff',
      mutedForeground: '#64748b',
      card: '#ffffff',
      cardForeground: '#0f172a',
      border: '#e0f2fe',
      destructive: '#dc2626',
    },
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    preview: {
      light: ['#0ea5e9', '#38bdf8', '#e0f2fe', '#f0f9ff'],
      dark: ['#38bdf8', '#0ea5e9', '#0369a1', '#0c4a6e'],
    },
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Natural and earthy green tones. Calming, eco-friendly feel.',
    colors: {
      primary: '#16a34a',           // Green 600
      primaryForeground: '#ffffff',
      secondary: '#f0fdf4',         // Green 50
      secondaryForeground: '#14532d',
      accent: '#4ade80',            // Green 400
      accentForeground: '#166534',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f0fdf4',
      mutedForeground: '#64748b',
      card: '#ffffff',
      cardForeground: '#0f172a',
      border: '#dcfce7',
      destructive: '#dc2626',
    },
    gradient: 'from-emerald-400 via-green-500 to-teal-600',
    preview: {
      light: ['#16a34a', '#4ade80', '#dcfce7', '#f0fdf4'],
      dark: ['#4ade80', '#16a34a', '#166534', '#14532d'],
    },
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    description: 'Warm amber and orange tones. Energetic and creative.',
    colors: {
      primary: '#f59e0b',           // Amber 500
      primaryForeground: '#ffffff',
      secondary: '#fffbeb',         // Amber 50
      secondaryForeground: '#78350f',
      accent: '#fbbf24',            // Amber 400
      accentForeground: '#92400e',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#fffbeb',
      mutedForeground: '#64748b',
      card: '#ffffff',
      cardForeground: '#0f172a',
      border: '#fef3c7',
      destructive: '#dc2626',
    },
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    preview: {
      light: ['#f59e0b', '#fbbf24', '#fef3c7', '#fffbeb'],
      dark: ['#fbbf24', '#f59e0b', '#b45309', '#78350f'],
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Rich purple and violet tones. Creative, luxurious, unique.',
    colors: {
      primary: '#7c3aed',           // Violet 600
      primaryForeground: '#ffffff',
      secondary: '#f5f3ff',         // Violet 50
      secondaryForeground: '#4c1d95',
      accent: '#a78bfa',            // Violet 400
      accentForeground: '#5b21b6',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f5f3ff',
      mutedForeground: '#64748b',
      card: '#ffffff',
      cardForeground: '#0f172a',
      border: '#ede9fe',
      destructive: '#dc2626',
    },
    gradient: 'from-purple-400 via-violet-500 to-indigo-600',
    preview: {
      light: ['#7c3aed', '#a78bfa', '#ede9fe', '#f5f3ff'],
      dark: ['#a78bfa', '#7c3aed', '#5b21b6', '#4c1d95'],
    },
  },
]

// Helper to get a scheme by ID
export function getColorScheme(id: string): ColorScheme | undefined {
  return colorSchemes.find(scheme => scheme.id === id)
}

// CSS custom properties generator
export function generateCSSVariables(scheme: ColorScheme): string {
  return `
    --primary: ${scheme.colors.primary};
    --primary-foreground: ${scheme.colors.primaryForeground};
    --secondary: ${scheme.colors.secondary};
    --secondary-foreground: ${scheme.colors.secondaryForeground};
    --accent: ${scheme.colors.accent};
    --accent-foreground: ${scheme.colors.accentForeground};
    --background: ${scheme.colors.background};
    --foreground: ${scheme.colors.foreground};
    --muted: ${scheme.colors.muted};
    --muted-foreground: ${scheme.colors.mutedForeground};
    --card: ${scheme.colors.card};
    --card-foreground: ${scheme.colors.cardForeground};
    --border: ${scheme.colors.border};
    --destructive: ${scheme.colors.destructive};
  `.trim()
}

// Tailwind config generator
export function generateTailwindConfig(scheme: ColorScheme) {
  return {
    primary: {
      DEFAULT: scheme.colors.primary,
      foreground: scheme.colors.primaryForeground,
    },
    secondary: {
      DEFAULT: scheme.colors.secondary,
      foreground: scheme.colors.secondaryForeground,
    },
    accent: {
      DEFAULT: scheme.colors.accent,
      foreground: scheme.colors.accentForeground,
    },
    muted: {
      DEFAULT: scheme.colors.muted,
      foreground: scheme.colors.mutedForeground,
    },
    card: {
      DEFAULT: scheme.colors.card,
      foreground: scheme.colors.cardForeground,
    },
  }
}
