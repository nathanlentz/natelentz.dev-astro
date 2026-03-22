# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **natelentz.dev**, a personal blog website built with Astro 5. It's a static site generator focused on performance and SEO, based on the Cactus Astro theme with custom enhancements.

**Tech Stack:**
- Astro 5.16.6 with React 18.3.1 integration
- TypeScript (strict mode)
- Tailwind CSS 3.3.3 with custom typography
- MDX for content with Content Collections
- Pagefind for client-side search
- Satori for dynamic OG image generation

## Development Commands

**Standard workflow:**
```bash
pnpm dev           # Start dev server with hot reload
pnpm build         # Build for production (includes Pagefind indexing)
pnpm preview       # Preview production build locally
pnpm check         # Run TypeScript and Astro checks
```

**Code quality:**
```bash
pnpm lint          # Run all linters (Biome + workspace linters)
pnpm format        # Format code with Biome
```

**Note:** The build process automatically runs `pagefind --source dist` as a postbuild hook to index the site for search.

## Architecture

### Path Aliases

The codebase uses TypeScript path aliases defined in `tsconfig.json`:
- `@/components/*` → `src/components/*.astro`
- `@/layouts/*` → `src/layouts/*.astro`
- `@/utils` → `src/utils/index.ts`
- `@/data/*` → `src/data/*`
- `@/site-config` → `src/site.config.ts`

Always use these aliases for imports instead of relative paths.

### Content Management

Blog posts are managed via Astro Content Collections in `src/content/post/`. Each post:
- Lives in its own directory or as a standalone `.md` file
- Must include frontmatter matching the schema in `src/content/config.ts`
- Required fields: `title` (max 60 chars), `description` (50-160 chars), `publishDate`
- Optional: `updatedDate`, `coverImage`, `tags`, `ogImage`, `archived`
- Tags are automatically deduplicated and lowercased

### Routing Structure

File-based routing in `src/pages/`:
- `/` → `index.astro` (home page)
- `/posts/[...page].astro` → Paginated post listing
- `/posts/[slug].astro` → Individual post (dynamic from Content Collections)
- `/tags/` → All tags overview
- `/tags/[tag]/[...page].astro` → Posts filtered by tag (paginated)
- `/og-image/[slug].png.ts` → Dynamic OG images using Satori
- `/rss.xml.ts` → RSS feed

### Layout Hierarchy

1. `src/layouts/Base.astro` - Root HTML structure with header/footer
2. `src/layouts/BlogPost.astro` - Blog post layout with TOC and scroll features
3. Components in `src/components/` are composed into layouts

### Styling System

**Tailwind Configuration (`tailwind.config.cjs`):**
- Dark mode: class-based switching
- Custom CSS variables for theming (bgColor, textColor, link, accent, quote)
- Custom `.cactus-link` component with gradient underline hover effect
- Custom typography preset for consistent prose styling
- Satoshi font family as default

**Global styles:** `src/styles/global.css` defines CSS custom properties for light/dark themes.

### Key Utilities

**Post utilities (`src/utils/post.ts`):**
- `sortMDByDate()` - Sorts posts by publish/update date (most recent first)
- `getUniqueTags()` - Extracts all unique tags from posts
- `getUniqueTagsWithCount()` - Returns tags with post counts

**Reading time:** The `remark-reading-time.mjs` plugin calculates reading time and injects it into post data.

**Date formatting:** Use `getFormattedDate()` from `@/utils` for consistent date display.

### Dynamic OG Images

`src/pages/og-image/[slug].png.ts` generates PNG Open Graph images at build time:
- Uses Satori to render React components to SVG
- Converts SVG to PNG with @resvg/resvg-js
- Includes post title, description, date, and reading time
- Uses Roboto Mono font from `src/assets/`

Note: Vite config excludes `@resvg/resvg-js` from optimization due to native dependencies.

### Search Integration

Pagefind provides client-side full-text search:
- Indexes built output after `pnpm build`
- No backend required
- Search UI in `src/components/Search.astro`
- Styles in `src/styles/search.css`

### Configuration Files

**`src/site.config.ts`** - Central configuration for site metadata:
- Author, title, description, locale settings
- Date formatting options
- Menu links for header/footer

**`astro.config.ts`** - Framework configuration:
- Site URL: `https://natelentz.dev/`
- Markdown: Shiki syntax highlighting (Catppuccin Mocha theme)
- Remark plugins: unwrap-images, reading-time
- Image service: Sharp for optimization
- Integrations: MDX, Tailwind (no base styles), Sitemap, React, Icons
- Prefetch and HTML compression enabled

## Common Patterns

**Creating a new blog post:**
1. Create directory in `src/content/post/` (e.g., `my-new-post/`)
2. Add `index.md` with required frontmatter
3. Post slug derives from directory name
4. OG image auto-generates at build time

**Adding a React component:**
1. Create `.tsx` file in `src/components/`
2. Import in Astro component with `client:*` directive for hydration
3. Example: `<Music client:load />` in `Music.tsx`

**Modifying theme colors:**
- Edit CSS custom properties in `src/styles/global.css`
- Update Tailwind config if adding new color tokens

**Working with images:**
- Use Astro's image optimization: `import { Image } from "astro:assets"`
- Images in posts are automatically unwrapped from `<p>` tags via remark plugin
- Cover images should be co-located with post content

## Important Notes

- **No test framework** is currently configured. TypeScript strict checks and Biome linting serve as quality gates.
- **Biome** handles linting and formatting. Prettier is available but Biome is primary.
- **Dark mode** uses class-based switching (`darkMode: "class"` in Tailwind config).
- **Archived posts** (`archived: true` in frontmatter) are filtered from listings but remain accessible by URL.
- **RSS feed** auto-generates from Content Collections at build time.
- **Sitemap** auto-generates via `@astrojs/sitemap` integration.
