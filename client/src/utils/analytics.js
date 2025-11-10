/**
 * Analytics utility
 * Placeholder for analytics integration (Google Analytics, Mixpanel, etc.)
 */

class Analytics {
  constructor() {
    this.enabled = import.meta.env.VITE_ANALYTICS_ENABLED === "true";
  }

  track(eventName, properties = {}) {
    if (!this.enabled) return;

    console.log("[Analytics] Track:", eventName, properties);

    // TODO: Integrate with your analytics provider
    // Example: gtag('event', eventName, properties);
  }

  identify(userId, traits = {}) {
    if (!this.enabled) return;

    console.log("[Analytics] Identify:", userId, traits);

    // TODO: Integrate with your analytics provider
    // Example: analytics.identify(userId, traits);
  }

  page(pageName, properties = {}) {
    if (!this.enabled) return;

    console.log("[Analytics] Page:", pageName, properties);

    // TODO: Integrate with your analytics provider
    // Example: gtag('config', 'GA_MEASUREMENT_ID', { page_path: pageName });
  }
}

const analytics = new Analytics();

export default analytics;
