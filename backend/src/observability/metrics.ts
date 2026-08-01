/**
 * In-process Prometheus-style counters/gauges for /metrics.
 * Intentionally simple (no prom-client) so unit tests stay hermetic.
 */

let httpRequestsTotal = 0;
const httpRequestsByStatus = new Map<number, number>();
let httpRequestDurationMsSum = 0;
let wsClientsConnected = 0;
let wsMessagesTotal = 0;
let realtimeFanoutsTotal = 0;
const startedAt = Date.now();

export function recordHttpRequest(statusCode: number, durationMs: number): void {
  httpRequestsTotal += 1;
  httpRequestsByStatus.set(statusCode, (httpRequestsByStatus.get(statusCode) ?? 0) + 1);
  httpRequestDurationMsSum += durationMs;
}

export function setWsClients(count: number): void {
  wsClientsConnected = Math.max(0, count);
}

export function recordWsMessage(): void {
  wsMessagesTotal += 1;
}

export function recordRealtimeFanout(n = 1): void {
  realtimeFanoutsTotal += n;
}

export function renderPrometheusMetrics(): string {
  const lines: string[] = [
    '# HELP secureconnect_up 1 if process is up',
    '# TYPE secureconnect_up gauge',
    'secureconnect_up 1',
    '# HELP secureconnect_process_uptime_seconds Process uptime in seconds',
    '# TYPE secureconnect_process_uptime_seconds gauge',
    `secureconnect_process_uptime_seconds ${((Date.now() - startedAt) / 1000).toFixed(3)}`,
    '# HELP secureconnect_http_requests_total Total HTTP requests handled',
    '# TYPE secureconnect_http_requests_total counter',
    `secureconnect_http_requests_total ${httpRequestsTotal}`,
    '# HELP secureconnect_http_request_duration_ms_sum Cumulative HTTP response time in ms',
    '# TYPE secureconnect_http_request_duration_ms_sum counter',
    `secureconnect_http_request_duration_ms_sum ${httpRequestDurationMsSum.toFixed(3)}`,
    '# HELP secureconnect_http_responses_total HTTP responses by status',
    '# TYPE secureconnect_http_responses_total counter',
  ];

  for (const [status, count] of [...httpRequestsByStatus.entries()].sort((a, b) => a[0] - b[0])) {
    lines.push(`secureconnect_http_responses_total{status="${status}"} ${count}`);
  }

  lines.push(
    '# HELP secureconnect_ws_clients Connected WebSocket clients on this instance',
    '# TYPE secureconnect_ws_clients gauge',
    `secureconnect_ws_clients ${wsClientsConnected}`,
    '# HELP secureconnect_ws_messages_total WebSocket messages received',
    '# TYPE secureconnect_ws_messages_total counter',
    `secureconnect_ws_messages_total ${wsMessagesTotal}`,
    '# HELP secureconnect_realtime_fanouts_total Realtime change events delivered to local sockets',
    '# TYPE secureconnect_realtime_fanouts_total counter',
    `secureconnect_realtime_fanouts_total ${realtimeFanoutsTotal}`,
  );

  return `${lines.join('\n')}\n`;
}

/** Test helper — resets counters between unit tests. */
export function resetMetricsForTests(): void {
  httpRequestsTotal = 0;
  httpRequestsByStatus.clear();
  httpRequestDurationMsSum = 0;
  wsClientsConnected = 0;
  wsMessagesTotal = 0;
  realtimeFanoutsTotal = 0;
}
