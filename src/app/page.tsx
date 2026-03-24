"use client";

import { useState, useRef } from "react";

const IDEA_SOURCES = [
  { id: "producthunt", label: "ProductHunt", emoji: "\u{1F680}", color: "#da552f" },
  { id: "reddit", label: "Reddit/X", emoji: "\u{1F4AC}", color: "#ff4500" },
  { id: "gaps", label: "\u5E02\u5834\u30AE\u30E3\u30C3\u30D7", emoji: "\u{1F50D}", color: "#6366f1" },
  { id: "remix", label: "\u65E2\u5B58\u00D7AI", emoji: "\u{1F9EA}", color: "#06b6d4" },
  { id: "github", label: "GitHub Trending", emoji: "\u{1F4BB}", color: "#8b5cf6" },
  { id: "appreviews", label: "\u30A2\u30D7\u30EA\u30EC\u30D3\u30E5\u30FC", emoji: "\u2B50", color: "#eab308" },
  { id: "jobs", label: "\u6C42\u4EBA\u30C8\u30EC\u30F3\u30C9", emoji: "\u{1F4BC}", color: "#0ea5e9" },
  { id: "regulation", label: "\u898F\u5236\u30FB\u6CD5\u6539\u6B63", emoji: "\u{1F3DB}\uFE0F", color: "#14b8a6" },
  { id: "indiehackers", label: "Indie Hackers", emoji: "\u{1F4B0}", color: "#f97316" },
  { id: "stackoverflow", label: "Stack Overflow", emoji: "\u{1F527}", color: "#f48024" },
];

interface DayPlan {
  day: number;
  tasks: string;
}

interface Idea {
  id: string;
  title: string;
  tagline: string;
  category: string;
  source: string;
  problem: string;
  audience: string;
  monetization: string;
  difficulty: number;
  potential: number;
  techStack: string[];
  competitors: string;
  trendReason: string;
  industry: string;
  marketSize: string;
  growthRate: string;
  whyNow: string;
  risks: string;
  trendType: string;
  trendPeriod: string;
  demandEvidence: string;
  verdict: string;
  verdictReason: string;
  differentiationStrategy: string;
  prosForGo: string[];
  consForGo: string[];
  firstUsers: string;
  estimatedCosts: string;
  revenueTarget: string;
  similarSuccess: string;
  // Dashboard scores (internal, drives visual)
  opportunityScore: number;
  painScore: number;
  marketScore: number;
  competitionScore: number;
  buildabilityScore: number;
  revenueScore: number;
  acquisitionScore: number;
  // Per-dimension evidence-based reason (shown to user)
  painReason: string;
  marketReason: string;
  competitionReason: string;
  buildabilityReason: string;
  revenueReason: string;
  acquisitionReason: string;
  tam: string;
  sam: string;
  arpa: string;
  mvpWeeks: number;
  monthsToProfit: number;
  churnRisk: string;
  primaryChannel: string;
  competitorCount: number;
}

