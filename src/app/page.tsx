'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketingChrome } from '@/components/MarketingChrome';
import Link from 'next/link';
import { marketingContentCardClassName, marketingWindowPanelClassName, sectionBadgeClassName } from '@/lib/marketing-section-styles';
import {
  MapPin,
  Shield,
  Users,
  Bell,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Activity,
  Award,
  ArrowRight,
  MessageSquare,
  Mail,
  ListOrdered,
} from 'lucide-react';

export default function Home() {
  return (
    <MarketingChrome homePage>
      <div className="relative overflow-x-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        >
          <div className="absolute top-24 left-1/2 h-72 w-[min(100%,42rem)] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-200/40 via-indigo-200/30 to-purple-200/40 blur-3xl" />
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-16 pb-20 md:pt-20 md:pb-24 text-center">
          <Badge className={`mb-5 ${sectionBadgeClassName}`} variant="secondary">
            <Activity className="shrink-0" />
            Transforming Civic Engagement
          </Badge>
          <h1 className="mx-auto mb-6 max-w-4xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-5xl font-bold leading-[1.1] tracking-tight text-transparent md:text-6xl">
            Not Just Civic,
            <br />
            A Unified Voice Returns
            <br />
            with a Response
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-gray-600">
            Report civic issues, track resolutions in real time, and help build a more responsive community—with
            transparency, clear accountability, and tools designed for both citizens and authorities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
            <Link href="/signup" className="sm:inline-flex">
              <Button size="lg" className="h-12 w-full px-8 text-lg shadow-md shadow-blue-600/20 sm:w-auto">
                Report an Issue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" className="sm:inline-flex">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full border-gray-200 bg-white/70 px-8 text-lg hover:bg-white sm:w-auto"
              >
                View Map
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto scroll-mt-24 px-4 py-16 md:py-20">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <Badge className={`mb-4 ${sectionBadgeClassName}`} variant="secondary">
              Features
            </Badge>
            <h2 className="mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              Built for real civic workflows
            </h2>
            <p className="text-lg text-gray-600">
              From first report to closure, CIViQ+ connects citizens, field teams, and administrators on one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: MapPin,
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
                title: 'Interactive map',
                body:
                  'See complaints on a live map with clustering in busy areas. Understand patterns by neighborhood and priority.',
              },
              {
                icon: CheckCircle,
                iconBg: 'bg-green-100',
                iconColor: 'text-green-600',
                title: 'Real-time tracking',
                body:
                  'Follow each case from submission to resolution with status history and timely updates you can rely on.',
              },
              {
                icon: Shield,
                iconBg: 'bg-purple-100',
                iconColor: 'text-purple-600',
                title: 'Anonymous reporting',
                body:
                  'Submit sensitive issues without revealing your identity when you need an extra layer of privacy and safety.',
              },
              {
                icon: Users,
                iconBg: 'bg-orange-100',
                iconColor: 'text-orange-600',
                title: 'Role-based access',
                body:
                  'Dedicated experiences for citizens, authorities, and administrators—each role sees the right data and actions.',
              },
              {
                icon: AlertTriangle,
                iconBg: 'bg-red-100',
                iconColor: 'text-red-600',
                title: 'Smart escalation',
                body:
                  'Unresolved items can move up the chain automatically so nothing stalls unnoticed at the wrong level.',
              },
              {
                icon: Award,
                iconBg: 'bg-indigo-100',
                iconColor: 'text-indigo-600',
                title: 'Trust & accountability',
                body:
                  'Reputation signals encourage fair reporting and dependable responses from everyone in the system.',
              },
              {
                icon: Bell,
                iconBg: 'bg-sky-100',
                iconColor: 'text-sky-600',
                title: 'Notifications',
                body:
                  'Stay informed when your complaint changes state or when authorities need clarification or confirmation.',
              },
              {
                icon: TrendingUp,
                iconBg: 'bg-emerald-100',
                iconColor: 'text-emerald-600',
                title: 'Insights for teams',
                body:
                  'Trends and workload visibility help departments plan resources and demonstrate progress to leadership.',
              },
              {
                icon: MessageSquare,
                iconBg: 'bg-violet-100',
                iconColor: 'text-violet-600',
                title: 'Structured dialogue',
                body:
                  'Keep conversation and evidence attached to the case so context is never scattered across channels.',
              },
            ].map((item) => (
              <Card
                key={item.title}
                className={`${marketingContentCardClassName} transition-shadow hover:shadow-xl hover:shadow-indigo-900/[0.06]`}
              >
                <CardContent className="p-8">
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${item.iconBg}`}
                  >
                    <item.icon className={`h-7 w-7 ${item.iconColor}`} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="container mx-auto scroll-mt-24 px-4 py-12 md:py-16">
          <div className={marketingWindowPanelClassName}>
            <div className="mx-auto mb-10 max-w-xl text-center">
              <Badge className={`mb-4 ${sectionBadgeClassName}`} variant="secondary">
                <ListOrdered className="shrink-0" />
                Steps
              </Badge>
              <h2 className="mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                How it works
              </h2>
              <p className="text-lg text-gray-600">Three simple steps from voice to verified action.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 md:gap-10">
              {[
                {
                  step: '1',
                  title: 'Report with context',
                  text: 'Describe the issue, attach photos if helpful, and place it on the map so responders know exactly where to act.',
                },
                {
                  step: '2',
                  title: 'Authority triage',
                  text: 'The right department receives the case, updates status, and can request details—keeping you in the loop.',
                },
                {
                  step: '3',
                  title: 'Resolve & learn',
                  text: 'Closure is recorded with accountability. Patterns feed better service over time across your community.',
                },
              ].map((s) => (
                <div key={s.step} className="relative text-center md:text-left">
                  <div className="mx-auto md:mx-0 mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md">
                    {s.step}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">{s.title}</h3>
                  <p className="text-gray-600">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="scroll-mt-24 border-t border-white/50">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className={marketingWindowPanelClassName}>
              <div className="mx-auto mb-10 max-w-xl text-center">
                <Badge className={`mb-4 ${sectionBadgeClassName}`} variant="secondary">
                  <Shield className="shrink-0" />
                  About CIViQ+
                </Badge>
                <h2 className="mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                  Civic technology with clarity
                </h2>
                <p className="text-lg text-gray-600">
                  Who we serve and what CIViQ+ is built to do for your community.
                </p>
              </div>
              <div className="mx-auto max-w-3xl space-y-4 text-gray-600">
                <p>
                  CIViQ+ is a civic complaint and engagement platform that helps residents report issues—such as
                  infrastructure, sanitation, safety, and public services—and follow them through to resolution alongside
                  the authorities responsible for action.
                </p>
                <p>
                  We believe accountability grows when reporting is easy, status is visible, and every voice can receive a
                  structured response. The product supports citizens who submit and track complaints, authority staff who
                  manage and resolve them, and administrators who oversee verification and system health.
                </p>
                <p>
                  By combining mapping, workflows, notifications, and role-based dashboards, CIViQ+ aims to reduce friction
                  between the public and the institutions that serve them—without replacing official processes, but making
                  them easier to navigate for everyone involved.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-24 border-t border-white/50">
          <div className="container mx-auto max-w-3xl px-4 py-16 text-center md:py-20">
            <h2 className="mb-4 inline-flex items-center justify-center gap-3 text-4xl font-bold tracking-tight">
              <Mail className="h-8 w-8 shrink-0 text-indigo-600" aria-hidden />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Contact
              </span>
            </h2>
            <p className="mx-auto mb-6 max-w-lg text-xl text-gray-600">
              Questions about CIViQ+, partnerships, or support for your organization? Reach out—we read every message.
            </p>
            <a
              href="mailto:support@civiq.app"
              className="inline-flex font-medium text-blue-600 transition-colors hover:text-indigo-600 hover:underline"
            >
              support@civiq.app
            </a>
          </div>
        </section>
      </div>
    </MarketingChrome>
  );
}
