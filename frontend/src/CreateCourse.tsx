import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';

const CreateCourse: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/courses', {
        title,
        description,
        price: Number(price),
      });
      alert('Course Created Successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 12px', marginBottom: '20px', cursor: 'pointer' }}>
        &larr; Back to Dashboard
      </button>

      <h2>Create New Course</h2>
      <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Course Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            placeholder="e.g. Master Go & React"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            placeholder="Course overview..."
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Price ($):</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min="0"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            background: '#27ae60',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Creating...' : 'Create Course'}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;