# Google Analytics 4 (GA4) Setup Guide

## Overview

Google Analytics 4 là công cụ analytics mới của Google, cung cấp:

- **Event-based tracking** - Flexible event model
- **Cross-platform tracking** - Web + Mobile unified
- **Privacy-first** - GDPR compliant
- **AI-powered insights** - Predictive metrics
- **Free tier** - Unlimited events

## Part B.1: Tạo GA4 Property

### Bước 1: Truy cập Google Analytics

1. Vào [Google Analytics](https://analytics.google.com/)
2. Sign in với Google account

### Bước 2: Tạo Property mới

1. Click **"Admin"** (gear icon bottom left)
2. Click **"+ Create Property"**
3. Điền thông tin:

```
Property name: MindX Week1 Full-Stack App
Reporting time zone: (GMT+07:00) Bangkok, Hanoi, Jakarta
Currency: Vietnamese Dong (₫) hoặc USD ($)
```

4. Click **"Next"**

### Bước 3: Business Information

```
Industry category: Technology
Business size: Small (1-10 employees) hoặc phù hợp
```

Select objectives:

- ✅ Examine user behavior
- ✅ Measure customer engagement

Click **"Create"**

### Bước 4: Accept Terms of Service

- ✅ Accept Google Analytics Terms of Service
- ✅ Accept Data Processing Terms
- (Optional) Email communications

Click **"I Accept"**

### Bước 5: Tạo Data Stream

1. Select platform: **Web**
2. Điền thông tin:

```
Website URL: https://tulm.mindx.edu.vn
Stream name: MindX Week1 Frontend
```

3. **Enhanced measurement** - Keep enabled:

   - ✅ Page views
   - ✅ Scrolls
   - ✅ Outbound clicks
   - ✅ Site search
   - ✅ Video engagement
   - ✅ File downloads

4. Click **"Create stream"**

### Bước 6: Lấy Measurement ID

Sau khi tạo stream, bạn sẽ thấy:

```
Measurement ID: G-XXXXXXXXXX
```

**Copy measurement ID này** - Cần dùng để integrate vào React app.

### Bước 7: (Optional) Configure Data Retention

1. Go to **Admin** → **Data Settings** → **Data Retention**
2. Set:
   - **Event data retention**: 14 months (maximum for free tier)
   - **Reset user data on new activity**: Yes

---

## Part B.2: Tích hợp GA4 vào React App

### Bước 1: Install Dependencies

```bash
cd week1-fullstack-app/frontend
npm install react-ga4
```

### Bước 2: Tạo GA4 Service

Tạo file `src/services/googleAnalytics.ts`:

```typescript
import ReactGA from "react-ga4";

let isInitialized = false;

/**
 * Initialize Google Analytics 4
 */
export function initializeGA4(): boolean {
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn("⚠️  GA4 Measurement ID not found. Analytics disabled.");
    return false;
  }

  try {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        // Cookie settings
        cookieFlags: "SameSite=None;Secure",
        // Send page view on initialization
        send_page_view: false, // We'll track manually
      },
      gtagOptions: {
        // Debug mode in development
        debug_mode: import.meta.env.MODE === "development",
        // User consent (GDPR)
        anonymize_ip: true,
      },
    });

    isInitialized = true;
    console.log("✅ Google Analytics 4 initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize GA4:", error);
    return false;
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  if (!isInitialized) return;

  ReactGA.send({
    hitType: "pageview",
    page: path,
    title: title || document.title,
  });
}

/**
 * Track custom event
 */
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
) {
  if (!isInitialized) return;

  ReactGA.event({
    category,
    action,
    label,
    value,
  });
}

/**
 * Track specific GA4 events
 */
export const GA4Events = {
  // User authentication
  login: (method: string) => {
    ReactGA.event("login", { method });
  },

  signup: (method: string) => {
    ReactGA.event("sign_up", { method });
  },

  logout: () => {
    ReactGA.event("logout", {});
  },

  // Page engagement
  selectContent: (contentType: string, itemId: string) => {
    ReactGA.event("select_content", {
      content_type: contentType,
      item_id: itemId,
    });
  },

  // User interactions
  buttonClick: (buttonName: string, location: string) => {
    ReactGA.event("button_click", {
      button_name: buttonName,
      location: location,
    });
  },

  formSubmit: (formName: string, success: boolean) => {
    ReactGA.event("form_submit", {
      form_name: formName,
      success: success.toString(),
    });
  },

  // Feature usage
  featureUsed: (featureName: string) => {
    ReactGA.event("feature_used", {
      feature_name: featureName,
    });
  },

  // Errors
  error: (errorType: string, errorMessage: string) => {
    ReactGA.event("error", {
      error_type: errorType,
      error_message: errorMessage,
    });
  },

  // Search
  search: (searchTerm: string, resultsCount: number) => {
    ReactGA.event("search", {
      search_term: searchTerm,
      results_count: resultsCount.toString(),
    });
  },
};

export function isGA4Enabled(): boolean {
  return isInitialized;
}
```

### Bước 3: Update main.tsx

```typescript
// Initialize Google Analytics 4
import { initializeGA4 } from "./services/googleAnalytics";
const ga4Enabled = initializeGA4();

// Log status
console.log(`📊 Google Analytics 4: ${ga4Enabled ? "Enabled" : "Disabled"}`);
```

### Bước 4: Track Route Changes

Update `src/App.tsx`:

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from './services/googleAnalytics';

function App() {
  const location = useLocation();

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);

  return (
    // ... your existing app code ...
  );
}
```

### Bước 5: Track User Actions

Update `src/components/Login.tsx`:

```typescript
import { GA4Events } from "../services/googleAnalytics";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await login(email, password);

    // Track successful login
    GA4Events.login("password");

    navigate("/profile");
  } catch (err) {
    // Track login error
    GA4Events.error("login_failed", "Invalid credentials");
  }
};
```

Update `src/components/Register.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  try {
    await register(email, password, name);

    // Track successful registration
    GA4Events.signup("password");

    navigate("/profile");
  } catch (err) {
    GA4Events.error("signup_failed", err.message);
  }
};
```

Update `src/components/Navigation.tsx`:

```typescript
const handleLogout = () => {
  // Track logout
  GA4Events.logout();

  logout();
  navigate("/login");
};
```

### Bước 6: Environment Variables

Add to `.env.local`:

```env
VITE_GA4_MEASUREMENT_ID="G-XXXXXXXXXX"
```

---

## Part B.3: Custom Event Tracking Examples

### Track Button Clicks

```typescript
import { GA4Events } from "../services/googleAnalytics";

