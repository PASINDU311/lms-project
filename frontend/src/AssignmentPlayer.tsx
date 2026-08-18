import React, { useEffect, useState } from 'react';
import API from './api';

interface Assignment {
  id: number;
  section_id: number;
  title: string;
  description: string;
  max_marks: number;
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

const AssignmentPlayer: React.FC<Props> = ({ sectionId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<{ [key: number]: Submission }>({});
  const [submissionContent, setSubmissionContent] = useState<{ [key: number]: string }>({});
  const [submissionUrl, setSubmissionUrl] = useState<{ [key: number]: string }>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>('STUDENT');

  useEffect(() => {
    // Logged-in User Role එක Check කරගැනීම
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

      // Student කෙනෙක් නම් විතරක් කලින් කරපු Submissions Check කරනවා
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
    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f4f8', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>📝 Section Assignments</h3>

      {assignments.map((a) => {
        const submission = submissions[a.id];

        return (
          <div key={a.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{a.title}</h4>
            <p style={{ fontSize: '14px', color: '#555', margin: '0 0 10px 0' }}>{a.description}</p>
            <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '10px' }}>
              <strong>Max Marks:</strong> {a.max_marks}
            </div>

            {/* Instructor / Admin ට Submit Form එක පෙන්වන්නේ නැත (Notice පමණි) */}
            {userRole === 'ADMIN' || userRole === 'INSTRUCTOR' ? (
              <div style={{ padding: '8px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                ℹ️ Instructor/Admin View: Submissions and Grading options are available in Course Builder.
              </div>
            ) : submission ? (
              /* Student: Submission Status & Grade View */
              <div style={{ padding: '12px', background: submission.status === 'GRADED' ? '#e8f8f5' : '#fef9e7', border: '1px solid #ddd', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '14px', color: submission.status === 'GRADED' ? '#27ae60' : '#d35400' }}>
                    Status: {submission.status === 'GRADED' ? '✓ Graded' : '⏳ Submitted (Pending Review)'}
                  </strong>
                  <span style={{ fontSize: '12px', color: '#888' }}>
                    Submitted on: {new Date(submission.created_at).toLocaleDateString()}
                  </span>
                </div>

                {submission.status === 'GRADED' && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#fff', borderRadius: '4px', border: '1px solid #2ecc71' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#27ae60' }}>
                      🎯 Your Grade: {submission.marks} / {a.max_marks}
                    </div>
                    {submission.feedback && (
                      <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#2c3e50' }}>
                        💬 <strong>Instructor Feedback:</strong> {submission.feedback}
                      </p>
                    )}
                  </div>
                )}

                <div style={{ marginTop: '10px', fontSize: '13px', color: '#555' }}>
                  {submission.content && <div><strong>Your Answer:</strong> {submission.content}</div>}
                  {submission.submission_url && (
                    <div>
                      <strong>Your Link:</strong>{' '}
                      <a href={submission.submission_url} target="_blank" rel="noreferrer">
                        {submission.submission_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Student: Submission Form */
              <div style={{ marginTop: '10px', padding: '10px', background: '#fafafa', borderRadius: '4px', border: '1px solid #eee' }}>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Text Answer / Notes:</label>
                  <textarea
                    rows={2}
                    value={submissionContent[a.id] || ''}
                    onChange={(e) => setSubmissionContent({ ...submissionContent, [a.id]: e.target.value })}
                    placeholder="Type your submission content here..."
                    style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Submission Link (GitHub / Google Drive / PDF):</label>
                  <input
                    type="url"
                    value={submissionUrl[a.id] || ''}
                    onChange={(e) => setSubmissionUrl({ ...submissionUrl, [a.id]: e.target.value })}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  onClick={() => handleSubmit(a.id)}
                  disabled={submitting === a.id}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#3498db',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {submitting === a.id ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AssignmentPlayer;