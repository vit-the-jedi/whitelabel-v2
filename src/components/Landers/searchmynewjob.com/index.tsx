import Header from "@/components/Header";

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-sky-400 ${className}`}>
      <span className="material-icons text-2xl border-2 border-sky-400 rounded-full p-1">search</span>
      <span className="text-2xl">Search My New Job</span>
    </div>
  );
}

export default function RootPage() {
  const jobCategories = [
    { icon: "directions_car", label: "Driving", job: "driver" },
    { icon: "business_center", label: "Management", job: "management" },
    { icon: "card_giftcard", label: "Retail", job: "retail" },
    { icon: "local_hospital", label: "Healthcare", job: "nurse" },
    { icon: "local_airport", label: "Airport", job: "airport" },
    { icon: "restaurant_menu", label: "Restaurants", job: "waiter" },
  ];

  const companies = [
    {
      name: "Uber",
      job: "driver",
      logo: "https://media.glassdoor.com/o/575263/uber-squarelogo-1479168719438.jpg",
    },
    {
      name: "Amazon",
      job: "amazon",
      logo: "https://media.glassdoor.com/sql/6036/amazon-squarelogo-1505166959541.png",
    },
    {
      name: "Walmart",
      job: "walmart",
      logo: "https://media.glassdoor.com/o/715/walmart-squarelogo-1408483474312.jpg",
    },
    {
      name: "McDonald's",
      job: "mcdonalds",
      logo: "https://media.glassdoor.com/sql/432/mcdonald-s-squarelogo-1529956196758.png",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <div className="bg-black">
        <Header logoUrl="/images/logos/searchmynewjob_logo.png" />
        <div className="px-6 py-16 text-center">
          <h2 className="text-white text-5xl font-bold mb-8">Find jobs near you</h2>
          <form className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              name="keyword"
              placeholder="Job title or keyword"
              className="w-full sm:w-64 bg-gray-800 text-white placeholder-gray-400 rounded px-4 py-3 outline-none"
            />
            <input
              type="text"
              name="zipcode"
              id="zip"
              maxLength={6}
              placeholder="City or Zip"
              className="w-full sm:w-64 bg-gray-800 text-white placeholder-gray-400 rounded px-4 py-3 outline-none"
            />
            <button className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded px-8 py-3 transition">
              Go
            </button>
          </form>

          <p className="text-white text-sm italic mt-6 max-w-xl mx-auto">
            SearchMyNewJob.com is a job search engine. We are not an employer nor are we affiliated with any of the
            employers on this site.
          </p>
        </div>
      </div>
      <main className="flex-1 bg-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-center text-sky-500 text-xl mb-12">
            Companies are looking for you! From 1,000s of new career openings we'll help you find your new job!
          </p>

          <section className="mb-10">
            <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <span className="material-icons text-gray-500">star</span>
              Popular Jobs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-8">
              {jobCategories.map((cat) => (
                <a
                  key={cat.job}
                  href={`https://searchmynewjob.com?job=${cat.job}`}
                  className="flex flex-col items-center justify-center gap-2 min-h-35 items-center p-6 bg-white rounded-lg shadow hover:shadow-md hover:scale-110 transition"
                >
                  <span className="material-icons text-sky-500 text-4xl">{cat.icon}</span>
                  <span className="text-sky-500">{cat.label}</span>
                </a>
              ))}
            </div>
          </section>

          <section className="mb-4">
            <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <span className="material-icons text-gray-500">business</span>
              Companies Hiring
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {companies.map((c) => (
                <a
                  key={c.job}
                  href={`https://searchmynewjob.com?job=${c.job}`}
                  className="flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow hover:shadow-md hover:scale-110 transition"
                >
                  <img src={c.logo} alt={c.name} className="h-20 w-20 object-contain rounded" />
                  <span className="text-sky-500">{c.name}</span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
      <footer className="px-6 py-10 text-center border-t">
        <BrandMark className="justify-center mb-4" />
        <p className="text-gray-500 text-sm">© 2026 Search My New Job. All Rights Reserved.</p>
        <p className="mt-2 text-gray-500 text-sm max-w-2xl mx-auto">
          SearchMyNewJob.com is a job search engine. All company trademarks, service marks, logos and/or domain names
          are the property of their respective owners. This website and its contents are not endorsed, sponsored by or
          affiliated with any listed employers.
        </p>
        <div className="mt-4 space-x-2 text-sky-500 text-sm">
          <a href="/about-us">About Us</a>
          <span className="text-gray-400">|</span>
          <a href="/terms">Terms of Service</a>
          <span className="text-gray-400">|</span>
          <a href="/privacy">Privacy Policy</a>
          <span className="text-gray-400">|</span>
          <a href="/privacy-notice">California Privacy Notice</a>
          <span className="text-gray-400">|</span>
          <a href="/do-not-sell">Do Not Sell My Info</a>
        </div>
      </footer>
    </div>
  );
}
