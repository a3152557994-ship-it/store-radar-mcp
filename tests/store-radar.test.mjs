import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { verifyLicense, activateLicense, getLicenseStatus, PUBLIC_SPKI_BASE64 } from "../src/license.mjs";
import { clusterNegativeReviews, compareMatrix, generateBattlecard, probeKeyword } from "../src/radar.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIN_PATH = path.resolve(__dirname, "../bin/store-radar-mcp.mjs");

function createTestKeyPairAndSigner() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const spkiB64 = publicKey.export({ format: "der", type: "spki" }).toString("base64");

  const signToken = (payload) => {
    const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
    const sigB64 = crypto.sign(null, Buffer.from(`OPC1.${payloadB64}`, "utf8"), privateKey).toString("base64url");
    return `OPC1.${payloadB64}.${sigB64}`;
  };

  return { spkiB64, signToken };
}

test("Ed25519 OPC1 license verifier accepts valid product/wildcard tokens and rejects tampering", () => {
  assert.equal(PUBLIC_SPKI_BASE64, "MCowBQYDK2VwAyEAP5NCVP7CT0tgaGLSGMe4r87SjYRWTM6gN6igBZYSXys=");

  const { spkiB64, signToken } = createTestKeyPairAndSigner();
  const now = Math.floor(Date.now() / 1000);

  const validToken = signToken({
    v: 1,
    p: "store-radar-mcp",
    e: "indie@example.com",
    plan: "lifetime",
    iat: now,
    exp: 0,
  });
  const resValid = verifyLicense(validToken, "store-radar-mcp", spkiB64);
  assert.equal(resValid.valid, true);
  assert.equal(resValid.payload.p, "store-radar-mcp");

  // Wildcard "*" license should also pass
  const wildcardToken = signToken({
    v: 1,
    p: "*",
    e: "bundle@example.com",
    plan: "all-access",
    iat: now,
    exp: now + 3600,
  });
  assert.equal(verifyLicense(wildcardToken, "store-radar-mcp", spkiB64).valid, true);

  // Tampered payload rejected
  const [, , origSig] = validToken.split(".");
  const tamperedPayloadB64 = Buffer.from(
    JSON.stringify({ v: 1, p: "store-radar-mcp", e: "hacker@example.com", plan: "pro", iat: now, exp: 0 }),
  ).toString("base64url");
  const tamperedToken = `OPC1.${tamperedPayloadB64}.${origSig}`;
  const resTampered = verifyLicense(tamperedToken, "store-radar-mcp", spkiB64);
  assert.equal(resTampered.valid, false);
  assert.equal(resTampered.reason, "BAD_SIGNATURE");

  // Product mismatch rejected
  const wrongProductToken = signToken({
    v: 1,
    p: "other-product",
    e: "indie@example.com",
    plan: "pro",
    iat: now,
    exp: 0,
  });
  const resMismatch = verifyLicense(wrongProductToken, "store-radar-mcp", spkiB64);
  assert.equal(resMismatch.valid, false);
  assert.equal(resMismatch.reason, "PRODUCT_MISMATCH");

  // Expired token rejected
  const expiredToken = signToken({
    v: 1,
    p: "store-radar-mcp",
    e: "indie@example.com",
    plan: "trial",
    iat: now - 7200,
    exp: now - 60,
  });
  const resExpired = verifyLicense(expiredToken, "store-radar-mcp", spkiB64);
  assert.equal(resExpired.valid, false);
  assert.equal(resExpired.reason, "EXPIRED");

  // Activate & persist to temporary path
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "store-radar-test-"));
  const licFile = path.join(tmpDir, "license.json");
  const act = activateLicense(validToken, { pubSpkiBase64: spkiB64, licensePath: licFile });
  assert.equal(act.ok, true);

  const status = getLicenseStatus({ pubSpkiBase64: spkiB64, licensePath: licFile });
  assert.equal(status.active, true);
  assert.equal(status.tier, "pro");
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("Pain-point clustering engine groups bilingual 1-3 star reviews and extracts wedges", () => {
  const sampleReviews = [
    { rating: 1, appName: "AppA", title: "免费试用陷阱自动扣费198", content: "半夜自动续费扣了我198元，订阅太贵了" },
    { rating: 1, appName: "AppB", title: "$60/year auto-renew rip-off", content: "Predatory subscription paywall for basic features" },
    { rating: 2, appName: "AppA", title: "更新后频繁闪退卡死", content: "录制5分钟必黑屏闪退，刚写的稿子全部丢失" },
    { rating: 2, appName: "AppC", title: "Forced login + popup ads", content: "Forces phone number sign up and shows full-screen ads" },
  ];

  const clustered = clusterNegativeReviews(sampleReviews);
  assert.equal(clustered.totalNegativeReviews, 4);
  assert.ok(clustered.clusters.length >= 3);

  const subCluster = clustered.clusters.find((c) => c.id === "subscription_fatigue");
  assert.ok(subCluster, "Expected subscription_fatigue cluster");
  assert.equal(subCluster.count, 2);
  assert.equal(subCluster.affectedAppCount, 2);

  const crashCluster = clustered.clusters.find((c) => c.id === "bugs_crashes");
  assert.ok(crashCluster, "Expected bugs_crashes cluster");
  assert.equal(crashCluster.count, 1);
});

