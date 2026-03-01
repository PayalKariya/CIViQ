'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
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
  ArrowRight
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CIViQ+
              </h1>
              <p className="text-xs text-gray-600">Civic Voice Platform</p>
            </div>
          </div>
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4" variant="secondary">
          <Activity className="w-3 h-3 mr-1" />
          Transforming Civic Engagement
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Not Just Civic,
          <br />A Unified Voice Returns
          <br />with a Response
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Report civic issues, track resolutions in real-time, and be part of building a better community. 
          Transparent, accountable, and citizen-driven.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="text-lg">
              Report an Issue
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg">
              View Map
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-blue-600">50+</div>
            <div className="text-sm text-gray-600">Active Complaints</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-green-600">11</div>
            <div className="text-sm text-gray-600">Resolved Issues</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-purple-600">21</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-orange-600">92%</div>
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-600 text-lg">Everything you need for effective civic engagement</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Interactive Map</h3>
              <p className="text-gray-600">
                View all complaints on an interactive map with clustering for high-density areas. 
                See what's happening in your neighborhood.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-Time Tracking</h3>
              <p className="text-gray-600">
                Track your complaints from submission to resolution. Get instant notifications 
                on status updates and responses.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Anonymous Reporting</h3>
              <p className="text-gray-600">
                Report sensitive issues anonymously without fear. Your privacy and safety 
                are our top priorities.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Role-Based Access</h3>
              <p className="text-gray-600">
                Separate dashboards for citizens, authorities, and admins. Everyone sees 
                what they need to see.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Escalation</h3>
              <p className="text-gray-600">
                Automatic escalation of unresolved complaints. No issue gets forgotten 
                or ignored.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Trust Scoring</h3>
              <p className="text-gray-600">
                Reputation system for both citizens and authorities. Promotes accountability 
                and responsible reporting.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of citizens making their voices heard and creating positive change
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg">
                Create Free Account
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg bg-white/10 hover:bg-white/20 text-white border-white">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">CIViQ+</div>
                <div className="text-xs text-gray-600">© 2025 All rights reserved</div>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600">About</a>
              <a href="#" className="hover:text-blue-600">Privacy</a>
              <a href="#" className="hover:text-blue-600">Terms</a>
              <a href="#" className="hover:text-blue-600">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}