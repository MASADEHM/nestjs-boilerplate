# 📋 Logging System

## 🎯 **Overview**

Production-ready logging system using **Winston + NDJSON format** for performance and monitoring.

## 📁 **Log Files Structure**

Logs are automatically organized into separate files:

```
logs/
├── access-YYYY-MM-DD.json     # HTTP requests (→ GET /api/users, ← 200 | 5ms)
├── info-YYYY-MM-DD.json       # Info logs (when you call logger.info())
├── error-YYYY-MM-DD.json      # Regular errors (404, validation, etc.)
├── critical-YYYY-MM-DD.json   # 500+ errors that need attention 🚨
├── uncaught-exceptions-YYYY-MM-DD.json  # App crashes (safety net)
└── rejections-YYYY-MM-DD.json # Unhandled promise rejections (safety net)
```

## 🚀 **Features**

- **Daily Rotation**: Automatic cleanup (7-14 days retention)
- **NDJSON Format**: Fast writes, ELK/Grafana ready
- **Async Writes**: Zero performance impact (64KB buffer)
- **Smart Filtering**: Each file gets only relevant logs
- **UTC Timestamps**: Multi-host consistency

## 📊 **Log Format**

```json
{"level":"http","message":"→ GET /api/users | ID: abc123","timestamp":"2025-10-14T08:23:50.995Z"}
{"level":"error","message":"✗ GET /api/users/999 | 404 | 5ms | Error: User not found | ID: def456","timestamp":"2025-10-14T08:23:52.000Z"}
{"level":"exception","message":"🚨 CRITICAL: GET /api/users | 500 | 15ms | Error: Database failed | Stack: Error... | ID: ghi789","timestamp":"2025-10-14T08:23:53.000Z"}
```

## 🐳 **Docker Setup**

Both `docker-compose.yml` and `docker-compose.production.yml` are configured:

```yaml
volumes:
  - ./logs:/app/logs # ✅ Logs persist on host
```

## 🛠 **Usage**

```typescript
// Application code examples
logger.info('User registered successfully'); // → info.json
logger.error('Validation failed'); // → error.json
// HTTP errors automatically routed by interceptor
```

## 🔧 **Configuration**

All logging config in: `src/core/config/logging.config.ts`

**That's it!** 🎯 Clean, fast, and production-ready logging!
