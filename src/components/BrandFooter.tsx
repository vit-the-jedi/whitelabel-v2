import getBrandFooter from "@/lib/footer/getBrandFooter";
import type { FooterContent } from "@/lib/footer/types";
import DOMPurify from "isomorphic-dompurify";

const vars: Record<string, string | number> = {
  year: new Date().getFullYear(),
  company_name: "protect.com",
  company_address: "...",
};

const links: Record<string, string> = {
  privacy_link: "/privacy",
  terms_link: "/terms",
  cpn_link: "/ca-privacy",
  dncLink: "/dns",
};

function fill(html: string) {
  return (
    html
      // {{privacy_link|Privacy Policy}} -> <a>
      .replace(/{{(\w+)\|([^}]+)}}/g, (_, k, label) => (links[k] ? `<a href="${links[k]}">${label}</a>` : label))
      // {{var}}
      .replace(/{{(\w+)}}/g, (_, k) => String(vars[k] ?? ""))
  );
}

export default async function BrandFooter() {
  const footer = (await getBrandFooter()) as FooterContent;
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(fill(footer.footerContent.html)) }} />;
}
