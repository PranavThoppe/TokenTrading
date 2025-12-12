import { motion } from 'framer-motion';

interface AnimatedPackProps {
  packType: number;
  isOpening: boolean;
  onOpenClick: () => void;
  isDisabled?: boolean;
}

const packColors: Record<number, { from: string; to: string; glow: string }> = {
  0: { from: 'from-gray-500', to: 'to-gray-700', glow: 'shadow-gray-500/50' },
  1: { from: 'from-green-500', to: 'to-green-700', glow: 'shadow-green-500/50' },
  2: { from: 'from-blue-500', to: 'to-blue-700', glow: 'shadow-blue-500/50' },
  3: { from: 'from-purple-500', to: 'to-purple-700', glow: 'shadow-purple-500/50' },
  4: { from: 'from-yellow-500', to: 'to-yellow-700', glow: 'shadow-yellow-500/50' },
};

const packNames: Record<number, string> = {
  0: 'Starter Pack',
  1: 'Standard Pack',
  2: 'Premium Pack',
  3: 'Elite Pack',
  4: 'Legendary Pack',
};

/**
 * Animated pack component with 3D transforms and hover effects
 */
export function AnimatedPack({ packType, isOpening, onOpenClick, isDisabled = false }: AnimatedPackProps) {
  const colors = packColors[packType] || packColors[0];
  const packName = packNames[packType] || 'Card Pack';

  return (
    <div className="flex flex-col items-center gap-8">
      {/* 3D Pack Container */}
      <motion.div
        className="relative perspective-1000"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Pack with 3D effect */}
        <motion.div
          className={`
            relative w-64 h-80 rounded-2xl cursor-pointer
            bg-gradient-to-br ${colors.from} ${colors.to}
            shadow-2xl ${colors.glow}
            transform-gpu preserve-3d
          `}
          whileHover={!isOpening && !isDisabled ? { 
            rotateY: 10, 
            rotateX: -5,
            scale: 1.05,
            transition: { duration: 0.3 }
          } : {}}
          animate={isOpening ? {
            rotateY: [0, 180, 360],
            scale: [1, 1.2, 0],
            opacity: [1, 1, 0],
          } : {}}
          transition={isOpening ? {
            duration: 1.5,
            ease: 'easeInOut',
          } : {}}
          onClick={!isOpening && !isDisabled ? onOpenClick : undefined}
        >
          {/* Pack shine effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/30 via-transparent to-transparent" />
          
          {/* Pack border */}
          <div className="absolute inset-2 rounded-xl border-2 border-white/20" />
          
          {/* Pack icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="text-6xl mb-4"
              animate={!isOpening ? { 
                y: [0, -5, 0],
              } : {}}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              📦
            </motion.div>
            <span className="text-white font-bold text-lg drop-shadow-lg">
              {packName}
            </span>
          </div>

          {/* Sparkle effects */}
          {!isOpening && (
            <>
              <motion.div
                className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full"
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: 0 
                }}
              />
              <motion.div
                className="absolute top-8 left-6 w-1.5 h-1.5 bg-white rounded-full"
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: 0.5 
                }}
              />
              <motion.div
                className="absolute bottom-6 right-8 w-1 h-1 bg-white rounded-full"
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: 1 
                }}
              />
            </>
          )}
        </motion.div>

        {/* Glow effect underneath */}
        <motion.div
          className={`
            absolute -bottom-4 left-1/2 -translate-x-1/2
            w-48 h-8 rounded-full blur-xl
            bg-gradient-to-r ${colors.from} ${colors.to}
            opacity-50
          `}
          animate={!isOpening ? {
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          } : { opacity: 0 }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>

      {/* Open Pack Button */}
      {!isOpening && (
        <motion.button
          className={`
            px-8 py-3 rounded-xl font-bold text-lg
            bg-gradient-to-r from-violet-500 to-fuchsia-500
            text-white shadow-lg shadow-violet-500/30
            hover:shadow-xl hover:shadow-violet-500/50
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-shadow duration-300
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={onOpenClick}
          disabled={isDisabled}
        >
          {isDisabled ? 'Processing...' : 'Open Pack'}
        </motion.button>
      )}

      {/* Opening indicator */}
      {isOpening && (
        <motion.div
          className="flex items-center gap-3 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span className="font-semibold">Opening pack...</span>
        </motion.div>
      )}
    </div>
  );
}
