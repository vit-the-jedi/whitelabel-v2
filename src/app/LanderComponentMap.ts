import dynamic from "next/dynamic";

/**
 * Keyed by vertical, not by domain — every brand on a vertical shares one
 * lander template, driven entirely by that brand's config. Adding a new
 * brand to an existing vertical (e.g. another jobs site) never touches this
 * file; adding a new vertical adds exactly one entry here.
 */
export const landerComponentMap: Record<string, any> = {
  jobs: dynamic(() => import("@/components/Landers/JobsLander")),
};
