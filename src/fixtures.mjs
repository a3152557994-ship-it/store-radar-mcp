/**
 * Realistic offline fixture datasets matching Apple iTunes Search API and
 * Customer Reviews RSS JSON structures for deterministic testing, offline mode,
 * and air-gapped environments.
 */

export const OFFLINE_NICHES = {
  cn_prompter: {
    keywords: ["提词器", "悬浮提词", "口播提词", "灵动岛提词", "teleprompter"],
    apps: [
      {
        trackId: 900101,
        trackName: "爱提词 Pro - 悬浮口播提词器",
        bundleId: "com.example.aitici",
        sellerName: "VisionScript Studio",
        price: 0,
        formattedPrice: "免费",
        currency: "CNY",
        primaryGenreName: "Photo & Video",
        averageUserRating: 4.1,
        userRatingCount: 8420,
        currentVersionReleaseDate: "2026-09-12T08:00:00Z",
        version: "4.8.2",
        trackViewUrl: "https://apps.apple.com/cn/app/id900101",
        description: "支持悬浮窗提词、AI语速跟随。含自动续费VIP会员（¥38/月，¥198/年）。",
      },
      {
        trackId: 900102,
        trackName: "闪念提词 - 短视频直播台词助手",
        bundleId: "com.example.flashprompt",
        sellerName: "BytePrompt Tech",
        price: 0,
        formattedPrice: "免费",
        currency: "CNY",
        primaryGenreName: "Productivity",
        averageUserRating: 3.6,
        userRatingCount: 3190,
        currentVersionReleaseDate: "2026-06-20T08:00:00Z",
        version: "3.2.0",
        trackViewUrl: "https://apps.apple.com/cn/app/id900102",
        description: "短视频拍摄必备提词工具，内购解锁高清录制与悬浮模式。",
      },
      {
        trackId: 900103,
        trackName: "极简台词板",
        bundleId: "com.example.cleanboard",
        sellerName: "Indie Film Tools",
        price: 18,
        formattedPrice: "¥18.00",
        currency: "CNY",
        primaryGenreName: "Photo & Video",
        averageUserRating: 4.4,
        userRatingCount: 640,
        currentVersionReleaseDate: "2025-11-05T08:00:00Z",
        version: "1.4.1",
        trackViewUrl: "https://apps.apple.com/cn/app/id900103",
        description: "一次性买断无内购基础滚屏提词板，暂不支持画中画悬浮窗。",
      },
      {
        trackId: 900104,
        trackName: "轻映提词大师 - AI语音跟随",
        bundleId: "com.example.lightprompt",
        sellerName: "CloudCam Co.",
        price: 0,
        formattedPrice: "免费",
        currency: "CNY",
        primaryGenreName: "Photo & Video",
        averageUserRating: 3.4,
        userRatingCount: 5110,
        currentVersionReleaseDate: "2026-10-01T08:00:00Z",
        version: "5.1.0",
        trackViewUrl: "https://apps.apple.com/cn/app/id900104",
        description: "智能AI滚动字幕，免费试用3天自动续费每年¥268。",
      },
      {
        trackId: 900105,
        trackName: "快口播提词 - 直播悬浮字幕",
        bundleId: "com.example.fastkoubo",
        sellerName: "Koubo Labs",
        price: 0,
        formattedPrice: "免费",
        currency: "CNY",
        primaryGenreName: "Utilities",
        averageUserRating: 3.8,
        userRatingCount: 1890,
        currentVersionReleaseDate: "2026-08-14T08:00:00Z",
        version: "2.9.4",
        trackViewUrl: "https://apps.apple.com/cn/app/id900105",
        description: "一键导入文案开启画中画提词，内置云端文稿同步。",
      },
    ],
    reviewsByTrackId: {
      900101: [
        { rating: 1, title: "免费试用陷阱！半夜自动扣费198元", content: "说是免费试用三天，根本没有提醒就直接自动续费扣了我198元！一个提词器订阅比视频会员还贵，吃相太难看了！", author: "口播新人阿泽", version: "4.8.2", updated: "2026-10-12" },
        { rating: 2, title: "录到一半经常闪退，台词全丢了", content: "拍4K视频开悬浮窗不到5分钟必闪退卡死，刚改好的两千字文稿没保存直接丢失，太耽误干活了。", author: "美妆主理人Lina", version: "4.8.1", updated: "2026-10-03" },
        { rating: 1, title: "不登录手机号不让用", content: "打开就强制手机号验证码登录，还有开屏广告弹窗，我只想离线看个词而已。", author: "独立摄影老周", version: "4.8.0", updated: "2026-09-25" },
        { rating: 3, title: "悬浮窗离摄像头太远眼神飘", content: "悬浮框不能贴紧灵动岛边缘，录出来眼睛一直在往下瞟，缺少贴顶微调功能。", author: "知识博主陈先生", version: "4.8.2", updated: "2026-10-18" },
      ],
      900102: [
        { rating: 1, title: "诱导付费，月卡38太黑了", content: "导入超过200字就要开VIP订阅，一个月38块钱，买断都没有，纯纯割韭菜。", author: "Vlogger小夏", version: "3.2.0", updated: "2026-09-19" },
        { rating: 2, title: "更新后画中画黑屏卡顿", content: "升级iOS之后悬浮窗直接黑屏不滚动，客服也没人回，bug太多了。", author: "带货主播阿杰", version: "3.2.0", updated: "2026-09-11" },
        { rating: 2, title: "广告弹窗满天飞", content: "每次保存台词都弹5秒全屏广告，一不小心就点进垃圾网页。", author: "数码测评君", version: "3.1.9", updated: "2026-08-30" },
      ],
      900103: [
        { rating: 3, title: "买断很良心但缺少画中画悬浮", content: "没有广告也不用订阅这点很好，但是不支持切到原相机悬浮提词，功能太简陋了。", author: "纪录片导演K", version: "1.4.1", updated: "2026-07-14" },
        { rating: 2, title: "iCloud同步经常失效", content: "iPad上写好的稿子手机上同步不过来，导出txt还会乱码。", author: "讲师王老师", version: "1.4.1", updated: "2026-06-08" },
      ],
      900104: [
        { rating: 1, title: "自动续费268元退钱！", content: "点错一下直接扣费268一年，取消订阅入口藏得极深，诱导付费太恶心了！", author: "宝妈创业日记", version: "5.1.0", updated: "2026-10-21" },
        { rating: 1, title: "AI语音跟随根本不准还卡死", content: "读快一点就卡在第一行不动，然后整个App白屏闪退，严重影响录制。", author: "财经说老李", version: "5.1.0", updated: "2026-10-15" },
      ],
      900105: [
        { rating: 2, title: "云端文稿莫名其妙清空丢失", content: "服务器维护把我存了十几篇口播稿全弄丢了，连本地备份导出都没有！", author: "探店达人Mia", version: "2.9.4", updated: "2026-09-29" },
        { rating: 1, title: "强制注册账号+周卡订阅刺客", content: "每周自动扣费18元！一个简单工具搞周订阅，吃相难看。", author: "阿凯聊车", version: "2.9.4", updated: "2026-09-17" },
      ],
    },
  },
  us_habit: {
    keywords: ["habit tracker", "daily routine", "streak tracker", "adhd planner"],
    apps: [
      {
        trackId: 800201,
        trackName: "StreakPulse: Daily Habit & Goals",
        bundleId: "io.streakpulse.app",
        sellerName: "PulseGrowth Inc.",
        price: 0,
        formattedPrice: "Free",
        currency: "USD",
        primaryGenreName: "Productivity",
        averageUserRating: 4.0,
        userRatingCount: 14200,
        currentVersionReleaseDate: "2026-10-02T12:00:00Z",
        version: "6.4.0",
        trackViewUrl: "https://apps.apple.com/us/app/id800201",
        description: "Build lasting routines with smart reminders. Subscription $9.99/mo or $59.99/yr.",
      },
      {
        trackId: 800202,
        trackName: "HabitGrid Pro - Routine Builder",
        bundleId: "com.habitgrid.mobile",
        sellerName: "GridLabs LLC",
        price: 0,
        formattedPrice: "Free",
        currency: "USD",
        primaryGenreName: "Health & Fitness",
        averageUserRating: 3.7,
        userRatingCount: 6830,
        currentVersionReleaseDate: "2026-08-19T12:00:00Z",
        version: "3.9.1",
        trackViewUrl: "https://apps.apple.com/us/app/id800202",
        description: "Visual heatmap habit tracker. Unlock unlimited habits with Pro membership.",
      },
      {
        trackId: 800203,
        trackName: "MinimalCheck",
        bundleId: "dev.indie.minimalcheck",
        sellerName: "SoloCraft Apps",
        price: 4.99,
        formattedPrice: "$4.99",
        currency: "USD",
        primaryGenreName: "Productivity",
        averageUserRating: 4.5,
        userRatingCount: 920,
        currentVersionReleaseDate: "2025-12-01T12:00:00Z",
        version: "1.2.0",
        trackViewUrl: "https://apps.apple.com/us/app/id800203",
        description: "Simple offline checklist with no subscriptions. Widgets not included yet.",
      },
      {
        trackId: 800204,
        trackName: "ZenRoutine AI Coach",
        bundleId: "ai.zenroutine.coach",
        sellerName: "ZenMind Corp",
        price: 0,
        formattedPrice: "Free",
        currency: "USD",
        primaryGenreName: "Lifestyle",
        averageUserRating: 3.3,
        userRatingCount: 4510,
        currentVersionReleaseDate: "2026-09-28T12:00:00Z",
        version: "2.7.5",
        trackViewUrl: "https://apps.apple.com/us/app/id800204",
        description: "AI-powered daily schedule & streak coach. 7-day trial then $69.99/year.",
      },
      {
        trackId: 800205,
        trackName: "AtomicLoop Tracker",
        bundleId: "app.atomicloop.ios",
        sellerName: "Loopware Studio",
        price: 0,
        formattedPrice: "Free",
        currency: "USD",
        primaryGenreName: "Productivity",
        averageUserRating: 3.9,
        userRatingCount: 2740,
        currentVersionReleaseDate: "2026-07-11T12:00:00Z",
        version: "4.0.3",
        trackViewUrl: "https://apps.apple.com/us/app/id800205",
        description: "Track habits across iPhone, iPad, and Watch with cloud sync.",
      },
    ],
    reviewsByTrackId: {
      800201: [
        { rating: 1, title: "$60/year subscription for a glorified checkbox?!", content: "Used to be a one-time purchase, now they locked my existing habits behind a $59.99 auto-renew paywall. Subscription fatigue is real.", author: "dev_marcus", version: "6.4.0", updated: "2026-10-14" },
        { rating: 2, title: "Widget freezes and loses streak data", content: "Home screen widget is stuck on yesterday and iCloud sync wiped my 120-day streak after updating. No CSV export on free tier.", author: "sarah_k92", version: "6.4.0", updated: "2026-10-09" },
        { rating: 1, title: "Forced account sign up + constant upsell popups", content: "Why do I need an email account just to track drinking water? Every morning it shows a full-screen promo popup.", author: "privacy_first", version: "6.3.8", updated: "2026-09-22" },
      ],
      800202: [
        { rating: 1, title: "Predatory weekly charge $6.99/wk", content: "Sneaky trial charged me $6.99 weekly without warning! Way too expensive for a simple tracker.", author: "alex_t", version: "3.9.1", updated: "2026-09-30" },
        { rating: 2, title: "Crashes every time I open stats tab", content: "App crashes immediately on iOS when tapping monthly heatmap. Super buggy update.", author: "runner_dan", version: "3.9.1", updated: "2026-09-12" },
      ],
      800203: [
        { rating: 3, title: "Love no subscription, but missing interactive widgets", content: "Fair one-time price, zero ads, works offline. Just wish it had interactive iOS lock screen widgets and CSV backup.", author: "minimalist_jo", version: "1.2.0", updated: "2026-08-05" },
      ],
      800204: [
        { rating: 1, title: "Bloated AI spam and $70 overcharge", content: "Cluttered interface, annoying chatbot popups, and charged $69.99 auto-renew right before trial ended.", author: "tired_founder", version: "2.7.5", updated: "2026-10-19" },
        { rating: 2, title: "Lost all notes during cloud sync", content: "Server outage deleted two weeks of routine logs. Needs local-first storage and export.", author: "lena_writes", version: "2.7.4", updated: "2026-10-01" },
      ],
      800205: [
        { rating: 2, title: "Apple Watch sync broken + paywall for >3 habits", content: "Limiting free tier to 3 habits and asking $49/yr is ridiculous, plus Watch app lags and never syncs.", author: "watch_user88", version: "4.0.3", updated: "2026-09-04" },
      ],
    },
  },
};

