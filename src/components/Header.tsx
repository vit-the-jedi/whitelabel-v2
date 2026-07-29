export default function Header({ logoUrl }: { logoUrl: string }) {
  return (
    <header style={{ padding: 16 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoUrl} alt="Site Logo" className="h-8" />
    </header>
  );
}
