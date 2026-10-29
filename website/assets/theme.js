/* ---------------------------------------------------------------------------
   Shared Tailwind theme. The palette is taken from the logo mark itself
   (sampled 2026-10-29): teal #14dcc8, blue #3c8cc8, violet #7060e0.

   The old site used #00f5ff cyan with #ff00ff magenta — magenta appears
   nowhere in the logo, so the brand and the site disagreed.
   --------------------------------------------------------------------------- */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#14dcc8',          // logo teal
        'primary-dim': '#0fb3a3',
        secondary: '#3c8cc8',        // logo blue
        accent: '#7060e0',           // logo violet
        'background-dark': '#0a0a0f',
        'surface-dark': '#12121a',
        'surface-raised': '#1a1a24',
      },
      fontFamily: { display: ['Spline Sans', 'system-ui', 'sans-serif'] },
      maxWidth: { content: '1180px' },
    },
  },
};