<button
  onClick={() => {
    GA4Events.buttonClick("Submit Form", "Contact Page");
    handleSubmit();
  }}
>
  Submit
</button>;
```

### Track Feature Usage

```typescript
const handleExportData = () => {
  GA4Events.featureUsed("Export Data");
  // ... export logic ...
};
```

### Track Form Interactions

```typescript
const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await submitForm(formData);
    GA4Events.formSubmit("Contact Form", true);
  } catch (error) {
    GA4Events.formSubmit("Contact Form", false);
    GA4Events.error("form_submission", error.message);
  }
};
```

### Track Content Selection

```typescript
const handleArticleClick = (articleId: string) => {
  GA4Events.selectContent("article", articleId);
  navigate(`/article/${articleId}`);
};
```

### Track Search

```typescript
const handleSearch = (query: string, results: any[]) => {
  GA4Events.search(query, results.length);
};
```

---

## Part B.4: View Data in GA4

### Real-time Reports

1. Vào **Reports** → **Realtime**
2. Bạn sẽ thấy:

   - **Users by page title** - Current active pages
   - **Event count by Event name** - Real-time events
   - **Users by platform** - Device types
   - **Users by country** - Geographic distribution

3. **Test ngay:**
   ```bash
   # Open your app in browser
   # Navigate to different pages
   # Perform actions (login, click buttons, etc.)
   # Watch Real-time report update within seconds
   ```

### Life Cycle Reports

**Acquisition:**

```
Reports → Life cycle → Acquisition → Traffic acquisition
```

- **Session source** - Where users come from
- **New users** - First-time visitors
- **Engagement rate** - How engaged are users

**Engagement:**

```
Reports → Life cycle → Engagement → Events
```

- **Event count** - All tracked events
- **Event value** - Total value
- **Events per user** - Engagement metric

**Retention:**

```
Reports → Life cycle → Retention → User retention
```

- **Daily active users**
- **Weekly active users**
- **User retention cohorts**

### User Reports

**Demographics:**

```
Reports → User → Demographics → Overview
```

- **Age** - User age groups
- **Gender** - User gender distribution
- **Interests** - User interests categories

**Tech:**

```
Reports → User → Tech → Overview
```

- **Browser** - Chrome, Firefox, Safari, etc.
- **Operating System** - Windows, Mac, Android, iOS
- **Screen resolution** - Desktop vs Mobile

### Custom Explorations

1. Click **"Explore"** in left menu
2. Click **"+ Blank"** to create exploration
3. Add dimensions & metrics:

**Example: User Journey Analysis**

```
Technique: Path exploration
Starting point: page_view (path = "/")
Ending point: login event
```

**Example: Funnel Analysis**

```
Technique: Funnel exploration
Steps:
1. page_view (/)
2. page_view (/register)
3. sign_up event
4. page_view (/profile)
```

---

## Part B.5: Configure Conversions

### Mark Events as Conversions

1. Vào **Admin** → **Events**
2. Find events like:
   - `sign_up`
   - `login`
   - `purchase` (if e-commerce)
3. Toggle **"Mark as conversion"** to ON

### View Conversion Data

```
Reports → Life cycle → Engagement → Conversions
```

---

## Part B.6: Set Up Audiences

### Create User Segments

1. Vào **Admin** → **Audiences**
2. Click **"+ New audience"**

**Example: Engaged Users**

```
Name: Highly Engaged Users
Conditions:
- Event name = page_view
- Event count > 10 (in last 7 days)
```

**Example: Converted Users**

```
Name: Registered Users
Conditions:
- Event name = sign_up
- Event count > 0
```

---

## Part B.7: Create Custom Dashboards

### Build Overview Dashboard

1. Click **Library** in left menu
2. Click **"+ Create"** → **"Dashboard"**
3. Add cards:

**Card 1: Active Users**

```
Metric: Active users
Dimension: Date
Chart type: Line chart
```

**Card 2: Top Events**

```
Metric: Event count
Dimension: Event name
Chart type: Bar chart
Top 10
```

**Card 3: Pages**

```
Metric: Views
Dimension: Page title
Chart type: Table
```

**Card 4: Conversions**

```
Metric: Conversions
Dimension: Event name
Chart type: Donut chart
```

---

## Part B.8: GA4 Best Practices

### ✅ DO

- **Track meaningful events** - User actions that matter
- **Use standard event names** - Google recommended events when possible
- **Add event parameters** - Provide context for events
- **Test in debug mode** - Verify events before production
- **Set up conversions** - Mark important events
- **Create audiences** - Segment users for analysis
- **Review weekly** - Check reports regularly

### ❌ DON'T

- **Over-track** - Don't track every single interaction
- **Include PII** - Never send email, phone, names
- **Forget GDPR** - Implement cookie consent if EU users
- **Ignore data quality** - Check for duplicate events
- **Mix UA & GA4** - Don't send same data to both
- **Hardcode IDs** - Use environment variables

---

## Part B.9: Debug Mode

### Enable Debug Mode in Browser

1. Install [GA Debugger Extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/)
2. Enable extension
3. Open DevTools → Console
4. See GA4 events firing in real-time

### Use GA4 DebugView

1. In GA4, go to **Admin** → **DebugView**
2. Open your app with debug mode:
   ```
   ?debug_mode=true
   ```
3. Perform actions
4. See events appear in DebugView instantly

---

## Part B.10: Privacy & GDPR Compliance

### Cookie Consent

Nếu có users từ EU, cần implement cookie consent:

```typescript
import ReactGA from "react-ga4";

