import posthog from "posthog-js";

/*
 * Product analytics for the docs site (PostHog). Off unless VITE_POSTHOG_KEY is set, so
 * local dev and forks send nothing. Pageviews follow client-side navigation on their own;
 * `track` records the few actions worth knowing about. Anonymous visitors get no person
 * profile, and Do Not Track is respected.
 */

const key = import.meta.env.VITE_POSTHOG_KEY;

export function initAnalytics() {
  if (!key) return;
  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    // Current defaults: pageviews on history changes (a single-page app) and page leaves.
    defaults: "2025-05-24",
    person_profiles: "identified_only",
    respect_dnt: true,
  });
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (key) posthog.capture(event, properties);
}
