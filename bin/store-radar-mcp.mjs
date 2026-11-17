#!/usr/bin/env node
/**
 * store-radar-mcp — Zero-dependency MCP Server (JSON-RPC 2.0 over stdio) + CLI
 *
 * Modes:
 *   1. MCP Server over stdio (default when invoked with no args or `serve`):
 *      Supports newline-delimited JSON-RPC 2.0 (MCP standard) AND Content-Length framed messages.
 *   2. Direct CLI:
 *      store-radar-mcp probe --country cn --keywords "提词器,悬浮提词" [--offline] [--json]
 *      store-radar-mcp compare --country us --keywords "habit tracker,daily routine" [--license OPC1...]
 *      store-radar-mcp battlecard --country cn --keywords "提词器" [--license OPC1...]
 *      store-radar-mcp activate <OPC1_TOKEN>
 *      store-radar-mcp status
 */

import { probeKeyword, compareMatrix, generateBattlecard } from "../src/radar.mjs";
import { activateLicense, getLicenseStatus, PRODUCT_SLUG } from "../src/license.mjs";

const SERVER_NAME = "store-radar-mcp";
const SERVER_VERSION = "1.0.0";
const DEFAULT_PROTOCOL_VERSION = "2024-11-05";

export const MCP_TOOLS = [
  {
    name: "probe_keyword",
    description:
      "[FREE] Query Apple App Store iTunes Search API + Customer Reviews RSS for a keyword. Returns top 5 competitors (pricing, rating, review count, vulnerability score) and verbatim 1-3 star user complaints.",
    inputSchema: {
      type: "object",
      properties: {
        keyword: { type: "string", description: "Search keyword, e.g. 'teleprompter' or '提词器'" },
        country: { type: "string", description: "2-letter App Store storefront code (e.g. 'us', 'cn', 'jp')", default: "us" },
        limit: { type: "number", description: "Max competitors to return (1-10)", default: 5 },
        use_fixture: { type: "boolean", description: "Use deterministic offline fixture dataset", default: false },
      },
      required: ["keyword"],
    },
  },
  {
    name: "compare_matrix",
    description:
      "[PRO] Multi-keyword deduplicated App Store competitor matrix + bilingual 1-3 star pain-point clustering heatmap. Requires a valid OPC1. license key (`store-radar-mcp` or `*`).",
    inputSchema: {
      type: "object",
      properties: {
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "List of related niche keywords to cross-compare and deduplicate",
        },
        country: { type: "string", description: "2-letter App Store storefront code", default: "us" },
        limit_per_keyword: { type: "number", description: "Competitors per keyword (1-10)", default: 5 },
        license_key: { type: "string", description: "Optional inline OPC1.<payload>.<sig> Pro license token" },
        use_fixture: { type: "boolean", description: "Use deterministic offline fixture dataset", default: false },
      },
      required: ["keywords"],
    },
  },
  {
    name: "generate_battlecard",
    description:
      "[PRO] Generate a ready-to-ship Markdown Commercial Battlecard: Opportunity Score (0-100), deduplicated pricing table, clustered 1-3★ verbatim quotes, anti-subscription buyout anchor, and ASO hooks. Requires OPC1. license.",
    inputSchema: {
      type: "object",
      properties: {
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "Seed keywords for the target App Store niche",
        },
        country: { type: "string", description: "2-letter App Store storefront code", default: "us" },
        license_key: { type: "string", description: "Optional inline OPC1.<payload>.<sig> Pro license token" },
        use_fixture: { type: "boolean", description: "Use deterministic offline fixture dataset", default: false },
      },
      required: ["keywords"],
    },
  },
];

function buildProPaywallMessage(toolName, status) {
  return [
    `🔒 Pro License Required for \`${toolName}\` (Status: ${status.reason})`,
    "",
    `Store Radar MCP Free includes unlimited \`probe_keyword\` calls.`,
    `Unlock \`compare_matrix\` & \`generate_battlecard\` permanently with a one-time buyout ($19 / ¥68 — zero recurring fees):`,
    "",
    `1. Purchase lifetime OPC1. license:`,
    `   - Email: a3152557994@gmail.com or 3152557994@qq.com (Subject: Buy store-radar-mcp Pro)`,
    `   - Web: https://a3152557994-ship-it.github.io/store-radar-mcp/`,
    `2. Activate offline in 1 second:`,
    `   - CLI: npx store-radar-mcp activate OPC1.<payload>.<sig>`,
    `   - Or set env \`STORE_RADAR_LICENSE_KEY\` in your \`mcp.json\`.`,
  ].join("\n");
}