interface Plan {
  summary: string;
  mvpFeatures: string[];
  outOfScope: string[];
  userFlow: string;
  dataModel: string;
  apiEndpoints: string[];
  dayByDayPlan: DayPlan[];
  claudeCodePrompt: string;
  marketingOneLiner: string;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// -- Prompt builders --
function buildDiscoveryPrompt(sources: string[], count: number) {
  const sourceDesc = sources
    .map((s) => {
      if (s === "producthunt")
        return "ProductHunt trending products and emerging micro-SaaS trends";
      if (s === "reddit")
        return "Reddit (r/SideProject, r/startups, r/indiehackers) and X/Twitter trending pain points";
      if (s === "gaps")
        return "gaps in existing popular tools where users complain about missing features";
      if (s === "remix")
        return "existing successful products that could be dramatically improved with AI";
      if (s === "github")
        return "GitHub Trending repositories and popular open-source tools that could be monetized as hosted SaaS (e.g. self-hosted tools that users would pay for a managed version)";
      if (s === "appreviews")
        return "App Store and Chrome Web Store 1-2 star reviews revealing specific user frustrations and missing features in popular apps";
      if (s === "jobs")
        return "job posting trends on LinkedIn/Indeed showing what companies are hiring for, indicating where budget exists and B2B demand is growing";
      if (s === "regulation")
        return "recent or upcoming regulatory changes, compliance requirements, and new laws (e.g. privacy regulations, AI governance, tax changes) that create mandatory software needs";
      if (s === "indiehackers")
        return "Indie Hackers success stories and publicly shared MRR data from solo founders, focusing on proven revenue models that can be replicated or improved";
      if (s === "stackoverflow")
        return "Stack Overflow most-asked questions and developer pain points that indicate opportunities for developer tools, CLIs, or API services";
      return s;
    })
    .join(", ");

  return `You are a startup idea scout and market analyst. Based on current trends from: ${sourceDesc}

Generate exactly ${count} unique micro-SaaS / app ideas that a solo developer can build as an MVP in 1 week.

CRITICAL: Mix the following two types of ideas:
- 🔥 EMERGING (直近トレンド): Ideas based on trends from the last 1-6 months. Brand new opportunities.
- 🌳 EVERGREEN (継続ニーズ): Ideas based on pain points that have persisted for 1+ years and still lack good solutions. Proven, lasting demand.

Aim for roughly half emerging and half evergreen.

For EACH idea, respond in this EXACT JSON format (array of objects):
[
  {
    "title": "Short catchy product name in English",
    "tagline": "One-line pitch in Japanese (15 words max)",
    "category": "One of: SaaS, AI Tool, Chrome Extension, API Service, Mobile App, CLI Tool, Marketplace, Developer Tool",
    "source": "Which trend source inspired this",
    "problem": "The pain point this solves (2 sentences, Japanese)",
    "audience": "Target user in Japanese",
    "monetization": "Revenue model in Japanese (e.g. フリーミアム月額980円、具体的な価格帯と課金モデルを記載)",
    "difficulty": 1-5,
    "potential": 1-5,
    "techStack": ["tech1", "tech2", "tech3"],
    "competitors": "Existing alternatives and why this is different (Japanese, 2-3 sentences with specific competitor names)",
    "trendReason": "Why this is trending or in demand - specific data points or events (Japanese, 2-3 sentences)",
    "industry": "Target industry in Japanese (e.g. HR Tech, EdTech, FinTech, HealthTech, MarTech)",
    "marketSize": "Estimated TAM/SAM in Japanese with numbers (e.g. 国内SaaS市場1.8兆円のうち、HR領域は約3,000億円)",
    "growthRate": "Market growth rate and future outlook (Japanese, 1-2 sentences with % if possible)",
    "whyNow": "Why this is the right timing to build this (Japanese, 1-2 sentences)",
    "risks": "Key risks and challenges for this idea (Japanese, 1-2 sentences)",
    "trendType": "One of: emerging or evergreen",
    "trendPeriod": "When this trend/need started and current status in Japanese (e.g. '2024年後半〜 AIエージェント普及に伴い急拡大中' or '2020年以前から継続、リモートワーク定着で再加速')",
    "demandEvidence": "Concrete evidence of demand in Japanese - mention specific subreddit posts, ProductHunt launches, Google Trends data, user complaints, market reports, or news articles that prove people want this (2-3 sentences)",
    "verdict": "One of: strong_go, go, consider, caution - your honest recommendation for a solo developer",
    "verdictReason": "1-2 sentence explanation of the verdict in Japanese. Be specific about WHY - e.g. '収益性5だが競合が少なく、1週間で差別化可能なMVPが作れるため強く推奨' or '市場は大きいが大手が参入済みで、個人開発者の勝ち筋が限定的'",
    "differentiationStrategy": "Specific, actionable differentiation strategy in Japanese. How exactly should a solo dev compete? What unique angle, niche, UX, or feature makes this different from competitors? (3-4 sentences)",
    "prosForGo": ["Reason to build this 1 (Japanese)", "Reason 2", "Reason 3"],
    "consForGo": ["Risk or concern 1 (Japanese)", "Risk or concern 2", "Risk or concern 3"],
    "firstUsers": "How to acquire the first 10-100 users, with specific channels and tactics in Japanese (e.g. 'Reddit r/freelanceのコミュニティに無料版を投稿 → Product Huntローンチ → SEOブログ記事3本で月間1000PV獲得')",
    "estimatedCosts": "Monthly running costs breakdown in Japanese with specific numbers (e.g. 'Vercel Pro ¥2,000 + Supabase Free枠 ¥0 + OpenAI API月¥3,000〜 + ドメイン年¥1,500 = 月額約¥5,000〜')",
    "revenueTarget": "Realistic revenue milestones in Japanese (e.g. '1ヶ月目: 無料ユーザー50人 → 3ヶ月目: 有料10人×月額980円=月¥9,800 → 6ヶ月目: 有料50人=月¥49,000')",
    "similarSuccess": "1-2 similar products that succeeded with concrete numbers in Japanese (e.g. 'Typefully: 個人開発→月$50K MRR達成。Plausible Analytics: OSSからSaaS化→ARR $1M突破。同じニッチで個人開発者が成功した実績あり')",
    "opportunityScore": "0-100 composite score. Formula: (painScore*25 + marketScore*20 + competitionScore*15 + buildabilityScore*25 + revenueScore*15) / 10. Calculate EXACTLY using this formula.",
    "painScore": "1-10. Evidence-based: 9-10=daily pain, users actively searching for solutions (cite search volume/complaints). 7-8=weekly pain, workaround exists but frustrating. 5-6=occasional annoyance, nice-to-have. 3-4=mild inconvenience. 1-2=not a real problem.",
    "marketScore": "1-10. Evidence-based: 9-10=TAM>1兆円, CAGR>20% (cite market report). 7-8=TAM>1000億円, growing steadily. 5-6=niche but viable market. 3-4=very small market. 1-2=almost no market.",
    "competitionScore": "1-10. Evidence-based: 9-10=no direct competitor, blue ocean. 7-8=1-3 weak competitors, clear gap. 5-6=moderate competition, differentiation possible. 3-4=many competitors, hard to stand out. 1-2=dominated by big players.",
    "buildabilityScore": "1-10. Evidence-based: 9-10=CRUD app, 2-3 days with existing APIs. 7-8=1 week, standard tech stack. 5-6=2-3 weeks, some complex features. 3-4=1+ month, needs specialized knowledge. 1-2=very complex, needs team.",
    "revenueScore": "1-10. Evidence-based: 9-10=proven willingness to pay (cite similar product pricing), ARPA>¥3000/mo. 7-8=clear value, ARPA ¥1000-3000. 5-6=freemium conversion uncertain. 3-4=hard to monetize. 1-2=users expect free.",
    "acquisitionScore": "1-10. Evidence-based: 9-10=captive audience in known community (cite specific channel). 7-8=SEO/content with low competition keywords. 5-6=possible but requires effort. 3-4=no clear channel. 1-2=very hard to reach users.",
    "painReason": "1-sentence Japanese evidence for painScore. Must cite specific data: search volume, forum complaints count, app store review patterns. e.g. '「Slack 通知多すぎ」の検索が月間2,400件、Reddit r/productivity で週3件以上の不満投稿'",
    "marketReason": "1-sentence Japanese evidence for marketScore. Must cite market report or comparable product revenue. e.g. '国内HR Tech市場は2025年に3,200億円（矢野経済研究所）、年成長率18%'",
    "competitionReason": "1-sentence Japanese evidence for competitionScore. Must name specific competitors and their weakness. e.g. '直接競合はNotionとCoda程度。両者ともAI機能が弱く、日本語対応も不十分'",
    "buildabilityReason": "1-sentence Japanese evidence for buildabilityScore. Must cite specific tech/API availability. e.g. 'OpenAI API + Supabase Auth + Vercel で3日で基本機能完成可能。類似OSSテンプレートも存在'",
    "revenueReason": "1-sentence Japanese evidence for revenueScore. Must cite comparable product pricing or willingness-to-pay data. e.g. '類似ツールCalendlyはFreemium→月$8で1500万ユーザー。同価格帯で日本語特化なら有料転換率5%見込み'",
    "acquisitionReason": "1-sentence Japanese evidence for acquisitionScore. Must cite specific channel and estimated reach. e.g. 'r/SideProject (40万人) + Product Hunt ローンチで初週500ユーザー獲得が現実的。SEOキーワード「AI議事録」月間検索8,100件'",
    "tam": "Total Addressable Market in Japanese with number (e.g. '約3,000億円')",
    "sam": "Serviceable Addressable Market in Japanese (e.g. '約50億円')",
    "arpa": "Average Revenue Per Account monthly in yen (e.g. '月額¥980〜¥2,980')",
    "mvpWeeks": "Estimated weeks to build MVP (number, 1-4)",
    "monthsToProfit": "Estimated months to reach profitability (number, 1-24)",
    "churnRisk": "One of: low, medium, high",
    "primaryChannel": "Single most viable acquisition channel in Japanese (e.g. 'SEO/コンテンツマーケティング')",
    "competitorCount": "Number of direct competitors (number, 0-20)"
  }
]

IMPORTANT RULES:
- Ideas must be buildable in 1 week by a solo dev using Next.js/React + Supabase + Vercel + OpenAI API
- Focus on ideas with clear monetization paths
- Mix of B2B and B2C ideas
- Each idea should solve a REAL, specific pain point
- Difficulty 1-3 preferred (solo dev friendly)
- trendPeriod must include specific years/dates
- demandEvidence must cite specific sources, not vague claims
- verdict must be brutally honest - don't make everything "strong_go". Use the full range.
  * strong_go: High potential + low difficulty + clear differentiation. Rare.
  * go: Good opportunity with manageable risks. Most promising ideas.
  * consider: Decent idea but has notable concerns. Worth exploring further.
  * caution: Significant risks or challenges. Think carefully before committing.
- differentiationStrategy must be SPECIFIC and ACTIONABLE, not generic advice like "UXを良くする"
- SCORING INTEGRITY: Each score (1-10) MUST be backed by the corresponding *Reason field with REAL data (market reports, search volumes, competitor names, pricing data). Never inflate scores. Average score across all ideas should be around 5-6, not 7-8.
- opportunityScore MUST be calculated exactly: (painScore*25 + marketScore*20 + competitionScore*15 + buildabilityScore*25 + revenueScore*15) / 10
- Each *Reason field must contain at least one concrete data point (number, source name, or verifiable fact)
- Return ONLY valid JSON array, no markdown, no explanation`;
}

function buildPlanPrompt(idea: Idea) {
  return `You are a technical product planner for solo developers.

Given this product idea:
- Name: ${idea.title}
- Tagline: ${idea.tagline}
- Problem: ${idea.problem}
- Audience: ${idea.audience}
- Monetization: ${idea.monetization}
- Tech Stack: ${idea.techStack?.join(", ")}
- Competitors: ${idea.competitors}

Generate a complete MVP implementation plan. Respond in this EXACT JSON format:
{
  "summary": "3-sentence executive summary in Japanese",
  "mvpFeatures": ["feature1 in Japanese", "feature2", "feature3", "feature4", "feature5"],
  "outOfScope": ["not-now feature1 in Japanese", "not-now feature2", "not-now feature3"],
  "userFlow": "Step-by-step user journey in Japanese (numbered list as single string)",
  "dataModel": "Key database tables/columns description in Japanese",
  "apiEndpoints": ["GET /api/xxx - description", "POST /api/xxx - description"],
  "dayByDayPlan": [
    {"day": 1, "tasks": "Day 1 tasks in Japanese"},
    {"day": 2, "tasks": "Day 2 tasks in Japanese"},
    {"day": 3, "tasks": "Day 3 tasks in Japanese"},
    {"day": 4, "tasks": "Day 4 tasks in Japanese"},
    {"day": 5, "tasks": "Day 5 tasks in Japanese"},
    {"day": 6, "tasks": "Day 6 tasks in Japanese"},
    {"day": 7, "tasks": "Day 7 tasks in Japanese"}
  ],
  "claudeCodePrompt": "A detailed, ready-to-paste prompt for Claude Code in Japanese that will scaffold the entire project.",
  "marketingOneLiner": "A compelling one-liner for the landing page in Japanese"
}

IMPORTANT:
- The claudeCodePrompt should be EXTREMELY detailed and actionable
- Include specific tech choices: Next.js App Router, Tailwind CSS, Supabase, Vercel
- The 7-day plan should be realistic for a solo developer
- Return ONLY valid JSON, no markdown, no explanation`;
}

// -- API call (via local API route) --
async function callClaude(prompt: string) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  const text = (data.content || [])
    .map((b: { text?: string }) => b.text || "")
    .join("");
  const clean = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    // JSON truncated - try to salvage by closing brackets
    let fixed = clean;
    // Remove trailing incomplete string/value
    fixed = fixed.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"]*$/, "");
    // Remove trailing incomplete object
    fixed = fixed.replace(/,\s*\{[^}]*$/, "");
    // Balance brackets
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;
    fixed += "}".repeat(Math.max(0, openBraces - closeBraces));
    fixed += "]".repeat(Math.max(0, openBrackets - closeBrackets));
    parsed = JSON.parse(fixed);
  }
  // OpenAI json_object mode wraps arrays in an object like {"ideas": [...]}
  if (!Array.isArray(parsed) && typeof parsed === "object" && parsed !== null) {
    const arr = Object.values(parsed).find((v) => Array.isArray(v));
    if (arr) return arr;
  }
  return parsed;
}

