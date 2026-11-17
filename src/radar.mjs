/**
 * Store Radar Core Engine:
 * 1. Real-time Apple iTunes Search API + Customer Reviews RSS JSON querying (zero dependencies)
 * 2. Bilingual (EN + ZH) 1-3 star pain-point clustering & verbatim quote extraction
 * 3. Multi-keyword deduplicated competitor pricing/vulnerability matrix
 * 4. Actionable Markdown Commercial Battlecard generator for indie developers
 */

import { getOfflineSearchApps, getOfflineNegativeReviews } from "./fixtures.mjs";

export const PAIN_CATEGORIES = [
  {
    id: "subscription_fatigue",
    labelEn: "Subscription Fatigue & Predatory Paywalls",
    labelZh: "订阅刺客 / 自动扣费 / 定价过高",
    wedgeEn: "Ship a transparent one-time buyout ($9.9–$19) with zero dark-pattern trials.",
    wedgeZh: "用干净透明的「一次性买断制（¥12–¥68）」直接击穿竞品高价年费/周卡痛点。",
    patterns: [
      /subscri(be|ption)/i,
      /auto[- ]?renew/i,
      /paywall/i,
      /overpric(ed|e)/i,
      /overcharg(e|ed)/i,
      /too expensive/i,
      /predatory/i,
      /weekly charge/i,
      /\$\d+\s*\/\s*(mo|yr|wk|year|month|week)/i,
      /money grab/i,
      /rip[- ]?off/i,
      /自动续费/,
      /自动扣费/,
      /扣费/,
      /订阅/,
      /诱导付费/,
      /免费试用/,
      /太贵/,
      /割韭菜/,
      /吃相/,
      /周卡|月卡|年费|会员费/,
      /退钱/,
    ],
  },
  {
    id: "bugs_crashes",
    labelEn: "Crashes, Freezes & Performance Bugs",
    labelZh: "闪退卡死 / 黑屏白屏 / 稳定性崩溃",
    wedgeEn: "Build a lightweight native/local-first engine with instant cold start and zero lag.",
    wedgeZh: "砍掉臃肿后台，用原生轻量架构保障零闪退、秒开与高帧率稳定体验。",
    patterns: [
      /crash(es|ed|ing)?/i,
      /freez(e|es|ing)/i,
      /\bbug(s|gy)?\b/i,
      /\bstuck\b/i,
      /\blag(s|gy|ging)?\b/i,
      /black screen/i,
      /white screen/i,
      /won'?t open/i,
      /broken/i,
      /unusable/i,
      /闪退/,
      /卡死/,
      /卡顿/,
      /黑屏/,
      /白屏/,
      /打不开/,
      /报错/,
      /崩溃/,
      /不滚动|不动/,
    ],
  },
  {
    id: "sync_data_loss",
    labelEn: "Data Loss, Broken Sync & Export Lock-in",
    labelZh: "数据丢失 / 同步失效 / 导出受限",
    wedgeEn: "Store data locally first with instant 1-click CSV/JSON/Markdown export & backup.",
    wedgeZh: "坚持本地优先存储 + 一键无损导出备份（TXT/CSV/JSON），绝不绑架用户资产。",
    patterns: [
      /lost (all |my )?(data|notes|streak|files)/i,
      /wiped/i,
      /delet(ed|es) my/i,
      /\bsync(ing)?\b/i,
      /icloud/i,
      /\bexport\b/i,
      /\bbackup\b/i,
      /乱码/,
      /丢失/,
      /全丢|弄丢/,
      /清空/,
      /同步/,
      /导出/,
      /备份/,
      /找不回/,
    ],
  },
  {
    id: "ads_bloat",
    labelEn: "Intrusive Ads, Popups & Feature Bloat",
    labelZh: "开屏广告 / 弹窗骚扰 / 界面臃肿",
    wedgeEn: "Deliver a clean, single-purpose utility UI with zero ad SDKs or nagging modals.",
    wedgeZh: "零广告 SDK、零开屏弹窗，打开即进入核心工作台。",
    patterns: [
      /\bads\b/i,
      /advertis(ement|ing)/i,
      /pop[- ]?up(s)?/i,
      /\bspam(my)?\b/i,
      /bloat(ed)?/i,
      /cluttered/i,
      /upsell/i,
      /广告/,
      /弹窗/,
      /开屏/,
      /臃肿/,
      /骚扰/,
      /满天飞/,
    ],
  },
  {
    id: "auth_onboarding",
    labelEn: "Forced Account Sign-Up & Privacy Friction",
    labelZh: "强制注册登录 / 手机号隐私索取",
    wedgeEn: "Zero sign-up required — work 100% offline immediately on first launch.",
    wedgeZh: "免注册免登录、零手机号索取，安装即用保护隐私。",
    patterns: [
      /force(d)? (account|login|sign[- ]?up)/i,
      /sign[- ]?up/i,
      /create an account/i,
      /email account/i,
      /privacy/i,
      /强制登录/,
      /强制手机号/,
      /手机号/,
      /验证码/,
      /不登录/,
      /强制注册/,
    ],
  },
  {
    id: "missing_features_ux",
    labelEn: "Missing Core Workflow & UX Friction",
    labelZh: "关键场景缺失 / 交互反人类",
    wedgeEn: "Nail the exact micro-workflow incumbents neglect (widgets, floating overlay, shortcuts).",
    wedgeZh: "精准补齐头部竞品忽略的高频微场景（如贴顶灵动岛、桌面小组件、快捷指令）。",
    patterns: [
      /missing/i,
      /\bwish it had\b/i,
      /confusing/i,
      /widget(s)?/i,
      /lock screen/i,
      /complicated/i,
      /缺少/,
      /不支持/,
      /简陋/,
      /眼神飘|灵动岛|悬浮/,
      /难用/,
      /反人类/,
    ],
  },
];

