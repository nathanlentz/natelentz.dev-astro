import { defineConfig, sharpImageService } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import icon from 'astro-icon'
import remarkUnwrapImages from "remark-unwrap-images";
import { remarkReadingTime } from "./src/utils/remark-reading-time.mjs";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
    site: "https://natelentz.dev/",
    markdown: {
        remarkPlugins: [remarkUnwrapImages, remarkReadingTime],
        shikiConfig: {
            theme: "catppuccin-mocha",
            wrap: true,
        },
    },
    image: {
        // https://docs.astro.build/en/guides/assets/#using-sharp
        service: sharpImageService(),
    },
    integrations: [mdx({}), tailwind({
        applyBaseStyles: false,
		}), sitemap(), react(), icon()],
  prefetch: true,
    compressHTML: true,
    vite: {
        optimizeDeps: {
            exclude: ["@resvg/resvg-js"],
        },
    },
});
