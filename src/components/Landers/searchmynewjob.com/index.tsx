export default function RootPage() {
  // Uses Google Material Icons (the same icon set the live site uses).
  // Add this to your document <head> if not already present:
  // <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />

  const jobCategories = [
    { icon: "directions_car", label: "Driving", job: "driver" },
    { icon: "business_center", label: "Management", job: "management" },
    { icon: "card_giftcard", label: "Retail", job: "retail" },
    { icon: "local_hospital", label: "Healthcare", job: "nurse" },
    { icon: "local_airport", label: "Airport", job: "airport" },
    { icon: "restaurant_menu", label: "Restaurants", job: "waiter" },
  ];

  const companies = [
    { name: "Uber", job: "driver" },
    { name: "Amazon", job: "amazon" },
    { name: "Walmart", job: "walmart" },
    { name: "McDonald's", job: "mcdonalds" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <header className="p-4 border-b" style={{ backgroundColor: "var(--brand-accent)", padding: "40px 20px" }}>
        <h1 className="text-xl font-bold">Search My New Job</h1>
        <form className="flex flex-row">
          <input type="text" name="zipcode" id="zip" max-length="6" placeholder="Enter Zipcode" />
          <button>Next</button>
        </form>
      </header>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-4">Find jobs near you</h2>
        <p className="mb-2 text-gray-600">
          SearchMyNewJob.com is a job search engine. We are not an employer nor are we affiliated with any of the
          employers on this site.
        </p>
        <p className="mb-8 text-gray-600">
          Companies are looking for you! From 1,000s of new career openings we'll help you{" "}
          <strong>find your new job</strong>!
        </p>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <span className="material-icons text-yellow-500">star</span>
            Popular Jobs
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {jobCategories.map((cat) => (
              <a
                key={cat.job}
                href={`https://searchmynewjob.com?job=${cat.job}`}
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <span className="material-icons text-gray-700">{cat.icon}</span>
                <span>{cat.label}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <span className="material-icons text-gray-700">business</span>
            Companies Hiring
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {companies.map((c) => (
              <a
                key={c.job}
                href={`https://searchmynewjob.com?job=${c.job}`}
                className="p-3 border rounded-lg text-center hover:bg-gray-50 transition"
              >
                {c.name}
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="p-4 border-t text-xs text-gray-500 text-center">
        <img
          src="https://searchmynewjob.com/themes/smnj/assets/images/searchmynewjob-logo.png"
          alt="Search My New Job Logo"
          className="mx-auto mb-3 h-8"
        />
        <p>© 2026 Search My New Job. All Rights Reserved.</p>
        <p className="mt-1">
          SearchMyNewJob.com is a job search engine. All company trademarks, service marks, logos and/or domain names
          are the property of their respective owners.
        </p>
        <div className="mt-2 space-x-2">
          <a href="https://searchmynewjob.com/about-us">About Us</a>
          <span>|</span>
          <a href="https://searchmynewjob.com/terms">Terms of Service</a>
          <span>|</span>
          <a href="https://searchmynewjob.com/privacy">Privacy Policy</a>
          <span>|</span>
          <a href="https://searchmynewjob.com/privacy-notice">California Privacy Notice</a>
        </div>
      </footer>
    </div>
  );
}
