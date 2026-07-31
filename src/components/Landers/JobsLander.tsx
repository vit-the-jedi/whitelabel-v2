import Header from "@/components/Header";
import type { DefaultConfig } from "@/app/configs/defaultConfig";

/**
 * Shared lander template for every brand on the "jobs" vertical. Content
 * (copy, categories, companies, links) comes entirely from `siteConfig.jobs`
 * — a new job-search site is a config file, not a new component.
 */
export default function JobsLander({ siteConfig }: { siteConfig: DefaultConfig }) {
  const { site, jobs } = siteConfig;
  if (!jobs) return null;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <div className="px-6 border-b">
        <Header logoUrl={`/images/logos/${site.logo}`} />
      </div>

      <div className="px-6 py-12" style={{ backgroundColor: "var(--primaryColor)" }}>
        <form className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center mb-8">{jobs.heroTitle}</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="keyword" className="block text-sm font-medium mb-1">
                Keywords
              </label>
              <input
                type="text"
                name="keyword"
                id="keyword"
                placeholder={jobs.keywordPlaceholder}
                autoComplete="off"
                className="w-full border rounded px-4 py-3 outline-none"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                placeholder={jobs.locationPlaceholder}
                autoComplete="off"
                className="w-full border rounded px-4 py-3 outline-none"
              />
            </div>
            <button
              type="submit"
              style={{ backgroundColor: "var(--secondaryColor)" }}
              className="w-full text-white font-semibold rounded px-8 py-3 transition"
            >
              View Jobs »
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-6">{jobs.disclaimer}</p>
        </form>
      </div>

      <main className="flex-1 px-6 py-8 bg-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Jobs by Category</h2>
            <ul className="space-y-2 columns-2">
              {jobs.categories.map((cat) => (
                <li key={cat.slug}>
                  <a
                    href={`${jobs.categoriesBasePath}${cat.slug}`}
                    className="hover:underline"
                    style={{ color: "var(--primaryColor)" }}
                  >
                    {cat.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Companies Hiring</h2>
            <ul className="space-y-2 columns-2">
              {jobs.companies.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`${jobs.companiesBasePath}${c.slug}`}
                    className="hover:underline"
                    style={{ color: "var(--primaryColor)" }}
                  >
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <footer className="px-6 py-10 text-center border-t">
        <p className="font-bold text-lg text-gray-900">{site.name}</p>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
          <li>
            <a href={site.complianceLinks.privacyPolicy}>Privacy Policy</a>
          </li>
          <li>
            <a href={site.complianceLinks.terms}>Terms of Service</a>
          </li>
          <li>
            <a href={site.complianceLinks.californiaPrivacy}>California Privacy Notice</a>
          </li>
        </ul>
        {site.footerContent.map((paragraph, i) => (
          <p key={i} className="mt-4 text-gray-500 text-sm max-w-2xl mx-auto">
            {paragraph}
          </p>
        ))}
      </footer>
    </div>
  );
}
