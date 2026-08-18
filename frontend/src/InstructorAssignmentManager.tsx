import React, { useEffect, useState } from 'react';
import API from './api';

interface Assignment {
  id: number;
  title: string;
  description: string;
  max_marks: number;
}

interface Submission {
  id: number;
  user_id: number;
  submission_url: string;
  content: string;
  status: string;
  marks: number | null;
  feedback: string;
  User?: {
    name: string;
    email: string;
  };
}

interface Props {
  sectionId: number;
  sectionTitle: string;
}

const InstructorAssignmentManager: React.FC<Props> = ({ sectionId, sectionTitle }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New Assignment Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxMarks, setMaxMarks] = useState<number>(100);

  // Submissions State for Grading
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Grading Inputs State
  const [gradingMarks, setGradingMarks] = useState<{ [key: number]: number }>({});
  const [gradingFeedback, setGradingFeedback] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchAssignments();
  }, [sectionId]);

  const fetchAssignments = async () => {
    try {
      const res = await API.get(`/assignments/section/${sectionId}`);
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error('Failed to load assignments', err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/assignments', {
        section_id: sectionId,
        title,
        description,
        max_marks: Number(maxMarks),
      });
      alert('Assignment created successfully!');
      setTitle('');
      setDescription('');
      setMaxMarks(100);
      setShowCreateForm(false);
      fetchAssignments();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create assignment');
    }
  };

  // 📝 Fetch Submissions to Grade
  const handleViewSubmissions = async (assignmentId: number) => {
    if (selectedAssignmentId === assignmentId) {
      setSelectedAssignmentId(null);
      return;
    }
    setSelectedAssignmentId(assignmentId);
    setLoadingSubmissions(true);
    try {
      const res = await API.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions(res.data.submissions || []);
      setLoadingSubmissions(false);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
      setLoadingSubmissions(false);
    }
  };

  // 💯 Submit Grade & Feedback
  const handleGradeSubmission = async (submissionId: number) => {
    const marks = gradingMarks[submissionId];
    const feedback = gradingFeedback[submissionId] || '';

    if (marks === undefined || marks === null) {
      alert('Please enter marks before saving!');
      return;
    }

    try {
      await API.put(`/assignments/submissions/${submissionId}/grade`, {
        marks: Number(marks),
        feedback: feedback,
      });
      alert('Grade & Feedback saved successfully!');
      if (selectedAssignmentId) {
        handleViewSubmissions(selectedAssignmentId); // Refresh submissions list
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to grade submission');
    }
  };

  return (
    <div style={{ marginTop: '15px', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h5 style={{ margin: 0, color: '#334155' }}>📝 Assignments ({assignments.length})</h5>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ padding: '4px 8px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
        >
          {showCreateForm ? 'Cancel' : '+ Add Assignment'}
        </button>
      </div>

      {/* Create Assignment Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateAssignment} style={{ marginTop: '10px', background: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
          <input
            type="text"
            placeholder="Assignment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '6px', marginBottom: '8px', boxSizing: 'border-box' }}
          />
          <textarea
            placeholder="Instructions / Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={2}
            style={{ width: '100%', padding: '6px', marginBottom: '8px', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Max Marks:</label>
            <input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value))}
              style={{ width: '80px', padding: '4px' }}
            />
          </div>
          <button type="submit" style={{ padding: '6px 12px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>
            Save Assignment
          </button>
        </form>
      )}

      {/* Existing Assignments List */}
      <div style={{ marginTop: '10px' }}>
        {assignments.map((assignment) => (
          <div key={assignment.id} style={{ background: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '8px', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '13px', color: '#1e293b' }}>{assignment.title}</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>{assignment.description} (Max Marks: {assignment.max_marks})</p>
              </div>
              <button
                onClick={() => handleViewSubmissions(assignment.id)}
                style={{ padding: '4px 10px', background: '#2980b9', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
              >
                {selectedAssignmentId === assignment.id ? 'Hide Submissions' : 'View Submissions & Grade 🎯'}
              </button>
            </div>

            {/* Submissions List & Grading UI */}
            {selectedAssignmentId === assignment.id && (
              <div style={{ marginTop: '12px', background: '#f1f5f9', padding: '10px', borderRadius: '4px', borderTop: '2px solid #3498db' }}>
                <h6 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#1e293b' }}>Student Submissions:</h6>
                {loadingSubmissions ? (
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Loading submissions...</p>
                ) : submissions.length > 0 ? (
                  submissions.map((sub) => (
                    <div key={sub.id} style={{ background: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '8px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
                          👤 {sub.User?.name || `Student ID: ${sub.user_id}`} ({sub.User?.email})
                        </span>
                        <span style={{ fontSize: '11px', background: sub.status === 'GRADED' ? '#dcfce7' : '#fef3c7', color: sub.status === 'GRADED' ? '#166534' : '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {sub.status}
                        </span>
                      </div>

                      {sub.submission_url && (
                        <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                          🔗 Link/URL: <a href={sub.submission_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{sub.submission_url}</a>
                        </div>
                      )}
                      {sub.content && (
                        <div style={{ fontSize: '12px', background: '#f8fafc', padding: '6px', borderRadius: '4px', marginBottom: '8px', color: '#475569' }}>
                          💬 Submission Text: {sub.content}
                        </div>
                      )}

                      {/* Grading Input Box */}
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="number"
                          placeholder="Marks"
                          defaultValue={sub.marks ?? ''}
                          onChange={(e) => setGradingMarks({ ...gradingMarks, [sub.id]: Number(e.target.value) })}
                          style={{ width: '70px', padding: '4px', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          placeholder="Feedback (e.g. Good job!)"
                          defaultValue={sub.feedback ?? ''}
                          onChange={(e) => setGradingFeedback({ ...gradingFeedback, [sub.id]: e.target.value })}
                          style={{ flex: 1, padding: '4px', fontSize: '12px' }}
                        />
                        <button
                          onClick={() => handleGradeSubmission(sub.id)}
                          style={{ padding: '4px 10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Save Grade
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>No submissions received for this assignment yet.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorAssignmentManager;