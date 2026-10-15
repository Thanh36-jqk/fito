export const meta = {
  name: 'fito-phase',
  description: 'Fito: lên kế hoạch → xây theo đợt (sở hữu file riêng) → review 2 góc nhìn → sửa → kiểm định build/test/Playwright',
  whenToUse: 'Thực hiện một pha trong docs/PLAN.md của Fito một cách có kiểm soát. args: {phase, goal, outOfScope, root?, rootBash?, port?, extraRules?, maxTasks?, agentTypes?}',
  phases: [
    { title: 'Plan', detail: 'đọc docs + code, chia task theo file sở hữu, chốt hợp đồng chung' },
    { title: 'Build', detail: 'chạy task theo đợt, task cùng đợt song song, không đụng file nhau' },
    { title: 'Review', detail: 'quy tắc dữ liệu & bảo mật / giao diện & Next' },
    { title: 'Fix', detail: 'sửa phát hiện + yêu cầu chéo từ builder' },
    { title: 'Verify', detail: 'lint, tsc, test, next build, smoke Playwright' },
  ],
}

const A = args || {}
const PHASE = A.phase || '2'
const GOAL = A.goal || ''
const OUT = A.outOfScope || ''
const MAX_TASKS = Math.min(Math.max(A.maxTasks || 4, 1), 6)
// Agent chuyên của Fito (.claude/agents/*.md); chưa nạp được thì lùi về agent mặc định
const TYPES = A.agentTypes === false ? null : { plan: 'fito-planner', build: 'fito-builder', review: 'fito-reviewer', fix: 'fito-builder', verify: 'fito-verifier' }
async function run(kind, prompt, opts) {
  if (TYPES) {
    try { return await agent(prompt, { ...opts, agentType: TYPES[kind] }) }
    catch (e) { log(`Không dùng được agent ${TYPES[kind]} → dùng agent mặc định (${String(e).slice(0, 80)})`) }
  }
  return agent(prompt, opts)
}
const ROOT = A.root || 'D:\\Fito'
const RB = A.rootBash || '/d/Fito'
const PORT = A.port || 3000
const EXTRA = A.extraRules || ''

const COMMON = `
Project: Fito, a Next.js 16.4 web app. WORK ONLY INSIDE ${ROOT} (Git Bash path ${RB}); never touch other checkouts. Read CLAUDE.md, AGENTS.md, docs/DECISIONS.md, docs/PLAN.md before acting.
Hard rules:
- Scale: Fito is for exactly 2 people. Build the simplest thing that works and looks great. No enterprise patterns, no premature abstraction, no scaling work, no extra infrastructure. Tests only for pure logic that is easy to get wrong.
- Next.js 16.4 has breaking changes: read the relevant guide in node_modules/next/dist/docs/ before using any Next API (caching with cacheComponents is ON: 'use cache', cacheLife, Suspense around params/searchParams access).
- Keep the approved UI (prototype/vibe.html and current components). All UI text is Vietnamese. Colors only from CSS tokens. Icons only lucide-react, no emoji icons. Respect prefers-reduced-motion.
- Data only from official APIs listed in docs/DECISIONS.md ("Nguồn dữ liệu, ảnh, trailer" and "Độ phủ"). Never scrape. Never fabricate data: missing values show "—".
- Secrets: TMDB_READ_TOKEN is in .env.local. Use it only in server code. NEVER print, log, echo or paste its value anywhere (no cat .env.local, no echo $T). Read it via process.env in code; in shell use T=$(grep ...) and never output $T.
- New dependencies: only if truly needed, stable version published >= ~1 week ago, install with npm install --save-exact, and note it.
- Do NOT git commit. Do NOT run "next build" unless your instructions say so (parallel builds corrupt .next). A dev server for this checkout is already running on http://localhost:${PORT} — do not start another.
${EXTRA}
`

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    contract: { type: 'string', description: 'Exact shared TypeScript types, function signatures and module paths every task must follow' },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          wave: { type: 'integer', description: '1 = first; tasks in same wave run in parallel' },
          owns: { type: 'array', items: { type: 'string' }, description: 'files/dirs this task alone may edit or create' },
          instructions: { type: 'string' },
          done_when: { type: 'array', items: { type: 'string' } },
        },
        required: ['id', 'title', 'wave', 'owns', 'instructions', 'done_when'],
      },
    },
    acceptance: { type: 'array', items: { type: 'string' }, description: 'end-to-end checks for the verifier' },
    risks: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'contract', 'tasks', 'acceptance', 'risks'],
}

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    files_changed: { type: 'array', items: { type: 'string' } },
    needs: { type: 'array', items: { type: 'string' }, description: 'changes needed in files you do not own' },
    tsc_ok: { type: 'boolean' },
    lint_ok: { type: 'boolean' },
    notes: { type: 'string' },
  },
  required: ['summary', 'files_changed', 'needs', 'tsc_ok', 'lint_ok', 'notes'],
}

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          file: { type: 'string' },
          issue: { type: 'string' },
          evidence: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['severity', 'file', 'issue', 'evidence', 'fix'],
      },
    },
  },
  required: ['findings'],
}

const FIX_SCHEMA = {
  type: 'object',
  properties: {
    fixed: { type: 'array', items: { type: 'string' } },
    skipped: { type: 'array', items: { type: 'string' }, description: 'with reason' },
    files_changed: { type: 'array', items: { type: 'string' } },
  },
  required: ['fixed', 'skipped', 'files_changed'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    pass: { type: 'boolean' },
    lint: { type: 'string' },
    tsc: { type: 'string' },
    tests: { type: 'string' },
    build: { type: 'string' },
    smoke: { type: 'string' },
    failures: { type: 'array', items: { type: 'string' } },
  },
  required: ['pass', 'lint', 'tsc', 'tests', 'build', 'smoke', 'failures'],
}

// ---------------- Plan ----------------
phase('Plan')
const plan = await run('plan', `${COMMON}
You are the tech lead planning PHASE ${PHASE} of docs/PLAN.md.
Goal: ${GOAL}
Out of scope: ${OUT}

Do this:
1. Read the docs, the current code under src/, and the Next docs you need (caching/cacheComponents, images/next.config remotePatterns, fetching data, route handlers if used).
2. Quickly probe the real API to confirm field shapes (server-side shell only, never print the token), e.g. TMDB /movie/38551 with append_to_response, now_playing?region=VN, discover with watch_region=VN, search/movie.
3. Write a precise shared CONTRACT: module paths, TypeScript types, function signatures, caching approach, fallback rules (title/overview/trailer/logo/providers as in docs/DECISIONS.md), how UI components consume real data while sample-data features (Chọn phim, Quẹt, Match state) keep working without crashing on real TMDB ids.
4. Split the work into at most ${MAX_TASKS} tasks. Each task lists the files/dirs it alone owns. Two tasks in the same wave must NEVER own the same file. Shared foundations (types, API client, Poster, store, CSS entry files, next.config) go in wave 1. Put UI areas in wave 2 so they run in parallel. If an area needs CSS, give it its own CSS file created in wave 1 and imported once in layout.
5. Each task's instructions must be concrete enough that a separate engineer can implement it without asking, including exact Vietnamese UI copy where new.
6. Acceptance checks must be verifiable: commands, URLs on http://localhost:${PORT} to open, exact texts/elements that must appear for this phase's goal, no console errors, no horizontal overflow at 390px, desktop layout at 1366px, no secret from .env.local in the client bundle.
Do not edit any files.`, { label: 'tech-lead plan', phase: 'Plan', schema: PLAN_SCHEMA, effort: 'high' })

if (!plan || !plan.tasks || !plan.tasks.length) {
  return { error: 'Planner returned no tasks', plan }
}

