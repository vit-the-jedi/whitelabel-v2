import Header from "@/components/Header";
import type { DefaultConfig } from "@/app/configs/defaultConfigs";

/**
 * Shared lander template for every brand on the "auto-insurance" vertical. Content
 * (copy, categories, companies, links) comes entirely from `siteConfig.autoInsurance`
 * — a new auto insurance site is a config file, not a new component.
 */
export default function AutoInsuranceLander({ siteConfig }: { siteConfig: DefaultConfig }) {
  const { site } = siteConfig;
  return <div> Auto Lander</div>;
}
