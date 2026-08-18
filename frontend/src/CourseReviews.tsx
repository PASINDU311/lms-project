import React, { useEffect, useState } from 'react';
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
    <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50' }}>⭐ Student Reviews & Ratings</h3>

      {/* Summary Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f39c12' }}>
          {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
        </div>
        <div>
          <div style={{ color: '#f39c12', fontSize: '18px' }}>
            {renderStars(Math.round(avgRating))}
          </div>
          <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
            Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Write / Edit Review Form (Only for Enrolled Students) */}
      {isEnrolled && (
        <form onSubmit={handleSubmitReview} style={{ marginBottom: '25px', padding: '15px', border: '1px solid #3498db', borderRadius: '6px', backgroundColor: '#f0f8ff' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2980b9' }}>Leave or Update Your Review</h4>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Rating:</label>
            <select
              value={ratingInput}
              onChange={(e) => setRatingInput(Number(e.target.value))}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5/5 - Excellent)</option>
              <option value={4}>⭐⭐⭐⭐ (4/5 - Good)</option>
              <option value={3}>⭐⭐⭐ (3/5 - Average)</option>
              <option value={2}>⭐⭐ (2/5 - Poor)</option>
              <option value={1}>⭐ (1/5 - Terrible)</option>
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Comment:</label>
            <textarea
              rows={3}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Share your experience with this course..."
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <p style={{ fontSize: '14px', color: '#777' }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p style={{ fontSize: '14px', color: '#777' }}>No reviews yet. Be the first to review!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px', color: '#34495e' }}>{r.user?.name || 'Anonymous Student'}</strong>
                <span style={{ fontSize: '12px', color: '#95a5a6' }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              <div style={{ color: '#f39c12', fontSize: '14px', margin: '3px 0' }}>
                {renderStars(r.rating)}
              </div>
              {r.comment && <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#555' }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseReviews;