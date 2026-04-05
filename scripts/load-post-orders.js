import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: Number(__ENV.VUS || 20),
  duration: __ENV.DURATION || "2m",
  thresholds: {
    http_req_failed: ["rate<0.01"],
  },
};

const baseUrl = __ENV.OEMS_BASE_URL || "http://localhost:8080";
const bearerToken = __ENV.OEMS_BEARER_TOKEN || "";
const mockUser = __ENV.OEMS_MOCK_USER || "trader1";
const mockRoles = __ENV.OEMS_MOCK_ROLES || "TRADER";
const symbol = __ENV.OEMS_SYMBOL || "AAPL";
const quantity = Number(__ENV.OEMS_QUANTITY || "10");
const price = Number(__ENV.OEMS_PRICE || "200.00");

function authHeaders() {
  if (bearerToken) {
    return { Authorization: `Bearer ${bearerToken}` };
  }
  return {
    "X-Mock-User": mockUser,
    "X-Mock-Roles": mockRoles,
  };
}

function requestHeaders(idempotencyKey) {
  return {
    "Content-Type": "application/json",
    "Idempotency-Key": idempotencyKey,
    ...authHeaders(),
  };
}

export default function () {
  const logicalId = `${__VU}-${__ITER}-${Date.now()}`;
  const payload = JSON.stringify({
    clientOrderId: `k6-order-${logicalId}`,
    symbol,
    side: "BUY",
    orderType: "LIMIT",
    quantity,
    price,
  });

  const response = http.post(
    `${baseUrl}/v1/orders`,
    payload,
    {
      headers: requestHeaders(`k6-idem-${logicalId}`),
      timeout: __ENV.REQUEST_TIMEOUT || "10s",
    },
  );

  check(response, {
    "status is 201": (r) => r.status === 201,
  });

  sleep(Number(__ENV.SLEEP_SECONDS || "0"));
}
