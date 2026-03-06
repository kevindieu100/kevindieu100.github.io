import Link from 'next/link';
import Image from 'next/image';

interface DemoCardProps {
  title: string;
  description: string;
  href: string;
  icon?: 'wikipedia' | 'nike' | 'default';
}

export function DemoCard({ title, description, href, icon = 'default' }: DemoCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="rounded-2xl bg-stone-100 p-6 transition-all hover:shadow-xl hover:scale-[1.02]">
        <div className="relative flex items-center justify-center h-40 overflow-hidden">
          {icon === 'wikipedia' ? (
            <Image
              src="/wikipedia-logo.png"
              alt="Wikipedia"
              fill
              className="object-contain p-4"
            />
          ) : icon === 'nike' ? (
            <Image
              src="/nike-logo.png"
              alt="Nike"
              fill
              className="object-contain p-6"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-300 via-cyan-400 to-blue-500 shadow-lg opacity-90" 
                 style={{
                   background: 'radial-gradient(circle at 30% 30%, rgba(180, 220, 200, 0.9), transparent 50%), radial-gradient(circle at 70% 60%, rgba(100, 180, 220, 0.8), transparent 50%), radial-gradient(circle at 50% 50%, rgba(120, 200, 180, 0.9), rgba(80, 150, 180, 0.8))',
                   boxShadow: '0 8px 32px rgba(100, 180, 200, 0.3), inset 0 -4px 12px rgba(255, 255, 255, 0.2)',
                 }}
            />
          )}
        </div>
      </div>
      <div className="pt-4 pb-2">
        <h3 className="font-sans text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="font-sans text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}
