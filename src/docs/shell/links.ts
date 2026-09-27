import type { DocPage } from "../registry";

const ROUTE = {
  doc: "/docs/$slug",
  foundation: "/foundations/$slug",
  component: "/components/$slug",
  template: "/templates/$slug",
} as const;

/** Typed <Link> props for a registry page: `<Link {...pageLink(p)} />`. */
export function pageLink(p: DocPage) {
  return { to: ROUTE[p.kind], params: { slug: p.slug } };
}
