/**
 * Sentry error tracking utility
 * Placeholder for Sentry integration
 */

class SentryService {
  constructor() {
    this.enabled = import.meta.env.VITE_SENTRY_ENABLED === "true";
    this.dsn = import.meta.env.VITE_SENTRY_DSN;
  }

  init() {
    if (!this.enabled || !this.dsn) {
      console.log("[Sentry] Not initialized - disabled or missing DSN");
      return;
    }

    console.log("[Sentry] Initialization placeholder");

    // TODO: Initialize Sentry
    // Example:
    // import * as Sentry from "@sentry/react";
    // Sentry.init({
    //   dsn: this.dsn,
    //   environment: import.meta.env.MODE,
    //   integrations: [new Sentry.BrowserTracing()],
    //   tracesSampleRate: 1.0,
    // });
  }

  captureException(error, context = {}) {
    if (!this.enabled) {
      console.error("[Sentry] Error:", error, context);
      return;
    }

    console.log("[Sentry] Capture exception:", error, context);

    // TODO: Send to Sentry
    // Example: Sentry.captureException(error, { extra: context });
  }

  captureMessage(message, level = "info", context = {}) {
    if (!this.enabled) {
      console.log(`[Sentry] ${level.toUpperCase()}:`, message, context);
      return;
    }

    console.log("[Sentry] Capture message:", message, level, context);

    // TODO: Send to Sentry
    // Example: Sentry.captureMessage(message, { level, extra: context });
  }

  setUser(user) {
    if (!this.enabled) return;

    console.log("[Sentry] Set user:", user);

    // TODO: Set Sentry user context
    // Example: Sentry.setUser(user);
  }

  addBreadcrumb(breadcrumb) {
    if (!this.enabled) return;

    console.log("[Sentry] Add breadcrumb:", breadcrumb);

    // TODO: Add breadcrumb to Sentry
    // Example: Sentry.addBreadcrumb(breadcrumb);
  }
}

const sentry = new SentryService();

export default sentry;
