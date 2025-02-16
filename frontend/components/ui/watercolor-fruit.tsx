import { motion } from 'framer-motion';

interface WatercolorFruitProps {
  type: 'apple' | 'orange' | 'kiwi' | 'banana' | 'grape' | 'strawberry' | 'pear' | 'plum';
  className?: string;
}

const fruitPaths = {
  apple: {
    shape: "M12 6c4-4 12 0 12 6 0 6-4 12-12 12S0 18 0 12C0 6 8 2 12 6",
    details: "M12 8c0 2-2 4-4 4s-4-2-4-4 2-4 4-4 4 2 4 4m8 0c0 2-2 4-4 4s-4-2-4-4 2-4 4-4 4 2 4 4",
    leaf: "M12 2c2 0 4 2 2 4s-4 0-2-4",
    colors: {
      main: '#ff6b6b',
      shadow: '#e74c3c',
      highlight: '#fab1a0',
      leaf: '#6ab04c'
    }
  },
  orange: {
    shape: "M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12",
    details: "M12 4a8 8 0 0 1 0 16 8 8 0 0 1 0-16",
    colors: {
      main: '#ffa502',
      shadow: '#e67e22',
      highlight: '#ffeaa7'
    }
  },
  kiwi: {
    shape: "M12 4c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8",
    details: "M12 8c2.209 0 4 1.791 4 4s-1.791 4-4 4-4-1.791-4-4 1.791-4 4-4",
    colors: {
      main: '#a8e6cf',
      shadow: '#3b7d4f',
      highlight: '#dcedc1'
    }
  },
  banana: {
    shape: "M4 12c0-4 2-8 8-8s8 4 8 8-2 8-8 8-8-4-8-8",
    details: "M8 8c2-2 6-2 8 0",
    colors: {
      main: '#ffeaa7',
      shadow: '#fdcb6e',
      highlight: '#fff3c9'
    }
  },
  grape: {
    shape: "M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0",
    details: "M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0",
    leaf: "M12 2c2-2 4 0 2 2s-4 0-2-2",
    colors: {
      main: '#a55eea',
      shadow: '#8854d0',
      highlight: '#d1b3ff',
      leaf: '#6ab04c'
    }
  },
  strawberry: {
    shape: "M12 4c6 0 10 4 10 8s-4 8-10 8S2 16 2 12s4-8 10-8",
    details: "M8 10c.5-.5 1.5-.5 2 0m4 0c.5-.5 1.5-.5 2 0",
    leaf: "M12 2c3 0 4 2 2 3s-4-1-2-3",
    colors: {
      main: '#ff7675',
      shadow: '#d63031',
      highlight: '#fab1a0',
      leaf: '#6ab04c'
    }
  },
  pear: {
    shape: "M12 4c4 0 8 3 8 7s-4 9-8 9-8-5-8-9 4-7 8-7",
    leaf: "M12 2c2-2 4 0 2 2s-4 0-2-2",
    colors: {
      main: '#badc58',
      shadow: '#6ab04c',
      highlight: '#dff9d8',
      leaf: '#6ab04c'
    }
  },
  plum: {
    shape: "M12 4c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8",
    details: "M8 12c0-2.209 1.791-4 4-4s4 1.791 4 4",
    colors: {
      main: '#a55eea',
      shadow: '#8854d0',
      highlight: '#d1b3ff'
    }
  }
};

export function WatercolorFruit({ type, className = '' }: WatercolorFruitProps) {
  const fruit = fruitPaths[type];
  
  // Add error handling for undefined fruit type
  if (!fruit) {
    console.error(`Unknown fruit type: ${type}`);
    return null;
  }
  
  return (
    <div className={`relative w-24 h-24 ${className}`}>
      <svg viewBox="0 0 24 24" className="w-full h-full">
        {/* Watercolor effect layers */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Base watercolor splash */}
          <path
            d={fruit.shape}
            fill={fruit.colors.main}
            opacity="0.4"
            filter="url(#watercolor)"
          />
          
          {/* Main fruit shape */}
          <path
            d={fruit.shape}
            fill={fruit.colors.main}
            opacity="0.8"
          />
          
          {/* Highlight layer */}
          <path
            d={fruit.shape}
            fill={fruit.colors.highlight}
            opacity="0.3"
            transform="translate(-1, -1) scale(0.95)"
          />
          
          {/* Details */}
          {fruit.details && (
            <path
              d={fruit.details}
              fill={fruit.colors.shadow}
              opacity="0.2"
            />
          )}
          
          {/* Leaf or stem if present */}
          {fruit.leaf && (
            <path
              d={fruit.leaf}
              fill={fruit.colors.leaf || fruit.colors.main}
              opacity="0.9"
            />
          )}
        </motion.g>
        
        {/* Watercolor filter effect */}
        <defs>
          <filter id="watercolor" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
            <feDisplacementMap in="blur" in2="noise" scale="5" />
          </filter>
        </defs>
      </svg>
    </div>
  );
} 