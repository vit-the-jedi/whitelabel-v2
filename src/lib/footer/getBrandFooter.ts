export default async function getBrandFooter() {
  const upstream = await fetch(
    "https://ue-sites.s3.us-east-1.amazonaws.com/api/graphdms/footer/Auto%20Insurance%20Footer.json",
    { next: { revalidate: 3600 } },
  );

  if (!upstream.ok) throw new Error("Footer fetch failed");
  const response = await upstream.json();
  console.log(response);
  return response;
}
