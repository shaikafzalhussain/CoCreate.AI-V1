import plugin from 'tailwindcss/plugin';

export const textShadowPlugin = plugin(function ({ matchUtilities, theme }) {
  matchUtilities(
    {
      'text-shadow': (value) => ({
        textShadow: value,
      }),
    },
    {
      values: theme('textShadow'),
    }
  );
});