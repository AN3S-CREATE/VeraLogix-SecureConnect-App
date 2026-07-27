import { describe, expect, it, beforeEach } from 'vitest';
import {
  recordHttpRequest,
  recordRealtimeFanout,
  recordWsMessage,
  renderPrometheusMetrics,
  resetMetricsForTests,
  setWsClients,
} from '../../src/observability/metrics.js';

describe('observability metrics', () => {
  beforeEach(() => {
    resetMetricsForTests();
  });

  it('renders baseline gauges and counters', () => {
    recordHttpRequest(200, 12.5);
    recordHttpRequest(401, 3);
    setWsClients(2);
    recordWsMessage();
    recordRealtimeFanout(3);

    const body = renderPrometheusMetrics();
    expect(body).toContain('secureconnect_up 1');
    expect(body).toContain('secureconnect_http_requests_total 2');
    expect(body).toContain('secureconnect_http_responses_total{status="200"} 1');
    expect(body).toContain('secureconnect_http_responses_total{status="401"} 1');
    expect(body).toContain('secureconnect_ws_clients 2');
    expect(body).toContain('secureconnect_ws_messages_total 1');
    expect(body).toContain('secureconnect_realtime_fanouts_total 3');
    expect(body).toMatch(/secureconnect_process_uptime_seconds \d/);
  });
});