const STOPWORDS_EN = new Set([
  "the", "and", "for", "that", "this", "with", "have", "from", "they", "just",
  "your", "when", "what", "were", "been", "very", "even", "only", "after", "into",
  "more", "will", "about", "there", "their", "would", "could", "should", "dont",
  "cant", "doesnt", "app", "apps", "use", "used", "using", "like", "really", "also",
]);

function normalizeAppRecord(raw) {
  const price = typeof raw.price === "number" ? raw.price : Number(raw.price || 0);
  const desc = String(raw.description || raw.descriptionSnippet || "");
  const hasSubHint =
    /subscri|auto[- ]?renew|\/mo|\/yr|会员|订阅|自动续费|内购|trial|vip/i.test(desc);
  return {
    trackId: Number(raw.trackId),
    name: String(raw.trackName || raw.name || "Unknown App").trim(),
    bundleId: String(raw.bundleId || ""),
    developer: String(raw.sellerName || raw.developer || ""),
    price,
    formattedPrice: String(raw.formattedPrice || (price === 0 ? "Free" : `$${price}`)),
    currency: String(raw.currency || "USD"),
    monetizationModel:
      price > 0 ? "paid_upfront" : hasSubHint ? "free_with_subscription_or_iap" : "free_or_iap",
    genre: String(raw.primaryGenreName || raw.genre || ""),
    rating: Number(Number(raw.averageUserRating || raw.rating || 0).toFixed(2)),
    ratingCount: Number(raw.userRatingCount || raw.ratingCount || 0),
    version: String(raw.version || ""),
    lastUpdated: String(raw.currentVersionReleaseDate || raw.lastUpdated || "").slice(0, 10),
    url: String(raw.trackViewUrl || raw.url || ""),
    descriptionSnippet: desc.slice(0, 240),
  };
}

/**
 * Query Apple iTunes Search API for software apps in a given country storefront.
 */