// enforce caps + ownership safety in plain code
let tasks = plan.tasks.slice(0, MAX_TASKS)
if (plan.tasks.length > MAX_TASKS) log(`Planner đề xuất ${plan.tasks.length} task, chỉ chạy ${MAX_TASKS} task đầu: bỏ ${plan.tasks.slice(MAX_TASKS).map(t => t.id).join(', ')}`)
const norm = p => p.replace(/\\/g, '/').replace(/^\.?\//, '').toLowerCase()
const overlaps = (a, b) => a.owns.some(x => b.owns.some(y => { const p = norm(x), q = norm(y); return p === q || p.startsWith(q.endsWith('/') ? q : q + '/') || q.startsWith(p.endsWith('/') ? p : p + '/') }))
// re-wave: if two tasks in the same wave overlap, push the later one to a new wave
tasks.sort((a, b) => a.wave - b.wave)
const placed = []
for (const t of tasks) {
  let w = t.wave
  while (placed.some(p => p.wave === w && overlaps(p, t))) w++
  if (w !== t.wave) log(`Task ${t.id} trùng file với task khác cùng đợt → dời sang đợt ${w}`)
  placed.push({ ...t, wave: w })
}
const waves = [...new Set(placed.map(t => t.wave))].sort((a, b) => a - b)
log(`Kế hoạch: ${placed.length} task, ${waves.length} đợt`)

// ---------------- Build ----------------
phase('Build')
const builds = []
for (const w of waves) {
  const inWave = placed.filter(t => t.wave === w)
  const others = placed.filter(t => t.wave !== w || true)
  const res = await parallel(inWave.map(t => () => run('build', `${COMMON}
You are an engineer implementing task ${t.id} — "${t.title}" (phase ${PHASE}, wave ${w}).

SHARED CONTRACT (follow exactly):
${plan.contract}

YOUR TASK:
${t.instructions}

Done when:
${t.done_when.map(d => '- ' + d).join('\n')}

FILE OWNERSHIP — you may edit/create ONLY: ${t.owns.join(', ')}
Other tasks own: ${others.filter(o => o.id !== t.id).map(o => `${o.id}: ${o.owns.join(', ')}`).join(' | ')}
If you need a change in a file you do not own, do NOT edit it — describe it in "needs".
Finish by running: cd ${RB} && npx tsc --noEmit && npx eslint <your files>. Report results honestly.`,
    { label: `build ${t.id}`, phase: 'Build', schema: BUILD_SCHEMA }).then(r => r && { task: t.id, ...r })))
  builds.push(...res.filter(Boolean))
  const missing = inWave.filter(t => !res.some(r => r && r.task === t.id))
  if (missing.length) log(`Đợt ${w}: task không trả kết quả: ${missing.map(t => t.id).join(', ')}`)
}
const needs = builds.flatMap(b => b.needs.map(n => `[${b.task}] ${n}`))

// ---------------- Review ----------------
phase('Review')
const LENSES = [
  { key: 'data-security', prompt: `Lens: DATA RULES + SECURITY. Check every rule in docs/DECISIONS.md "Nguồn dữ liệu, ảnh, trailer" and "Độ phủ": official trailer only (site YouTube, type Trailer, official true, vi then en), image host image.tmdb.org via next/image, title/overview fallbacks, include_adult=false, attribution "Dữ liệu phim từ TMDB" and "dữ liệu JustWatch", missing data shows "—" never fabricated, sources below 50 votes excluded from total. SECURITY: token only server-side (no NEXT_PUBLIC_, no client component imports of the API module, ideally 'server-only'); verify by building nothing — instead grep src for process.env usage in "use client" files. Error handling: TMDB failure must not crash pages.` },
  { key: 'ui-next', prompt: `Lens: UI FIDELITY + RESPONSIVE + NEXT CORRECTNESS. Compare with prototype/vibe.html and the existing components: same look (sticker, ticket, poster frame/halftone kept with real images), Vietnamese copy, tokens only, lucide icons. Check 390px and 1366px using the Playwright MCP tools (load via ToolSearch "select:mcp__playwright__browser_navigate,mcp__playwright__browser_resize,mcp__playwright__browser_evaluate,mcp__playwright__browser_console_messages") on http://localhost:${PORT}: the pages touched in this phase plus /, /o-nha, /match: console errors, horizontal overflow (scrollWidth > innerWidth), broken images, Suspense/cacheComponents warnings ("encountered URL data", "instant"), loading/empty/error states, reduced motion. Sample-data features (Chọn phim, Quẹt, Match) must still work.` },
]
const reviews = await parallel(LENSES.map(l => () => run('review', `${COMMON}
You are a strict senior reviewer for phase ${PHASE}. Do not edit files.
${l.prompt}
Contract that was supposed to be followed:
${plan.contract}
Report only real, evidenced problems (file + concrete evidence). No style nitpicks.`,
  { label: `review ${l.key}`, phase: 'Review', schema: FINDINGS_SCHEMA, effort: 'high' })))
const findings = reviews.filter(Boolean).flatMap(r => r.findings)
const actionable = findings.filter(f => f.severity !== 'low')
log(`Review: ${findings.length} phát hiện (${actionable.length} cao/vừa), ${needs.length} yêu cầu chéo từ builder`)

// ---------------- Fix + Verify loop ----------------
const fixes = []
let verify = null
let todo = [...actionable.map(f => `[${f.severity}] ${f.file}: ${f.issue} — evidence: ${f.evidence} — fix: ${f.fix}`), ...needs]
for (let round = 1; round <= 2; round++) {
  if (todo.length) {
    phase('Fix')
    const fx = await run('fix', `${COMMON}
You are the integration engineer (fix round ${round}). Apply these items; you may edit any file now. Verify each fix; skip only with a clear reason.
${todo.map((x, i) => `${i + 1}. ${x}`).join('\n')}
Contract:
${plan.contract}
Run npx tsc --noEmit and npm run lint at the end.`, { label: `fix round ${round}`, phase: 'Fix', schema: FIX_SCHEMA })
    if (fx) fixes.push(fx)
  }
  phase('Verify')
  verify = await run('verify', `${COMMON}
You are the release verifier for phase ${PHASE}. Do not edit source files.
Run in ${RB}, in order, and record real output summaries:
1. npm run lint
2. npx tsc --noEmit
3. tests: if a test script/vitest exists, run it (npx vitest run); else report "no tests".
4. npm run build (you are the only one building now). Report errors and the route table.
5. Secret leak check WITHOUT printing values: for every non-empty KEY=VALUE line in .env.local (if the file exists), count files under .next/static containing VALUE (grep -rlF) → must be 0 for each. Print only key names and counts.
6. Smoke test with Playwright MCP (ToolSearch "select:mcp__playwright__browser_navigate,mcp__playwright__browser_resize,mcp__playwright__browser_evaluate,mcp__playwright__browser_console_messages,mcp__playwright__browser_click,mcp__playwright__browser_wait_for") against the running dev server http://localhost:${PORT} at 390x844 and 1366x820:
${plan.acceptance.map(a => '   - ' + a).join('\n')}
   Also: no console errors, no horizontal overflow, images load (naturalWidth > 0).
pass = true only if every step succeeds. List each failure concretely.`, { label: `verify round ${round}`, phase: 'Verify', schema: VERIFY_SCHEMA, effort: 'high' })
  if (!verify || verify.pass) break
  todo = verify.failures
  log(`Kiểm định vòng ${round} chưa đạt: ${todo.length} lỗi`)
}

return {
  plan: { summary: plan.summary, tasks: placed.map(t => ({ id: t.id, title: t.title, wave: t.wave, owns: t.owns })), risks: plan.risks },
  builds: builds.map(b => ({ task: b.task, summary: b.summary, files: b.files_changed, tsc_ok: b.tsc_ok, lint_ok: b.lint_ok, notes: b.notes })),
  findings,
  fixes,
  verify,
}