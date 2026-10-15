#!/usr/bin/env node
/*
 * Builds the Verinex client onboarding deliverables from data.js:
 *   dist/verinex-client-onboarding.html     interactive page (single self-contained file)
 *   dist/Verinex-Client-Onboarding-Guide.html  print layout
 *   dist/Verinex-Client-Onboarding-Guide.pdf   branded PDF (needs Playwright + Chromium)
 *
 * Usage: node docs/verinex-onboarding/build.js
 */
const fs = require('fs');
const path = require('path');
const D = require('./data.js');

const dir = __dirname;
const dist = path.join(dir, 'dist');
fs.mkdirSync(dist, { recursive: true });

/* ---------- interactive page ---------- */
const dataSrc = fs.readFileSync(path.join(dir, 'data.js'), 'utf8');
const webLogoUri = 'data:image/png;base64,' + fs.readFileSync(path.join(dir, 'verinex-logo-web.png')).toString('base64');
const app = fs.readFileSync(path.join(dir, 'app.template.html'), 'utf8').replace('/*__DATA__*/', () => dataSrc).replace('__LOGO__', () => webLogoUri);
fs.writeFileSync(path.join(dist, 'verinex-client-onboarding.html'),
  `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${app}\n</html>\n`);

// Body-only variant for publishing as a claude.ai Artifact (the host adds the document skeleton).
fs.writeFileSync(path.join(dist, 'artifact.html'), app);

/* ---------- print guide ---------- */
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const optText = o => typeof o === 'string' ? o : o.l;
const whenText = fn => {
  const src = fn.toString();
  if (src.includes('Required for every client') || /^\(\) =>/.test(src) || src === 'always') return 'All clients';
  const m = src.match(/\? '([^']+)'/);
  return m ? m[1] : 'All clients';
};
const TYPE = { text: 'Text', number: 'Number', date: 'Date', select: 'Pick one', single: 'Pick one', multi: 'Pick any' };

// Logos: full-color for white pages, reversed (white type) for the navy cover.
const LOGO_COLOR = 'data:image/png;base64,' + fs.readFileSync(path.join(dir, 'verinex-logo-web.png')).toString('base64');
const LOGO_REVERSED = 'data:image/png;base64,' + fs.readFileSync(path.join(dir, 'verinex-logo-reversed.png')).toString('base64');

const page = (n, eyebrow, title, body) => `
<section class="page">
  <header class="run"><span class="mini"><img src="${LOGO_COLOR}" alt="The Verinex Group"></span><span>Client Onboarding Guide</span></header>
  <div class="sec-head"><span class="num">${String(n).padStart(2, '0')}</span><div><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2></div></div>
  ${body}
</section>`;

const questionsBody = D.STEPS.map((s, i) => `
  <div class="block">
    <h3><span class="stepn">Step ${i + 1}</span> ${esc(s.title)}</h3>
    <p class="muted">${esc(s.intro)}</p>
    <table class="qt"><thead><tr><th style="width:46%">Question</th><th style="width:30%">Options</th><th>Asked when</th></tr></thead><tbody>
    ${s.questions.map(q => `<tr class="${q.showText ? 'follow' : ''}"><td>${q.showText ? '<span class="arrow">↳</span> ' : ''}${esc(q.label)}${q.required ? ' <span class="req">*</span>' : ''}</td>
      <td class="muted">${q.options ? (q.id === 'software' ? 'Software list (see Section 05)' : q.options.map(optText).map(esc).join(' · ')) : TYPE[q.type]}</td>
      <td>${q.showText ? `<span class="pill">${esc(q.showText)}</span>` : '<span class="muted">Always</span>'}</td></tr>`).join('')}
    </tbody></table>
  </div>`).join('');

