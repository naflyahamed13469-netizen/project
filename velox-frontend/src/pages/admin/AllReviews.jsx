import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Eye, Pencil, Star, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AllReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspectModal, setInspectModal] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const getCustomerName = (review) => review.customerName || review.customer_name || 'Unknown Customer';
  const getReviewDate = (review) => review.reviewDate || review.review_date;
  const getRentalId = (review) => review.rentalId || review.rental_id;
  const getVehicleName = (review) => {
    if (review.vehicleName) return review.vehicleName;
    if (review.vehicle) return review.vehicle;
    const parts = [review.brand, review.model].filter(Boolean);
    return parts.length ? parts.join(' ') : 'Unknown Vehicle';
  };

  const handleInspect = async (reviewId) => {
    setInspectLoading(true);
    try {
      const res = await api.get(`/reviews/${reviewId}`);
      setInspectModal(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to load review details');
    } finally {
      setInspectLoading(false);
    }
  };

  const openEdit = (review) => {
    setEditModal(review);
    setEditForm({
      rating: Number(review.rating) || 1,
      comment: review.comment || '',
    });
  };

  const handleSaveEdit = async () => {
    const rating = Number(editForm.rating);
    const comment = editForm.comment?.trim();
    if (!rating || rating < 1 || rating > 5 || !comment) {
      toast.error('Rating and comment are required');
      return;
    }

    setSaveLoading(true);
    try {
      await api.put(`/reviews/${editModal.id}`, { rating, comment });
      toast.success('Review updated');
      setEditModal(null);
      await fetchReviews();
      if (inspectModal?.id === editModal.id) {
        const res = await api.get(`/reviews/${editModal.id}`);
        setInspectModal(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update review');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/reviews/${deleteModal.id}`);
      toast.success('Review deleted');
      setDeleteModal(null);
      if (inspectModal?.id === deleteModal.id) {
        setInspectModal(null);
      }
      await fetchReviews();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to delete review');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <div className="page-enter px-8 py-6 text-white/30">Loading...</div>;

  return (
    <div className="page-enter px-8 py-6">
      <h1 className="font-syne font-extrabold text-[32px] text-white mb-1">All Reviews</h1>
      <p className="text-white/35 text-sm mb-6">Monitor customer feedback across all rentals</p>

      <div className="flex items-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <Star size={24} className="fill-[#f59e0b] text-[#f59e0b]" />
          <span className="text-4xl font-syne font-extrabold text-[#f59e0b]">{avgRating}</span>
          <span className="text-sm text-white/25">/ 5</span>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div>
          <p className="text-2xl font-syne font-extrabold text-white">{reviews.length}</p>
          <p className="text-xs text-white/25">Total Reviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] hover:border-[#f59e0b]/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3 gap-2">
              <div>
                <h3 className="font-medium text-white/90 text-sm">{getCustomerName(r)}</h3>
                <span className="text-xs text-white/20">{getReviewDate(r) || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleInspect(r.id)}
                  className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Inspect review"
                  title="Inspect review"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => openEdit(r)}
                  className="p-1.5 text-[#f59e0b] hover:bg-[#f59e0b]/10 rounded-lg transition-colors"
                  aria-label="Edit review"
                  title="Edit review"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteModal(r)}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  aria-label="Delete review"
                  title="Delete review"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-xs text-white/25 mb-3">
              {getVehicleName(r)} &middot; Rental {getRentalId(r)}
            </p>
            <div className="flex items-center gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={star <= r.rating ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-white/10'}
                />
              ))}
            </div>
            <p className="text-sm text-white/40 leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>

      {inspectLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-6 py-4 text-white/70 text-sm">
            Loading review details...
          </div>
        </div>
      )}

      {inspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-syne font-bold text-lg text-white">Review Details</h3>
              <button
                onClick={() => setInspectModal(null)}
                className="text-white/35 hover:text-white transition-colors"
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-white/70"><span className="text-white/35">Customer:</span> {getCustomerName(inspectModal)}</p>
              <p className="text-white/70"><span className="text-white/35">Customer Email:</span> {inspectModal.customerEmail || inspectModal.customer_email || 'N/A'}</p>
              <p className="text-white/70"><span className="text-white/35">Vehicle:</span> {getVehicleName(inspectModal)}</p>
              <p className="text-white/70"><span className="text-white/35">Rental ID:</span> {getRentalId(inspectModal)}</p>
              <p className="text-white/70"><span className="text-white/35">Review Date:</span> {getReviewDate(inspectModal) || 'N/A'}</p>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    className={star <= inspectModal.rating ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-white/15'}
                  />
                ))}
              </div>
              <p className="text-white/65 whitespace-pre-wrap">{inspectModal.comment || 'No feedback comment.'}</p>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-syne font-bold text-lg text-white">Edit Review</h3>
              <button
                onClick={() => setEditModal(null)}
                className="text-white/35 hover:text-white transition-colors"
                aria-label="Close edit"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/40 mb-2">Rating</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditForm((prev) => ({ ...prev, rating: star }))}
                      className="transition-colors"
                    >
                      <Star
                        size={20}
                        className={star <= editForm.rating ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-white/15'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-white/40 mb-2">Feedback</p>
                <textarea
                  rows={4}
                  value={editForm.comment}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEditModal(null)}
                  className="px-4 py-2 text-sm text-white/40 border border-[#2a2a2a] rounded-lg hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saveLoading}
                  className="px-4 py-2 text-sm bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-60 text-black font-semibold rounded-lg transition-colors"
                >
                  {saveLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-syne font-bold text-lg text-white mb-2">Delete Review</h3>
            <p className="text-sm text-white/40 mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 text-sm text-white/40 border border-[#2a2a2a] rounded-lg hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
