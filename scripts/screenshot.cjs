const { chromium } = require("playwright");
const fs = require("fs");

const EXEC = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = "http://localhost:3000";
const OUT = "/home/user/freakenpr/screenshots";

const shots = [
  { name: "01-welcome", path: "/welcome", demo: false },
  { name: "02-home", path: "/", demo: true },
  { name: "03-plan-mission", path: "/missions/new" },
  { name: "04-mission-detail", path: "/missions/m1" },
  { name: "05-timeline", path: "/missions" },
  { name: "06-lore", path: "/lore" },
  { name: "07-atlas", path: "/map" },
  { name: "08-score", path: "/score" },
  { name: "09-family", path: "/family" },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXEC });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Seed the demo family by clicking the onboarding CTA once.
  await page.goto(`${BASE}/welcome`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/01-welcome.png` });

  await page.getByText("Explore the Martinez family demo").click();
  await page.waitForURL(`${BASE}/`, { timeout: 15000 });
  await page.waitForTimeout(1200);

  for (const s of shots) {
    if (s.name === "01-welcome") continue;
    await page.goto(`${BASE}${s.path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: true });
    console.log("captured", s.name);
  }

  await browser.close();
  console.log("DONE");
})().catch((e) => {
  console.error("SHOT ERROR:", e.message);
  process.exit(1);
});
