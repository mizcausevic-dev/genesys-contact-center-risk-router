import { mkdir, writeFile } from "node:fs/promises";
import { buildRouter } from "../src/index.js";
import sample from "../fixtures/genesys-risk-sample.json" with { type: "json" };

const router = buildRouter(sample);
const cards = router.queues
  .map(
    (queue) => `
      <article class="card">
        <div class="top"><span>${queue.tier}</span><strong>${queue.riskScore}</strong></div>
        <h3>${queue.name}</h3>
        <p>${queue.narrative}</p>
        <dl>
          <div><dt>Channel</dt><dd>${queue.channel}</dd></div>
          <div><dt>Daily volume</dt><dd>${queue.dailyVolume.toLocaleString("en-US")}</dd></div>
          <div><dt>Service level</dt><dd>${queue.serviceLevel}%</dd></div>
          <div><dt>Abandon</dt><dd>${queue.abandonRate}%</dd></div>
        </dl>
        <p class="route">${queue.route}</p>
      </article>`
  )
  .join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Genesys Contact Center Risk Router</title>
  <meta name="description" content="Board-readable Genesys contact center risk routing for queue SLA pressure, abandon rates, sentiment, staffing, and revenue exposure." />
  <style>
    :root{color-scheme:dark;--bg:#050914;--panel:#0d1727;--panel2:#121d2f;--text:#f4f1e8;--muted:#a8b5c7;--cyan:#27d8f4;--mint:#55f2bc;--pink:#ff7ab6;--line:rgba(39,216,244,.24)}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 12% 0%,rgba(39,216,244,.14),transparent 34rem),radial-gradient(circle at 88% 20%,rgba(255,122,182,.16),transparent 30rem),var(--bg);color:var(--text);font-family:"Segoe UI",system-ui,sans-serif}
    main{width:min(1180px,calc(100vw - 32px));margin:auto;padding:64px 0}.hero{border:1px solid var(--line);border-radius:30px;background:linear-gradient(135deg,rgba(18,29,47,.96),rgba(7,10,21,.95));padding:clamp(28px,5vw,58px);box-shadow:0 30px 90px rgba(0,0,0,.35)}
    .eyebrow{color:var(--pink);letter-spacing:.18em;text-transform:uppercase;font:800 12px/1 ui-monospace,SFMono-Regular,Consolas,monospace}h1{max-width:980px;margin:18px 0;font-size:clamp(44px,8vw,104px);line-height:.91;letter-spacing:-.06em}.lede{max-width:800px;color:var(--muted);font-size:clamp(18px,2.2vw,24px);line-height:1.55}
    .metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:34px}.metric{border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(255,255,255,.04);padding:20px}.metric strong{display:block;font-size:34px}.metric span{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.12em}
    .section{margin-top:28px;border:1px solid var(--line);border-radius:28px;background:rgba(13,23,39,.78);padding:clamp(22px,3vw,34px)}h2{margin:0 0 18px;font-size:clamp(30px,4vw,54px);line-height:1;letter-spacing:-.04em}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
    .card{border:1px solid rgba(255,255,255,.1);border-radius:22px;background:var(--panel2);padding:22px}.top{display:flex;justify-content:space-between;color:var(--cyan);font:800 12px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.14em}.top strong{color:var(--mint);font-size:30px;letter-spacing:0}h3{margin:16px 0 10px;font-size:25px;line-height:1.08}p{color:var(--muted);line-height:1.55}
    dl{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}dt{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.1em}dd{margin:4px 0 0;font-weight:800}.route{color:var(--text);border-top:1px solid rgba(255,255,255,.08);padding-top:14px}footer{color:var(--muted);padding-top:24px;font-size:14px}@media(max-width:760px){main{padding:28px 0}.metrics,.grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="eyebrow">Genesys contact center signal</div>
      <h1>Customer queue pressure becomes a revenue-risk route, not another dashboard.</h1>
      <p class="lede">Genesys Contact Center Risk Router turns SLA gaps, abandon rates, repeat contacts, staffing coverage, sentiment, and revenue exposure into an executive CX intervention queue.</p>
      <div class="metrics">
        <div class="metric"><strong>${router.summary.queueCount}</strong><span>Queues</span></div>
        <div class="metric"><strong>${router.summary.meanRiskScore}</strong><span>Mean risk score</span></div>
        <div class="metric"><strong>${router.summary.totalDailyVolume.toLocaleString("en-US")}</strong><span>Daily contacts</span></div>
        <div class="metric"><strong>$${router.summary.revenueAtRiskMillions}M</strong><span>Revenue exposure</span></div>
      </div>
    </section>
    <section class="section">
      <h2>Queue risk router</h2>
      <p><strong>Primary recommendation:</strong> ${router.summary.primaryRecommendation}</p>
      <div class="grid">${cards}</div>
    </section>
    <footer>Genesys Contact Center Risk Router · synthetic proof surface · no production CX data</footer>
  </main>
</body>
</html>`;

await mkdir("site", { recursive: true });
await writeFile("site/index.html", html);
