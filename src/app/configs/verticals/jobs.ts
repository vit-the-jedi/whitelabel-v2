/**
 * Config shape for the "jobs" vertical (job-search landers like
 * searchmynewjob.com, simplyjobs.com). No quote flow — a brand on this
 * vertical never sets `flow`.
 */
export type JobCategory = { label: string; slug: string };
export type JobCompany = { name: string; slug: string };

export type JobsConfig = {
  heroTitle: string;
  keywordPlaceholder: string;
  locationPlaceholder: string;
  disclaimer: string;
  /** Base path categories/companies links are appended to, e.g. "https://simplyjobs.com/jobs-and-careers/". */
  categoriesBasePath: string;
  companiesBasePath: string;
  categories: JobCategory[];
  companies: JobCompany[];
};
