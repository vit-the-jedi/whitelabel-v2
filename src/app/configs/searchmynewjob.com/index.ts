import defaultConfig, { type DefaultConfig } from "@/app/configs/defaultConfig";
import { mergeConfig, type DeepPartial } from "@/app/configs/mergeConfig";

const searchMyNewJobOverrides = {
  vertical: "jobs",
  site: {
    name: "Search My New Job",
    title: "Job Search - Search My New Job",
    description:
      "Search My New Job is a job and career opportunities search engine. Search for jobs near you and find hiring and recruiting advice.",
    url: "https://www.searchmynewjob.com",
    logo: "searchmynewjob_logo.png",
    nav: {
      text: "Find jobs near you",
    },
    complianceLinks: {
      privacyPolicy: "https://www.searchmynewjob.com/privacy",
      terms: "https://www.searchmynewjob.com/terms",
      californiaPrivacy: "https://www.searchmynewjob.com/privacy-notice",
    },
    redirectUrl: "https://searchmynewjob.com",
    footerContent: [
      "SearchMyNewJob.com is a job search engine. All company trademarks, service marks, logos and/or domain names are the property of their respective owners.",
    ],
  },
  features: {
    GTM: {
      id: "GTM-588RZGR",
      enabled: true,
      scriptUrl: "https://www.googletagmanager.com/gtm.js?id=",
    },
  },
  theme: {
    primaryColor: "#00619e",
    secondaryColor: "#1f2937",
    fontFamily: "Nunito Sans, sans-serif",
    googleFont: "Nunito Sans",
  },
  jobs: {
    heroTitle: "Find jobs near you",
    keywordPlaceholder: "Job title or keyword",
    locationPlaceholder: "City or Zip",
    disclaimer:
      "SearchMyNewJob.com is a job search engine. We are not an employer nor are we affiliated with any of the employers on this site.",
    categoriesBasePath: "https://searchmynewjob.com?job=",
    companiesBasePath: "https://searchmynewjob.com?job=",
    categories: [
      { label: "Driving", slug: "driver" },
      { label: "Management", slug: "management" },
      { label: "Retail", slug: "retail" },
      { label: "Healthcare", slug: "nurse" },
      { label: "Airport", slug: "airport" },
      { label: "Restaurants", slug: "waiter" },
    ],
    companies: [
      { name: "Uber", slug: "driver" },
      { name: "Amazon", slug: "amazon" },
      { name: "Walmart", slug: "walmart" },
      { name: "McDonald's", slug: "mcdonalds" },
    ],
  },
} satisfies DeepPartial<DefaultConfig>;

const searchMyNewJobConfig: DefaultConfig = mergeConfig(defaultConfig, searchMyNewJobOverrides);

export const subdomainConfigs: Record<string, DeepPartial<DefaultConfig>> = {};

export default searchMyNewJobConfig;