// After user accepts cookies
function handleCookieConsent(accepted: boolean) {
  if (accepted) {
    ReactGA.gtag("consent", "update", {
      analytics_storage: "granted",
    });
    initializeGA4();
  } else {
    ReactGA.gtag("consent", "update", {
      analytics_storage: "denied",
    });
  }
}
```

### IP Anonymization

Already enabled in our config:

```typescript
anonymize_ip: true;
```

### Data Deletion Requests

Users có quyền request xóa data:

1. Go to **Admin** → **Data deletion requests**
2. Create new request with user_id

---

## Part B.11: Comparison with Application Insights

| Feature          | Application Insights  | Google Analytics 4 |
| ---------------- | --------------------- | ------------------ |
| **Purpose**      | Production monitoring | Product analytics  |
| **Focus**        | Technical metrics     | User behavior      |
| **Latency**      | P50, P95, P99         | ❌ No              |
| **Error Rate**   | ✅ Yes                | Limited            |
| **Traffic**      | ✅ Yes                | ✅ Yes (sessions)  |
| **Capacity**     | ✅ CPU, Memory        | ❌ No              |
| **User Journey** | Limited               | ✅ Excellent       |
| **Conversions**  | ❌ No                 | ✅ Yes             |
| **Real-time**    | ✅ Yes                | ✅ Yes             |
| **Cost**         | Pay per GB            | Free (with limits) |
| **Best for**     | Engineers, DevOps     | Product, Marketing |

**Recommendation:** Use BOTH

- **App Insights** - System health, performance, errors
- **GA4** - User behavior, conversions, engagement

---

## Troubleshooting

### Issue: No data in GA4

**Check:**

```javascript
// In browser console
console.log(import.meta.env.VITE_GA4_MEASUREMENT_ID);
```

If undefined:

- Add to `.env.local`
- Restart dev server
- Clear browser cache

### Issue: Events not appearing

**Solutions:**

- Wait 24-48 hours for data to process
- Check **DebugView** for real-time validation
- Verify Measurement ID is correct
- Check browser console for errors

### Issue: Duplicate events

**Causes:**

- React StrictMode (disabled in our setup)
- Multiple initialize() calls
- Browser extensions

**Solution:**

- Initialize GA4 only once
- Use `isInitialized` flag

---

## Summary

✅ Part B completed - Google Analytics 4 fully integrated  
➡️ Tiếp theo: [Part C - Problem Discovery](./PROBLEM_DISCOVERY_GUIDE.md)

### Checklist

- [ ] GA4 property created
- [ ] Measurement ID obtained
- [ ] react-ga4 installed
- [ ] GA4 initialized in app
- [ ] Page view tracking working
- [ ] Custom events implemented
- [ ] Conversions marked
- [ ] Real-time data visible
- [ ] Dashboard created
- [ ] Privacy compliance checked