const decision = `
<svg class="flow" viewBox="0 0 720 300" role="img" aria-label="Engagement model decision flow">
  <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#5A6B7B"/></marker></defs>
  <rect x="250" y="8" width="220" height="50" rx="10" fill="#0E2A47"/><text x="360" y="38" fill="#fff" font-size="14" font-weight="600" text-anchor="middle">Which systems will we use?</text>
  <g stroke="#5A6B7B" stroke-width="1.5" fill="none" marker-end="url(#ar)"><path d="M300 58 L120 108"/><path d="M360 58 L360 108"/><path d="M420 58 L600 108"/>
  <path d="M360 168 L170 228"/><path d="M360 168 L300 228"/><path d="M360 168 L430 228"/><path d="M360 168 L560 228"/></g>
  <g font-size="13" text-anchor="middle">
  <rect x="20" y="110" width="200" height="56" rx="10" fill="#E3F3F2" stroke="#0F8B8D"/><text x="120" y="133" font-weight="600" fill="#0E2A47">A · Client EHR + billing</text><text x="120" y="152" fill="#5A6B7B" font-size="11.5">Named logins, MFA, client clearinghouse</text>
  <rect x="260" y="110" width="200" height="56" rx="10" fill="#E3F3F2" stroke="#0F8B8D"/><text x="360" y="133" font-weight="600" fill="#0E2A47">B · Client EHR + Verinex billing</text><text x="360" y="152" fill="#5A6B7B" font-size="11.5">How do visits reach us?</text>
  <rect x="500" y="110" width="200" height="56" rx="10" fill="#E3F3F2" stroke="#0F8B8D"/><text x="600" y="133" font-weight="600" fill="#0E2A47">C · Verinex EHR + billing</text><text x="600" y="152" fill="#5A6B7B" font-size="11.5">Migration, users, training</text>
  <rect x="100" y="230" width="140" height="54" rx="8" fill="#fff" stroke="#D9E0E6"/><text x="170" y="252" font-weight="600" fill="#172B3D">API / database</text><text x="170" y="270" fill="#5A6B7B" font-size="11">Admin authorizes</text>
  <rect x="250" y="230" width="110" height="54" rx="8" fill="#fff" stroke="#D9E0E6"/><text x="305" y="252" font-weight="600" fill="#172B3D">File export</text><text x="305" y="270" fill="#5A6B7B" font-size="11">CSV / HL7 → SFTP</text>
  <rect x="370" y="230" width="120" height="54" rx="8" fill="#fff" stroke="#D9E0E6"/><text x="430" y="252" font-weight="600" fill="#172B3D">Manual pull</text><text x="430" y="270" fill="#5A6B7B" font-size="11">Verinex runs reports</text>
  <rect x="500" y="230" width="120" height="54" rx="8" fill="#fff" stroke="#D9E0E6"/><text x="560" y="252" font-weight="600" fill="#172B3D">Superbills</text><text x="560" y="270" fill="#5A6B7B" font-size="11">Client uploads</text>
  </g>
</svg>`;

const docsBody = D.DOCUMENTS.map(c => `
  <div class="block"><h3>${esc(c.cat)}</h3>
  <table class="dt"><thead><tr><th style="width:5%"></th><th style="width:36%">Document</th><th style="width:33%">Why we need it</th><th>Required when</th></tr></thead><tbody>
  ${c.items.map(d => `<tr><td><span class="box"></span></td><td><b>${esc(d.name)}</b></td><td class="muted">${esc(d.why)}</td><td>${whenText(d.when) === 'All clients' ? '<span class="muted">All clients</span>' : `<span class="pill">${esc(whenText(d.when))}</span>`}</td></tr>`).join('')}
  </tbody></table></div>`).join('');

const swBody = `<table class="dt"><thead><tr><th style="width:26%">Software</th><th style="width:22%">Integration</th><th>What to expect</th></tr></thead><tbody>
  ${D.SOFTWARE.map(s => `<tr><td><b>${esc(s.label)}</b></td><td><span class="pill api-${s.api}">${esc(D.API_LABEL[s.api])}</span></td><td class="muted">${esc(s.note)}</td></tr>`).join('')}
  </tbody></table><p class="fine">Vendor capabilities and fees change. Verinex confirms the current options with your vendor during discovery.</p>`;

