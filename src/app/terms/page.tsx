import type { Metadata } from 'next';
import { MarketingChrome } from '@/components/MarketingChrome';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { marketingWindowPanelClassName, sectionBadgeClassName } from '@/lib/marketing-section-styles';

export const metadata: Metadata = {
  title: 'Terms of Use | CIViQ+',
  description: 'Terms and conditions for using CIViQ+.',
};

export default function TermsPage() {
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
                <FileText className="shrink-0" />
                Terms
              </Badge>
              <h1 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                Terms of use
              </h1>
            </div>
            <div className="mx-auto max-w-3xl space-y-5 text-base leading-relaxed text-slate-600">
              <p>
                By accessing or using CIViQ+, you agree to these terms. If you do not agree, please do not use the service.
              </p>
              <div>
                <h2 className="mb-2 text-lg font-semibold text-slate-900">Use of the service</h2>
                <p>
                  You may use CIViQ+ only for lawful purposes and in line with any policies communicated by your
                  organization if you access the product through an institutional deployment. You must provide accurate
                  information where required and keep your credentials secure.
                </p>
              </div>
              <div>
                <h2 className="mb-2 text-lg font-semibold text-slate-900">User content</h2>
                <p>
                  You are responsible for content you submit. Do not upload unlawful, harassing, or misleading material.
                  Reports should reflect genuine civic issues to the best of your knowledge. Authorities and
                  administrators may moderate or reject content that violates policy or operational rules.
                </p>
              </div>
              <div>
                <h2 className="mb-2 text-lg font-semibold text-slate-900">Accounts</h2>
                <p>
                  We may suspend or terminate accounts that abuse the platform, compromise security, or breach these
                  terms. Some roles (such as authority accounts) may require verification before full access is granted.
                </p>
              </div>
              <div>
                <h2 className="mb-2 text-lg font-semibold text-slate-900">Disclaimers</h2>
                <p>
                  The service is provided &quot;as is&quot; to the extent permitted by law. Response times and outcomes
                  depend on participating agencies and real-world constraints; CIViQ+ facilitates reporting and tracking
                  but does not guarantee a particular resolution.
                </p>
              </div>
              <div>
                <h2 className="mb-2 text-lg font-semibold text-slate-900">Changes</h2>
                <p>
                  We may update these terms or the product from time to time. Continued use after changes constitutes
                  acceptance of the updated terms where permitted by law.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MarketingChrome>
  );
}
