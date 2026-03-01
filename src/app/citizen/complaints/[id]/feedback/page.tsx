'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CitizenFeedbackPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [complaint, setComplaint] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && params.id) {
      fetchComplaint();
    }
  }, [user, params.id]);

  const fetchComplaint = async () => {
    try {
      const res = await fetch(`/api/complaints/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch complaint');
      const data = await res.json();
      setComplaint(data);
    } catch (err) {
      console.error(err);
      toast.error('Error loading complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/complaints/${params.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          rating,
          comment,
          type: 'citizen_to_authority',
        }),
      });

      if (!res.ok) throw new Error('Failed to submit feedback');
      
      await refreshUser();
      setIsSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (err) {
      console.error(err);
      toast.error('Error submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  if (isSubmitted) {
    return (
      <ProtectedRoute allowedRoles={['citizen']}>
        <DashboardLayout title="Feedback Submitted">
          <Card className="max-w-md mx-auto mt-12">
            <CardContent className="pt-12 pb-12 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Feedback Received!</h2>
              <p className="text-gray-600">
                Your feedback helps us improve our services. The authority's trust score has been updated accordingly.
              </p>
              <Button onClick={() => router.push('/citizen')} className="mt-4">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['citizen']}>
      <DashboardLayout title="Give Feedback">
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Rate Resolution for Complaint #{params.id}</CardTitle>
              <CardDescription>
                {complaint?.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4 py-4">
                <p className="font-medium text-lg">Overall Satisfaction</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none transition-transform active:scale-90"
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hover || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {rating === 1 && 'Very Dissatisfied'}
                  {rating === 2 && 'Dissatisfied'}
                  {rating === 3 && 'Neutral'}
                  {rating === 4 && 'Satisfied'}
                  {rating === 5 && 'Very Satisfied'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Comments (Optional)</label>
                <Textarea
                  placeholder="Tell us about your experience with the resolution..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <Button
                className="w-full h-12 text-lg"
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
