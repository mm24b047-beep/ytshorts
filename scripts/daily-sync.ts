import cron from "node-cron";

const API_BASE = process.env.API_BASE || "http://localhost:3000";

console.log("Starting daily sync scheduler...");

// Run every day at 9:00 AM
const task = cron.schedule("0 9 * * *", async () => {
  console.log(`[${new Date().toISOString()}] Running daily sync...`);
  try {
    const res = await fetch(`${API_BASE}/api/sync`, {
      method: "POST",
    });
    const data = await res.json();
    console.log(`[${new Date().toISOString()}] Sync completed:`, data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Sync failed:`, error);
  }
});

// Also run immediately on startup
fetch(`${API_BASE}/api/sync`, { method: "POST" })
  .then((res) => res.json())
  .then((data) => console.log(`[${new Date().toISOString()}] Initial sync completed:`, data))
  .catch((error) => console.error(`[${new Date().toISOString()}] Initial sync failed:`, error));

console.log("Scheduler running. Press Ctrl+C to stop.");
