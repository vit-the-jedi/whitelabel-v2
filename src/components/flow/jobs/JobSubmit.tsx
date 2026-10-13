function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.55 4.34l3.06 3.06a.75.75 0 1 1-1.06 1.06l-3.06-3.06A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M9.69 18.933a.75.75 0 0 0 .62 0c.121-.055 4.834-2.223 6.795-6.062A8.25 8.25 0 1 0 2.515 12.87c1.961 3.84 6.674 6.007 6.795 6.062ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function Hero({
  backgroundUrl = "/images/landers/simplyjobs.com/cityscape.png",
  heroTitle = "We found 0 Jobs near you!",
  keywordValue = "",
  zipValue = "",
  jobCount = 0,
  disclaimer = "SimplyJobs.com is a job search engine. We are not an employer nor are we affiliated with any of the employers on this site.",
  cardTitle = "Start your search",
  cardBody = "Browse openings and jump straight into the next step.",
}: {
  backgroundUrl?: string;
  heroTitle?: string;
  keywordValue?: string;
  zipValue?: string;
  jobCount?: number;
  disclaimer?: string;
  cardTitle?: string;
  cardBody?: string;
} = {}) {
  return (
    <div className="relative">
      <div
        className="relative bg-cover bg-center px-6 py-16 sm:py-20"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-white text-4xl sm:text-5xl font-bold leading-tight">{heroTitle}</h1>

          <form className="mt-8 flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-6">
            <div className="flex-1 text-left">
              <label htmlFor="keyword" className="block text-white text-sm font-medium mb-1">
                Search Jobs
              </label>
              <div className="flex items-center gap-2 bg-white rounded-md px-4 py-3">
                <SearchIcon />
                <input
                  id="keyword"
                  name="keyword"
                  type="text"
                  defaultValue={keywordValue}
                  className="w-full outline-none text-gray-900"
                />
              </div>
            </div>

            <div className="w-full sm:w-40 text-left">
              <label htmlFor="zip" className="block text-white text-sm font-medium mb-1">
                Zip Code
              </label>
              <div className="flex items-center gap-2 bg-white rounded-md px-4 py-3">
                <PinIcon />
                <input
                  id="zip"
                  name="zip"
                  type="text"
                  defaultValue={zipValue}
                  className="w-full outline-none text-gray-900"
                />
              </div>
            </div>
          </form>

          <button
            type="submit"
            className="mt-6 w-full sm:w-auto sm:min-w-[420px] bg-emerald-500 hover:bg-emerald-600 text-white font-bold tracking-wide uppercase rounded-md px-10 py-4 transition"
          >
            View Jobs
          </button>

          <p className="mt-4 text-white/90 text-sm italic">
            Search over <span className="font-semibold">{jobCount}</span> Jobs near you!
          </p>
          <p className="mt-2 text-white/70 text-xs max-w-xl mx-auto">{disclaimer}</p>
        </div>
      </div>

      {/* Overlapping card — negative margin pulls it up over the hero's bottom edge */}
      <div className="relative px-6 -mt-10 sm:-mt-12">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-xl p-6 sm:p-8 text-center">
          <h2 className="text-lg font-bold text-gray-900">{cardTitle}</h2>
          <p className="mt-2 text-sm text-gray-500">{cardBody}</p>
        </div>
      </div>
    </div>
  );
}

export default function JobsSubmit({ city, links }: { city: string; links: { label: string; href: string }[] }) {
  return (
    <div className="px-6 pt-16 pb-8 text-center">
      <Hero />
      <h3 className="text-lg text-gray-900">
        Recommended jobs in <span className="text-emerald-600 font-semibold">{city}</span>
      </h3>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        {links?.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="border border-sky-400 text-sky-500 uppercase text-sm font-semibold tracking-wide rounded-full px-6 py-3 hover:bg-sky-50 transition"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
