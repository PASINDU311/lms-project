import React, { useState, useEffect } from 'react';
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
  user_id: number;
  user?: { name: string; email: string };
  submission_url: string;
  content: string;
  marks?: number;
  feedback?: string;
  status: string;
  created_at: string;
}

interface Props {
  sectionId: number;
  sectionTitle: string;
}

const InstructorAssignmentManager: React.FC<Props> = ({ sectionId, sectionTitle }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  // New Assignment Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);

  // Grading State
  const [gradingSubmissionId, setGradingSubmissionId] = useState<number | null>(null);
  const [marksInput, setMarksInput] = useState<number>(0);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  useEffect(() => {
    fetchAssignments();
  }, [sectionId]);

  const fetchAssignments = () => {
    API.get(`/assignments/section/${sectionId}`)
      .then((res) => {
        const list = res.data.assignments || [];
        setAssignments(list);
        if (list.length > 0 && !selectedAssignment) {
          setSelectedAssignment(list[0]);
          fetchSubmissions(list[0].id);
        }
      })
      .catch((err) => console.error('Failed to fetch assignments', err));
  };

  const fetchSubmissions = (assignmentId: number) => {
    API.get(`/assignments/${assignmentId}/submissions`)
      .then((res) => setSubmissions(res.data.submissions || []))
      .catch((err) => console.error('Failed to fetch submissions', err));
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
      setShowCreateForm(false);
      fetchAssignments();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create assignment');
    }
  };

  const handleGradeSubmission = async (submissionId: number) => {
    try {
      await API.put(`/assignments/submissions/${submissionId}/grade`, {
        marks: Number(marksInput),
        feedback: feedbackInput,
      });
      alert('Grade saved successfully!');
      setGradingSubmissionId(null);
      if (selectedAssignment) fetchSubmissions(selectedAssignment.id);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save grade');
    }
  };

  return (
    <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, color: '#2c3e50' }}>📋 Assignments for: {sectionTitle}</h4>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ padding: '6px 12px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {showCreateForm ? 'Close Form' : '+ Add New Assignment'}
        </button>
      </div>

      {/* Create Assignment Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateAssignment} style={{ marginTop: '15px', padding: '15px', background: '#fff', border: '1px solid #27ae60', borderRadius: '6px' }}>
          <h5 style={{ marginTop: 0 }}>Create New Assignment</h5>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Description / Instructions:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Max Marks:</label>
            <input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value))}
              style={{ width: '120px', padding: '6px' }}
            />
          </div>
          <button type="submit" style={{ padding: '8px 15px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Save Assignment
          </button>
        </form>
      )}

      {/* Assignments List & Submissions View */}
      {assignments.length > 0 ? (
        <div style={{ marginTop: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            {assignments.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setSelectedAssignment(a);
                  fetchSubmissions(a.id);
                }}
                style={{
                  padding: '6px 12px',
                  background: selectedAssignment?.id === a.id ? '#3498db' : '#fff',
                  color: selectedAssignment?.id === a.id ? '#fff' : '#333',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {a.title}
              </button>
            ))}
          </div>

          {selectedAssignment && (
            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <h5 style={{ margin: '0 0 10px 0' }}>Student Submissions ({submissions.length})</h5>

              {submissions.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#777' }}>No student submissions yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {submissions.map((sub) => (
                    <div key={sub.id} style={{ padding: '10px', border: '1px solid #eee', borderRadius: '4px', background: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{sub.user?.name || 'Student'} ({sub.user?.email})</strong>
                        <span style={{ fontSize: '12px', color: '#888' }}>{new Date(sub.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {sub.content && <p style={{ fontSize: '13px', margin: '5px 0' }}><strong>Answer:</strong> {sub.content}</p>}
                      {sub.submission_url && (
                        <p style={{ fontSize: '13px', margin: '5px 0' }}>
                          <strong>URL:</strong> <a href={sub.submission_url} target="_blank" rel="noreferrer">{sub.submission_url}</a>
                        </p>
                      )}

                      <div style={{ marginTop: '8px', fontSize: '13px' }}>
                        <strong>Status:</strong> <span style={{ color: sub.status === 'GRADED' ? 'green' : 'orange' }}>{sub.status}</span>
                        {sub.marks !== undefined && <span> | <strong>Marks:</strong> {sub.marks} / {selectedAssignment.max_marks}</span>}
                      </div>

                      {/* Grade Action Button */}
                      {gradingSubmissionId === sub.id ? (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#fff', border: '1px solid #3498db', borderRadius: '4px' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Marks ({selectedAssignment.max_marks} Max): </label>
                            <input
                              type="number"
                              value={marksInput}
                              onChange={(e) => setMarksInput(Number(e.target.value))}
                              style={{ width: '80px', padding: '4px', marginLeft: '5px' }}
                            />
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block' }}>Feedback: </label>
                            <input
                              type="text"
                              value={feedbackInput}
                              onChange={(e) => setFeedbackInput(e.target.value)}
                              placeholder="Great job! / Need improvements..."
                              style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                            />
                          </div>
                          <button
                            onClick={() => handleGradeSubmission(sub.id)}
                            style={{ padding: '4px 10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}
                          >
                            Save Grade
                          </button>
                          <button
                            onClick={() => setGradingSubmissionId(null)}
                            style={{ padding: '4px 10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setGradingSubmissionId(sub.id);
                            setMarksInput(sub.marks || 0);
                            setFeedbackInput(sub.feedback || '');
                          }}
                          style={{ marginTop: '8px', padding: '4px 10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          {sub.status === 'GRADED' ? 'Edit Grade' : 'Grade Submission'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p style={{ fontSize: '13px', color: '#777', marginTop: '10px' }}>No assignments added to this section yet.</p>
      )}
    </div>
  );
};

export default InstructorAssignmentManager;