export async function fetchSearchApps(keyword, options = {}) {
  const country = String(options.country || "us").toLowerCase();
  const limit = Math.min(Math.max(Number(options.limit || 5), 1), 25);
  const offline = Boolean(options.offline || process.env.STORE_RADAR_OFFLINE === "1");
  const fetcher = options.fetcher || globalThis.fetch;

  if (offline) {
    return getOfflineSearchApps(keyword, country, limit).map(normalizeAppRecord);
  }

  const url =
    `https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}` +
    `&country=${encodeURIComponent(country)}&entity=software&limit=${limit}`;

  try {
    const res = await fetcher(url, {
      headers: {
        "User-Agent": "store-radar-mcp/1.0 (+https://github.com/a3152557994-ship-it/store-radar-mcp)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(options.timeoutMs || 10000),
    });
    if (!res.ok) {
      throw new Error(`iTunes Search HTTP ${res.status}`);
    }
    const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    return results.slice(0, limit).map(normalizeAppRecord);
  } catch (err) {
    if (options.fallbackToFixture) {
      return getOfflineSearchApps(keyword, country, limit).map(normalizeAppRecord);
    }
    throw err;
  }
}

/**
 * Query Apple Customer Reviews RSS JSON feed and extract 1-3 star negative reviews.
 */
export async function fetchNegativeReviews(trackId, options = {}) {
  const country = String(options.country || "us").toLowerCase();
  const maxReviews = Math.min(Math.max(Number(options.maxReviews || 10), 1), 50);
  const offline = Boolean(options.offline || process.env.STORE_RADAR_OFFLINE === "1");
  const fetcher = options.fetcher || globalThis.fetch;

  if (offline) {
    return getOfflineNegativeReviews(trackId, country).slice(0, maxReviews);
  }

  const page = Number(options.page || 1);
  const url = `https://itunes.apple.com/${encodeURIComponent(country)}/rss/customerreviews/page=${page}/id=${encodeURIComponent(trackId)}/sortby=mostrecent/json`;

  try {
    const res = await fetcher(url, {
      headers: {
        "User-Agent": "store-radar-mcp/1.0 (+https://github.com/a3152557994-ship-it/store-radar-mcp)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(options.timeoutMs || 10000),
    });
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Reviews RSS HTTP ${res.status}`);
    }
    const data = await res.json();
    const rawEntries = data?.feed?.entry;
    if (!rawEntries) return [];
    const entries = Array.isArray(rawEntries) ? rawEntries : [rawEntries];

    const negative = [];
    for (const entry of entries) {
      // First entry in older Apple RSS feeds can be app metadata without `im:rating`
      const ratingStr = entry?.["im:rating"]?.label;
      if (!ratingStr) continue;
      const rating = Number(ratingStr);
      if (Number.isNaN(rating) || rating > 3) continue;

      negative.push({
        rating,
        title: String(entry?.title?.label || "").trim(),
        content: String(entry?.content?.label || "").trim(),
        author: String(entry?.author?.name?.label || "App Store User").trim(),
        version: String(entry?.["im:version"]?.label || "").trim(),
        updated: String(entry?.updated?.label || "").slice(0, 10),
      });
      if (negative.length >= maxReviews) break;
    }
    return negative;
  } catch (err) {
    if (options.fallbackToFixture) {
      return getOfflineNegativeReviews(trackId, country).slice(0, maxReviews);
    }
    return [];
  }
}

/**
 * Extract high-frequency recurring pain tokens (EN words + ZH 2-4 char phrases).
 */
export function extractTopPainTerms(reviews, topN = 10) {
  const counts = new Map();
  const cjkSignalPhrases = [
    "自动续费", "自动扣费", "诱导付费", "免费试用", "订阅", "太贵", "扣费",
    "闪退", "卡死", "卡顿", "黑屏", "白屏", "打不开", "丢失", "同步", "导出",
    "广告", "弹窗", "强制登录", "手机号", "灵动岛", "悬浮窗", "画中画", "小组件",
  ];

  for (const rev of reviews) {
    const text = `${rev.title || ""} ${rev.content || ""}`;
    const seenInReview = new Set();

    // English words
    const enMatches = text.toLowerCase().match(/[a-z][a-z0-9-]{3,18}/g) || [];
    for (const word of enMatches) {
      if (STOPWORDS_EN.has(word)) continue;
      seenInReview.add(word);
    }

    // Curated high-signal Chinese phrases + repeated CJK bigrams
    for (const phrase of cjkSignalPhrases) {
      if (text.includes(phrase)) {
        seenInReview.add(phrase);
      }
    }

    for (const term of seenInReview) {
      counts.set(term, (counts.get(term) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .filter(([, c]) => c >= 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, topN)
    .map(([term, mentions]) => ({ term, mentions }));
}

/**
 * Cluster 1-3 star reviews into developer-actionable pain point categories.
 * Each review can match one or more categories; unmatched reviews fall into `other_ux`.
 */
export function clusterNegativeReviews(reviews) {
  const list = Array.isArray(reviews) ? reviews : [];
  const totalReviews = list.length;
  if (totalReviews === 0) {
    return {
      totalNegativeReviews: 0,
      averageNegativeRating: 0,
      clusters: [],
      topTerms: [],
    };
  }

  const buckets = new Map();
  for (const cat of PAIN_CATEGORIES) {
    buckets.set(cat.id, {
      id: cat.id,
      labelEn: cat.labelEn,
      labelZh: cat.labelZh,
      wedgeEn: cat.wedgeEn,
      wedgeZh: cat.wedgeZh,
      count: 0,
      severityPoints: 0,
      affectedApps: new Set(),
      quotes: [],
    });
  }

  let ratingSum = 0;
  for (const rev of list) {
    const rating = Math.min(Math.max(Number(rev.rating || 1), 1), 3);
    ratingSum += rating;
    const severity = 4 - rating; // 1★ = 3 pts, 2★ = 2 pts, 3★ = 1 pt
    const combined = `${rev.title || ""} ${rev.content || ""}`;

    let matchedAny = false;
    for (const cat of PAIN_CATEGORIES) {
      if (cat.patterns.some((re) => re.test(combined))) {
        matchedAny = true;
        const b = buckets.get(cat.id);
        b.count += 1;
        b.severityPoints += severity;
        if (rev.appName) b.affectedApps.add(rev.appName);
        if (b.quotes.length < 4) {
          b.quotes.push({
            rating,
            appName: rev.appName || null,
            title: rev.title || "",
            excerpt: String(rev.content || "").slice(0, 180),
            version: rev.version || "",
          });
        }
      }
    }

    if (!matchedAny) {
      const fallback = buckets.get("missing_features_ux");
      fallback.count += 1;
      fallback.severityPoints += severity;
      if (rev.appName) fallback.affectedApps.add(rev.appName);
      if (fallback.quotes.length < 4) {
        fallback.quotes.push({
          rating,
          appName: rev.appName || null,
          title: rev.title || "",
          excerpt: String(rev.content || "").slice(0, 180),
          version: rev.version || "",
        });
      }
    }
  }

  const clusters = [...buckets.values()]
    .filter((b) => b.count > 0)
    .map((b) => ({
      id: b.id,
      labelEn: b.labelEn,
      labelZh: b.labelZh,
      wedgeEn: b.wedgeEn,
      wedgeZh: b.wedgeZh,
      count: b.count,
      sharePercent: Number(((b.count / totalReviews) * 100).toFixed(1)),
      severityScore: b.severityPoints,
      affectedAppCount: b.affectedApps.size,
      affectedApps: [...b.affectedApps],
      quotes: b.quotes,
    }))
    .sort((a, b) => b.severityScore - a.severityScore || b.count - a.count);

  return {
    totalNegativeReviews: totalReviews,
    averageNegativeRating: Number((ratingSum / totalReviews).toFixed(2)),
    clusters,
    topTerms: extractTopPainTerms(list, 10),
  };
}

/**
 * Compute an incumbent Vulnerability Score (0-100):
 * High review count proves market demand; lower star rating (<4.3) + heavy 1-3★ pain = high indie opportunity.
 */
export function computeVulnerabilityScore(app, negativeReviews = []) {
  const demandScore = Math.min(35, Math.log10(Math.max(app.ratingCount, 1) + 1) * 8.5);
  const ratingGap = app.rating > 0 ? Math.max(0, (4.6 - app.rating) * 25) : 15;
  const subPenalty = app.monetizationModel === "free_with_subscription_or_iap" ? 14 : 4;
  const negSignal = Math.min(20, negativeReviews.length * 3.5);
  return Math.min(99, Math.max(5, Math.round(demandScore + ratingGap + subPenalty + negSignal)));
}

/**
 * Free MCP Tool: `probe_keyword`
 * Fetches top 5 competitors + verbatim 1-3 star reviews for a single keyword.
 */
export async function probeKeyword(params = {}) {
  const keyword = String(params.keyword || "").trim();
  if (!keyword) {
    throw new Error("Parameter `keyword` is required.");
  }
  const country = String(params.country || "us").toLowerCase();
  const limit = Math.min(Math.max(Number(params.limit || 5), 1), 10);
  const maxReviewsPerApp = Math.min(Math.max(Number(params.maxReviewsPerApp || 5), 1), 15);
  const offline = Boolean(params.offline || params.use_fixture);

  const apps = await fetchSearchApps(keyword, {
    country,
    limit,
    offline,
    fallbackToFixture: Boolean(params.fallbackToFixture),
    fetcher: params.fetcher,
  });

  const enriched = await Promise.all(
    apps.map(async (app) => {
      const negativeReviews = await fetchNegativeReviews(app.trackId, {
        country,
        maxReviews: maxReviewsPerApp,
        offline,
        fallbackToFixture: Boolean(params.fallbackToFixture),
        fetcher: params.fetcher,
      });
      return {
        ...app,
        vulnerabilityScore: computeVulnerabilityScore(app, negativeReviews),
        negativeReviewCountSampled: negativeReviews.length,
        negativeReviews,
      };
    }),
  );

  return {
    keyword,
    country,
    mode: offline ? "offline_fixture" : "live_itunes_api",
    competitorCount: enriched.length,
    competitors: enriched,
  };
}

/**
 * Pro MCP Tool: `compare_matrix`
 * Queries multiple keywords, deduplicates competitors, analyzes pricing models, and clusters all 1-3★ reviews.
 */
export async function compareMatrix(params = {}) {
  const rawKeywords = Array.isArray(params.keywords)
    ? params.keywords
    : String(params.keywords || "")
        .split(/[,，\n]/)
        .map((s) => s.trim())
        .filter(Boolean);

  if (rawKeywords.length === 0) {
    throw new Error("At least one keyword is required in `keywords`.");
  }

  const country = String(params.country || "us").toLowerCase();
  const limitPerKeyword = Math.min(Math.max(Number(params.limitPerKeyword || 5), 1), 10);
  const offline = Boolean(params.offline || params.use_fixture);

  const appMap = new Map();
  for (const kw of rawKeywords) {
    const apps = await fetchSearchApps(kw, {
      country,
      limit: limitPerKeyword,
      offline,
      fallbackToFixture: Boolean(params.fallbackToFixture),
      fetcher: params.fetcher,
    });
    apps.forEach((app, rankIdx) => {
      const existing = appMap.get(app.trackId);
      if (!existing) {
        appMap.set(app.trackId, {
          ...app,
          matchedKeywords: [kw],
          bestRank: rankIdx + 1,
        });
      } else {
        if (!existing.matchedKeywords.includes(kw)) {
          existing.matchedKeywords.push(kw);
        }
        existing.bestRank = Math.min(existing.bestRank, rankIdx + 1);
      }
    });
  }

  const uniqueApps = [...appMap.values()];
  const allNegativeReviews = [];

  for (const app of uniqueApps) {
    const negs = await fetchNegativeReviews(app.trackId, {
      country,
      maxReviews: 8,
      offline,
      fallbackToFixture: Boolean(params.fallbackToFixture),
      fetcher: params.fetcher,
    });
    app.negativeReviews = negs;
    app.negativeReviewCountSampled = negs.length;
    app.vulnerabilityScore = computeVulnerabilityScore(app, negs);
    for (const r of negs) {
      allNegativeReviews.push({ ...r, appName: app.name, trackId: app.trackId });
    }
  }

  uniqueApps.sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore || b.ratingCount - a.ratingCount);

  const paidApps = uniqueApps.filter((a) => a.price > 0);
  const subApps = uniqueApps.filter((a) => a.monetizationModel === "free_with_subscription_or_iap");
  const avgRating =
    uniqueApps.length > 0
      ? Number((uniqueApps.reduce((s, a) => s + a.rating, 0) / uniqueApps.length).toFixed(2))
      : 0;
  const totalRatings = uniqueApps.reduce((s, a) => s + a.ratingCount, 0);

  const painSummary = clusterNegativeReviews(allNegativeReviews);

  return {
    country,
    keywords: rawKeywords,
    mode: offline ? "offline_fixture" : "live_itunes_api",
    uniqueCompetitorCount: uniqueApps.length,
    marketMetrics: {
      totalUserRatings: totalRatings,
      averageCompetitorRating: avgRating,
      subscriptionHeavyCount: subApps.length,
      paidUpfrontCount: paidApps.length,
      freeCount: uniqueApps.length - paidApps.length,
    },
    competitors: uniqueApps,
    painClustering: painSummary,
  };
}

/**
 * Pro MCP Tool: `generate_battlecard`
 * Produces an executive Markdown Commercial Battlecard + structured go/no-go validation data.
 */
export async function generateBattlecard(params = {}) {
  const matrix = await compareMatrix(params);
  const isCn = matrix.country === "cn";
  const topClusters = matrix.painClustering.clusters.slice(0, 4);
  const primaryPain = topClusters[0] || null;
  const secondaryPain = topClusters[1] || null;

  // Calculate Opportunity Score (0-100)
  const demandPts = Math.min(40, Math.log10(Math.max(matrix.marketMetrics.totalUserRatings, 1) + 1) * 9);
  const ratingWeaknessPts =
    matrix.marketMetrics.averageCompetitorRating > 0
      ? Math.max(5, Math.min(30, (4.5 - matrix.marketMetrics.averageCompetitorRating) * 28))
      : 15;
  const subFatigueCluster = matrix.painClustering.clusters.find((c) => c.id === "subscription_fatigue");
  const subBonusPts = subFatigueCluster ? Math.min(20, subFatigueCluster.sharePercent * 0.45) : 6;
  const painDepthPts = Math.min(10, matrix.painClustering.totalNegativeReviews * 0.8);
  const opportunityScore = Math.min(
    98,
    Math.max(15, Math.round(demandPts + ratingWeaknessPts + subBonusPts + painDepthPts)),
  );

  const verdict =
    opportunityScore >= 72
      ? "STRONG GO (High Demand + Vulnerable Subscription Incumbents)"
      : opportunityScore >= 52
        ? "SELECTIVE GO (Differentiate via Sharp Micro-Workflow Wedge)"
        : "CAUTION (Low Review Volume or Entrenched 4.8★ Incumbents)";

  const buyoutRecommendation = isCn
    ? "¥12 – ¥28 一次性买断（免费体验基础功能 + 无广告永久解锁 Pro，正面对冲竞品 ¥198/年自动续费差评）"
    : "$9.99 – $19.00 One-Time Buyout (Free core utility + Lifetime Pro unlock — direct counter-positioning against $59/yr auto-renew fatigue)";

  const primaryKw = matrix.keywords[0];
  const asoHooks = isCn
    ? [
        `${primaryKw} 纯净版 - 免登录零广告买断制`,
        `极简${primaryKw} - 本地离线防丢稿 & 一键导出`,
      ]
    : [
        `${primaryKw} Pure — Offline, No Subscription`,
        `Clean ${primaryKw}: Local-First & One-Time Unlock`,
      ];

  const lines = [];
  lines.push(`# Store Radar Commercial Battlecard: \`${matrix.keywords.join(" / ")}\` (${matrix.country.toUpperCase()})`);
  lines.push("");
  lines.push(`- **Opportunity Score**: **${opportunityScore} / 100** — **${verdict}**`);
  lines.push(`- **Unique Competitors Analyzed**: ${matrix.uniqueCompetitorCount} apps (${matrix.marketMetrics.totalUserRatings.toLocaleString()} cumulative ratings, avg **${matrix.marketMetrics.averageCompetitorRating}★**)`);
  lines.push(`- **Sampled 1–3★ Verbatim Complaints**: ${matrix.painClustering.totalNegativeReviews} reviews`);
  lines.push(`- **Recommended Pricing Anchor**: ${buyoutRecommendation}`);
  lines.push("");

  lines.push("## 1. Competitor Pricing & Vulnerability Matrix");
  lines.push("");
  lines.push("| App Name | Price / Model | Rating | Reviews | Keywords Matched | Vulnerability |");
  lines.push("| :--- | :--- | :---: | :---: | :--- | :---: |");
  for (const app of matrix.competitors.slice(0, 8)) {
    const modelTag =
      app.monetizationModel === "paid_upfront"
        ? `${app.formattedPrice} (Paid)`
        : app.monetizationModel === "free_with_subscription_or_iap"
          ? `${app.formattedPrice} + Sub/IAP`
          : app.formattedPrice;
    lines.push(
      `| **${app.name.replace(/\|/g, "/")}** | ${modelTag} | ${app.rating}★ | ${app.ratingCount.toLocaleString()} | ${app.matchedKeywords.join(", ")} | **${app.vulnerabilityScore}/100** |`,
    );
  }
  lines.push("");

  lines.push("## 2. Clustered 1–3★ Pain Points & Verbatim User Quotes");
  lines.push("");
  if (topClusters.length === 0) {
    lines.push("> No 1–3★ reviews returned in current sample window. Try broadening seed keywords.");
  } else {
    topClusters.forEach((c, idx) => {
      lines.push(`### ${idx + 1}. ${c.labelEn} / ${c.labelZh} (${c.sharePercent}% · ${c.count} mentions)`);
      lines.push(`- **Indie Wedge**: ${isCn ? c.wedgeZh : c.wedgeEn}`);
      for (const q of c.quotes.slice(0, 2)) {
        const appPrefix = q.appName ? `[${q.appName}] ` : "";
        lines.push(`- *${q.rating}★ ${appPrefix}"${q.title}"* — "${q.excerpt}"`);
      }
      lines.push("");
    });
  }

  if (matrix.painClustering.topTerms.length > 0) {
    lines.push(
      `**High-Frequency Complaint Signals**: ${matrix.painClustering.topTerms
        .map((t) => `\`${t.term}\` (${t.mentions})`)
        .join(" · ")}`,
    );
    lines.push("");
  }

  lines.push("## 3. Weekend MVP Spec & Go-To-Market Wedge");
  lines.push("");
  lines.push(
    `1. **Core Hero Feature**: Solve **${primaryPain ? (isCn ? primaryPain.labelZh : primaryPain.labelEn) : "core speed & reliability"}** on Day 1 without requiring account registration.`,
  );
  if (secondaryPain) {
    lines.push(
      `2. **Retention Moat**: Address **${isCn ? secondaryPain.labelZh : secondaryPain.labelEn}** (${isCn ? secondaryPain.wedgeZh : secondaryPain.wedgeEn}).`,
    );
  }
  lines.push(`3. **ASO Title Candidates**:`);
  for (const hook of asoHooks) {
    lines.push(`   - \`${hook}\``);
  }

  return {
    opportunityScore,
    verdict,
    buyoutRecommendation,
    asoHooks,
    matrix,
    markdown: lines.join("\n"),
  };
}
