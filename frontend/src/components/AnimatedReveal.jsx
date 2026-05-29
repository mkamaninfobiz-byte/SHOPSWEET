import { motion } from 'framer-motion';

/** Slide-up reveal for headings and copy */
export const Reveal = ({ children, className = '', delay = 0, as = 'div' }) => {
  const Component = motion[as] || motion.div;
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
};

/** Staggered letter/word gradient headline */
export const AnimatedHeadline = ({ lines, className = '' }) => (
  <div className={className}>
    {lines.map((line, lineIndex) => (
      <span key={lineIndex} className="block overflow-hidden">
        <motion.span
          className={`inline-block ${line.className || ''}`}
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.75,
            delay: lineIndex * 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {line.text}
        </motion.span>
      </span>
    ))}
  </div>
);

/** Pulsing background orb */
export const FloatingOrb = ({ className = '', delay = 0 }) => (
  <motion.div
    className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
    animate={{
      scale: [1, 1.12, 1],
      opacity: [0.35, 0.55, 0.35],
      x: [0, 12, 0],
      y: [0, -8, 0],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

export default Reveal;
