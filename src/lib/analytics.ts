import posthog from "posthog-js";

/*
 * Product analytics for the docs site (PostHog). Off unless VITE_POSTHOG_KEY is set, so
 * local dev and forks send nothing. Pageviews follow client-side navigation on their own;
 * `track` records the few actions worth knowing about. Anonymous visitors get no person
 * profile, and Do Not Track is respected.
 *
 * Other sites live on the same parent domain, so Caret keeps its own visitor cookie
 * (no cross-subdomain sharing) and tags every event with `site`, so it filters cleanly
 * even in a PostHog project shared with those sites.
 */

/** The value of the `site` property on every event this app sends. */
const SITE = "caret-ui";

const key = import.meta.env.VITE_POSTHOG_KEY;

export function initAnalytics() {
  if (!key) return;
  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    // Current defaults: pageviews on history changes (a single-page app) and page leaves.
    defaults: "2025-05-24",
    person_profiles: "identified_only",
    respect_dnt: true,
    cross_subdomain_cookie: false,
    loaded: (ph) => ph.register({ site: SITE }),
  });
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (key) posthog.capture(event, properties);
}
