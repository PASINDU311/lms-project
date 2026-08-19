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

  const cardAccentColors = ['#2B4A3E', '#3D5A73', '#B98A1E', '#B5482F'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: 30,
        padding: 28,
        backgroundColor: '#FFFFFF',
        border: '1px solid #E4DFD1',
        borderTop: '3px solid #2B4A3E',
        borderRadius: 10,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}
      </style>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid #E4DFD1',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#201F1C"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: '#201F1C',
              fontFamily: "'Fraunces', serif",
            }}
          >
            Student Evaluation Ledger
          </h3>
        </div>

        {/* Enrollment Stamp */}
        {isEnrolled && (
          <div
            style={{
              transform: 'rotate(28deg)',
              backgroundColor: '#E7EEE9',
              color: '#2B4A3E',
              border: '1.5px solid #2B4A3E',
              padding: '2px 8px',
              borderRadius: '4px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              pointerEvents: 'none',
            }}
          >
            ENROLLED
          </div>
        )}
      </div>

      {/* Summary Header — Report-Card Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          marginBottom: 24,
          backgroundColor: '#FAF8F3',
          border: '1px solid #E4DFD1',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderRight: '1px solid #E4DFD1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#A39C8C',
              fontFamily: "'IBM Plex Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}
          >
            AVERAGE SCORE
          </span>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#201F1C',
              fontFamily: "'IBM Plex Mono', monospace",
              lineHeight: 1.1,
            }}
          >
            {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}{' '}
            <span style={{ fontSize: 13, color: '#A39C8C', fontWeight: 400 }}>/ 5.0</span>
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderRight: '1px solid #E4DFD1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#A39C8C',
              fontFamily: "'IBM Plex Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}
          >
            OVERALL RATING
          </span>
          <div
            style={{
              color: '#B98A1E',
              fontSize: 16,
              letterSpacing: '2px',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {renderStars(Math.round(avgRating))}
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#A39C8C',
              fontFamily: "'IBM Plex Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}
          >
            TOTAL EVALUATIONS
          </span>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#201F1C',
              fontFamily: "'IBM Plex Mono', monospace",
              lineHeight: 1.1,
            }}
          >
            {totalReviews}
          </div>
        </div>
      </div>

      {/* Write / Edit Review Form — Card-Catalog Intake Slip Style */}
      {isEnrolled && (
        <form
          onSubmit={handleSubmitReview}
          style={{
            marginBottom: 28,
            padding: 20,
            border: '1.5px dashed #D2CBB8',
            borderRadius: 8,
            backgroundColor: '#FAF8F3',
          }}
        >
          <h4
            style={{
              margin: '0 0 14px 0',
              fontSize: 15,
              fontWeight: 600,
              color: '#201F1C',
              fontFamily: "'Fraunces', serif",
            }}
          >
            File Evaluation Entry
          </h4>

          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                color: '#6B6558',
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              RATING SCORE:
            </label>
            <select
              value={ratingInput}
              onChange={(e) => setRatingInput(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                borderRadius: 7,
                border: '1px solid #E4DFD1',
                fontSize: 13,
                fontFamily: "'IBM Plex Mono', monospace",
                backgroundColor: '#FFFFFF',
                color: '#201F1C',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={5}>5 / 5 — EXCELLENT</option>
              <option value={4}>4 / 5 — GOOD</option>
              <option value={3}>3 / 5 — AVERAGE</option>
              <option value={2}>2 / 5 — POOR</option>
              <option value={1}>1 / 5 — TERRIBLE</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                color: '#6B6558',
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              STUDENT REMARKS:
            </label>
            <textarea
              rows={3}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Record your experience with this course..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 7,
                border: '1px solid #E4DFD1',
                boxSizing: 'border-box',
                fontSize: 13.5,
                outline: 'none',
                backgroundColor: '#FFFFFF',
                color: '#201F1C',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={submitting}
            style={{
              padding: '9px 18px',
              backgroundColor: submitting ? '#E4DFD1' : '#2B4A3E',
              color: submitting ? '#A39C8C' : '#FAF8F3',
              border: 'none',
              borderRadius: 7,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>{submitting ? 'Filing Entry...' : 'Submit Evaluation'}</span>
            {!submitting && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </motion.button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <p
          style={{
            fontSize: 12,
            color: '#A39C8C',
            fontFamily: "'IBM Plex Mono', monospace",
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Loading evaluation records...
        </p>
      ) : reviews.length === 0 ? (
        <div
          style={{
            padding: 24,
            border: '1.5px dashed #D2CBB8',
            borderRadius: 8,
            backgroundColor: '#FAF8F3',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: '#A39C8C',
              fontFamily: "'IBM Plex Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            No evaluation records filed for this course.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map((r, idx) => {
            const authorName = r.user?.name || 'Anonymous Student';
            const initial = authorName.charAt(0).toUpperCase();
            const accentColor = cardAccentColors[idx % cardAccentColors.length];

            return (
              <div
                key={r.id}
                style={{
                  backgroundColor: '#FAF8F3',
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid #E4DFD1',
                  borderTop: `3px solid ${accentColor}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        backgroundColor: '#E7EEE9',
                        color: '#2B4A3E',
                        fontWeight: 600,
                        fontSize: 12,
                        fontFamily: "'IBM Plex Mono', monospace",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #2B4A3E',
                      }}
                    >
                      {initial}
                    </div>
                    <strong
                      style={{
                        fontSize: 14,
                        color: '#201F1C',
                        fontWeight: 600,
                        fontFamily: "'Fraunces', serif",
                      }}
                    >
                      {authorName}
                    </strong>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#A39C8C',
                      fontFamily: "'IBM Plex Mono', monospace",
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div
                  style={{
                    color: '#B98A1E',
                    fontSize: 13,
                    margin: '8px 0 4px 40px',
                    letterSpacing: '1px',
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {renderStars(r.rating)}
                </div>

                {r.comment && (
                  <p style={{ margin: '4px 0 0 40px', fontSize: 13.5, color: '#6B6558', lineHeight: 1.5 }}>
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