import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/itinerary-app/",
  plugins: [react()],
});
