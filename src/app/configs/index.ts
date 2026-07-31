import protectCom, { subdomainConfigs as protectComSubdomains } from "./protect.com/";
import freeInsuranceQuotes, { subdomainConfigs as freeInsuranceQuotesSubdomains } from "./free-insurance-quotes.us/";
import searchMyNewJobConfig, { subdomainConfigs as searchMyNewJobSubdomains } from "./searchmynewjob.com";
import simplyJobsConfig from "./simplyjobs.com";
import { type DefaultConfig } from "@/app/configs/defaultConfig";
import defaultConfig from "@/app/configs/defaultConfig";
import { mergeConfig, type DeepPartial } from "@/app/configs/mergeConfig";

export const configs: Record<string, DefaultConfig> = {
  "protect.com": protectCom,
  "free-insurance-quotes.us": freeInsuranceQuotes,
  "searchmynewjob.com": searchMyNewJobConfig,
  "simplyjobs.com": simplyJobsConfig,
};

// Map of domain -> subdomain -> partial overrides
const subdomainOverrides: Record<string, Record<string, DeepPartial<DefaultConfig>>> = {
  "protect.com": protectComSubdomains,
  "free-insurance-quotes.us": freeInsuranceQuotesSubdomains,
  "searchmynewjob.com": searchMyNewJobSubdomains,
  //"simplyjobs.com": simplyJobsSubdomains,
};

const normalizeHost = (host: string): string =>
  host
    .toLowerCase()
    .split(":")[0]
    .replace(/^www\./, "");

export const getConfigKeyForHost = (host: string): string | null => {
  if (!host) {
    return null;
  }

  const normalizedHost = normalizeHost(host);

  if (configs[normalizedHost]) {
    return normalizedHost;
  }

  const hostParts = normalizedHost.split(".");

  if (hostParts.length > 2) {
    const rootDomain = hostParts.slice(-2).join(".");
    if (configs[rootDomain]) {
      return rootDomain;
    }
  }

  return null;
};

export const getConfigForHost = (host: string): DefaultConfig => {
  const configKey = getConfigKeyForHost(host);

  if (configKey) {
    return configs[configKey];
  }

  return defaultConfig;
};

export const getSubdomainConfig = (domain: string, subdomain: string): DeepPartial<DefaultConfig> | null => {
  const configKey = getConfigKeyForHost(domain);
  if (!configKey) return null;
  return subdomainOverrides[configKey]?.[subdomain] ?? null;
};
