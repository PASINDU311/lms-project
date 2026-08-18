import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import API from './api';

interface User {
  id: number;
  name: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user?: User;
}

interface Props {
  courseId: number;
  isEnrolled?: boolean;
}

const CourseReviews: React.FC<Props> = ({ courseId, isEnrolled = false }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const fetchReviews = () => {
    setLoading(true);
    API.get(`/courses/${courseId}/reviews`)
      .then((res) => {
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avg_rating || 0);
        setTotalReviews(res.data.total_reviews || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch reviews', err);
        setLoading(false);
      });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await API.post('/reviews', {
        course_id: Number(courseId),
        rating: Number(ratingInput),
        comment: commentInput,
      });
      alert('Review submitted successfully!');
      setCommentInput('');
      fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count: number) => {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: 30,
        padding: 28,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
        ⭐ Student Reviews & Ratings
      </h3>

      {/* Summary Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 24,
          background: '#f8fafc',
          padding: 20,
          borderRadius: 12,
          border: '1px solid #f1f5f9',
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
          {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
        </div>
        <div>
          <div style={{ color: '#f59e0b', fontSize: 20, letterSpacing: '1px' }}>
            {renderStars(Math.round(avgRating))}
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
            Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Write / Edit Review Form (Only for Enrolled Students) */}
      {isEnrolled && (
        <form
          onSubmit={handleSubmitReview}
          style={{
            marginBottom: 28,
            padding: 20,
            border: '1px solid #e0e7ff',
            borderRadius: 12,
            backgroundColor: '#f5f3ff',
          }}
        >
          <h4 style={{ margin: '0 0 14px 0', fontSize: 15, fontWeight: 700, color: '#4338ca' }}>
            Leave or Update Your Review
          </h4>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Rating:
            </label>
            <select
              value={ratingInput}
              onChange={(e) => setRatingInput(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13.5,
                backgroundColor: '#ffffff',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5/5 - Excellent)</option>
              <option value={4}>⭐⭐⭐⭐ (4/5 - Good)</option>
              <option value={3}>⭐⭐⭐ (3/5 - Average)</option>
              <option value={2}>⭐⭐ (2/5 - Poor)</option>
              <option value={1}>⭐ (1/5 - Terrible)</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Comment:
            </label>
            <textarea
              rows={3}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Share your experience with this course..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box',
                fontSize: 13.5,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={submitting}
            style={{
              padding: '9px 20px',
              backgroundColor: submitting ? '#cbd5e1' : '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: 13.5,
              boxShadow: submitting ? 'none' : '0 2px 6px rgba(79, 70, 229, 0.2)',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </motion.button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <p style={{ fontSize: 13.5, color: '#64748b' }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p style={{ fontSize: 13.5, color: '#64748b', fontStyle: 'italic' }}>
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map((r) => {
            const authorName = r.user?.name || 'Anonymous Student';
            const initial = authorName.charAt(0).toUpperCase();

            return (
              <div
                key={r.id}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: '#e0e7ff',
                        color: '#4338ca',
                        fontWeight: 700,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {initial}
                    </div>
                    <strong style={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>{authorName}</strong>
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ color: '#f59e0b', fontSize: 14, margin: '6px 0 4px 42px', letterSpacing: '0.5px' }}>
                  {renderStars(r.rating)}
                </div>
                {r.comment && (
                  <p style={{ margin: '4px 0 0 42px', fontSize: 13.5, color: '#475569', lineHeight: 1.5 }}>
                    {r.comment}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default CourseReviews;