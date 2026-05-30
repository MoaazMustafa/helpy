// Required for Drizzle's `migrations.js` to inline `.sql` files at build time.
// See https://orm.drizzle.team/docs/get-started/expo-new
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
