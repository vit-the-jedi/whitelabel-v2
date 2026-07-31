import defaultConfig, { type DefaultConfig } from "@/app/configs/defaultConfig";
import { mergeConfig, type DeepPartial } from "@/app/configs/mergeConfig";

const simplyJobsOverrides = {
  vertical: "jobs",
  site: {
    name: "SimplyJobs",
    title: "Jobs & Position Openings",
    description: "Search for jobs in your area and start your new job immediately.",
    url: "https://simplyjobs.com",
    logo: "simplyjobs_logo.png",
    nav: {
      text: "We found 0 Jobs near you!",
    },
    complianceLinks: {
      privacyPolicy: "https://simplyjobs.com/privacy",
      terms: "https://simplyjobs.com/terms",
      californiaPrivacy: "https://simplyjobs.com/privacy-notice",
    },
    redirectUrl: "https://simplyjobs.com",
    footerContent: [
      "SimplyJobs.com is a job search engine. All company trademarks, service marks, logos and/or domain names are the property of their respective owners. This website and its contents are not endorsed, sponsored by or affiliated with any listed employers. SimplyJobs® and its logos are trademarks or registered trademarks of Digital Media Solutions, LLC.",
    ],
  },
  features: {
    GTM: {
      id: "GTM-PBT5BG",
      enabled: true,
      scriptUrl: "https://www.googletagmanager.com/gtm.js?id=",
    },
  },
  theme: {
    primaryColor: "#0084f8",
    secondaryColor: "#FB5A80",
    fontFamily: "Roboto, sans-serif",
  },
  jobs: {
    heroTitle: "We found 0 Jobs near you!",
    keywordPlaceholder: "Cashier, Nurse, etc...",
    locationPlaceholder: "City, State",
    disclaimer:
      "SimplyJobs.com is a job search engine. We are not an employer nor are we affiliated with any of the employers on this site.",
    categoriesBasePath: "https://simplyjobs.com/jobs-and-careers/",
    companiesBasePath: "https://simplyjobs.com/companies-and-jobs/",
    categories: [
      { label: "Airport", slug: "airport-jobs" },
      { label: "Airline", slug: "airline-jobs" },
      { label: "Biology", slug: "biology-jobs" },
      { label: "Engineering", slug: "engineering-jobs-careers" },
      { label: "Game Developer", slug: "game-developer-jobs" },
      { label: "Graphic Design", slug: "graphic-design-jobs" },
      { label: "Math", slug: "math-jobs" },
      { label: "Mechanical Engineering", slug: "mechanical-engineering-jobs" },
      { label: "Nursing", slug: "nursing-jobs" },
      { label: "Physics", slug: "physics-jobs" },
      { label: "Retail", slug: "retail-jobs" },
      { label: "Science", slug: "science-jobs" },
      { label: "Software Developer", slug: "software-developer-jobs" },
      { label: "STEM", slug: "STEM-jobs" },
      { label: "Tech", slug: "tech-jobs-careers" },
      { label: "Warehouse", slug: "warehouse-jobs" },
      { label: "Work From Home", slug: "work-from-home-jobs" },
    ],
    companies: [
      { name: "American Red Cross", slug: "american-red-cross-jobs" },
      { name: "Costco", slug: "costco-jobs" },
      { name: "Apple", slug: "apple-jobs" },
      { name: "Home Depot", slug: "home-depot-jobs" },
      { name: "JCPenney", slug: "jcpenney-jobs" },
      { name: "JP Morgan Chase", slug: "jp-morgan-chase-jobs" },
      { name: "Kohl's", slug: "kohls-jobs" },
      { name: "Kmart", slug: "kmart-jobs" },
      { name: "Lowe's", slug: "lowes-jobs" },
      { name: "McDonald's", slug: "mcdonalds-jobs" },
      { name: "PetSmart", slug: "petsmart-jobs" },
      { name: "Pizza Hut", slug: "pizza-hut-jobs" },
      { name: "Sam's Club", slug: "sams-club-jobs" },
      { name: "Starbucks", slug: "starbucks-jobs" },
      { name: "Target", slug: "target-jobs" },
      { name: "Walmart", slug: "walmart-jobs" },
      { name: "Wells Fargo", slug: "wells-fargo-jobs" },
      { name: "Wendy's", slug: "wendys-jobs" },
    ],
  },
} satisfies DeepPartial<DefaultConfig>;

const simplyJobsConfig: DefaultConfig = mergeConfig(defaultConfig, simplyJobsOverrides);

export const subdomainConfigs: Record<string, DeepPartial<DefaultConfig>> = {};

export default simplyJobsConfig;
