import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.nvnkmr.capacitor.learnings",
  appName: "Capacitor Learnings",
  webDir: "build",
  ios: {
    contentInset: "always", // content fills the full screen including notch area
  },
};

export default config;