const processBody = `<table class="dt"><thead><tr><th style="width:4%">#</th><th style="width:22%">Phase</th><th style="width:12%">Timing</th><th style="width:14%">Owner</th><th>What happens · Deliverables</th></tr></thead><tbody>
  ${D.PHASES.map((p, i) => `<tr><td class="mono">${i + 1}</td><td><b>${esc(p.name)}</b></td><td class="mono">${esc(p.days)}</td><td>${esc(p.owner)}</td>
  <td>${esc(p.what)}${p.variant ? `<ul class="var">${Object.entries({ 'client-full': 'Model A', 'client-ehr-verinex-billing': 'Model B', 'verinex-full': 'Model C' }).map(([k, l]) => `<li><b>${l}:</b> ${esc(p.variant[k])}</li>`).join('')}</ul>` : ''}
  <div class="outs">${p.out.map(o => `<span>${esc(o)}</span>`).join('')}</div></td></tr>`).join('')}
  </tbody></table>`;

const issuesBody = `<table class="dt issues"><thead><tr><th style="width:12%">Area</th><th style="width:24%">Issue</th><th style="width:34%">Resolution</th><th style="width:13%">Owner</th><th>Prevention</th></tr></thead><tbody>
  ${D.ISSUES.map(i => `<tr><td><span class="pill">${esc(i.cat)}</span></td><td><b>${esc(i.title)}</b></td><td>${esc(i.fix)}</td><td class="muted">${esc(i.owner)}</td><td class="muted">${esc(i.prevent)}</td></tr>`).join('')}
  </tbody></table>`;