export async function handleJsonRpcMessage(msg) {
  if (!msg || typeof msg !== "object" || msg.jsonrpc !== "2.0") {
    return {
      jsonrpc: "2.0",
      id: msg?.id ?? null,
      error: { code: -32600, message: "Invalid JSON-RPC 2.0 request" },
    };
  }

  // JSON-RPC notifications (no `id` property) do not produce a response
  if (!("id" in msg)) {
    return null;
  }

  const { id, method, params = {} } = msg;

  try {
    if (method === "initialize") {
      const clientVersion = params?.protocolVersion || DEFAULT_PROTOCOL_VERSION;
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: clientVersion,
          capabilities: {
            tools: { listChanged: false },
          },
          serverInfo: {
            name: SERVER_NAME,
            version: SERVER_VERSION,
          },
        },
      };
    }

    if (method === "ping") {
      return { jsonrpc: "2.0", id, result: {} };
    }

    if (method === "tools/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: { tools: MCP_TOOLS },
      };
    }

    if (method === "tools/call") {
      const toolName = params?.name;
      const args = params?.arguments || {};

      if (toolName === "probe_keyword") {
        const res = await probeKeyword({
          keyword: args.keyword,
          country: args.country || "us",
          limit: args.limit || 5,
          use_fixture: Boolean(args.use_fixture),
        });
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(res, null, 2) }],
            isError: false,
          },
        };
      }

      if (toolName === "compare_matrix" || toolName === "generate_battlecard") {
        const status = getLicenseStatus({
          expectedProduct: PRODUCT_SLUG,
          inlineToken: args.license_key,
        });
        if (!status.active) {
          return {
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: buildProPaywallMessage(toolName, status) }],
              isError: true,
            },
          };
        }

        if (toolName === "compare_matrix") {
          const matrix = await compareMatrix({
            keywords: args.keywords,
            country: args.country || "us",
            limitPerKeyword: args.limit_per_keyword || 5,
            use_fixture: Boolean(args.use_fixture),
          });
          return {
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: JSON.stringify(matrix, null, 2) }],
              isError: false,
            },
          };
        }

        const card = await generateBattlecard({
          keywords: args.keywords,
          country: args.country || "us",
          use_fixture: Boolean(args.use_fixture),
        });
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              { type: "text", text: card.markdown },
              {
                type: "text",
                text: JSON.stringify(
                  {
                    opportunityScore: card.opportunityScore,
                    verdict: card.verdict,
                    buyoutRecommendation: card.buyoutRecommendation,
                    asoHooks: card.asoHooks,
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: false,
          },
        };
      }

      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Unknown tool: ${toolName}` },
      };
    }

    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    };
  } catch (err) {
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32000, message: err.message || String(err) },
    };
  }
}

function startMcpStdioServer() {
  let buffer = Buffer.alloc(0);

  const sendResponse = (obj, useContentLength) => {
    if (!obj) return;
    const json = JSON.stringify(obj);
    if (useContentLength) {
      const byteLen = Buffer.byteLength(json, "utf8");
      process.stdout.write(`Content-Length: ${byteLen}\r\n\r\n${json}`);
    } else {
      process.stdout.write(`${json}\n`);
    }
  };

  const processBuffer = async () => {
    while (buffer.length > 0) {
      const preview = buffer.subarray(0, Math.min(buffer.length, 64)).toString("utf8");

      // Support Content-Length header framing if client sends it
      if (/^Content-Length:/i.test(preview)) {
        const headerEnd = buffer.indexOf("\r\n\r\n");
        if (headerEnd === -1) return;
        const headerStr = buffer.subarray(0, headerEnd).toString("utf8");
        const match = headerStr.match(/Content-Length:\s*(\d+)/i);
        if (!match) {
          buffer = buffer.subarray(headerEnd + 4);
          continue;
        }
        const bodyLen = Number(match[1]);
        const totalLen = headerEnd + 4 + bodyLen;
        if (buffer.length < totalLen) return;

        const bodyStr = buffer.subarray(headerEnd + 4, totalLen).toString("utf8");
        buffer = buffer.subarray(totalLen);
        try {
          const msg = JSON.parse(bodyStr);
          const reply = await handleJsonRpcMessage(msg);
          sendResponse(reply, true);
        } catch {
          sendResponse(
            { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
            true,
          );
        }
        continue;
      }

      // Standard MCP newline-delimited JSON-RPC
      const nlIdx = buffer.indexOf("\n");
      if (nlIdx === -1) return;
      const line = buffer.subarray(0, nlIdx).toString("utf8").trim();
      buffer = buffer.subarray(nlIdx + 1);
      if (!line) continue;

      try {
        const msg = JSON.parse(line);
        const reply = await handleJsonRpcMessage(msg);
        sendResponse(reply, false);
      } catch {
        sendResponse(
          { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
          false,
        );
      }
    }
  };

  let queue = Promise.resolve();
  process.stdin.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)]);
    queue = queue.then(processBuffer).catch(() => {});
  });
}

function parseCliFlags(argv) {
  const flags = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq !== -1) {
        flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      } else {
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith("-")) {
          flags[key] = next;
          i += 1;
        } else {
          flags[key] = true;
        }
      }
    } else if (arg === "-h") {
      flags.help = true;
    } else if (arg === "-v") {
      flags.version = true;
    } else {
      flags._.push(arg);
    }
  }
  return flags;
}

function printHelp() {
  console.log(`store-radar-mcp v${SERVER_VERSION}
