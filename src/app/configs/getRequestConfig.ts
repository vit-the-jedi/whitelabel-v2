import { headers } from "next/headers";
import { configs, getConfigForHost, getSubdomainConfig } from "./index";
import { mergeConfig } from "./mergeConfig";
import type { DefaultConfig } from "./defaultConfig";

export const getRequestConfig = async (): Promise<DefaultConfig> => {
  const requestHeaders = await headers();
  const domain = requestHeaders.get("x-site-domain") ?? "";
  const subdomain = requestHeaders.get("x-site-subdomain") ?? "";

  const baseConfig: DefaultConfig = domain && domain in configs
    ? configs[domain]
    : getConfigForHost(domain);

  if (subdomain) {
    const overrides = getSubdomainConfig(domain, subdomain);
    if (overrides) {
      return mergeConfig<DefaultConfig>(baseConfig, overrides);
    }
  }

  return baseConfig;
};
