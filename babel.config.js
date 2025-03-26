module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './', // 👈 Points to root level (where app, components, etc. live)
        },
      },
    ],
  ],
};
