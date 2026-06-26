import { generateDefaultFlowSteps } from "@/lib/flow/config";
import type { FlowConfig } from "@/lib/flow/types";

export type DefaultConfig = {
  site: {
    name: string;
    title: string;
    description: string;
    url: string;
    email: string;
    c2cnumber?: string;
    logo: string;
    nav: {
      text: string;
    };
    complianceLinks: {
      privacyPolicy: string;
      terms: string;
      californiaPrivacy: string;
    };
    redirectUrl: string;
    footerContent: string[]; // Optional array for additional footer content
    form?: string; // Optional form key, e.g. 'gender'
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    googleFont?: string; // Google Font name, e.g. "Nunito Sans" — used by next/font/google
    radioButtonColor?: string;
    fonts?: string[]; // Legacy CDN font URLs (prefer googleFont)
    layout?: string;
  };
  features: {
    GA?: {
      id: string;
      enabled: boolean;
      scriptUrl?: string;
    };
    GTM?: {
      id: string;
      enabled: boolean;
      scriptUrl?: string;
    };
    ringba?: {
      enabled: boolean;
      id: string;
      scriptUrl?: string;
    };
    maxmind?: {
      enabled: boolean;
      scriptUrl?: string;
    };
  };
  /** Optional funnel flow config for this site. */
  flow?: FlowConfig;
};

const defaultConfig: DefaultConfig = {
  site: {
    name: "My Site",
    title: "Welcome to My Site",
    description: "Default site configuration",
    url: "https://example.com",
    email: "",
    logo: "default-logo.png",
    nav: {
      text: "",
    },
    complianceLinks: {
      privacyPolicy: "",
      terms: "",
      californiaPrivacy: "",
    },
    redirectUrl: "https://insure.protect.com",
    footerContent: [],
  },
  theme: {
    primaryColor: "#007bff",
    secondaryColor: "#6c757d",
    fontFamily: "Nunito Sans, sans-serif",
    radioButtonColor: "#007bff",
    fonts: [],
  },
  features: {
    ringba: {
      enabled: false,
      id: "",
      scriptUrl: "",
    },
    GA: {
      id: "",
      enabled: false,
      scriptUrl: "",
    },
    GTM: {
      id: "",
      enabled: false,
      scriptUrl: "",
    },
    maxmind: {
      enabled: false,
      scriptUrl: "",
    },
  },
  flow: {
    brand: "default",
    startStep: "zip",
    steps: generateDefaultFlowSteps(),
  },
};

export default defaultConfig;
