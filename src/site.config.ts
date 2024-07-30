import type { SiteConfig } from "@/data/types";

export const siteConfig: SiteConfig = {
	// Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
	author: "Nate Lentz",
	// Meta property used to construct the meta title property, found in src/components/BaseHead.astro L:11
	title: "A blog by Nate Lentz",
	// Meta property used as the default description meta property
	description: "Personal blog by Nate Lentz. I write about code and other things.",
	// HTML lang property, found in src/layouts/Base.astro L:18
	lang: "en-US",
	// Meta property, found in src/components/BaseHead.astro L:42
	ogLocale: "en_US",
	// Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
	date: {
		locale: "en-US",
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
	},
};

// Used to generate links in both the Header & Footer.
export const menuLinks: Array = [
	{
		title: "Home",
		path: "/",
	},
	{
		title: "Blog",
		path: "/posts/",
	},
];
