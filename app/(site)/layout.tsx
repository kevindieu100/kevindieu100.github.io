import { Nav } from '@/components/Nav';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-content px-6 pt-12 pb-24">
      <header className="mb-16">
        <Nav />
      </header>
      <main>{children}</main>
    </div>
  );
}
