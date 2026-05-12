module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin',
    ],
    env: {
      web: {
        plugins: ['babel-plugin-transform-import-meta'],
      },
    },
  };
};
