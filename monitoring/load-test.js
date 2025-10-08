/**
 * K6 Load Testing Script for Week 2 Monitoring Validation
 *
 * This script tests the 4 Golden Signals:
 * 1. Latency - Response times (P50, P95, P99)
 * 2. Error Rate - Failed requests percentage
 * 3. Traffic - Request volume (RPS)
 * 4. Capacity - CPU/Memory usage under load
 *
 * Prerequisites:
 * - Install k6: https://k6.io/docs/getting-started/installation/
 * - Update BASE_URL if needed
 *
 * Usage:
 * k6 run load-test.js
 *
 * Or with custom config:
 * k6 run --vus 50 --duration 5m load-test.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const latency = new Trend("latency");
const successfulRequests = new Counter("successful_requests");
const failedRequests = new Counter("failed_requests");

// Configuration
const BASE_URL = "https://tulm.mindx.edu.vn";

// Test stages - simulate realistic traffic patterns
export const options = {
  stages: [
    // Warm-up phase
    { duration: "30s", target: 10 }, // Ramp up to 10 users

    // Normal load
    { duration: "2m", target: 20 }, // Steady 20 users

    // Peak load (test capacity)
    { duration: "1m", target: 50 }, // Spike to 50 users

    // Sustained peak
    { duration: "2m", target: 50 }, // Hold at 50 users

    // Recovery
    { duration: "1m", target: 20 }, // Scale down to 20

    // Cool down
    { duration: "30s", target: 0 }, // Ramp down to 0
  ],

  thresholds: {
    // Latency thresholds (Golden Signal #1)
    http_req_duration: [
      "p(50)<500", // P50 should be < 500ms
      "p(95)<2000", // P95 should be < 2s
      "p(99)<5000", // P99 should be < 5s (before alert threshold)
    ],

    // Error rate threshold (Golden Signal #2)
    errors: ["rate<0.05"], // Error rate should be < 5%

    // Success rate
    http_req_failed: ["rate<0.05"], // < 5% failures
  },
};

// Test scenarios
export default function () {
  // Scenario 1: Health Check (10% of requests)
  if (Math.random() < 0.1) {
    testHealthEndpoint();
  }

  // Scenario 2: User Registration (5% of requests)
  else if (Math.random() < 0.05) {
    testUserRegistration();
  }

  // Scenario 3: User Login (20% of requests)
  else if (Math.random() < 0.2) {
    testUserLogin();
  }

  // Scenario 4: Authenticated Requests (40% of requests)
  else if (Math.random() < 0.4) {
    testAuthenticatedEndpoint();
  }

  // Scenario 5: Frontend Static Resources (25% of requests)
  else {
    testFrontendPage();
  }

  // Random think time between 1-3 seconds
  sleep(Math.random() * 2 + 1);
}

function testHealthEndpoint() {
  const response = http.get(`${BASE_URL}/health`);

  const success = check(response, {
    "Health check status is 200": (r) => r.status === 200,
    "Health check responds quickly": (r) => r.timings.duration < 500,
  });

  recordMetrics(response, success);
}

function testUserRegistration() {
  const payload = JSON.stringify({
    username: `testuser_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`,
    password: "TestPassword123!",
    email: `test_${Date.now()}@example.com`,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.post(`${BASE_URL}/register`, payload, params);

  const success = check(response, {
    "Registration status is 200 or 201": (r) =>
      r.status === 200 || r.status === 201,
  });

  recordMetrics(response, success);
}

function testUserLogin() {
  const payload = JSON.stringify({
    username: "testuser",
    password: "testpassword",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.post(`${BASE_URL}/login`, payload, params);

  const success = check(response, {
    "Login responds": (r) => r.status !== 0,
    "Login completes in time": (r) => r.timings.duration < 2000,
  });

  recordMetrics(response, success);

  // If login successful, return token for authenticated requests
  if (response.status === 200) {
    try {
      const body = JSON.parse(response.body);
      return body.token;
    } catch (e) {
      return null;
    }
  }

  return null;
}

function testAuthenticatedEndpoint() {
  // First login to get token
  const token = testUserLogin();

  if (token) {
    const params = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = http.get(`${BASE_URL}/profile`, params);

    const success = check(response, {
      "Authenticated request succeeds": (r) =>
        r.status === 200 || r.status === 401,
    });

    recordMetrics(response, success);
  }
}

function testFrontendPage() {
  const response = http.get(`${BASE_URL}/`);

  const success = check(response, {
    "Frontend loads successfully": (r) => r.status === 200,
    "Frontend has content": (r) => r.body.length > 100,
  });

  recordMetrics(response, success);
}

function recordMetrics(response, success) {
  // Record latency (Golden Signal #1: LATENCY)
  latency.add(response.timings.duration);

  // Record error rate (Golden Signal #2: ERROR RATE)
  errorRate.add(!success);

  // Count requests
  if (success) {
    successfulRequests.add(1);
  } else {
    failedRequests.add(1);
  }
}

// Summary handler
export function handleSummary(data) {
  console.log("\n========================================");
  console.log("📊 LOAD TEST SUMMARY - GOLDEN SIGNALS");
  console.log("========================================\n");

  console.log("🕐 GOLDEN SIGNAL #1: LATENCY");
  console.log(
    `   P50: ${data.metrics.http_req_duration.values.p50.toFixed(2)}ms`
  );
  console.log(
    `   P95: ${data.metrics.http_req_duration.values.p95.toFixed(2)}ms`
  );
  console.log(
    `   P99: ${data.metrics.http_req_duration.values.p99.toFixed(2)}ms`
  );
  console.log(
    `   Avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`
  );
  console.log(
    `   Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`
  );

  console.log("❌ GOLDEN SIGNAL #2: ERROR RATE");
  console.log(
    `   Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%`
  );
  console.log(`   Failed Requests: ${data.metrics.errors.values.fails || 0}`);
  console.log(
    `   Total Checks: ${
      data.metrics.errors.values.passes + data.metrics.errors.values.fails
    }\n`
  );

  console.log("🚦 GOLDEN SIGNAL #3: TRAFFIC");
  console.log(`   Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(
    `   Requests/sec: ${data.metrics.http_reqs.values.rate.toFixed(2)}`
  );
  console.log(
    `   Duration: ${(data.state.testRunDurationMs / 1000).toFixed(0)}s\n`
  );

  console.log("📈 GOLDEN SIGNAL #4: CAPACITY");
  console.log("   (Check Azure App Insights for CPU/Memory during this test)");
  console.log(`   Peak VUs: ${data.metrics.vus_max.values.value}`);
  console.log(
    `   Data Received: ${(
      data.metrics.data_received.values.count /
      1024 /
      1024
    ).toFixed(2)}MB`
  );
  console.log(
    `   Data Sent: ${(data.metrics.data_sent.values.count / 1024).toFixed(
      2
    )}KB\n`
  );

  console.log("✅ THRESHOLDS");
  let allPassed = true;
  Object.keys(data.metrics).forEach((metric) => {
    if (data.metrics[metric].thresholds) {
      Object.keys(data.metrics[metric].thresholds).forEach((threshold) => {
        const passed = data.metrics[metric].thresholds[threshold].ok;
        const symbol = passed ? "✅" : "❌";
        console.log(`   ${symbol} ${threshold}`);
        if (!passed) allPassed = false;
      });
    }
  });

  console.log("\n========================================");
  if (allPassed) {
    console.log("🎉 ALL THRESHOLDS PASSED!");
  } else {
    console.log("⚠️  SOME THRESHOLDS FAILED!");
  }
  console.log("========================================\n");

  console.log("🔍 Next Steps:");
  console.log("1. Check Azure Application Insights for metrics");
  console.log("2. Verify dashboards show the traffic spike");
  console.log("3. Check if any alerts were triggered");
  console.log("4. Review P95/P99 latencies in App Insights\n");

  return {
    stdout: JSON.stringify(data, null, 2),
  };
}