test("compareMatrix deduplicates multi-keyword apps and generateBattlecard outputs Markdown", async () => {
  const matrix = await compareMatrix({
    keywords: ["提词器", "悬浮提词", "口播提词"],
    country: "cn",
    offline: true,
  });
  assert.equal(matrix.uniqueCompetitorCount, 5);
  assert.ok(matrix.competitors[0].matchedKeywords.length >= 2);
  assert.ok(matrix.painClustering.totalNegativeReviews >= 10);

  const card = await generateBattlecard({
    keywords: ["habit tracker", "daily routine"],
    country: "us",
    offline: true,
  });
  assert.ok(card.opportunityScore >= 50 && card.opportunityScore <= 100);
  assert.match(card.markdown, /# Store Radar Commercial Battlecard/);
  assert.match(card.markdown, /Competitor Pricing & Vulnerability Matrix/);
  assert.match(card.markdown, /Clustered 1–3★ Pain Points/);
});

test("MCP JSON-RPC 2.0 stdio server handles initialize, tools/list, and tools/call (free + Pro gate)", async () => {
  const { spkiB64, signToken } = createTestKeyPairAndSigner();
  const proToken = signToken({
    v: 1,
    p: "store-radar-mcp",
    e: "mcp-pro@example.com",
    plan: "lifetime",
    iat: Math.floor(Date.now() / 1000),
    exp: 0,
  });

  const tmpLicensePath = path.join(os.tmpdir(), `nonexistent-radar-${Date.now()}.json`);
  const child = spawn(process.execPath, [BIN_PATH], {
    env: {
      ...process.env,
      STORE_RADAR_PUBLIC_KEY_SPKI: spkiB64,
      STORE_RADAR_LICENSE_PATH: tmpLicensePath,
      STORE_RADAR_LICENSE_KEY: "",
    },
    stdio: ["pipe", "pipe", "pipe"],
  });

  const responses = new Map();
  let stdoutBuf = "";
  child.stdout.on("data", (chunk) => {
    stdoutBuf += chunk.toString("utf8");
    const lines = stdoutBuf.split("\n");
    stdoutBuf = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      const parsed = JSON.parse(line);
      if ("id" in parsed) {
        responses.set(parsed.id, parsed);
      }
    }
  });

  const sendRpc = (msg) => {
    child.stdin.write(`${JSON.stringify(msg)}\n`);
  };

  const waitForId = (id, timeoutMs = 4000) =>
    new Promise((resolve, reject) => {
      const start = Date.now();
      const timer = setInterval(() => {
        if (responses.has(id)) {
          clearInterval(timer);
          resolve(responses.get(id));
        } else if (Date.now() - start > timeoutMs) {
          clearInterval(timer);
          reject(new Error(`Timed out waiting for JSON-RPC id=${id}`));
        }
      }, 15);
    });

  try {
    // 1. initialize + notification
    sendRpc({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1.0" } },
    });
    const initRes = await waitForId(1);
    assert.equal(initRes.result.serverInfo.name, "store-radar-mcp");

    sendRpc({ jsonrpc: "2.0", method: "notifications/initialized" });

    // 2. tools/list
    sendRpc({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
    const listRes = await waitForId(2);
    const toolNames = listRes.result.tools.map((t) => t.name);
    assert.deepEqual(toolNames, ["probe_keyword", "compare_matrix", "generate_battlecard"]);

    // 3. Free tool `probe_keyword` works without license
    sendRpc({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "probe_keyword", arguments: { keyword: "提词器", country: "cn", use_fixture: true } },
    });
    const probeRes = await waitForId(3);
    assert.equal(probeRes.result.isError, false);
    const probeData = JSON.parse(probeRes.result.content[0].text);
    assert.equal(probeData.competitorCount, 5);

    // 4. Pro tool `compare_matrix` without license returns graceful paywall error
    sendRpc({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: "compare_matrix", arguments: { keywords: ["提词器", "悬浮提词"], country: "cn", use_fixture: true } },
    });
    const gatedRes = await waitForId(4);
    assert.equal(gatedRes.result.isError, true);
    assert.match(gatedRes.result.content[0].text, /Pro License Required/);

    // 5. Pro tool `generate_battlecard` WITH valid OPC1 license succeeds
    sendRpc({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "generate_battlecard",
        arguments: {
          keywords: ["提词器", "悬浮提词"],
          country: "cn",
          license_key: proToken,
          use_fixture: true,
        },
      },
    });
    const battleRes = await waitForId(5);
    assert.equal(battleRes.result.isError, false);
    assert.match(battleRes.result.content[0].text, /# Store Radar Commercial Battlecard/);
  } finally {
    child.kill();
  }
});

test("CLI `probe --country cn --keywords ... --offline --json` runs directly", () => {
  const stdout = execFileSync(
    process.execPath,
    [BIN_PATH, "probe", "--country", "cn", "--keywords", "提词器", "--offline", "--json"],
    { encoding: "utf8" },
  );
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.country, "cn");
  assert.equal(parsed.competitorCount, 5);
});
