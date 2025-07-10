# 📬 Email Service API 

A mock email delivery service built using **Node.js** and **Express**, featuring:

- 🔁 Retry logic with exponential backoff
- 🔄 Fallback between two providers
- 🆔 Idempotency to avoid duplicate sends
- 🚦 Rate limiting
- 📊 Email status tracking
- 📄 Console-based logging

---

## 🌐 Live Deployment

➡️ https://assignment-backend-q258.onrender.com
---


## 📦 Features Overview

| Feature         | Description |
|----------------|-------------|
| 🔁 Retry Logic  | Retries each provider up to 3 times with exponential delays |
| 🔄 Fallback     | If Provider1 fails, falls back to Provider2 |
| 🆔 Idempotency  | Avoids duplicate sends using `emailid` and cache |
| 🚦 Rate Limiting| Max 5 emails per minute allowed globally |
| 📊 Status Check | Query email status using `/email/:emailid` |
| 📄 Logging      | Simple console logging of all actions and errors |

---

## 🚀 API Endpoints

### ✅ `POST /email`

**Send a mock email.**

**Request:**

```json
{
  "emailid": "email-001",
  "emaildata": {
    "to": "receiver@example.com",
    "subject": "Hello!",
    "body": "This is a test email for the assignment demo."
  }
}
```

Success Response:

```json
{
  "status": "success",
  "provider": "Provider1"
}
```

Other responses:

Duplicate: { "status": "duplicate", "message": "already sent" }

Rate limit: { "status": "error", "message": "rate limit exceeded" }

All failed: { "status": "error", "message": "All providers failed" }

---
### 📊 GET /email/:emailid
Check the status of a sent email.

Example:
✅ GET /email/email-001
Response:

```json
{
  "emailid": "email-001",
  "status": "success"
}
```
Possible values: success, failed, rate_limited, notfound, duplicate

---
## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/gouravKJ/assignment-backend.git
```
2. Install Dependencies
```bash
npm install
```
4. Start the Server
```bash
node index.js
```


