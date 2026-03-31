import type { Config } from "@netlify/functions";

// Runs every 2 days — triggers the auto-blog GitHub Actions workflow
export default async function handler() {
  const enabled = process.env.BLOG_SCHEDULER_ENABLED !== "false";
  if (!enabled) {
    console.log("[blog-scheduler] Disabled. Set BLOG_SCHEDULER_ENABLED=true to enable.");
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO ?? "stewartmasters/path-verdict";

  if (!token) {
    console.error("[blog-scheduler] GITHUB_TOKEN not set. Cannot trigger workflow.");
    return;
  }

  const url = `https://api.github.com/repos/${repo}/actions/workflows/auto-blog.yml/dispatches`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref: "main" }),
  });

  if (res.ok || res.status === 204) {
    console.log("[blog-scheduler] Successfully triggered auto-blog workflow.");
  } else {
    const text = await res.text();
    console.error(`[blog-scheduler] Failed to trigger workflow: ${res.status} ${text}`);
  }
}

export const config: Config = {
  schedule: "@daily",  // Netlify runs this daily; GitHub Actions decides if it should publish
};
