import Header from "@/components/Header";

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-sky-400 ${className}`}>
      <span className="material-icons text-2xl border-2 border-sky-400 rounded-full p-1">search</span>
      <span className="text-2xl">SimplyJobs</span>
    </div>
  );
}

export default function RootPage() {
  const jobCategoryColumns = [
    [
      { label: "Airport", slug: "airport-jobs" },
      { label: "Airline", slug: "airline-jobs" },
      { label: "Biology", slug: "biology-jobs" },
      { label: "Engineering", slug: "engineering-jobs-careers" },
      { label: "Game Developer", slug: "game-developer-jobs" },
    ],
    [
      { label: "Graphic Design", slug: "graphic-design-jobs" },
      { label: "Math", slug: "math-jobs" },
      { label: "Mechanical Engineering", slug: "mechanical-engineering-jobs" },
      { label: "Nursing", slug: "nursing-jobs" },
      { label: "Physics", slug: "physics-jobs" },
      { label: "Retail", slug: "retail-jobs" },
    ],
    [
      { label: "Science", slug: "science-jobs" },
      { label: "Software Developer", slug: "software-developer-jobs" },
      { label: "STEM", slug: "STEM-jobs" },
      { label: "Tech", slug: "tech-jobs-careers" },
      { label: "Warehouse", slug: "warehouse-jobs" },
      { label: "Work From Home", slug: "work-from-home-jobs" },
    ],
  ];

  const companyColumns = [
    [
      { name: "American Red Cross", slug: "american-red-cross-jobs" },
      { name: "Costco", slug: "costco-jobs" },
      { name: "Apple", slug: "apple-jobs" },
      { name: "Home Depot", slug: "home-depot-jobs" },
      { name: "JCPenney", slug: "jcpenney-jobs" },
      { name: "JP Morgan Chase", slug: "jp-morgan-chase-jobs" },
      { name: "Kohl's", slug: "kohls-jobs" },
    ],
    [
      { name: "Kmart", slug: "kmart-jobs" },
      { name: "Lowe's", slug: "lowes-jobs" },
      { name: "McDonald's", slug: "mcdonalds-jobs" },
      { name: "PetSmart", slug: "petsmart-jobs" },
      { name: "Pizza Hut", slug: "pizza-hut-jobs" },
      { name: "Sam's Club", slug: "sams-club-jobs" },
    ],
    [
      { name: "Starbucks", slug: "starbucks-jobs" },
      { name: "Target", slug: "target-jobs" },
      { name: "Walmart", slug: "walmart-jobs" },
      { name: "Wells Fargo", slug: "wells-fargo-jobs" },
      { name: "Wendy's", slug: "wendys-jobs" },
    ],
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <div className="px-6 py-4">
        <a href="https://simplyjobs.com" className="font-bold text-lg text-gray-900">
          <Header logoUrl="/images/logos/simplyjobs_logo.png" />
        </a>
      </div>

      <div
        className="px-6 py-12"
        style={{
          backgroundColor: "var(--primaryColor)",
          backgroundImage: "url('/images/landers/simplyjobs.com/cityscape.png')",
          backgroundSize: "50%",
          backgroundPosition: "bottom right",
          backgroundRepeat: "no-repeat",
        }}
      >
        <form action="https://form.simplyjobs.com" className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center mb-8">
            We found 0<span className="text-gray-400"> Jobs</span> near you!
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="keyword" className="block text-sm font-medium mb-1">
                Keywords
              </label>
              <input
                type="text"
                name="search_text"
                id="keyword"
                required
                placeholder="Cashier, Nurse, etc..."
                autoComplete="off"
                className="w-full border rounded px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
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
                required
                placeholder="City, State"
                autoComplete="off"
                className="w-full border rounded px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <button
                type="submit"
                style={{ backgroundColor: "var(--secondaryColor)", borderColor: "var(--secondaryColor)" }}
                className="w-full hover:bg-emerald-600 text-white font-semibold rounded px-8 py-3 transition"
              >
                View Jobs »
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <p className="md:col-span-2 text-sm text-gray-500 m-0">
              SimplyJobs.com is a job search engine. We are not an employer nor are we affiliated with any of the
              employers on this site.
            </p>
            <p className=" font-medium md:text-right">
              Search over 204<span className="text-gray-400"> Jobs</span> near you!
            </p>
          </div>
        </form>
      </div>

      <main className="flex-1 px-6 py-8 bg-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Jobs by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {jobCategoryColumns.map((column, i) => (
                <ul key={i} className="space-y-2">
                  {column.map((cat) => (
                    <li key={cat.slug}>
                      <a
                        href={`https://simplyjobs.com/jobs-and-careers/${cat.slug}`}
                        className="hover:underline"
                        style={{ color: "var(--primaryColor)" }}
                      >
                        {cat.label}
                        <span> Jobs</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Companies Hiring</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {companyColumns.map((column, i) => (
                <ul key={i} className="space-y-2">
                  {column.map((c) => (
                    <li key={c.slug}>
                      <a
                        href={`https://simplyjobs.com/companies-and-jobs/${c.slug}`}
                        className="hover:underline"
                        style={{ color: "var(--primaryColor)" }}
                      >
                        {c.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-10 text-center">
        <a href="/" className="font-bold text-lg text-gray-900">
          SimplyJobs
        </a>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
          <li>
            <a href="https://simplyjobs.com/privacy">Privacy Policy</a>
          </li>
          <li>
            <a href="https://simplyjobs.com/about-us">About Us</a>
          </li>
          <li>
            <a href="https://simplyjobs.com/terms">Terms of Service</a>
          </li>
          <li>
            <a href="https://simplyjobs.com/privacy-notice" target="_blank">
              California Privacy Notice
            </a>
          </li>
          <li>
            <a href="https://simplyjobs.com/privacy-notice" target="_blank">
              Do Not Sell My Info
            </a>
          </li>
        </ul>
        <p className="mt-4 text-gray-500 text-sm max-w-2xl mx-auto">
          SimplyJobs.com is a job search engine. All company trademarks, service marks, logos and/or domain names are
          the property of their respective owners. This website and its contents are not endorsed, sponsored by or
          affiliated with any listed employers. SimplyJobs® and its logos are trademarks or registered trademarks of
          Digital Media Solutions, LLC.
          <br />© 2026 SimplyJobs. All Rights Reserved.
        </p>
        <ul className="mt-4 flex items-center justify-center gap-4 text-gray-500 text-sm">
          <li>
            <a
              rel="nofollow"
              target="_blank"
              href="https://www.facebook.com/simplyjobsofficial/"
              className=" transition"
            >
              Facebook
            </a>
          </li>
          <li>
            <a rel="nofollow" target="_blank" href="https://twitter.com/simply_jobs" className="transition">
              Twitter
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
}
