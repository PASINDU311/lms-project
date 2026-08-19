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
      <span
        style={{
          background: '#FBEAE3',
          color: '#B5482F',
          border: '1px solid #B5482F',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        Deadline Passed
      </span>
    );
  }

  return (
    <span
      style={{
        background: '#FBF1DA',
        color: '#B98A1E',
        border: '1px solid #B98A1E',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: "'IBM Plex Mono', monospace",
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}
    >
      Due in: {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
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

  const cardAccentColors = ['#2B4A3E', '#3D5A73', '#B98A1E', '#B5482F'];

  if (assignments.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginTop: 24,
        padding: 28,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        border: '1px solid #E4DFD1',
        borderTop: '3px solid #2B4A3E',
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
          gap: 12,
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid #E4DFD1',
        }}
      >
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: '#201F1C',
              fontFamily: "'Fraunces', serif",
            }}
          >
            Section Assignments
          </h3>
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: 11,
              color: '#A39C8C',
              fontFamily: "'IBM Plex Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Complete the assignments below before the deadline.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {assignments.map((a, idx) => {
          const submission = submissions[a.id];
          const isExpired = a.due_date ? new Date(a.due_date).getTime() < new Date().getTime() : false;
          const accentColor = cardAccentColors[idx % cardAccentColors.length];

          return (
            <div
              key={a.id}
              style={{
                backgroundColor: '#FAF8F3',
                padding: 20,
                borderRadius: 8,
                border: '1px solid #E4DFD1',
                borderTop: `3px solid ${accentColor}`,
                position: 'relative',
              }}
            >
              {/* Stamp Badge for Submission Status */}
              {submission && (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    transform: 'rotate(28deg)',
                    backgroundColor: submission.status === 'GRADED' ? '#E7EEE9' : '#FBF1DA',
                    color: submission.status === 'GRADED' ? '#2B4A3E' : '#B98A1E',
                    border: `1.5px solid ${submission.status === 'GRADED' ? '#2B4A3E' : '#B98A1E'}`,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                >
                  {submission.status === 'GRADED' ? 'GRADED' : 'PENDING'}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, paddingRight: submission ? 70 : 0 }}>
                  <h4
                    style={{
                      margin: '0 0 6px 0',
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#201F1C',
                      fontFamily: "'Fraunces', serif",
                    }}
                  >
                    {a.title}
                  </h4>
                  <p style={{ fontSize: 13.5, color: '#6B6558', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    {a.description}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {a.due_date && <CountdownBadge dueDate={a.due_date} />}
                  <span
                    style={{
                      backgroundColor: '#E9EFF3',
                      color: '#3D5A73',
                      border: '1px solid #3D5A73',
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "'IBM Plex Mono', monospace",
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    MAX MARKS: {a.max_marks}
                  </span>
                </div>
              </div>

              {/* Instructor / Admin View */}
              {userRole === 'ADMIN' || userRole === 'INSTRUCTOR' ? (
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#E9EFF3',
                    color: '#3D5A73',
                    border: '1px solid #E4DFD1',
                    borderRadius: 7,
                    fontSize: 12,
                    fontFamily: "'IBM Plex Mono', monospace",
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Instructor/Admin View: Submissions and Grading options are available in Course Builder.
                </div>
              ) : submission ? (
                /* Student: Submission Status & Grade View */
                <div
                  style={{
                    padding: 16,
                    background: '#FFFFFF',
                    border: '1px solid #E4DFD1',
                    borderRadius: 8,
                    marginTop: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "'IBM Plex Mono', monospace",
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: submission.status === 'GRADED' ? '#2B4A3E' : '#B98A1E',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {submission.status === 'GRADED' ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Graded
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Submitted (Pending Review)
                        </>
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#A39C8C',
                        fontFamily: "'IBM Plex Mono', monospace",
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Submitted on: {new Date(submission.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {submission.status === 'GRADED' && (
                    <div
                      style={{
                        marginTop: 12,
                        border: '1px solid #E4DFD1',
                        borderRadius: 8,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Report-Card Strip for Grades */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                          backgroundColor: '#E7EEE9',
                          borderBottom: submission.feedback ? '1px solid #E4DFD1' : 'none',
                        }}
                      >
                        <div style={{ padding: '10px 14px', borderRight: '1px solid #E4DFD1' }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#A39C8C', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em' }}>
                            Your Grade
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 600, color: '#2B4A3E', fontFamily: "'IBM Plex Mono', monospace" }}>
                            {submission.marks} <span style={{ fontSize: 12, color: '#6B6558', fontWeight: 400 }}>/ {a.max_marks}</span>
                          </div>
                        </div>
                      </div>

                      {submission.feedback && (
                        <div style={{ padding: '12px 14px', backgroundColor: '#FFFFFF' }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#A39C8C', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em', marginBottom: 4 }}>
                            Instructor Feedback
                          </div>
                          <p style={{ margin: 0, fontSize: 13, color: '#201F1C', lineHeight: 1.4 }}>
                            {submission.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: 12, fontSize: 13, color: '#201F1C', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {submission.content && (
                      <div>
                        <strong style={{ color: '#6B6558', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Your Answer:
                        </strong>{' '}
                        <span>{submission.content}</span>
                      </div>
                    )}
                    {submission.submission_url && (
                      <div>
                        <strong style={{ color: '#6B6558', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Your Link:
                        </strong>{' '}
                        <a
                          href={submission.submission_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#2B4A3E', textDecoration: 'underline', fontWeight: 500 }}
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
                    padding: 14,
                    background: '#FBEAE3',
                    borderRadius: 7,
                    border: '1px solid #B5482F',
                    color: '#B5482F',
                    fontSize: 12,
                    fontFamily: "'IBM Plex Mono', monospace",
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  The deadline for this assignment has passed. Submissions are now closed.
                </div>
              ) : (
                /* Student: Submission Form (Card-Catalog Intake Slip Style) */
                <div
                  style={{
                    marginTop: 12,
                    padding: 16,
                    background: '#FFFFFF',
                    borderRadius: 8,
                    border: '1.5px dashed #D2CBB8',
                  }}
                >
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
                        borderRadius: 7,
                        border: '1px solid #E4DFD1',
                        backgroundColor: '#FAF8F3',
                        color: '#201F1C',
                        fontSize: 13.5,
                        outline: 'none',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    />
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
                        borderRadius: 7,
                        border: '1px solid #E4DFD1',
                        backgroundColor: '#FAF8F3',
                        color: '#201F1C',
                        fontSize: 13.5,
                        outline: 'none',
                        fontFamily: "'Inter', sans-serif",
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
                      backgroundColor: submitting === a.id ? '#E4DFD1' : '#2B4A3E',
                      color: submitting === a.id ? '#A39C8C' : '#FAF8F3',
                      border: 'none',
                      borderRadius: 7,
                      cursor: submitting === a.id ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: 13,
                      fontFamily: "'Inter', sans-serif",
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>{submitting === a.id ? 'Submitting...' : 'Submit Assignment'}</span>
                    {submitting !== a.id && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    )}
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