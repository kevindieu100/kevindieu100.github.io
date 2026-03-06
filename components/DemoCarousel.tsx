'use client';

import { useRef } from 'react';
import { DemoCard } from './DemoCard';

interface Demo {
  title: string;
  description: string;
  href: string;
}

interface DemoCarouselProps {
  demos: Demo[];
}

export function DemoCarousel({ demos }: DemoCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="mt-16">
      <div className="flex items-end justify-between mb-8">
        <h2 className="font-serif text-3xl font-normal text-gray-900 leading-tight md:text-4xl">
          Discover all our agent based<br />
          AI Answering Services
        </h2>
        {demos.length > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {demos.map((demo) => (
          <div key={demo.title} className="flex-shrink-0 w-72 snap-start">
            <DemoCard {...demo} />
          </div>
        ))}
      </div>
    </section>
  );
}
