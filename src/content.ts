export const sampleConfig = `version: 1

admin:
  address: "127.0.0.1:9090"

listeners:
  - name: http
    protocol: http
    address: ":8080"
    routes:
      - name: default
        path: /
        pool: backend

pools:
  - name: backend
    algorithm: round_robin
    health_check:
      type: http
      path: /health
      interval: 10s
      timeout: 5s
    backends:
      - id: backend-1
        address: "127.0.0.1:7091"
      - id: backend-2
        address: "127.0.0.1:7092"`;
