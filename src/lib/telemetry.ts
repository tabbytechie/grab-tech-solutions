const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;
let appInsights: {
  trackPageView: () => void;
  trackEvent: (event: { name: string; properties?: Record<string, unknown> }) => void;
  trackException: (event: { exception: Error; properties?: Record<string, unknown> }) => void;
} | null = null;

if (connectionString && typeof window !== "undefined") {
  import("@microsoft/applicationinsights-web")
    .then(({ ApplicationInsights }) => {
      appInsights = new ApplicationInsights({
        config: {
          connectionString,
          enableAutoRouteTracking: true,
        },
      });
      appInsights.loadAppInsights();
      appInsights.trackPageView();
    })
    .catch((error) => {
      if (import.meta.env.DEV || import.meta.env.MODE === "test") {
        console.warn("Application Insights telemetry is unavailable.", error);
      }
    });
}

/**
 * Telemetry Utility for System Tracing
 */
export const telemetry = {
  log: (event: string, data: Record<string, unknown>) => {
    const trace = {
      timestamp: new Date().toISOString(),
      event,
      ...data,
    };

    if (import.meta.env.DEV || import.meta.env.MODE === "test") {
      console.log(`[TELEMETRY] ${JSON.stringify(trace)}`);
    }

    appInsights?.trackEvent({ name: event, properties: data });
  },
  error: (event: string, error: Error, context: Record<string, unknown> = {}) => {
    const trace = {
      timestamp: new Date().toISOString(),
      event,
      error: error.message,
      ...context,
    };

    if (import.meta.env.DEV || import.meta.env.MODE === "test") {
      console.error(`[TELEMETRY_FAILURE] ${JSON.stringify(trace)}`);
    }

    appInsights?.trackException({ exception: error, properties: { event, ...context } });
  },
};
