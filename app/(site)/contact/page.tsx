'use client';

import Link from 'next/link';
import { useState } from 'react';

const EMAIL = 'kevindieu1000@gmail.com';
const LINKEDIN_URL = 'https://www.linkedin.com/in/kevindieu';

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <article className="space-y-12">
      <h1 className="font-serif text-xl italic text-gray-800">Contact</h1>

      <ul className="space-y-0">
        <li>
          <div className="flex items-center gap-4 py-6 first:pt-0">
            <div className="min-w-0 flex-1">
              <p className="font-sans font-medium text-gray-900">Email</p>
              <p className="mt-0.5 font-sans text-sm font-normal text-gray-600">
                {EMAIL}
              </p>
            </div>
            <span className="h-px min-w-[16px] flex-1 shrink bg-gray-200" aria-hidden />
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50/80 px-3 py-1.5 font-sans text-sm text-gray-700 hover:border-accent hover:bg-accent/5 hover:text-accent transition-colors"
              aria-label={`Copy ${EMAIL}`}
            >
              <EmailIcon className="h-4 w-4" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </li>
        <li>
          <div className="flex items-center gap-4 py-6">
            <div className="min-w-0 flex-1">
              <p className="font-sans font-medium text-gray-900">LinkedIn</p>
              <p className="mt-0.5 font-sans text-sm font-normal text-gray-600">
                linkedin.com/in/kevindieu
              </p>
            </div>
            <span className="h-px min-w-[16px] flex-1 shrink bg-gray-200" aria-hidden />
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50/80 px-3 py-1.5 font-sans text-sm text-gray-700 hover:border-accent hover:bg-accent/5 hover:text-accent transition-colors"
            >
              <LinkedInIcon className="h-4 w-4" />
              Open
            </a>
          </div>
        </li>
      </ul>

      <footer className="pt-4">
        <Link
          href="/"
          className="font-sans text-sm text-gray-600 hover:text-accent transition-colors"
        >
          ← Home
        </Link>
      </footer>
    </article>
  );
}
