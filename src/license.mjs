/**
 * Offline Ed25519 license verification and local state persistence for store-radar-mcp.
 * Zero external dependencies — uses pure Node.js `node:crypto`.
 *
 * Token format: OPC1.<base64url_payload>.<base64url_sig>
 * Signature input: UTF-8 bytes of `OPC1.${base64url_payload}`
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

export const PRODUCT_SLUG = "store-radar-mcp";
export const PUBLIC_SPKI_BASE64 = "MCowBQYDK2VwAyEAP5NCVP7CT0tgaGLSGMe4r87SjYRWTM6gN6igBZYSXys=";

export function getLicenseFilePath() {
  if (process.env.STORE_RADAR_LICENSE_PATH) {
    return path.resolve(process.env.STORE_RADAR_LICENSE_PATH);
  }
  return path.join(os.homedir(), ".config", "store-radar-mcp", "license.json");
}

export function fromBase64Url(str) {
  const normalized = String(str).replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + "=".repeat(padLen), "base64");
}

/**
 * Verify an `OPC1.<payload>.<sig>` offline license token with Ed25519.
 * @param {string} token
 * @param {string} [expectedProduct="store-radar-mcp"]
 * @param {string} [pubSpkiBase64=PUBLIC_SPKI_BASE64]
 */
export function verifyLicense(
  token,
  expectedProduct = PRODUCT_SLUG,
  pubSpkiBase64 = process.env.STORE_RADAR_PUBLIC_KEY_SPKI || PUBLIC_SPKI_BASE64,
) {
  if (typeof token !== "string" || !token.trim()) {
    return { valid: false, reason: "INVALID_TYPE" };
  }
  const parts = token.trim().split(".");
  if (parts.length !== 3 || parts[0] !== "OPC1" || !parts[1] || !parts[2]) {
    return { valid: false, reason: "BAD_FORMAT" };
  }

  try {
    const [, payloadB64, sigB64] = parts;
    const pubDer = Buffer.from(pubSpkiBase64, "base64");
    const publicKey = crypto.createPublicKey({ key: pubDer, format: "der", type: "spki" });
    const sigBytes = fromBase64Url(sigB64);
    const verified = crypto.verify(
      null,
      Buffer.from(`OPC1.${payloadB64}`, "utf8"),
      publicKey,
      sigBytes,
    );
    if (!verified) {
      return { valid: false, reason: "BAD_SIGNATURE" };
    }

    const payload = JSON.parse(fromBase64Url(payloadB64).toString("utf8"));
    if (!payload || typeof payload !== "object") {
      return { valid: false, reason: "BAD_PAYLOAD" };
    }

    if (!("p" in payload)) {
      return { valid: false, reason: "MISSING_FIELDS", payload };
    }

    if (expectedProduct && payload.p !== expectedProduct && payload.p !== "*") {
      return { valid: false, reason: "PRODUCT_MISMATCH", payload };
    }

    if (typeof payload.exp === "number" && payload.exp > 0) {
      const nowSec = Math.floor(Date.now() / 1000);
      if (nowSec > payload.exp) {
        return { valid: false, reason: "EXPIRED", payload };
      }
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, reason: "VERIFY_ERROR", message: err.message };
  }
}

export function activateLicense(token, options = {}) {
  const expectedProduct = options.expectedProduct ?? PRODUCT_SLUG;
  const pubSpkiBase64 =
    options.pubSpkiBase64 ?? process.env.STORE_RADAR_PUBLIC_KEY_SPKI ?? PUBLIC_SPKI_BASE64;
  const licensePath = options.licensePath ? path.resolve(options.licensePath) : getLicenseFilePath();

  const verification = verifyLicense(token, expectedProduct, pubSpkiBase64);
  if (!verification.valid) {
    return { ok: false, ...verification, licensePath };
  }

  const record = {
    token: token.trim(),
    product: verification.payload.p,
    email: verification.payload.e || "pro-user",
    plan: verification.payload.plan || "lifetime",
    iat: verification.payload.iat || Math.floor(Date.now() / 1000),
    exp: verification.payload.exp ?? 0,
    activatedAt: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(licensePath), { recursive: true, mode: 0o700 });
  fs.writeFileSync(licensePath, JSON.stringify(record, null, 2) + "\n", { mode: 0o600 });

  return {
    ok: true,
    valid: true,
    payload: verification.payload,
    activatedAt: record.activatedAt,
    licensePath,
  };
}

export function getLicenseStatus(options = {}) {
  const expectedProduct = options.expectedProduct ?? PRODUCT_SLUG;
  const pubSpkiBase64 =
    options.pubSpkiBase64 ?? process.env.STORE_RADAR_PUBLIC_KEY_SPKI ?? PUBLIC_SPKI_BASE64;

  // Check inline token first, then environment variable, then persisted file
  const candidateToken = options.inlineToken || process.env.STORE_RADAR_LICENSE_KEY || "";
  if (candidateToken.trim()) {
    const verification = verifyLicense(candidateToken.trim(), expectedProduct, pubSpkiBase64);
    if (verification.valid) {
      return {
        active: true,
        tier: "pro",
        source: options.inlineToken ? "inline" : "env",
        reason: "ACTIVE",
        payload: verification.payload,
      };
    }
    return {
      active: false,
      tier: "free",
      source: options.inlineToken ? "inline" : "env",
      reason: verification.reason,
      payload: verification.payload ?? null,
    };
  }

  const licensePath = options.licensePath ? path.resolve(options.licensePath) : getLicenseFilePath();
  if (!fs.existsSync(licensePath)) {
    return {
      active: false,
      tier: "free",
      source: "none",
      reason: "NOT_ACTIVATED",
      licensePath,
      payload: null,
    };
  }

  try {
    const raw = fs.readFileSync(licensePath, "utf8");
    const data = JSON.parse(raw);
    const verification = verifyLicense(data?.token, expectedProduct, pubSpkiBase64);
    if (!verification.valid) {
      return {
        active: false,
        tier: "free",
        source: "file",
        reason: verification.reason,
        licensePath,
        payload: verification.payload ?? null,
      };
    }
    return {
      active: true,
      tier: "pro",
      source: "file",
      reason: "ACTIVE",
      licensePath,
      activatedAt: data.activatedAt || null,
      payload: verification.payload,
    };
  } catch (err) {
    return {
      active: false,
      tier: "free",
      source: "file",
      reason: "READ_ERROR",
      message: err.message,
      licensePath,
      payload: null,
    };
  }
}
