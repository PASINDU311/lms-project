import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import API from './api';

interface Assignment {
  id: number;
  section_id: number;
  title: string;
  description: string;
  max_marks: number;
  due_date?: string;
}

interface Submission {
  id: number;
  assignment_id: number;
  submission_url: string;
  content: string;
  marks?: number;
  feedback?: string;
  status: string;
  created_at: string;
}

interface Props {
  sectionId: number;
}

// Helper component for live countdown calculation
const CountdownBadge: React.FC<{ dueDate: string }> = ({ dueDate }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; expired: boolean }>({
    days: 0, hours: 0, minutes: 0, seconds: 0, expired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(dueDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [dueDate]);

  if (timeLeft.expired) {
    return (
      <span style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
        🚫 Deadline Passed
      </span>
    );
  }

  return (
    <span style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
      ⏳ Due in: {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  );
};

const AssignmentPlayer: React.FC<Props> = ({ sectionId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<{ [key: number]: Submission }>({});
  const [submissionContent, setSubmissionContent] = useState<{ [key: number]: string }>({});
  const [submissionUrl, setSubmissionUrl] = useState<{ [key: number]: string }>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>('STUDENT');

  useEffect(() => {
    API.get('/profile')
      .then((res) => {
        if (res.data?.user?.role) {
          setUserRole(res.data.user.role);
        }
      })
      .catch(() => console.log('Could not fetch user profile'));

    fetchAssignmentsAndSubmissions();
  }, [sectionId]);

  const fetchAssignmentsAndSubmissions = async () => {
    try {
      const res = await API.get(`/assignments/section/${sectionId}`);
      const assignList: Assignment[] = res.data.assignments || [];
      setAssignments(assignList);

      assignList.forEach(async (a) => {
        try {
          const subRes = await API.get(`/assignments/${a.id}/my-submission`);
          if (subRes.data.submission) {
            setSubmissions((prev) => ({ ...prev, [a.id]: subRes.data.submission }));
          }
        } catch (err) {
          // No submission yet
        }
      });
    } catch (err) {
      console.error('Failed to load assignments', err);
    }
  };

  const handleSubmit = async (assignmentId: number) => {
    setSubmitting(assignmentId);
    try {
      await API.post('/assignments/submit', {
        assignment_id: assignmentId,
        content: submissionContent[assignmentId] || '',
        submission_url: submissionUrl[assignmentId] || '',
      });
      alert('Assignment submitted successfully!');
      fetchAssignmentsAndSubmissions();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(null);
    }
  };

  if (assignments.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: 24,
        padding: 24,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <span style={{ fontSize: 20 }}>📝</span>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
            Section Assignments
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: '#64748b' }}>
            Complete the assignments below before the deadline.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {assignments.map((a) => {
          const submission = submissions[a.id];
          const isExpired = a.due_date ? new Date(a.due_date).getTime() < new Date().getTime() : false;

          return (
            <div
              key={a.id}
              style={{
                backgroundColor: '#f8fafc',
                padding: 20,
                borderRadius: 12,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                    {a.title}
                  </h4>
                  <p style={{ fontSize: 13.5, color: '#475569', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    {a.description}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {a.due_date && <CountdownBadge dueDate={a.due_date} />}
                  <span
                    style={{
                      backgroundColor: '#e0e7ff',
                      color: '#3730a3',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 20,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Max Marks: {a.max_marks}
                  </span>
                </div>
              </div>

              {/* Instructor / Admin View */}
              {userRole === 'ADMIN' || userRole === 'INSTRUCTOR' ? (
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>ℹ️</span> Instructor/Admin View: Submissions and Grading options are available in Course Builder.
                </div>
              ) : submission ? (
                /* Student: Submission Status & Grade View */
                <div
                  style={{
                    padding: 16,
                    background: submission.status === 'GRADED' ? '#f0fdf4' : '#fffbeb',
                    border: `1px solid ${submission.status === 'GRADED' ? '#bbf7d0' : '#fef08a'}`,
                    borderRadius: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: submission.status === 'GRADED' ? '#15803d' : '#b45309',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {submission.status === 'GRADED' ? '✓ Graded' : '⏳ Submitted (Pending Review)'}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      Submitted on: {new Date(submission.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {submission.status === 'GRADED' && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        background: '#ffffff',
                        borderRadius: 8,
                        border: '1px solid #86efac',
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#15803d' }}>
                        🎯 Your Grade: {submission.marks} / {a.max_marks}
                      </div>
                      {submission.feedback && (
                        <p style={{ margin: '6px 0 0 0', fontSize: 13, color: '#334155' }}>
                          💬 <strong>Instructor Feedback:</strong> {submission.feedback}
                        </p>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: 12, fontSize: 13, color: '#334155', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {submission.content && (
                      <div>
                        <strong>Your Answer:</strong> {submission.content}
                      </div>
                    )}
                    {submission.submission_url && (
                      <div>
                        <strong>Your Link:</strong>{' '}
                        <a
                          href={submission.submission_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#4f46e5', textDecoration: 'underline', fontWeight: 500 }}
                        >
                          {submission.submission_url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : isExpired ? (
                /* Deadline Passed Box */
                <div
                  style={{
                    marginTop: 12,
                    padding: 16,
                    background: '#fef2f2',
                    borderRadius: 10,
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    fontSize: 13.5,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  ⚠️ The deadline for this assignment has passed. Submissions are now closed.
                </div>
              ) : (
                /* Student: Submission Form */
                <div
                  style={{
                    marginTop: 12,
                    padding: 16,
                    background: '#ffffff',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ marginBottom: 14 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: 6,
                      }}
                    >
                      Text Answer / Notes:
                    </label>
                    <textarea
                      rows={3}
                      value={submissionContent[a.id] || ''}
                      onChange={(e) => setSubmissionContent({ ...submissionContent, [a.id]: e.target.value })}
                      placeholder="Type your submission content here..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        boxSizing: 'border-box',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13.5,
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: 6,
                      }}
                    >
                      Submission Link (GitHub / Google Drive / PDF):
                    </label>
                    <input
                      type="url"
                      value={submissionUrl[a.id] || ''}
                      onChange={(e) => setSubmissionUrl({ ...submissionUrl, [a.id]: e.target.value })}
                      placeholder="https://..."
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        boxSizing: 'border-box',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 13.5,
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSubmit(a.id)}
                    disabled={submitting === a.id}
                    style={{
                      padding: '9px 18px',
                      backgroundColor: submitting === a.id ? '#cbd5e1' : '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      cursor: submitting === a.id ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: 13.5,
                      boxShadow: submitting === a.id ? 'none' : '0 2px 6px rgba(79, 70, 229, 0.2)',
                    }}
                  >
                    {submitting === a.id ? 'Submitting...' : 'Submit Assignment'}
                  </motion.button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AssignmentPlayer;