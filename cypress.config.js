import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'mvcaqg',
  e2e: {
    setupNodeEvents(on, config) {
    },
    baseUrl: 'https://rick-morty-39iyxpr96-crisky94s-projects.vercel.app/', // <-- ¡PON AQUÍ LA URL DE TU APP!
  },
});