// -- Dashboard Chart Components --

function OpportunityGauge({ score }: { score: number }) {
  const clampedScore = Math.max(0, Math.min(100, score || 0));
  const angle = (clampedScore / 100) * 180;
  const rad = (angle - 180) * (Math.PI / 180);
  const x = 100 + 70 * Math.cos(rad);
  const y = 100 + 70 * Math.sin(rad);

  const getColor = (s: number) => {
    if (s >= 80) return "#22c55e";
    if (s >= 60) return "#3b82f6";
    if (s >= 40) return "#f59e0b";
    return "#ef4444";
  };
  const getLabel = (s: number) => {
    if (s >= 80) return "Excellent";
    if (s >= 60) return "Good";
    if (s >= 40) return "Fair";
    return "Low";
  };
  const color = getColor(clampedScore);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* Background arc */}
        <path
          d="M 30 100 A 70 70 0 0 1 170 100"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Score arc */}
        {clampedScore > 0 && (
          <path
            d={`M 30 100 A 70 70 0 ${largeArc} 1 ${x.toFixed(1)} ${y.toFixed(1)}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        )}
        {/* Score number */}
        <text
          x="100"
          y="85"
          textAnchor="middle"
          fill={color}
          fontSize="36"
          fontWeight="800"
          fontFamily="'Space Grotesk', sans-serif"
        >
          {clampedScore}
        </text>
        <text
          x="100"
          y="105"
          textAnchor="middle"
          fill="#666"
          fontSize="11"
          fontFamily="'JetBrains Mono', monospace"
        >
          {getLabel(clampedScore)}
        </text>
        {/* Scale labels */}
        <text x="25" y="115" textAnchor="middle" fill="#444" fontSize="9" fontFamily="'JetBrains Mono', monospace">0</text>
        <text x="100" y="20" textAnchor="middle" fill="#444" fontSize="9" fontFamily="'JetBrains Mono', monospace">50</text>
        <text x="175" y="115" textAnchor="middle" fill="#444" fontSize="9" fontFamily="'JetBrains Mono', monospace">100</text>
      </svg>
      <div style={{
        fontSize: 11, color: "#666", marginTop: -4,
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: "1px",
      }}>
        OPPORTUNITY SCORE
      </div>
    </div>
  );
}

function VerdictCard({ label, verdict, reason, color, icon }: { label: string; verdict: string; reason: string; color: string; icon: string }) {
  return (
    <div style={{
      background: "#0d0d0d", border: `1px solid ${color}25`,
      borderRadius: 10, padding: "10px 14px",
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 6,
      }}>
        <span style={{
          fontSize: 12, fontWeight: 700, color: "#aaa",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {label}
        </span>
        <span style={{
          fontSize: 14, fontWeight: 800, color,
          fontFamily: "'Noto Sans JP', sans-serif",
        }}>
          {icon} {verdict}
        </span>
      </div>
      <div style={{
        fontSize: 12, color: "#888", lineHeight: 1.6,
        fontFamily: "'Noto Sans JP', sans-serif",
      }}>
        {reason}
      </div>
    </div>
  );
}

function KPICard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{
      background: "#0d0d0d", border: "1px solid #1a1a1a",
      borderRadius: 10, padding: "12px 14px",
      borderTop: `2px solid ${color}`,
    }}>
      <div style={{
        fontSize: 10, color: "#555", fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: "0.5px", marginBottom: 6, textTransform: "uppercase",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 16, fontWeight: 800, color: "#f0f0f0",
        fontFamily: "'Space Grotesk', sans-serif",
        lineHeight: 1.2,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{
          fontSize: 11, color: "#555", marginTop: 4,
          fontFamily: "'Noto Sans JP', sans-serif",
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function MilestoneTimeline({ mvpWeeks, monthsToProfit }: { mvpWeeks: number; monthsToProfit: number }) {
  const milestones = [
    { label: "MVP完成", time: `${mvpWeeks}週間`, position: 15, color: "#6366f1" },
    { label: "初ユーザー", time: `${mvpWeeks + 1}週間`, position: 30, color: "#06b6d4" },
    { label: "有料化", time: `${Math.max(1, Math.round(mvpWeeks / 4) + 1)}ヶ月`, position: 55, color: "#f59e0b" },
    { label: "黒字化", time: `${monthsToProfit}ヶ月`, position: 85, color: "#22c55e" },
  ];

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ position: "relative", height: 60 }}>
        {/* Line */}
        <div style={{
          position: "absolute", top: 20, left: 0, right: 0,
          height: 2, background: "#1a1a1a",
        }} />
        {/* Milestones */}
        {milestones.map((m, i) => (
          <div key={i} style={{
            position: "absolute", left: `${m.position}%`,
            transform: "translateX(-50%)", textAlign: "center",
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: m.color, margin: "15px auto 4px",
              boxShadow: `0 0 8px ${m.color}40`,
            }} />
            <div style={{
              fontSize: 10, fontWeight: 700, color: m.color,
              fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap",
            }}>
              {m.label}
            </div>
            <div style={{
              fontSize: 9, color: "#555",
              fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap",
            }}>
              {m.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Components --

function SourceToggle({
  sources,
  selected,
  onToggle,
}: {
  sources: typeof IDEA_SOURCES;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {sources.map((s) => {
        const active = selected.includes(s.id);
        return (
          <button
            key={s.id}
            onClick={() => onToggle(s.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: `2px solid ${active ? s.color : "#333"}`,
              background: active ? s.color + "22" : "transparent",
              color: active ? s.color : "#888",
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: active ? 700 : 400,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>{s.emoji}</span>
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

function DifficultyDots({ n, max = 5 }: { n: number; max?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: i < n ? "#f59e0b" : "#333",
            transition: "background 0.2s",
          }}
        />
      ))}
    </span>
  );
}

function AnalysisPanel({
  icon,
  title,
  children,
  accent,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "#0d0d0d",
        border: "1px solid #1a1a1a",
        borderRadius: 10,
        padding: 14,
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
          fontSize: 12,
          fontWeight: 700,
          color: accent,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <span>{icon}</span>
        {title}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#bbb",
          lineHeight: 1.7,
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function IdeaCard({
  idea,
  index,
  onClick,
}: {
  idea: Idea;
  index: number;
  onClick: () => void;
}) {
  const catColor: Record<string, string> = {
    SaaS: "#6366f1",
    "AI Tool": "#06b6d4",
    "Chrome Extension": "#f59e0b",
    "API Service": "#ec4899",
    "Mobile App": "#10b981",
    "CLI Tool": "#8b5cf6",
    Marketplace: "#ef4444",
    "Developer Tool": "#14b8a6",
  };
  const color = catColor[idea.category] || "#6366f1";

  const verdictConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
    strong_go: { label: "STRONG GO", color: "#22c55e", bg: "#22c55e10", border: "#22c55e40", icon: "◎" },
    go: { label: "GO", color: "#3b82f6", bg: "#3b82f610", border: "#3b82f640", icon: "○" },
    consider: { label: "CONSIDER", color: "#f59e0b", bg: "#f59e0b10", border: "#f59e0b40", icon: "△" },
    caution: { label: "CAUTION", color: "#ef4444", bg: "#ef444410", border: "#ef444440", icon: "×" },
  };
  const v = verdictConfig[idea.verdict] || verdictConfig.consider;

  const getVerdict = (v: number) => {
    if (v >= 8) return { icon: "◎", text: "有利", color: "#22c55e" };
    if (v >= 6) return { icon: "○", text: "良好", color: "#3b82f6" };
    if (v >= 4) return { icon: "△", text: "注意", color: "#f59e0b" };
    return { icon: "×", text: "不利", color: "#ef4444" };
  };

  const verdictItems = [
    { label: "課題の深刻度", score: idea.painScore, reason: idea.painReason },
    { label: "市場規模", score: idea.marketScore, reason: idea.marketReason },
    { label: "競合優位性", score: idea.competitionScore, reason: idea.competitionReason },
    { label: "構築容易性", score: idea.buildabilityScore, reason: idea.buildabilityReason },
    { label: "収益性", score: idea.revenueScore, reason: idea.revenueReason },
    { label: "集客容易性", score: idea.acquisitionScore, reason: idea.acquisitionReason },
  ];

  const churnColor = idea.churnRisk === "low" ? "#22c55e" : idea.churnRisk === "medium" ? "#f59e0b" : "#ef4444";
  const churnLabel = idea.churnRisk === "low" ? "低" : idea.churnRisk === "medium" ? "中" : "高";

  return (
    <div
      style={{
        background: "#111",
        border: `2px solid ${v.border}`,
        borderRadius: 16,
        overflow: "hidden",
        animation: `fadeSlideIn 0.4s ease-out ${index * 0.08}s both`,
      }}
    >
      {/* ===== HEADER: Verdict + Title ===== */}
      <div style={{
        background: v.bg,
        borderBottom: `1px solid ${v.border}`,
        padding: "16px 24px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 10, flexWrap: "wrap", gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 24, fontWeight: 800, color: v.color,
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              {v.icon}
            </span>
            <span style={{
              fontSize: 13, fontWeight: 800, color: v.color,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "1px",
            }}>
              {v.label}
            </span>
            {idea.verdictReason && (
              <span style={{
                fontSize: 12, color: "#888",
                fontFamily: "'Noto Sans JP', sans-serif",
                marginLeft: 4,
              }}>
                — {idea.verdictReason}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {idea.industry && (
              <span style={{
                padding: "4px 14px", borderRadius: 8,
                background: color + "18", color,
                fontSize: 13, fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                border: `1px solid ${color}30`,
              }}>
                {idea.industry}
              </span>
            )}
            <span style={{
              padding: "3px 10px", borderRadius: 20,
              background: "#ffffff08", color: "#888",
              fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
            }}>
              {idea.category}
            </span>
            {idea.trendType === "emerging" ? (
              <span style={{
                padding: "3px 10px", borderRadius: 20,
                background: "#ef444418", color: "#f87171",
                fontSize: 11, fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                EMERGING
              </span>
            ) : idea.trendType === "evergreen" ? (
              <span style={{
                padding: "3px 10px", borderRadius: 20,
                background: "#10b98118", color: "#34d399",
                fontSize: 11, fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                EVERGREEN
              </span>
            ) : null}
          </div>
        </div>
        <h3 style={{
          margin: "0 0 4px 0", fontSize: 24, fontWeight: 800,
          color: "#f0f0f0", fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: "-0.5px",
        }}>
          {idea.title}
        </h3>
        <p style={{
          margin: 0, color: "#aaa", fontSize: 14,
          fontFamily: "'Noto Sans JP', sans-serif",
        }}>
          {idea.tagline}
        </p>
      </div>

      {/* ===== DASHBOARD BODY ===== */}
      <div style={{ padding: "20px 24px" }}>

        {/* --- Gauge + 6-Axis Verdict Grid --- */}
        <div style={{
          display: "grid", gridTemplateColumns: "220px 1fr",
          gap: 16, marginBottom: 20, alignItems: "start",
        }}>
          {/* Gauge + Difficulty/Potential */}
          <div style={{
            background: "#0a0a0a", border: "1px solid #1a1a1a",
            borderRadius: 12, padding: "16px 12px 14px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          }}>
            <OpportunityGauge score={idea.opportunityScore} />
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "'JetBrains Mono', monospace", marginBottom: 2 }}>難易度</div>
                <DifficultyDots n={idea.difficulty} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "'JetBrains Mono', monospace", marginBottom: 2 }}>収益性</div>
                <DifficultyDots n={idea.potential} />
              </div>
            </div>
          </div>

          {/* 6-Axis Verdict Cards */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
          }}>
            {verdictItems.map((item, i) => {
              const vd = getVerdict(item.score || 5);
              return (
                <VerdictCard
                  key={i}
                  label={item.label}
                  verdict={vd.text}
                  reason={item.reason || "—"}
                  color={vd.color}
                  icon={vd.icon}
                />
              );
            })}
          </div>
        </div>

        {/* --- Row 2: KPI Metrics Grid --- */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10, marginBottom: 20,
        }}>
          <KPICard label="TAM" value={idea.tam || "—"} color="#06b6d4" />
          <KPICard label="SAM" value={idea.sam || "—"} color="#3b82f6" />
          <KPICard label="ARPA" value={idea.arpa || "—"} color="#10b981" />
          <KPICard
            label="競合数"
            value={idea.competitorCount != null ? `${idea.competitorCount}社` : "—"}
            sub={idea.competitorCount <= 3 ? "少ない - チャンス" : idea.competitorCount <= 8 ? "適度な競争" : "激戦区"}
            color={idea.competitorCount <= 3 ? "#22c55e" : idea.competitorCount <= 8 ? "#f59e0b" : "#ef4444"}
          />
          <KPICard label="MVP期間" value={idea.mvpWeeks ? `${idea.mvpWeeks}週間` : "—"} color="#8b5cf6" />
          <KPICard label="黒字化" value={idea.monthsToProfit ? `${idea.monthsToProfit}ヶ月` : "—"} color="#22c55e" />
          <KPICard
            label="チャーンリスク"
            value={churnLabel}
            color={churnColor}
          />
          <KPICard label="主要チャネル" value={idea.primaryChannel || "—"} color="#f59e0b" />
        </div>

        {/* --- Milestone Timeline --- */}
        {idea.mvpWeeks && idea.monthsToProfit && (
          <div style={{
            background: "#0a0a0a", border: "1px solid #1a1a1a",
            borderRadius: 12, padding: "14px 20px", marginBottom: 20,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#666",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "1px", marginBottom: 4,
            }}>
              MILESTONE TIMELINE
            </div>
            <MilestoneTimeline mvpWeeks={idea.mvpWeeks} monthsToProfit={idea.monthsToProfit} />
          </div>
        )}

        {/* --- Problem & Audience --- */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16,
        }}>
          {idea.problem && (
            <div style={{
              background: "#0d0d0d", borderRadius: 8, padding: "10px 14px",
              borderLeft: "3px solid #ef4444",
            }}>
              <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>PROBLEM</span>
              <p style={{
                margin: "6px 0 0", fontSize: 13, color: "#ccc",
                lineHeight: 1.7, fontFamily: "'Noto Sans JP', sans-serif",
              }}>
                {idea.problem}
              </p>
            </div>
          )}
          <div style={{
            background: "#0d0d0d", borderRadius: 8, padding: "10px 14px",
            borderLeft: "3px solid #6366f1",
          }}>
            <span style={{ color: "#6366f1", fontWeight: 700, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>TARGET USER</span>
            <p style={{
              margin: "6px 0 0", fontSize: 13, color: "#ccc",
              lineHeight: 1.7, fontFamily: "'Noto Sans JP', sans-serif",
            }}>
              {idea.audience}
            </p>
            {idea.trendPeriod && (
              <p style={{
                margin: "6px 0 0", paddingTop: 6, borderTop: "1px solid #1a1a1a",
                fontSize: 11, color: "#666", fontFamily: "'JetBrains Mono', monospace",
              }}>
                {idea.trendPeriod}
              </p>
            )}
          </div>
        </div>

        {/* --- Analysis Grid --- */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 10, marginBottom: 16,
        }}>
          <AnalysisPanel icon="📈" title="トレンド理由" accent="#f59e0b">
            <div>{idea.trendReason}</div>
            {idea.whyNow && (
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid #1a1a1a", color: "#999", fontSize: 12 }}>
                <span style={{ color: "#f59e0b", fontWeight: 600 }}>今やるべき理由: </span>
                {idea.whyNow}
              </div>
            )}
            {idea.demandEvidence && (
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid #1a1a1a", color: "#999", fontSize: 12 }}>
                <span style={{ color: "#a78bfa", fontWeight: 600 }}>需要の根拠: </span>
                {idea.demandEvidence}
              </div>
            )}
          </AnalysisPanel>

          <AnalysisPanel icon="🏢" title="市場分析" accent="#06b6d4">
            {idea.marketSize && <div>{idea.marketSize}</div>}
            {idea.growthRate && (
              <div style={{ marginTop: 4, color: "#999", fontSize: 12 }}>
                <span style={{ color: "#06b6d4", fontWeight: 600 }}>成長率: </span>
                {idea.growthRate}
              </div>
            )}
          </AnalysisPanel>

          <AnalysisPanel icon="⚔️" title="競合 & 差別化" accent="#ec4899">
            <div>{idea.competitors}</div>
            {idea.differentiationStrategy && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1a1a1a" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#ec4899", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                  差別化戦略
                </div>
                <div style={{ color: "#ddd", fontSize: 13, lineHeight: 1.7 }}>
                  {idea.differentiationStrategy}
                </div>
              </div>
            )}
          </AnalysisPanel>

          <AnalysisPanel icon="💰" title="ビジネスモデル" accent="#10b981">
            <div>{idea.monetization}</div>
            {idea.risks && (
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid #1a1a1a", color: "#999", fontSize: 12 }}>
                <span style={{ color: "#ef4444", fontWeight: 600 }}>リスク: </span>
                {idea.risks}
              </div>
            )}
          </AnalysisPanel>
        </div>

        {/* --- Go / No-Go --- */}
        {(idea.prosForGo?.length > 0 || idea.consForGo?.length > 0) && (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16,
          }}>
            <div style={{
              background: "#22c55e08", border: "1px solid #22c55e20",
              borderRadius: 10, padding: 14,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
                GO REASONS
              </div>
              {(idea.prosForGo || []).map((p, i) => (
                <div key={i} style={{
                  fontSize: 13, color: "#bbb", lineHeight: 1.6,
                  fontFamily: "'Noto Sans JP', sans-serif",
                  paddingLeft: 12, borderLeft: "2px solid #22c55e30",
                  marginBottom: 4,
                }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{
              background: "#ef444408", border: "1px solid #ef444420",
              borderRadius: 10, padding: 14,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
                RISKS & CONCERNS
              </div>
              {(idea.consForGo || []).map((c, i) => (
                <div key={i} style={{
                  fontSize: 13, color: "#bbb", lineHeight: 1.6,
                  fontFamily: "'Noto Sans JP', sans-serif",
                  paddingLeft: 12, borderLeft: "2px solid #ef444430",
                  marginBottom: 4,
                }}>
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Execution Simulation --- */}
        {(idea.firstUsers || idea.estimatedCosts || idea.revenueTarget || idea.similarSuccess) && (
          <div style={{
            background: "#0a0a0a", border: "1px solid #1a1a1a",
            borderRadius: 12, padding: 16, marginBottom: 16,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#a78bfa",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "1px", marginBottom: 12,
            }}>
              EXECUTION PLAN
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {idea.firstUsers && (
                <div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                    初期ユーザー獲得
                  </div>
                  <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6, fontFamily: "'Noto Sans JP', sans-serif" }}>
                    {idea.firstUsers}
                  </div>
                </div>
              )}
              {idea.revenueTarget && (
                <div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                    売上目標
                  </div>
                  <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6, fontFamily: "'Noto Sans JP', sans-serif" }}>
                    {idea.revenueTarget}
                  </div>
                </div>
              )}
              {idea.estimatedCosts && (
                <div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                    月額ランニングコスト
                  </div>
                  <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6, fontFamily: "'Noto Sans JP', sans-serif" }}>
                    {idea.estimatedCosts}
                  </div>
                </div>
              )}
              {idea.similarSuccess && (
                <div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                    類似の成功事例
                  </div>
                  <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6, fontFamily: "'Noto Sans JP', sans-serif" }}>
                    {idea.similarSuccess}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Footer --- */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 10, paddingTop: 12,
          borderTop: "1px solid #1a1a1a",
        }}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {(idea.techStack || []).map((t) => (
              <span
                key={t}
                style={{
                  padding: "2px 8px", borderRadius: 6,
                  background: "#1a1a1a", color: "#666",
                  fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                  border: "1px solid #262626",
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <button
            onClick={onClick}
            style={{
              padding: "10px 24px", borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#fff", cursor: "pointer",
              fontWeight: 700, fontSize: 14,
              fontFamily: "'Noto Sans JP', sans-serif",
              transition: "all 0.2s",
              boxShadow: "0 2px 12px #6366f130",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 20px #6366f150";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 12px #6366f130";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            📋 企画書を生成
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanView({
  idea,
  plan,
  onBack,
  loading,
}: {
  idea: Idea;
  plan: Plan | null;
  onBack: () => void;
  loading: boolean;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 20,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: "3px solid #333",
            borderTopColor: "#6366f1",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p
          style={{
            color: "#888",
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 14,
          }}
        >
          「{idea.title}」の企画書を生成中...
        </p>
      </div>
    );
  }

  if (!plan) return null;

  const Section = ({
    title,
    children,
    copyText,
    copyKey,
  }: {
    title: string;
    children: React.ReactNode;
    copyText?: string;
    copyKey?: string;
  }) => (
    <div
      style={{
        background: "#111",
        border: "1px solid #222",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h4
          style={{
            margin: 0,
            color: "#f0f0f0",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </h4>
        {copyText && copyKey && (
          <button
            onClick={() => copyToClipboard(copyText, copyKey)}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid #333",
              background:
                copiedField === copyKey ? "#6366f122" : "transparent",
              color: copiedField === copyKey ? "#6366f1" : "#666",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {copiedField === copyKey ? "✓ Copied" : "Copy"}
          </button>
        )}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ animation: "fadeSlideIn 0.3s ease-out" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "transparent",
            color: "#aaa",
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
          }}
        >
          ← 戻る
        </button>
        <div>
          <h2
            style={{
              margin: 0,
              color: "#f0f0f0",
              fontSize: 24,
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {idea.title}
          </h2>
          <p
            style={{
              margin: "4px 0 0 0",
              color: "#888",
              fontSize: 13,
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            {plan.marketingOneLiner}
          </p>
        </div>
      </div>

      <Section title="📋 サマリー">
        <p
          style={{
            margin: 0,
            color: "#ccc",
            fontSize: 14,
            lineHeight: 1.8,
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          {plan.summary}
        </p>
      </Section>

      <Section title="✅ MVP機能（1週間で作る）">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(plan.mvpFeatures || []).map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                color: "#ccc",
                fontSize: 14,
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              <span
                style={{ color: "#6366f1", fontWeight: 700, flexShrink: 0 }}
              >
                {i + 1}.
              </span>
              {f}
            </div>
          ))}
        </div>
      </Section>

      <Section title="🚫 スコープ外（後回し）">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {(plan.outOfScope || []).map((f, i) => (
            <div
              key={i}
              style={{
                color: "#888",
                fontSize: 13,
                fontFamily: "'Noto Sans JP', sans-serif",
                paddingLeft: 12,
                borderLeft: "2px solid #333",
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </Section>

      <Section title="📅 7日間実装プラン">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(plan.dayByDayPlan || []).map((d, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "#6366f122",
                  color: "#6366f1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                D{d.day}
              </span>
              <p
                style={{
                  margin: 0,
                  color: "#ccc",
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontFamily: "'Noto Sans JP', sans-serif",
                  paddingTop: 6,
                }}
              >
                {d.tasks}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="🤖 Claude Code プロンプト（コピーしてそのまま貼り付け）"
        copyText={plan.claudeCodePrompt}
        copyKey="prompt"
      >
        <div
          style={{
            background: "#0a0a0a",
            borderRadius: 8,
            padding: 16,
            maxHeight: 400,
            overflowY: "auto",
            border: "1px solid #1a1a1a",
          }}
        >
          <pre
            style={{
              margin: 0,
              color: "#a5b4fc",
              fontSize: 13,
              lineHeight: 1.7,
              fontFamily: "'JetBrains Mono', monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {plan.claudeCodePrompt}
          </pre>
        </div>
      </Section>
    </div>
  );
}

// -- Main App --
export default function MVPIdeaFactory() {
  const [selectedSources, setSelectedSources] = useState(
    IDEA_SOURCES.map((s) => s.id)
  );
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [ideaCount, setIdeaCount] = useState(6);
  const [error, setError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const toggleSource = (id: string) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const generateIdeas = async () => {
    if (selectedSources.length === 0) {
      setError("ソースを1つ以上選択してください");
      return;
    }
    setError(null);
    setLoading(true);
    setIdeas([]);
    setSelectedIdea(null);
    setPlan(null);
    try {
      const result = await callClaude(
        buildDiscoveryPrompt(selectedSources, ideaCount)
      );
      setIdeas(
        Array.isArray(result)
          ? result.map((r: Omit<Idea, "id">) => ({ ...r, id: generateId() }))
          : []
      );
    } catch (e) {
      setError(
        "アイデア生成に失敗しました: " +
          (e instanceof Error ? e.message : String(e))
      );
    }
    setLoading(false);
  };

  const selectIdea = async (idea: Idea) => {
    setSelectedIdea(idea);
    setPlan(null);
    setPlanLoading(true);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    try {
      const result = await callClaude(buildPlanPrompt(idea));
      setPlan(result);
    } catch (e) {
      setError(
        "企画書生成に失敗しました: " +
          (e instanceof Error ? e.message : String(e))
      );
    }
    setPlanLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#f0f0f0",
        fontFamily: "'Noto Sans JP', 'Space Grotesk', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;800&family=JetBrains+Mono:wght@400;700&family=Noto+Sans+JP:wght@400;500;700&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>

      <div
        ref={topRef}
        style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}
      >
        {/* Title */}
        <div style={{ marginBottom: 40, animation: "fadeSlideIn 0.4s ease-out" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              ⚡
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 800,
                fontFamily: "'Space Grotesk', sans-serif",
                background: "linear-gradient(135deg, #f0f0f0, #888)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-1px",
              }}
            >
              MVP Idea Factory
            </h1>
          </div>
          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: 14,
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            トレンドからアイデアを発掘 → 企画書 + Claude Codeプロンプトを自動生成
          </p>
        </div>

        {/* Controls */}
        {!selectedIdea && (
          <div
            style={{
              background: "#111",
              border: "1px solid #1a1a1a",
              borderRadius: 16,
              padding: 24,
              marginBottom: 32,
              animation: "fadeSlideIn 0.4s ease-out 0.1s both",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "#888",
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                アイデアソース
              </label>
              <SourceToggle
                sources={IDEA_SOURCES}
                selected={selectedSources}
                onToggle={toggleSource}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 20,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label
                  style={{
                    color: "#888",
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  生成数:
                </label>
                {[4, 6, 8, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setIdeaCount(n)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border:
                        ideaCount === n
                          ? "2px solid #6366f1"
                          : "1px solid #333",
                      background:
                        ideaCount === n ? "#6366f122" : "transparent",
                      color: ideaCount === n ? "#6366f1" : "#888",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                onClick={generateIdeas}
                disabled={loading}
                style={{
                  marginLeft: "auto",
                  padding: "12px 28px",
                  borderRadius: 10,
                  border: "none",
                  background: loading
                    ? "#333"
                    : "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "#fff",
                  cursor: loading ? "wait" : "pointer",
                  fontWeight: 700,
                  fontSize: 15,
                  fontFamily: "'Noto Sans JP', sans-serif",
                  transition: "all 0.2s",
                  boxShadow: loading ? "none" : "0 4px 20px #6366f140",
                }}
              >
                {loading ? "生成中..." : "⚡ アイデアを発掘"}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#ef444422",
              border: "1px solid #ef4444",
              borderRadius: 10,
              padding: 14,
              marginBottom: 20,
              color: "#fca5a5",
              fontSize: 14,
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {Array.from({ length: ideaCount }, (_, i) => (
              <div
                key={i}
                style={{
                  background: "#111",
                  border: "1px solid #1a1a1a",
                  borderRadius: 16,
                  overflow: "hidden",
                  animation: `pulse 1.5s ease-in-out ${i * 0.15}s infinite`,
                }}
              >
                <div style={{ background: "#0d0d0d", padding: "16px 24px", borderBottom: "1px solid #1a1a1a" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 80, height: 20, background: "#1a1a1a", borderRadius: 8 }} />
                    <div style={{ width: 100, height: 20, background: "#1a1a1a", borderRadius: 8 }} />
                  </div>
                  <div style={{ width: "50%", height: 24, background: "#1a1a1a", borderRadius: 8, marginBottom: 6 }} />
                  <div style={{ width: "70%", height: 14, background: "#1a1a1a", borderRadius: 8 }} />
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, marginBottom: 20 }}>
                    <div style={{ height: 180, background: "#0a0a0a", borderRadius: 12, border: "1px solid #1a1a1a" }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      {[0,1,2,3,4,5].map((j) => (
                        <div key={j} style={{ height: 84, background: "#0d0d0d", borderRadius: 10, border: "1px solid #1a1a1a" }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <div key={j} style={{ height: 60, background: "#0d0d0d", borderRadius: 10, border: "1px solid #1a1a1a" }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Plan view */}
        {selectedIdea && (
          <PlanView
            idea={selectedIdea}
            plan={plan}
            loading={planLoading}
            onBack={() => {
              setSelectedIdea(null);
              setPlan(null);
            }}
          />
        )}

        {/* Ideas grid */}
        {!loading && !selectedIdea && ideas.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#666",
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {ideas.length} ideas generated — click to build
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {ideas.map((idea, i) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  index={i}
                  onClick={() => selectIdea(idea)}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && ideas.length === 0 && !selectedIdea && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              animation: "fadeSlideIn 0.4s ease-out 0.2s both",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏭</div>
            <p
              style={{
                color: "#555",
                fontSize: 16,
                lineHeight: 1.8,
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              ソースを選んで「アイデアを発掘」を押すと
              <br />
              AIがトレンドベースのMVPアイデアを生成します
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "40px 0 20px",
            color: "#333",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          MVP Idea Factory — Built for weekly shipping
        </div>
      </div>
    </div>
  );
}
