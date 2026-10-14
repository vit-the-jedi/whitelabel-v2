import type { JsonObject } from "@/lib/types";

interface FooterHTML extends JsonObject {
  html: string;
}

export interface FooterContent {
  title: string;
  generatedAt: string;
  footerContent: FooterHTML;
}
