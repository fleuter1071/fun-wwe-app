import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveBrowserPath() {
  const candidates = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  ];

  return candidates.find((candidate) => process.platform === "win32" && fs.existsSync(candidate));
}

const executablePath = resolveBrowserPath();

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4176",
    trace: "on-first-retry"
  },
  webServer: {
    command: "node server.js",
    url: "http://127.0.0.1:4176",
    env: {
      PORT: "4176"
    },
    reuseExistingServer: false,
    timeout: 30_000
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 1440, height: 1100 },
        launchOptions: executablePath ? { executablePath } : {}
      }
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        launchOptions: executablePath ? { executablePath } : {}
      }
    }
  ]
});
