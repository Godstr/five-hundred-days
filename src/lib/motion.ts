/** The signature ease of the site: fast out, long and soft landing. */
export const EASE = [0.16, 1, 0.3, 1] as const

/** Fade-up used by most blocks as they scroll into view. */
export const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.9, ease: EASE },
} as const
