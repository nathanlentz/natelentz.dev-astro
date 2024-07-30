/** @type {import("@types/prettier").Options} */
export default {
	printWidth: 100,
	semi: true,
	singleQuote: false,
	tabWidth: 2,
	useTabs: true,
	plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss" /* Must come last */],
	pluginSearchDirs: false,
	overrides: [
		{
			files: "**/*astro",
			options: {
				parser: "astro",
			},
		},
	],
};
