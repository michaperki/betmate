#!/usr/bin/env node
/*
 * Mock NOWPayments confirmation webhook for local/dev testing.
 * Usage:
 *   node scripts/mock-nowpayments.js <deposit_id> [status]
 * Env:
 *   BACKEND_URL (default http://localhost:9000)
 *   DEV_WEBHOOK_KEY (required)
 */
const fetch = require('node-fetch');

async function main() {
  const [, , depositId, statusArg] = process.argv;
  if (!depositId) {
    console.error('Usage: node scripts/mock-nowpayments.js <deposit_id> [status]');
    process.exit(1);
  }
  const status = (statusArg || 'confirmed').toLowerCase();
  const backend = process.env.BACKEND_URL || 'http://localhost:9000';
  const key = process.env.DEV_WEBHOOK_KEY;
  if (!key) {
    console.error('DEV_WEBHOOK_KEY is not set in environment.');
    process.exit(1);
  }
  const url = `${backend.replace(/\/+$/, '')}/billing/webhook/nowpayments/mock`;
  const body = { deposit_id: String(depositId), status };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-dev-webhook-key': key,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = null; }
    if (!res.ok) {
      console.error(`HTTP ${res.status}`);
      console.error(json || text);
      process.exit(1);
    }
    console.log(json || text);
  } catch (err) {
    console.error('Request failed:', err.message);
    process.exit(1);
  }
}

main();

