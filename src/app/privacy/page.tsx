import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingChrome } from '@/components/MarketingChrome';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { marketingWindowPanelClassName, sectionBadgeClassName } from '@/lib/marketing-section-styles';

export const metadata: Metadata = {
  title: 'Privacy Policy | CIViQ+',
  description: 'How CIViQ+ handles your information.',
};

export default function PrivacyPage() {
  return (
    <MarketingChrome>
      <div className="relative overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute top-16 left-1/2 h-64 w-[min(100%,42rem)] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-200/40 via-indigo-200/30 to-purple-200/40 blur-3xl" />
        </div>
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className={marketingWindowPanelClassName}>
            <div className="mx-auto mb-10 max-w-xl text-center">
              <Badge className={`mb-4 ${sectionBadgeClassName}`} variant="secondary">
                <Lock className="shrink-0" />
                Privacy
              </Badge>
              <h1 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                Privacy overview
              </h1>
            </div>
            <div className="mx-auto max-w-3xl space-y-5 text-base leading-relaxed text-slate-600">
              <p>
                This overview describes how CIViQ+ treats information in connection with the service. For regulated
                environments you may need a standalone legal agreement; this page is a plain-language summary for users of
                the application.
              </p>
              <div>
                <h2 className="mb-2 text-lg font-semibold text-slate-900">What we collect</h2>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Account details you provide at registration (such as name, email, and role).</li>
                  <li>
                    Complaint content you submit, including descriptions, optional images, and location when you place a
                    pin on the map.
                  </li>
                  <li>
                    Operational data needed to run the service (such as sign-in events and device/browser metadata
                    typical of web applications).
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="mb-2 text-lg font-semibold text-slate-900">How we use it</h2>
                <p>
                  We use this information to authenticate users, route complaints to the right teams, show status and
                  history, send notifications you expect as part of the workflow, and maintain security and reliability of
                  the platform.
                </p>
              </div>
              <div>
                <h2 className="mb-2 text-lg font-semibold text-slate-900">Sharing</h2>
                <p>
                  Complaint data is visible to authorized roles in the system (for example, relevant authority staff and
                  administrators) as required to investigate and resolve issues. We do not sell personal data.
                </p>
              </div>
              <div>
                <h2 className="mb-2 text-lg font-semibold text-slate-900">Retention & your choices</h2>
                <p>
                  Records may be retained for as long as needed for case management, auditing, and legal obligations. You
                  can reach us through{' '}
                  <Link href="/#contact" className="font-medium text-blue-600 hover:text-indigo-600 hover:underline">
                    Contact
                  </Link>{' '}
                  on the home page or email{' '}
                  <a
                    href="mailto:support@civiq.app"
                    className="font-medium text-blue-600 hover:text-indigo-600 hover:underline"
                  >
                    support@civiq.app
                  </a>{' '}
                  regarding access, correction, or deletion requests where applicable law allows.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MarketingChrome>
  );
}
