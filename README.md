# Store Radar MCP (`store-radar-mcp`)

> **App Store Competitor Pricing & 1–3★ Negative Review Pain-Point Clustering MCP Server + CLI**
> Built for indie developers using **Cursor**, **Claude Code**, and **Antigravity** to validate profitable buyout niches before writing a single line of Swift/React Native code.

- **Live Demo & License Portal**: [https://a3152557994-ship-it.github.io/store-radar-mcp/](https://a3152557994-ship-it.github.io/store-radar-mcp/)
- **Zero Heavy Dependencies**: Pure Node.js `>=20` ES modules (`node:crypto`, native `fetch`, standard MCP JSON-RPC 2.0 over `stdio`).
- **Dual Interface**: Runs seamlessly as an **MCP Server** inside your AI IDE or directly from your terminal as a standalone **CLI**.

---

## Quick Start (1-Click MCP Config)

Add to `.cursor/mcp.json`, `~/.claude.json`, or your Antigravity MCP settings:

```json
{
  "mcpServers": {
    "store-radar": {
      "command": "npx",
      "args": ["-y", "github:a3152557994-ship-it/store-radar-mcp"],
      "env": {
        "STORE_RADAR_LICENSE_KEY": ""
      }
    }
  }
}
```

Or run directly via CLI:

```bash
# Free: Probe top 5 competitors + verbatim 1-3★ negative reviews
node ./bin/store-radar-mcp.mjs probe --country cn --keywords "提词器"

# Pro: Multi-keyword deduplication + Markdown Commercial Battlecard
node ./bin/store-radar-mcp.mjs battlecard --country us --keywords "habit tracker,daily routine" --license OPC1.<payload>.<sig>
```

---

## MCP Tools Included

| Tool | Tier | Description |
| :--- | :---: | :--- |
| `probe_keyword` | **Free** | Real-time Apple iTunes Search API + Customer Reviews RSS query. Outputs top 5 competitors (price, rating, review count, vulnerability score) + verbatim 1–3★ complaints. |
| `compare_matrix` | **Pro** | Multi-keyword competitor deduplication, monetization split (Free+Sub vs Paid Upfront), and bilingual (EN/ZH) 1–3★ pain-point clustering heatmap. |
| `generate_battlecard` | **Pro** | Ready-to-ship Markdown Commercial Battlecard: Opportunity Score (0–100), incumbent vulnerability table, clustered user quotes, recommended one-time buyout anchor, and ASO title hooks. |

---

## Pricing & Offline Ed25519 Activation

- **Free Tier**: Forever free `probe_keyword` MCP tool & CLI.
- **Pro Lifetime Buyout (`$19 / ¥68`)**: Unlock `compare_matrix` & `generate_battlecard` across unlimited storefronts (`us`, `cn`, `jp`, `gb`, `de`, etc.). Zero subscriptions, 100% offline `Ed25519` (`OPC1.`) cryptographic verification.
- **Order Pro Key**: Email `a3152557994@gmail.com` or `3152557994@qq.com` (or use the one-click checkout modal on our [official page](https://a3152557994-ship-it.github.io/store-radar-mcp/)).

```bash
node ./bin/store-radar-mcp.mjs activate OPC1.<base64url_payload>.<base64url_sig>
```

## License

MIT (Core & Free Probe Engine). Pro analytical workflows gated via offline Ed25519 `OPC1.` signature verification.