App Store Competitor Pricing & 1-3★ Pain-Point Clustering MCP Server + CLI

Usage:
  store-radar-mcp                                      Start MCP Server over stdio
  store-radar-mcp probe --country cn --keywords "提词器" [--offline] [--json]
  store-radar-mcp compare --country us --keywords "habit tracker,daily routine" [--license <OPC1...>]
  store-radar-mcp battlecard --country cn --keywords "提词器,悬浮提词" [--license <OPC1...>]
  store-radar-mcp activate <OPC1.<payload>.<sig>>      Verify & save offline Pro license
  store-radar-mcp status                               Show local Pro license status
`);
}

async function runCli(argv) {
  const flags = parseCliFlags(argv);
  const sub = flags._[0];

  if (flags.version) {
    console.log(SERVER_VERSION);
    return;
  }
  if (flags.help) {
    printHelp();
    return;
  }

  if (!sub || sub === "serve" || flags.stdio) {
    startMcpStdioServer();
    return;
  }

  if (sub === "activate") {
    const token = flags._[1] || flags.license || flags.key;
    if (!token) {
      console.error("Error: Missing OPC1. token. Usage: store-radar-mcp activate <OPC1...>");
      process.exitCode = 1;
      return;
    }
    const res = activateLicense(String(token));
    if (!res.ok) {
      console.error(`License verification failed: ${res.reason}`);
      process.exitCode = 1;
      return;
    }
    console.log(`✅ Activated store-radar-mcp Pro (${res.payload.p}) -> ${res.licensePath}`);
    return;
  }

  if (sub === "status") {
    const status = getLicenseStatus();
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  const country = String(flags.country || "us").toLowerCase();
  const rawKw = String(flags.keywords || flags.keyword || flags._[1] || "").trim();
  const offline = Boolean(flags.offline);

  if (sub === "probe") {
    if (!rawKw) {
      console.error("Error: --keywords is required for `probe`.");
      process.exitCode = 1;
      return;
    }
    const kwList = rawKw.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    const results = [];
    for (const kw of kwList) {
      results.push(
        await probeKeyword({
          keyword: kw,
          country,
          limit: Number(flags.limit || 5),
          offline,
          fallbackToFixture: Boolean(flags["fallback-fixture"]),
        }),
      );
    }
    if (flags.json) {
      console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
      return;
    }
    for (const r of results) {
      console.log(`\n📡 Probe [${r.country.toUpperCase()}] "${r.keyword}" (${r.competitorCount} apps, ${r.mode})`);
      for (const app of r.competitors) {
        console.log(
          `  • ${app.name} | ${app.formattedPrice} | ${app.rating}★ (${app.ratingCount}) | Vulnerability: ${app.vulnerabilityScore}/100`,
        );
        for (const rev of app.negativeReviews.slice(0, 2)) {
          console.log(`      [${rev.rating}★] ${rev.title}: ${rev.content.slice(0, 90)}`);
        }
      }
    }
    return;
  }

  if (sub === "compare" || sub === "battlecard") {
    const status = getLicenseStatus({ inlineToken: flags.license });
    if (!status.active) {
      console.error(buildProPaywallMessage(sub, status));
      process.exitCode = 2;
      return;
    }
    if (!rawKw) {
      console.error(`Error: --keywords is required for \`${sub}\`.`);
      process.exitCode = 1;
      return;
    }
    if (sub === "compare") {
      const matrix = await compareMatrix({
        keywords: rawKw,
        country,
        offline,
      });
      console.log(JSON.stringify(matrix, null, 2));
      return;
    }
    const card = await generateBattlecard({
      keywords: rawKw,
      country,
      offline,
    });
    console.log(flags.json ? JSON.stringify(card, null, 2) : card.markdown);
    return;
  }

  console.error(`Unknown subcommand: ${sub}`);
  printHelp();
  process.exitCode = 1;
}

runCli(process.argv.slice(2));
