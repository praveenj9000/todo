module.exports = function (api) {
	api.cache(true);

	return {
		presets: ["babel-preset-expo"],
		plugins: [
			[
				"@tamagui/babel-plugin",
				{
					components: ["@todo/ui", "tamagui"],
					config: "../../packages/design-system/src/config/tamagui.config.ts",
				},
			],
			"react-native-reanimated/plugin",
		],
	};
};