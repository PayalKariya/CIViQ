'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, MapPin } from 'lucide-react';
import { appHeaderSurfaceClass, appPageBackgroundClass } from '@/lib/app-shell';

type MarketingChromeProps = {
  children: React.ReactNode;
  homePage?: boolean;
};

function footerHref(homePage: boolean, id: string) {
  return homePage ? `#${id}` : `/#${id}`;
}

function SocialIcon({ children, label, href }: { children: React.ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
    >
      {children}
    </a>
  );
}

export function MarketingChrome({ children, homePage = false }: MarketingChromeProps) {
  const handleNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value?.trim();
    const q = email ? `&body=${encodeURIComponent(`Please add ${email} to civic updates.`)}` : '';
    window.location.href = `mailto:support@civiq.app?subject=CIViQ%2B%20updates${q}`;
  };

  return (
    <div className={`${appPageBackgroundClass} flex flex-col`}>
      <header className={appHeaderSurfaceClass}>
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold leading-tight text-transparent">
                CIViQ+
              </span>
              <p className="text-xs text-gray-600">Civic Voice Platform</p>
            </div>
          </Link>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">{children}</main>

      <div className="relative mt-auto">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-full h-12 w-full overflow-hidden text-white md:h-14"
          aria-hidden
        >
          <svg
            className="h-full w-full min-w-[800px]"
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M0,80V32C180,8 360,64 540,40C720,16 900,56 1080,36C1260,16 1320,28 1440,12V80H0Z"
            />
          </svg>
        </div>

        <footer className="relative border-t border-gray-200 bg-white text-gray-700">
          <div className="container mx-auto px-4 pb-8 pt-4 md:pb-10 md:pt-6">
            <div className="grid grid-cols-2 gap-10 border-b border-gray-100 pb-12 md:grid-cols-3 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-2">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-indigo-800">Platform</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li>
                    <Link href="/" className="transition-colors hover:text-blue-600">
                      Home
                    </Link>
                  </li>
                  <li>
                    <a href={footerHref(homePage, 'features')} className="transition-colors hover:text-blue-600">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href={footerHref(homePage, 'how-it-works')} className="transition-colors hover:text-blue-600">
                      How it works
                    </a>
                  </li>
                </ul>
              </div>
              <div className="lg:col-span-2">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-indigo-800">Account</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li>
                    <Link href="/login" className="transition-colors hover:text-blue-600">
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className="transition-colors hover:text-blue-600">
                      Create account
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="lg:col-span-2">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-indigo-800">Company</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li>
                    <a href={footerHref(homePage, 'about')} className="transition-colors hover:text-blue-600">
                      About
                    </a>
                  </li>
                  <li>
                    <a href={footerHref(homePage, 'contact')} className="transition-colors hover:text-blue-600">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div className="lg:col-span-2">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-indigo-800">Legal</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li>
                    <Link href="/privacy" className="transition-colors hover:text-blue-600">
                      Privacy policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="transition-colors hover:text-blue-600">
                      Terms of use
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-span-2 border-t border-gray-100 pt-10 md:col-span-3 md:border-t-0 md:pt-0 lg:col-span-4 lg:border-l lg:border-gray-100 lg:pl-8">
                <p className="mb-4 text-sm font-medium leading-snug text-gray-800">
                  Get updates on new features and civic engagement tips—we respect your inbox.
                </p>
                <form onSubmit={handleNewsletter} className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <Input
                    name="email"
                    type="email"
                    placeholder="Your email address"
                    className="h-11 rounded-full border border-gray-200 bg-white px-4 text-slate-900 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500/30 sm:min-w-0 sm:flex-1"
                    autoComplete="email"
                  />
                  <Button
                    type="submit"
                    className="h-11 shrink-0 rounded-full border-0 bg-gradient-to-r from-amber-300 to-yellow-400 px-6 font-semibold text-indigo-950 shadow-md hover:from-amber-200 hover:to-yellow-300"
                  >
                    Subscribe
                  </Button>
                </form>
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Connect</p>
                <div className="flex flex-wrap gap-2">
                  <SocialIcon label="X" href="https://twitter.com">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </SocialIcon>
                  <SocialIcon label="LinkedIn" href="https://linkedin.com">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </SocialIcon>
                  <SocialIcon label="GitHub" href="https://github.com">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </SocialIcon>
                  <SocialIcon label="Email" href="mailto:support@civiq.app">
                    <Mail className="h-4 w-4" aria-hidden />
                  </SocialIcon>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 pt-8 text-sm text-gray-500 md:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">CIViQ+</div>
                  <p className="text-gray-500">Civic Voice Platform</p>
                </div>
              </div>
              <p className="text-center md:text-left">© 2026 CIViQ+. All rights reserved.</p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                <Link href="/terms" className="transition-colors hover:text-blue-600">
                  Terms of use
                </Link>
                <Link href="/privacy" className="transition-colors hover:text-blue-600">
                  Privacy policy
                </Link>
                <a href={footerHref(homePage, 'contact')} className="transition-colors hover:text-blue-600">
                  Contact us
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