/**
 * Pick or synthesize deterministic fixture data for any keyword & country
 * when running in `--offline` / `use_fixture` mode.
 */
export function getOfflineSearchApps(keyword, country = "us", limit = 5) {
  const kw = String(keyword || "").toLowerCase().trim();
  const isCn = String(country || "").toLowerCase() === "cn" || /[\u4e00-\u9fa5]/.test(kw);
  const preset = isCn ? OFFLINE_NICHES.cn_prompter : OFFLINE_NICHES.us_habit;

  // Customize titles subtly if a custom keyword is queried in offline mode while preserving realistic structure
  const matchesPreset = preset.keywords.some((k) => kw.includes(k) || k.includes(kw));
  const apps = preset.apps.slice(0, limit).map((app, idx) => {
    if (matchesPreset || !kw) return { ...app };
    const tag = isCn ? `[${keyword}] ` : `${keyword} - `;
    return {
      ...app,
      trackId: app.trackId + (idx === 0 ? 0 : 0), // keep review mapping intact
      trackName: idx < 2 ? `${tag}${app.trackName}` : app.trackName,
    };
  });
  return apps;
}

export function getOfflineNegativeReviews(trackId, country = "us") {
  const allMaps = {
    ...OFFLINE_NICHES.cn_prompter.reviewsByTrackId,
    ...OFFLINE_NICHES.us_habit.reviewsByTrackId,
  };
  if (allMaps[trackId]) {
    return allMaps[trackId].map((r) => ({ ...r }));
  }
  const isCn = String(country || "").toLowerCase() === "cn";
  return isCn
    ? [
        { rating: 1, title: "自动续费太坑了", content: "免费试用没提醒直接扣费，订阅价格虚高，希望出一次性买断版。", author: "匿名用户", version: "1.0", updated: "2026-10-01" },
        { rating: 2, title: "闪退严重且无法导出", content: "更新后经常卡死闪退，本地数据不能导出备份。", author: "效率控", version: "1.0", updated: "2026-09-20" },
      ]
    : [
        { rating: 1, title: "Overpriced subscription paywall", content: "Locked basic features behind a costly monthly auto-renew subscription.", author: "indie_user", version: "1.0", updated: "2026-10-01" },
        { rating: 2, title: "Crashes and sync issues", content: "App freezes on launch and iCloud sync lost my saved entries.", author: "power_tester", version: "1.0", updated: "2026-09-20" },
      ];
}