const guide = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Verinex Group — Client Onboarding Guide</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Source+Sans+3:wght@400;600;700&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
/* BRAND: replace these with Verinex Group's exact hex codes */
:root { --brand:#0E2A47; --accent:#0F8B8D; --accent-soft:#E3F3F2; --line:#D9E0E6; --fg:#172B3D; --muted:#5A6B7B; --tint:#F4F6F8; }
@page { size: Letter; margin: .6in .7in .7in; }
@page :first { margin: 0; }
* { box-sizing: border-box; }
body { margin:0; font: 10.5pt/1.5 "Source Sans 3", "Segoe UI", sans-serif; color: var(--fg); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1,h2,h3 { font-family: Sora, "Segoe UI", sans-serif; margin:0; line-height:1.2; }
.page { break-after: page; position: relative; }
.run { display:flex; justify-content:space-between; align-items:center; font: 500 7.5pt/1 "IBM Plex Mono", monospace; letter-spacing:.12em; text-transform:uppercase; color: var(--muted); border-bottom: 1px solid var(--line); padding-bottom: 10px; margin-bottom: 26px; }
.mini { display:flex; align-items:center; gap:7px; color: var(--brand); }
.mini img { height: 36px; width: auto; display: block; }
.sec-head { display:flex; gap:18px; align-items:flex-end; margin-bottom: 18px; }
.num { font: 700 40pt/0.85 Sora, sans-serif; color: var(--accent-soft); -webkit-text-stroke: 1.2px var(--accent); }
.eyebrow { font: 500 7.5pt/1 "IBM Plex Mono", monospace; letter-spacing:.14em; text-transform:uppercase; color: var(--accent); display:block; margin-bottom:6px; }
h2 { font-size: 21pt; color: var(--brand); }
h3 { font-size: 12pt; color: var(--brand); margin: 0 0 4px; }
p { margin: 0 0 10px; max-width: 6.6in; }
.muted { color: var(--muted); }
.block { margin-bottom: 20px; break-inside: avoid-page; }
table { width:100%; border-collapse: collapse; font-size: 9pt; margin-top: 8px; }
th { text-align:left; font: 500 7pt/1.2 "IBM Plex Mono", monospace; letter-spacing:.08em; text-transform:uppercase; color: var(--muted); border-bottom: 1.5px solid var(--brand); padding: 6px 8px; }
td { padding: 7px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
tr { break-inside: avoid; }
tr.follow td { background: #FAFBFC; }
.arrow { color: var(--accent); font-weight:700; }
.req { color: var(--accent); font-weight:700; }
.pill { display:inline-block; font-size: 8pt; padding: 2px 7px; border-radius: 4px; background: var(--accent-soft); color: #0B5F60; font-weight:600; }
.api-no, .api-unknown { background:#EEF2F5; color: var(--muted); }
.api-interface { background:#FDF1DC; color:#7A4A00; }
.box { display:inline-block; width:11px; height:11px; border:1.4px solid var(--brand); border-radius:2px; }
.mono { font-family: "IBM Plex Mono", monospace; font-size: 8.5pt; }
.stepn { font: 500 8pt "IBM Plex Mono", monospace; color: var(--accent); margin-right: 4px; }
.outs { margin-top:6px; display:flex; flex-wrap:wrap; gap:4px; }
.outs span { font-size:7.8pt; border:1px solid var(--line); border-radius:4px; padding:1px 6px; color: var(--muted); }
ul.var { margin:6px 0 0; padding-left: 14px; color: var(--muted); font-size: 8.5pt; }
.fine { font-size: 8.5pt; color: var(--muted); margin-top: 10px; }
.callout { background: var(--tint); border-left: 3px solid var(--accent); padding: 12px 16px; margin: 14px 0; border-radius: 0 6px 6px 0; }
.callout b { color: var(--brand); }
.cols { display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 14px 0; }
.mcard { border: 1px solid var(--line); border-radius: 8px; padding: 12px; }
.mcard .t { font: 500 7pt "IBM Plex Mono", monospace; letter-spacing:.1em; color: var(--accent); }
.mcard h3 { font-size: 10.5pt; margin: 4px 0; }
.mcard p { font-size: 9pt; color: var(--muted); margin:0; }
.flow { width:100%; height:auto; margin: 6px 0 12px; font-family: "Source Sans 3", sans-serif; }
.toc { list-style:none; padding:0; margin: 8px 0 0; }
.toc li { display:flex; gap:14px; padding: 9px 0; border-bottom: 1px solid var(--line); }
.toc .n { font: 500 9pt "IBM Plex Mono", monospace; color: var(--accent); width: 26px; }
.toc b { color: var(--brand); width: 2.3in; }
.check { columns: 2; column-gap: 26px; padding:0; list-style:none; margin: 10px 0 18px; }
.check li { break-inside: avoid; padding: 6px 0 6px 22px; position: relative; border-bottom: 1px solid var(--line); font-size: 9.5pt; }
.check li::before { content:""; position:absolute; left:0; top:9px; width:11px; height:11px; border:1.4px solid var(--brand); border-radius:2px; }
.sign { display:grid; grid-template-columns: 1fr 1fr; gap: 26px 36px; margin-top: 18px; }
.sign div { border-top: 1px solid var(--fg); padding-top: 5px; font-size: 8.5pt; color: var(--muted); padding-bottom: 28px; }
.issues td { font-size: 8.6pt; }
/* cover */
.cover { width: 8.5in; height: 11in; background: var(--brand); color:#fff; display:flex; flex-direction:column; padding: .9in .85in; overflow:hidden; }
.cover .logo { position: relative; }
.cover .logo img { width: 2.9in; height: auto; display: block; }
.cover h1 { font-size: 38pt; line-height: 1.08; margin-top: 1.8in; max-width: 6in; letter-spacing: -0.01em; }
.cover .sub { font-size: 13pt; opacity: .82; max-width: 5.4in; margin-top: 18px; line-height: 1.5; }
.cover .rings { position:absolute; right:-1.6in; top: 2.4in; width: 5in; height: 5in; border-radius: 50%; border: .55in solid rgba(61,191,184,.18); }
.cover .rings::after { content:""; position:absolute; inset: .55in; border-radius:50%; border: 2px solid rgba(61,191,184,.45); }
.cover .meta { margin-top:auto; display:grid; grid-template-columns: repeat(3, 1fr); gap: 20px; border-top: 1px solid rgba(255,255,255,.25); padding-top: 16px; font-size: 9.5pt; }
.cover .meta span { display:block; font: 500 7pt "IBM Plex Mono", monospace; letter-spacing:.14em; text-transform: uppercase; color: #3DBFB8; margin-bottom: 5px; }
.cover .eyebrow { color:#3DBFB8; }
</style></head><body>

<section class="page cover">
  <div class="rings"></div>
  <div class="logo"><img src="${LOGO_REVERSED}" alt="The Verinex Group"></div>
  <h1>Client Onboarding Guide</h1>
  <p class="sub">Everything your practice needs to move its billing to Verinex Group: the questions we ask, the documents we need, the process week by week, and how we finalize go-live.</p>
  <div class="meta"><div><span>Prepared for</span>______________________</div><div><span>Account manager</span>______________________</div><div><span>Version</span>1.0 · ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div></div>
</section>

${page(1, 'Context', 'Why onboarding matters', `
  <p>Most billing problems in the first 90 days come from setup, not from the billing work itself: a provider who is not enrolled with a payer, ERAs that never reach the billing team, or visits that never make it from the EHR to a claim. A structured onboarding removes those problems before the first claim goes out.</p>
  <p>This guide is the reference for that onboarding. It pairs with the interactive onboarding page, where your team answers the questionnaire, sees a document checklist built from those answers, and tracks progress to go-live.</p>
  <div class="callout"><b>Goal:</b> clean claims from day one, no gap in cash flow during the handover, and a measured baseline so you can see what changes.</div>
  <h3 style="margin-top:22px">What's inside</h3>
  <ol class="toc">
    <li><span class="n">02</span><b>Engagement models</b><span class="muted">The first decision: whose systems we use</span></li>
    <li><span class="n">03</span><b>Onboarding questions</b><span class="muted">Full questionnaire with branching follow-ups</span></li>
    <li><span class="n">04</span><b>Process & timeline</b><span class="muted">Nine phases, owners and deliverables</span></li>
    <li><span class="n">05</span><b>Systems & integration</b><span class="muted">How each EHR connects to our billing</span></li>
    <li><span class="n">06</span><b>Required documents</b><span class="muted">Checklist with conditions</span></li>
    <li><span class="n">07</span><b>Finalize onboarding</b><span class="muted">Go-live checklist and sign-off</span></li>
    <li><span class="n">08</span><b>Issues & resolutions</b><span class="muted">Common problems and fixes</span></li>
  </ol>
  <h3 style="margin-top:22px">Roles</h3>
  <p><b>Client:</b> a primary contact with authority to sign, an office or IT admin who can create user accounts, and each provider for credentialing details.<br>
  <b>Verinex:</b> an account manager (single point of contact), an onboarding specialist, the credentialing team and the assigned billing team.</p>
`)}

${page(2, 'The first decision', 'Engagement models', `
  <p>Before anything else we agree where your data lives and how visits reach our billing team. Your answer shapes the rest of the questionnaire and the document list.</p>
  <div class="cols">
    <div class="mcard"><span class="t">MODEL A</span><h3>Your EHR + your billing system</h3><p>Verinex billers get named logins in your software and work there. Lowest change for your staff.</p></div>
    <div class="mcard"><span class="t">MODEL B</span><h3>Your EHR + Verinex billing</h3><p>Providers keep documenting in your EHR. Visits flow into our billing platform.</p></div>
    <div class="mcard"><span class="t">MODEL C</span><h3>Verinex EHR + billing</h3><p>One platform for scheduling, notes and billing. We migrate data and train staff.</p></div>
  </div>
  <h3>Decision flow</h3>
  ${decision}
  <div class="callout"><b>Example — Kareo / Tebra on Model B.</b> We first ask whether you will authorize a direct connection. If yes, your system administrator generates an API key and we sync visits automatically. If your plan or policy does not allow it, our team pulls the Encounters or Appointments report on an agreed schedule, or your staff uploads superbills through the secure portal.</div>
`)}

${page(3, 'Questionnaire', 'Onboarding questions', `
  <p>Questions marked <span class="req">*</span> are required. Rows marked <span class="arrow">↳</span> are follow-ups that only appear when the earlier answer shown in the last column applies. The interactive page handles this automatically.</p>
  ${questionsBody}
`)}

${page(4, 'Week by week', 'Process & timeline', `
  <p>Typical go-live is three to five weeks after the signed agreement. Phases overlap: documents, access requests and enrollment checks run in parallel.</p>
  ${processBody}
`)}

${page(5, 'Technical', 'Systems & integration', `
  <p>For Model B, visits reach our billing system in one of four ways. We pick the most automated option your software and policies allow, and fall back without delaying billing.</p>
  <table class="dt"><thead><tr><th style="width:22%">Method</th><th style="width:40%">How it works</th><th>What we need from you</th></tr></thead><tbody>
    <tr><td><b>API / database connection</b></td><td>Visits and charges sync automatically, usually daily.</td><td class="muted">Admin authorization, vendor approval where required, API key or credentials sent through the secure portal.</td></tr>
    <tr><td><b>Scheduled file export</b></td><td>Your EHR sends CSV or HL7 files to the Verinex SFTP on a schedule.</td><td class="muted">Export configured in your EHR; we supply SFTP details and file layout.</td></tr>
    <tr><td><b>Manual report pull</b></td><td>Our team logs in and exports completed visits on an agreed schedule.</td><td class="muted">Named read-only login for each biller; the report name that lists completed visits.</td></tr>
    <tr><td><b>Superbill upload</b></td><td>Your staff uploads encounter forms to the secure portal.</td><td class="muted">Agreed daily cut-off; sample superbill so we can map codes.</td></tr>
  </tbody></table>
  <h3 style="margin-top:20px">Software we commonly see</h3>
  ${swBody}
  <div class="callout"><b>Security:</b> every Verinex user has their own login and MFA. We never accept passwords by email or text. Access is removed the same day a team member leaves the account.</div>
`)}

${page(6, 'Checklist', 'Required documents', `
  <p>Send everything through the Verinex secure portal. The interactive page shows only the items that apply to your practice.</p>
  ${docsBody}
`)}

${page(7, 'Ready to bill', 'Finalize onboarding', `
  <p>Go-live is approved when every item below is complete. Your account manager reviews the list with you on a short readiness call.</p>
  <h3>Go-live checklist</h3>
  <ul class="check">${D.GOLIVE.map(g => `<li>${esc(g)}</li>`).join('')}</ul>
  <h3>After go-live</h3>
  <p>Weekly check-ins for the first month, then reviews at 60 and 90 days. We report on days in A/R, clean-claim rate, first-pass resolution, denial rate and charge lag against the baseline taken during onboarding.</p>
  <h3 style="margin-top:22px">Sign-off</h3>
  <p class="muted">By signing, both parties confirm the go-live checklist is complete and agree the A/R handover cut-off date.</p>
  <div class="sign"><div>Client signatory · name & title</div><div>Verinex account manager</div><div>Signature · date</div><div>Signature · date</div><div>A/R handover cut-off date</div><div>Go-live date</div></div>
`)}

${page(8, 'Troubleshooting', 'Issues & resolutions', `
  <p>The problems we see most often during onboarding, who resolves them, and how to prevent them.</p>
  ${issuesBody}
  <div class="callout" style="margin-top:18px"><b>Escalation:</b> raise any onboarding issue with your account manager. Anything that blocks claims or payments gets a same-business-day response.</div>
`)}

</body></html>`;

const guidePath = path.join(dist, 'Verinex-Client-Onboarding-Guide.html');
fs.writeFileSync(guidePath, guide);

/* ---------- PDF ---------- */
(async () => {
  let chromium;
  try { ({ chromium } = require('playwright')); } catch (e) {
    console.log('Playwright not found; skipped PDF. Open the guide HTML in a browser and print to PDF.'); return;
  }
  const browser = await chromium.launch();
  const pageObj = await browser.newPage();
  await pageObj.goto('file://' + guidePath, { waitUntil: 'networkidle' }).catch(() => pageObj.goto('file://' + guidePath));
  await pageObj.pdf({ path: path.join(dist, 'Verinex-Client-Onboarding-Guide.pdf'), format: 'Letter', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log('Built dist/ (interactive HTML, guide HTML, PDF)');
})();
