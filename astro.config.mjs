// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import compressor from "astro-compressor";

import purgecss from "astro-purgecss";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://marsolpropiedades.cl",
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@components": "/src/components",
        "@utils": "/src/utils",
        "@layouts": "/src/layouts",
        "@lib": "/src/lib",
      },
    },
  },

  integrations: [
    compressor({ gzip: true, brotli: false }),
    purgecss({
      content: [
        "./src/**/*.{astro,js,ts}",
        // Add any other template files that contain styles
      ],
    }),
    sitemap(),
  ],
});
