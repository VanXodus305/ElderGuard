# ElderGuard - Web Development Presentation

---

## SLIDE 1: Complete Web Development Overview

### Title: ElderGuard Web Application - Scam Detection & Prevention Platform

---

### 🎯 **Core Problem**

Elderly users are 3x more likely to fall victim to online scams. ElderGuard provides AI-powered, accessible scam detection.

---

### ✨ **Key Features** (Implemented)

**1. Secure Authentication**

- Google OAuth login via NextAuth.js v5
- Profile completion gating (emergency contacts required)
- Secure session management (httpOnly cookies, CSRF protection)

**2. Multi-Layer Threat Detection**

- ML API analysis (text-based scam prediction with metadata)
- VirusTotal scanning (98+ security engines)
- Short link expansion (bit.ly → actual-phishing-site.com)
- HTTP/HTTPS security warnings

**3. Smart URL Processing**

```
User Input: "Check this: https://bit.ly/kyc-2025"
                        ↓
        Extract URLs + Auto-expand short links
                        ↓
        Scan with VirusTotal (14 security checks)
                        ↓
Result: "bit.ly/kyc → actual-site.com [UNSAFE - 5 malicious]"
```

**4. Emergency Contact System**

- Multiple emergency contacts (add/edit/remove)
- WhatsApp alert with detailed scam report
- One-tap call button
- Individual per-contact actions (not grouped)

**5. Language & Accessibility**

- 180+ language support (Franc library)
- Transliteration detection (Hinglish, Tanglish, etc.)
- 4 font size options (small/base/large/xl)
- Mobile-first responsive design
- Real-time loading animation with elapsed time counter

---

### 🏗️ **System Architecture**

```
┌─────────────────┐
│  React Frontend │ (Next.js 13+, HeroUI, Tailwind CSS)
│  ├─ Dashboard   │
│  ├─ Profile Mgmt│
│  └─ Font Sizes  │
└────────┬────────┘
         │ HTTPS
         ↓
┌────────────────────────────────────────────┐
│   NEXT.JS API ROUTES (Serverless Backend)  │
├────────────────────────────────────────────┤
│ /api/analyze-message → ML API (CORS proxy) │
│ /api/scan-url → VirusTotal (98+ engines)  │
│ /api/expand-url → Short link expansion    │
│ /api/translate → Language detection       │
│ /api/auth/* → Google OAuth (NextAuth.js)  │
│ /api/user/profile → MongoDB CRUD          │
└────────┬────────────────────────────────────┘
         │
    ┌────┴────┬──────────────┬────────────┐
    ↓         ↓              ↓            ↓
  ML API  VirusTotal  Google Translate  MongoDB
  (scam)   (threats)    (80+ langs)      (users)
```

---

### 🔄 **Message Analysis Flow** (Complete Pipeline)

```
USER MESSAGE INPUT
        ↓
[SKIP translation if URL-only] ← Optimization
        ↓
1️⃣  LANGUAGE DETECTION & TRANSLATION
    • Detect 180+ languages
    • Special transliteration handling
    • Google Translate API fallback
        ↓
2️⃣  URL EXTRACTION & EXPANSION
    • Extract full URLs & domain names
    • Auto-detect 14+ short link services
    • Expand to reveal real destination
        ↓
3️⃣  METADATA EXTRACTION (ML Context)
    • has_otp, has_urgency, has_threat, has_upi, has_url
    • severity score (0-1 scale)
        ↓
4️⃣  ML ANALYSIS
    • POST to scam-detection-iitkgp.onrender.com
    • Prediction: "safe" or "scam" (with confidence)
        ↓
5️⃣  URL SCANNING (VirusTotal)
    • 98+ security engines analyze each URL
    • Classification: SAFE / LIKELY SCAM / SCAM
    • ≥2 malicious flags = SCAM (our rule)
    • HTTP detection warning
        ↓
6️⃣  FINAL RISK DETERMINATION
    • ML says scam? → SCAM
    • Link is scam? → SCAM
    • Link is likely-scam? → LIKELY SCAM
    • All safe? → SAFE
        ↓
7️⃣  DISPLAY RESULTS & ALERTS
    • Color-coded risk level (green/yellow/red)
    • Individual link analysis with expansion details
    • Emergency contact buttons (WhatsApp + Call)
    • Real-time loading animation (shows elapsed time)
```

---

### 🛡️ **Scam Detection Rules** (VirusTotal Scoring)

| Classification     | Condition                                                            |
| ------------------ | -------------------------------------------------------------------- |
| 🟢 **SAFE**        | 0 malicious OR (1-2 malicious + 50+ harmless) OR <3% malicious ratio |
| 🟡 **LIKELY SCAM** | 3-10 malicious OR 3-20% malicious ratio                              |
| 🔴 **SCAM**        | **≥2 malicious flags ⚠️** OR >10 malicious OR >20% malicious ratio   |

---

### 💻 **Tech Stack**

**Frontend:** Next.js 13+, React, HeroUI, Tailwind CSS, React Icons
**Backend:** Next.js API Routes, Node.js, Axios
**Auth & DB:** NextAuth.js v5 (Google OAuth), MongoDB + Mongoose
**External APIs:**

- VirusTotal (threat analysis)
- scam-detection-iitkgp.onrender.com (ML model)
- Google Translate API (language translation)
- Franc (language detection)

---

### 🚀 **Major Achievements**

✅ Full-stack authentication with Google OAuth
✅ Real-time scam detection (ML + VirusTotal integration)
✅ Intelligent short link expansion (prevents URL hiding)
✅ Multi-language support including transliterated text
✅ Accessible UI with 4 font sizes + mobile responsiveness
✅ Emergency contact system with WhatsApp/Call alerts
✅ CORS bypass solution via server-side proxy
✅ Optimized API calls (skip translation for URL-only messages)
✅ Real-time loading feedback with elapsed timer
✅ Responsive design (desktop 2-col, mobile stacked)

---

### 📊 **Key Metrics**

- **Languages Supported:** 180+
- **Security Engines (VirusTotal):** 98+
- **Short Link Services Detected:** 14+
- **Font Size Options:** 4 (accessibility)
- **Emergency Contacts per User:** Unlimited
- **Analysis Time:** <5s average
- **Mobile Breakpoints:** sm, md, lg

---

### 🔐 **Security & Privacy**

✓ Secure authentication (Google OAuth, NextAuth.js)
✓ httpOnly cookies (XSS protection)
✓ CSRF protection (sameSite: "none")
✓ HTTPS enforced
✓ VirusTotal scanning before user clicks
✓ HTTP/HTTPS security warnings
✓ No sensitive data in client storage
✓ Environment variables for API keys

---

### 📱 **User Experience Highlights**

- **Profile Setup:** Add unlimited emergency contacts with phone/WhatsApp options
- **Dashboard:** 2-column layout (input + live results)
- **Loading State:** Animated spinner + skeleton placeholders + elapsed time
- **Results Display:** Color-coded severity + link analysis + expansion details
- **Alert System:** Individual WhatsApp/Call buttons per contact
- **Accessibility:** Adjustable font sizes, high contrast colors, readable fonts

---

### 🎓 **Technologies & Patterns Used**

- React Hooks (useState, useEffect, useContext)
- Context API (font size provider)
- Server-side proxy endpoints (CORS avoidance)
- API route composition (multiple external APIs)
- Responsive CSS Grid & Flexbox
- Language detection with fallbacks
- Metadata feature engineering for ML
- Error handling with graceful degradation

---
