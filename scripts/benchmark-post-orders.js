const http = require("http");
const { performance } = require("perf_hooks");

const baseUrl = new URL(process.env.OEMS_BASE_URL || "http://localhost:8080");
const durationSeconds = Number(process.env.DURATION_SECONDS || "60");
const concurrency = Number(process.env.CONCURRENCY || "20");
const symbol = process.env.OEMS_SYMBOL || "AAPL";
const quantity = Number(process.env.OEMS_QUANTITY || "10");
const price = Number(process.env.OEMS_PRICE || "200.00");
const timeoutMs = Number(process.env.REQUEST_TIMEOUT_MS || "10000");
const bearerToken = process.env.OEMS_BEARER_TOKEN || "";
const mockUser = process.env.OEMS_MOCK_USER || "trader1";
const mockRoles = process.env.OEMS_MOCK_ROLES || "TRADER";

const latencies = [];
const statusCounts = {};
let failures = 0;
let totalRequests = 0;

function percentile(values, p) {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

function requestHeaders(idempotencyKey) {
  const headers = {
    "Content-Type": "application/json",
    "Idempotency-Key": idempotencyKey,
  };
  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  } else {
    headers["X-Mock-User"] = mockUser;
    headers["X-Mock-Roles"] = mockRoles;
  }
  return headers;
}

function sendOrder(workerId, sequence) {
  return new Promise((resolve) => {
    const logicalId = `${workerId}-${sequence}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const payload = JSON.stringify({
      clientOrderId: `perf-order-${logicalId}`,
      symbol,
      side: "BUY",
      orderType: "LIMIT",
      quantity,
      price,
    });

    const options = {
      protocol: baseUrl.protocol,
      hostname: baseUrl.hostname,
      port: baseUrl.port,
      path: "/v1/orders",
      method: "POST",
      timeout: timeoutMs,
      headers: requestHeaders(`perf-idem-${logicalId}`),
    };

    const start = performance.now();
    const req = http.request(options, (res) => {
      res.on("data", () => {});
      res.on("end", () => {
        const elapsed = performance.now() - start;
        latencies.push(elapsed);
        totalRequests += 1;
        const statusKey = String(res.statusCode);
        statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
        if (res.statusCode !== 201) {
          failures += 1;
        }
        resolve();
      });
    });

    req.on("timeout", () => {
      req.destroy(new Error("timeout"));
    });

    req.on("error", () => {
      totalRequests += 1;
      failures += 1;
      statusCounts.ERROR = (statusCounts.ERROR || 0) + 1;
      resolve();
    });

    req.write(payload);
    req.end();
  });
}

async function runWorker(workerId, stopAt) {
  let sequence = 0;
  while (Date.now() < stopAt) {
    sequence += 1;
    await sendOrder(workerId, sequence);
  }
}

async function main() {
  const startedAt = Date.now();
  const stopAt = startedAt + (durationSeconds * 1000);
  const workers = [];
  for (let i = 0; i < concurrency; i += 1) {
    workers.push(runWorker(i + 1, stopAt));
  }
  await Promise.all(workers);

  const elapsedSeconds = Math.max(1, (Date.now() - startedAt) / 1000);
  const successful = totalRequests - failures;
  const result = {
    timestamp: new Date().toISOString(),
    baseUrl: baseUrl.toString(),
    durationSeconds,
    concurrency,
    totalRequests,
    successfulRequests: successful,
    failedRequests: failures,
    failureRatePct: Number(((failures / Math.max(totalRequests, 1)) * 100).toFixed(2)),
    requestsPerSecond: Number((totalRequests / elapsedSeconds).toFixed(2)),
    latencyMs: {
      p50: Number(percentile(latencies, 50).toFixed(2)),
      p95: Number(percentile(latencies, 95).toFixed(2)),
      p99: Number(percentile(latencies, 99).toFixed(2)),
      max: Number(percentile(latencies, 100).toFixed(2)),
    },
    statusCounts,
  };

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
