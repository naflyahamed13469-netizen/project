import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reviews() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [hoverRatings, setHoverRatings] = useState({});
  const [submitted, setSubmitted] = useState(new Set());

  useEffect(() => {
    Promise.all([
      api.get('/rentals'),
      api.get('/reviews'),
    ])
      .then(([rRes, rvRes]) => {
        setRentals(rRes.data);
        setReviews(rvRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const myRentals = rentals.filter((r) => r.customer_id === user?.id && (r.status === 'Completed' || r.status === 'Active'));
  const myReviews = reviews.filter((r) => r.customer_id === user?.id);
  const reviewedRentalIds = new Set(myReviews.map((r) => r.rental_id));

  const handleSubmit = async (rentalId) => {
    const rating = ratings[rentalId];
    const comment = comments[rentalId];
    if (!rating || !comment?.trim()) {
      toast.error('Please provide a rating and comment');
      return;
    }
    try {
      await api.post('/reviews', { rental_id: rentalId, rating, comment });
      const rvRes = await api.get('/reviews');
      setReviews(rvRes.data);
      setSubmitted((prev) => new Set([...prev, rentalId]));
      toast.success('Feedback submitted!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  if (loading) return <div className="page-enter px-8 py-6 text-white/30">Loading...</div>;

  return (
    <div className="page-enter px-8 py-6">
      <h1 className="font-syne font-extrabold text-[32px] text-white mb-1">Reviews & Feedback</h1>
      <p className="text-white/35 text-sm mb-6">Share your rental experience</p>

      <div className="space-y-4">
        {myRentals.map((r) => {
          const existingReview = myReviews.find((rv) => rv.rental_id === r.id);
          const isSubmitted = submitted.has(r.id) || reviewedRentalIds.has(r.id);
          const isActive = r.status === 'Active';

          return (
            <div key={r.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-syne font-bold text-white/90">
                    {r.brand} {r.model}
                  </h3>
                  <p className="text-xs text-white/25 mt-0.5">{new Date(r.start_date).toLocaleDateString()} to {new Date(r.end_date).toLocaleDateString()}</p>
                  {isActive && <p className="text-xs text-[#f59e0b] mt-1">🟢 Rental in progress - Share feedback anytime</p>}
                </div>
              </div>

              {isSubmitted ? (
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <= (existingReview?.rating || ratings[r.id])
                            ? 'fill-[#f59e0b] text-[#f59e0b]'
                            : 'text-white/15'
                        }
                      />
                    ))}
                    <span className="text-xs text-white/25 ml-2">
                      {existingReview?.review_date || 'Today'}
                    </span>
                  </div>
                  <p className="text-sm text-white/50">
                    {existingReview?.comment || comments[r.id]}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRatings((prev) => ({ ...prev, [r.id]: star }))}
                        onMouseLeave={() => setHoverRatings((prev) => ({ ...prev, [r.id]: 0 }))}
                        onClick={() => setRatings((prev) => ({ ...prev, [r.id]: star }))}
                        className="transition-colors"
                      >
                        <Star
                          size={20}
                          className={
                            star <= (hoverRatings[r.id] || ratings[r.id] || 0)
                              ? 'fill-[#f59e0b] text-[#f59e0b]'
                              : 'text-white/15'
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comments[r.id] || ''}
                    onChange={(e) => setComments((prev) => ({ ...prev, [r.id]: e.target.value }))}
                    placeholder="Share your experience..."
                    rows={2}
                    className="w-full px-4 py-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors resize-none"
                  />
                  <button
                    onClick={() => handleSubmit(r.id)}
                    className="mt-3 px-5 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-sm rounded-lg transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {myRentals.length === 0 && (
          <p className="text-white/30 text-sm text-center py-12">No active or completed rentals to provide feedback on yet.</p>
        )}
      </div>
    </div>
  );
}
