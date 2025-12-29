import { NextResponse } from "next/server";

// Endpoint Prometheus pour les métriques
export async function GET() {
  // Métriques basiques (à étendre avec prom-client)
  const metrics = `
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 0

# HELP http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 0
http_request_duration_seconds_bucket{le="0.5"} 0
http_request_duration_seconds_bucket{le="1"} 0
http_request_duration_seconds_bucket{le="+Inf"} 0

# HELP nodejs_heap_size_total_bytes Process heap size from node.js
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes ${process.memoryUsage().heapTotal}
`;

  return new NextResponse(metrics, {
    headers: {
      "Content-Type": "text/plain; version=0.0.4",
    },
  });
}

