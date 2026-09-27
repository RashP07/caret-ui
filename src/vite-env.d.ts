/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** PostHog project API key (public, starts with phc_). Unset: analytics stays off. */
  readonly VITE_POSTHOG_KEY?: string;
  /** PostHog ingestion host, e.g. https://us.i.posthog.com or https://eu.i.posthog.com. */
  readonly VITE_POSTHOG_HOST?: string;
}
