import { motion } from 'framer-motion';

interface PixelFruitProps {
  type: 'apple' | 'orange' | 'kiwi' | 'banana' | 'grape' | 'strawberry' | 'pear' | 'plum';
  className?: string;
}

const fruitColors = {
  apple: {
    main: '#e74c3c',
    shadow: '#c0392b',
    highlight: '#ff6b6b',
    leaf: '#2ecc71'
  },
  orange: {
    main: '#f39c12',
    shadow: '#d35400',
    highlight: '#ffa53f',
    leaf: '#27ae60'
  },
  kiwi: {
    main: '#8e723c',
    shadow: '#6d4c41',
    highlight: '#a1887f',
    flesh: '#cddc39'
  },
  banana: {
    main: '#f1c40f',
    shadow: '#f39c12',
    highlight: '#ffeb3b',
    spots: '#795548'
  },
  grape: {
    main: '#8e44ad',
    shadow: '#6c3483',
    highlight: '#9b59b6',
    leaf: '#27ae60'
  },
  strawberry: {
    main: '#e74c3c',
    shadow: '#c0392b',
    highlight: '#ff6b6b',
    seeds: '#fff'
  },
  pear: {
    main: '#a4b72f',
    shadow: '#8e9c24',
    highlight: '#cddc39',
    leaf: '#2ecc71'
  },
  plum: {
    main: '#8e44ad',
    shadow: '#6c3483',
    highlight: '#9b59b6',
    leaf: '#27ae60'
  }
} as const;

export function PixelFruit({ type, className = '' }: PixelFruitProps) {
  // Ensure we have valid colors or use fallback colors
  const colors = fruitColors[type] || fruitColors.apple;
  
  const getFruitSpecificDetails = () => {
    switch (type) {
      case 'apple':
        return (
          <>
            <rect x="14" y="4" width="4" height="4" fill={colors.leaf} />
            <rect x="16" y="2" width="2" height="2" fill={colors.leaf} />
          </>
        );
      case 'kiwi':
        return (
          <>
            <rect x="12" y="12" width="8" height="8" fill={colors.flesh} />
            <rect x="14" y="14" width="2" height="2" fill={colors.shadow} />
            <rect x="16" y="16" width="2" height="2" fill={colors.shadow} />
          </>
        );
      case 'orange':
        return (
          <>
            <circle cx="16" cy="16" r="6" fill={colors.highlight} />
            <rect x="15" y="4" width="2" height="4" fill={colors.leaf} />
          </>
        );
      // Add cases for other fruits
      default:
        return null;
    }
  };
  
  return (
    <div className={`relative w-16 h-16 ${className}`}>
      <svg viewBox="0 0 32 32" className="w-full h-full">
        {/* Base shape */}
        <rect x="8" y="8" width="16" height="16" fill={colors.main} />
        <rect x="6" y="10" width="2" height="12" fill={colors.shadow} />
        <rect x="24" y="10" width="2" height="12" fill={colors.shadow} />
        <rect x="10" y="6" width="12" height="2" fill={colors.highlight} />
        
        {/* Fruit-specific details */}
        {getFruitSpecificDetails()}
      </svg>
    </div>
  );
} 