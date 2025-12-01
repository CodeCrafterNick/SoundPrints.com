import type { WaveformStyle, GradientStop } from './stores/customizer-store'

export interface DesignPreset {
  id: string
  name: string
  description: string
  category: 'minimal' | 'vibrant' | 'elegant' | 'retro' | 'nature' | 'celebration'
  preview: {
    backgroundColor: string
    waveformColor: string
  }
  settings: {
    // Waveform
    waveformColor: string
    waveformUseGradient: boolean
    waveformGradientStops: GradientStop[]
    waveformGradientDirection: 'horizontal' | 'vertical' | 'diagonal' | 'radial'
    waveformStyle: WaveformStyle
    
    // Background
    backgroundColor: string
    backgroundUseGradient: boolean
    backgroundGradientStops: GradientStop[]
    backgroundGradientDirection: 'horizontal' | 'vertical' | 'diagonal' | 'radial'
    
    // Text
    textColor: string
    fontFamily: string
  }
}

export const DESIGN_PRESETS: DesignPreset[] = [
  // Minimal
  {
    id: 'minimal-black',
    name: 'Minimal Black',
    description: 'Clean black on white',
    category: 'minimal',
    preview: { backgroundColor: '#FFFFFF', waveformColor: '#000000' },
    settings: {
      waveformColor: '#000000',
      waveformUseGradient: false,
      waveformGradientStops: [{ color: '#000000', position: 0 }, { color: '#333333', position: 1 }],
      waveformGradientDirection: 'horizontal',
      waveformStyle: 'bars',
      backgroundColor: '#FFFFFF',
      backgroundUseGradient: false,
      backgroundGradientStops: [{ color: '#FFFFFF', position: 0 }, { color: '#F5F5F5', position: 1 }],
      backgroundGradientDirection: 'vertical',
      textColor: '#000000',
      fontFamily: 'Inter',
    }
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    description: 'Clean white on black',
    category: 'minimal',
    preview: { backgroundColor: '#1A1A1A', waveformColor: '#FFFFFF' },
    settings: {
      waveformColor: '#FFFFFF',
      waveformUseGradient: false,
      waveformGradientStops: [{ color: '#FFFFFF', position: 0 }, { color: '#CCCCCC', position: 1 }],
      waveformGradientDirection: 'horizontal',
      waveformStyle: 'bars',
      backgroundColor: '#1A1A1A',
      backgroundUseGradient: false,
      backgroundGradientStops: [{ color: '#1A1A1A', position: 0 }, { color: '#000000', position: 1 }],
      backgroundGradientDirection: 'vertical',
      textColor: '#FFFFFF',
      fontFamily: 'Inter',
    }
  },
  {
    id: 'minimal-gray',
    name: 'Soft Gray',
    description: 'Subtle gray tones',
    category: 'minimal',
    preview: { backgroundColor: '#F8F8F8', waveformColor: '#6B7280' },
    settings: {
      waveformColor: '#6B7280',
      waveformUseGradient: false,
      waveformGradientStops: [{ color: '#6B7280', position: 0 }, { color: '#9CA3AF', position: 1 }],
      waveformGradientDirection: 'horizontal',
      waveformStyle: 'smooth',
      backgroundColor: '#F8F8F8',
      backgroundUseGradient: false,
      backgroundGradientStops: [{ color: '#F8F8F8', position: 0 }, { color: '#E5E7EB', position: 1 }],
      backgroundGradientDirection: 'vertical',
      textColor: '#374151',
      fontFamily: 'Playfair Display',
    }
  },
  
  // Vibrant
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    description: 'Vibrant pink to blue gradient',
    category: 'vibrant',
    preview: { backgroundColor: '#0F0F23', waveformColor: '#FF00FF' },
    settings: {
      waveformColor: '#FF00FF',
      waveformUseGradient: true,
      waveformGradientStops: [
        { color: '#FF00FF', position: 0 },
        { color: '#00FFFF', position: 1 }
      ],
      waveformGradientDirection: 'horizontal',
      waveformStyle: 'neon',
      backgroundColor: '#0F0F23',
      backgroundUseGradient: true,
      backgroundGradientStops: [
        { color: '#0F0F23', position: 0 },
        { color: '#1A1A3E', position: 1 }
      ],
      backgroundGradientDirection: 'vertical',
      textColor: '#FFFFFF',
      fontFamily: 'Orbitron',
    }
  },
  {
    id: 'sunset-vibes',
    name: 'Sunset Vibes',
    description: 'Warm orange to pink gradient',
    category: 'vibrant',
    preview: { backgroundColor: '#1F1135', waveformColor: '#FF6B35' },
    settings: {
      waveformColor: '#FF6B35',
      waveformUseGradient: true,
      waveformGradientStops: [
        { color: '#FF6B35', position: 0 },
        { color: '#FF1493', position: 0.5 },
        { color: '#8B5CF6', position: 1 }
      ],
      waveformGradientDirection: 'horizontal',
      waveformStyle: 'gradient-bars',
      backgroundColor: '#1F1135',
      backgroundUseGradient: true,
      backgroundGradientStops: [
        { color: '#1F1135', position: 0 },
        { color: '#2D1B4E', position: 1 }
      ],
      backgroundGradientDirection: 'vertical',
      textColor: '#FFD700',
      fontFamily: 'Poppins',
    }
  },
  {
    id: 'electric-blue',
    name: 'Electric Blue',
    description: 'High-energy blue theme',
    category: 'vibrant',
    preview: { backgroundColor: '#000814', waveformColor: '#00D4FF' },
    settings: {
      waveformColor: '#00D4FF',
      waveformUseGradient: true,
      waveformGradientStops: [
        { color: '#00D4FF', position: 0 },
        { color: '#0066FF', position: 1 }
      ],
      waveformGradientDirection: 'vertical',
      waveformStyle: 'frequency',
      backgroundColor: '#000814',
      backgroundUseGradient: false,
      backgroundGradientStops: [{ color: '#000814', position: 0 }, { color: '#001D3D', position: 1 }],
      backgroundGradientDirection: 'vertical',
      textColor: '#00D4FF',
      fontFamily: 'Rajdhani',
    }
  },
  
  // Elegant
  {
    id: 'wedding-gold',
    name: 'Wedding Gold',
    description: 'Elegant gold on ivory',
    category: 'elegant',
    preview: { backgroundColor: '#FFFBF0', waveformColor: '#D4AF37' },
    settings: {
      waveformColor: '#D4AF37',
      waveformUseGradient: true,
      waveformGradientStops: [
        { color: '#D4AF37', position: 0 },
        { color: '#F4E4BC', position: 0.5 },
        { color: '#D4AF37', position: 1 }
      ],
      waveformGradientDirection: 'horizontal',
      waveformStyle: 'smooth',
      backgroundColor: '#FFFBF0',
      backgroundUseGradient: false,
      backgroundGradientStops: [{ color: '#FFFBF0', position: 0 }, { color: '#FFF8E7', position: 1 }],
      backgroundGradientDirection: 'vertical',
      textColor: '#8B7355',
      fontFamily: 'Cormorant Garamond',
    }
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Romantic rose gold tones',
    category: 'elegant',
    preview: { backgroundColor: '#FFF5F5', waveformColor: '#E8A598' },
    settings: {
      waveformColor: '#E8A598',
      waveformUseGradient: true,
      waveformGradientStops: [
        { color: '#E8A598', position: 0 },
        { color: '#D4A574', position: 1 }
      ],
      waveformGradientDirection: 'diagonal',
      waveformStyle: 'heartbeat',
      backgroundColor: '#FFF5F5',
      backgroundUseGradient: false,
      backgroundGradientStops: [{ color: '#FFF5F5', position: 0 }, { color: '#FFF0F0', position: 1 }],
      backgroundGradientDirection: 'vertical',
      textColor: '#8B6969',
      fontFamily: 'Great Vibes',
    }
  },
  {
    id: 'navy-silver',
    name: 'Navy & Silver',
    description: 'Sophisticated navy with silver',
    category: 'elegant',
    preview: { backgroundColor: '#1B2838', waveformColor: '#C0C0C0' },
    settings: {
      waveformColor: '#C0C0C0',
      waveformUseGradient: true,
      waveformGradientStops: [
        { color: '#C0C0C0', position: 0 },
        { color: '#E8E8E8', position: 0.5 },
        { color: '#C0C0C0', position: 1 }
      ],
      waveformGradientDirection: 'horizontal',
      waveformStyle: 'constellation',
      backgroundColor: '#1B2838',
      backgroundUseGradient: false,
      backgroundGradientStops: [{ color: '#1B2838', position: 0 }, { color: '#0F1C2E', position: 1 }],
      backgroundGradientDirection: 'vertical',
      textColor: '#D1D5DB',
      fontFamily: 'Cinzel',
    }
  },
  
  // Retro
  {
    id: 'vintage-vinyl',
    name: 'Vintage Vinyl',
    description: 'Classic vinyl record vibes',
    category: 'retro',
    preview: { backgroundColor: '#2C1810', waveformColor: '#F4A460' },
    settings: {
      waveformColor: '#F4A460',
      waveformUseGradient: false,
      waveformGradientStops: [{ color: '#F4A460', position: 0 }, { color: '#DEB887', position: 1 }],
      waveformGradientDirection: 'horizontal',
      waveformStyle: 'vinyl',
      backgroundColor: '#2C1810',
      backgroundUseGradient: false,
      backgroundGradientStops: [{ color: '#2C1810', position: 0 }, { color: '#1A0F0A', position: 1 }],
      backgroundGradientDirection: 'vertical',
      textColor: '#F4A460',
      fontFamily: 'Bebas Neue',
    }
  },
  {
    id: 'retro-wave',
    name: 'Retro Wave',
    description: '80s synthwave aesthetic',
    category: 'retro',
    preview: { backgroundColor: '#2D1B4E', waveformColor: '#FF1493' },
    settings: {
      waveformColor: '#FF1493',
      waveformUseGradient: true,
      waveformGradientStops: [
        { color: '#FF1493', position: 0 },
        { color: '#00CED1', position: 1 }
      ],
      waveformGradientDirection: 'horizontal',
      waveformStyle: 'wave3d',
      backgroundColor: '#2D1B4E',
      backgroundUseGradient: true,
      backgroundGradientStops: [
        { color: '#2D1B4E', position: 0 },
        { color: '#1A0A2E', position: 0.5 },
        { color: '#0D0D2B', position: 1 }
      ],
      backgroundGradientDirection: 'vertical',
      textColor: '#FF1493',
      fontFamily: 'Press Start 2P',
    }
  },
  {
    id: 'classic-sepia',
    name: 'Classic Sepia',
    description: 'Timeless sepia tones',
    category: 'retro',
    preview: { backgroundColor: '#F5F0E1', waveformColor: '#8B7355' },
    settings: {
      waveformColor: '#8B7355',
      waveformUseGradient: false,
      waveformGradientStops: [{ color: '#8B7355', position: 0 }, { color: '#A0826D', position: 1 }],
      waveformGradientDirection: 'horizontal',
      waveformStyle: 'bars',
      backgroundColor: '#F5F0E1',
      backgroundUseGradient: false,
      backgroundGradientStops: [{ color: '#F5F0E1', position: 0 }, { color: '#E8E0CC', position: 1 }],
      backgroundGradientDirection: 'vertical',
      textColor: '#5D4E37',
      fontFamily: 'Courier Prime',
    }
  },
  
  // Nature
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Deep forest tones',
    category: 'nature',
    preview: { backgroundColor: '#0D1F0D', waveformColor: '#228B22' },
    settings: {
      waveformColor: '#228B22',
      waveformUseGradient: true,
      waveformGradientStops: [
        { color: '#228B22', position: 0 },
        { color: '#32CD32', position: 1 }
      ],
      waveformGradientDirection: 'vertical',
      waveformStyle: 'mountain',
      backgroundColor: '#0D1F0D',
      backgroundUseGradient: false,
      backgroundGradientStops: [{ color: '#0D1F0D', position: 0 }, { color: '#1A2F1A', position: 1 }],
      backgroundGradientDirection: 'vertical',
      textColor: '#90EE90',
      fontFamily: 'Lora',
    }
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    description: 'Deep sea blues',
    category: 'nature',
    preview: { backgroundColor: '#001F3F', waveformColor: '#00CED1' },
    settings: {
      waveformColor: '#00CED1',
      waveformUseGradient: true,
      waveformGradientStops: [
        { color: '#006994', position: 0 },
        { color: '#00CED1', position: 0.5 },
        { color: '#40E0D0', position: 1 }
      ],
      waveformGradientDirection: 'vertical',
      waveformStyle: 'ripple',
      backgroundColor: '#001F3F',
      backgroundUseGradient: true,
      backgroundGradientStops: [
        { color: '#001F3F', position: 0 },
        { color: '#003366', position: 1 }
      ],
      backgroundGradientDirection: 'vertical',
      textColor: '#87CEEB',
      fontFamily: 'Quicksand',
    }
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    description: 'Northern lights magic',
    category: 'nature',
    preview: { backgroundColor: '#0C1445', waveformColor: '#00FF7F' },
    settings: {
      waveformColor: '#00FF7F',
      waveformUseGradient: true,
      waveformGradientStops: [
        { color: '#00FF7F', position: 0 },
        { color: '#00CED1', position: 0.33 },
        { color: '#9370DB', position: 0.66 },
        { color: '#FF69B4', position: 1 }
      ],
      waveformGradientDirection: 'horizontal',
      waveformStyle: 'aurora',
      backgroundColor: '#0C1445',
      backgroundUseGradient: true,
      backgroundGradientStops: [
        { color: '#0C1445', position: 0 },
        { color: '#1A1A4E', position: 0.5 },
        { color: '#0C1445', position: 1 }
      ],
      backgroundGradientDirection: 'vertical',
      textColor: '#E0FFFF',
      fontFamily: 'Comfortaa',
    }
  },
  
  // Celebration
  {
    id: 'birthday-party',
    name: 'Birthday Party',
    description: 'Festive and fun',
    category: 'celebration',
    preview: { backgroundColor: '#FFF0F5', waveformColor: '#FF69B4' },
    settings: {
      waveformColor: '#FF69B4',
      waveformUseGradient: true,
      waveformGradientStops: [
        { color: '#FF69B4', position: 0 },
        { color: '#FFD700', position: 0.5 },
        { color: '#00CED1', position: 1 }
      ],
      waveformGradientDirection: 'horizontal',
      waveformStyle: 'particle',
      backgroundColor: '#FFF0F5',
      backgroundUseGradient: false,
      backgroundGradientStops: [{ color: '#FFF0F5', position: 0 }, { color: '#FFE4E1', position: 1 }],
      backgroundGradientDirection: 'vertical',
      textColor: '#FF1493',
      fontFamily: 'Pacifico',
    }
  },
  {
    id: 'new-years',
    name: 'New Years Eve',
    description: 'Glamorous gold sparkles',
    category: 'celebration',
    preview: { backgroundColor: '#000000', waveformColor: '#FFD700' },
    settings: {
      waveformColor: '#FFD700',
      waveformUseGradient: true,
      waveformGradientStops: [
        { color: '#FFD700', position: 0 },
        { color: '#FFFFFF', position: 0.5 },
        { color: '#FFD700', position: 1 }
      ],
      waveformGradientDirection: 'horizontal',
      waveformStyle: 'galaxy',
      backgroundColor: '#000000',
      backgroundUseGradient: false,
      backgroundGradientStops: [{ color: '#000000', position: 0 }, { color: '#1A1A1A', position: 1 }],
      backgroundGradientDirection: 'vertical',
      textColor: '#FFD700',
      fontFamily: 'Playfair Display',
    }
  },
  {
    id: 'valentines',
    name: 'Valentine\'s Day',
    description: 'Romantic reds and pinks',
    category: 'celebration',
    preview: { backgroundColor: '#FFF0F5', waveformColor: '#FF1744' },
    settings: {
      waveformColor: '#FF1744',
      waveformUseGradient: true,
      waveformGradientStops: [
        { color: '#FF1744', position: 0 },
        { color: '#FF69B4', position: 1 }
      ],
      waveformGradientDirection: 'horizontal',
      waveformStyle: 'heartbeat',
      backgroundColor: '#FFF0F5',
      backgroundUseGradient: false,
      backgroundGradientStops: [{ color: '#FFF0F5', position: 0 }, { color: '#FFE4EC', position: 1 }],
      backgroundGradientDirection: 'vertical',
      textColor: '#C41E3A',
      fontFamily: 'Dancing Script',
    }
  },
]

export const PRESET_CATEGORIES = [
  { id: 'minimal', name: 'Minimal', icon: 'Square' },
  { id: 'vibrant', name: 'Vibrant', icon: 'Rainbow' },
  { id: 'elegant', name: 'Elegant', icon: 'Sparkles' },
  { id: 'retro', name: 'Retro', icon: 'Radio' },
  { id: 'nature', name: 'Nature', icon: 'Leaf' },
  { id: 'celebration', name: 'Celebration', icon: 'PartyPopper' },
] as const

export function getPresetsByCategory(category: string): DesignPreset[] {
  return DESIGN_PRESETS.filter(preset => preset.category === category)
}
