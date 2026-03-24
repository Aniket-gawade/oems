import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: Number(__ENV.VUS || 10),
  duration: __ENV.DURATION || "1m",
  thresholds: {
    http_req_failed: ["rate<0.01"],
  },
};

const baseUrl = __ENV.OEMS_BASE_URL || "http://localhost:8080";
const bearerToken = __ENV.OEMS_BEARER_TOKEN || "";
const symbol = __ENV.OEMS_SYMBOL || "AAPL";

function authHeader() {
  if (!bearerToken) {
    return {};
  }
  return { Authorization: `Bearer ${bearerToken}` };
}

function headers(idempotencyKey) {
  return {
    "Content-Type": "application/json",
    "Idempotency-Key": idempotencyKey,
    ...authHeader(),
  };
}

function orderBody(clientOrderId, quantity) {
  return JSON.stringify({
    clientOrderId,
    symbol,
    side: "BUY",
    orderType: "LIMIT",
    quantity,
    price: 200.0,
  });
}

export default function () {
  const logicalId = `vu${__VU}-iter${__ITER}`;
  const idemKey = `k6-${logicalId}`;

  const firstBody = orderBody(`k6-${logicalId}`, 10);
  const firstResponse = http.post(
    `${baseUrl}/v1/orders`,
    firstBody,
    { headers: headers(idemKey) },
  );

  check(firstResponse, {
    "first attempt is terminal": (r) => r.status === 201 || r.status === 422,
  });

  const replayResponse = http.post(
    `${baseUrl}/v1/orders`,
    firstBody,
    { headers: headers(idemKey) },
  );

  check(replayResponse, {
    "replay status matches first": (r) => r.status === firstResponse.status,
    "replay body matches first": (r) => r.body === firstResponse.body,
  });

  const conflictBody = orderBody(`k6-${logicalId}-conflict`, 11);
  const conflictResponse = http.post(
    `${baseUrl}/v1/orders`,
    conflictBody,
    { headers: headers(idemKey) },
  );

  check(conflictResponse, {
    "same key + different payload is 409": (r) => r.status === 409,
  });

  sleep(0.1);
}
