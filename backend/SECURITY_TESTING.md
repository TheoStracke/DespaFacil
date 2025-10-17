# Security Testing Guide

This document describes how to safely test the application for common abuse patterns without performing illegal attacks.

## Prerequisites
- Windows PowerShell 5.1+ (already available)
- k6 installed (via `winget install Grafana.k6` or `choco install k6`)
- Optional: OWASP ZAP for DAST baseline scan

## Quick Smoke Test (Login)
Use PowerShell:

```powershell
$body = @{ emailOrCnpj='theostracke11@gmail.com'; password='SenhaForte123!' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:4000/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
```

Expected: HTTP 200 with accessToken in the response.

## Load Testing (safe)
Run a small smoke with k6:

```powershell
k6 run .\backend\test\security\k6-login-smoke.js
```

Short burst to observe rate limiter behavior:

```powershell
k6 run .\backend\test\security\k6-burst-login.js
```

Expected: Mostly 200, some 429 (Too Many Requests) when limiter kicks in.

## Dependency Audit
Run security audits on dependencies:

```powershell
cd backend; npm audit --audit-level=high; cd ..
cd frontend; npm audit --audit-level=high; cd ..
```

## OWASP ZAP Baseline (optional)
Scan the frontend host (non-invasive baseline):
- With Docker:

```powershell
docker run --rm -t -v "$PWD:/zap/wrk" owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000 -r zap-report.html
```

- Or install ZAP Desktop and use Quick Start against `http://localhost:3000`.

## Monitoring Tips
- Log 401/403/429 and failed login counts.
- Alert on spikes from single IPs.
- Consider CAPTCHA on login after N failures.
- Configure reverse proxy/WAF (Cloudflare) for edge rate limiting.
