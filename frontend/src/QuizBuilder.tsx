import React, { useState } from 'react';
import API from './api';

interface OptionInput {
  option_text: string;
  is_correct: boolean;
}

interface QuestionInput {
  question: string;
  options: OptionInput[];
}

interface QuizBuilderProps {
  sectionId: number;
  onQuizCreated?: () => void;
}

const QuizBuilder: React.FC<QuizBuilderProps> = ({ sectionId, onQuizCreated }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([
    {
      question: '',
      options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ],
      },
    ]);
  };

  const handleQuestionChange = (qIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].question = text;
    setQuestions(updated);
  };

  const handleAddOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ option_text: '', is_correct: false });
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].option_text = text;
    setQuestions(updated);
  };

  const handleSelectCorrectOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.forEach((opt, idx) => {
      opt.is_correct = idx === oIndex;
    });
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/quizzes', {
        section_id: sectionId,
        title,
        questions,
      });
      alert('Quiz created successfully!');
      setTitle('');
      setQuestions([
        {
          question: '',
          options: [
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
          ],
        },
      ]);
      if (onQuizCreated) onQuizCreated();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '15px' }}>
      <h4>➕ Add New Quiz for Section #{sectionId}</h4>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Quiz Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Chapter 1 Knowledge Check"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '6px', marginBottom: '15px', backgroundColor: '#fafafa' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Question #{qIndex + 1}:</label>
            <input
              type="text"
              value={q.question}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
              required
              placeholder="Enter the question text"
              style={{ width: '100%', padding: '8px', marginTop: '5px', marginBottom: '10px' }}
            />

            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Options (Select radio for correct answer):</label>
            {q.options.map((opt, oIndex) => (
              <div key={oIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type="radio"
                  name={`correct_${qIndex}`}
                  checked={opt.is_correct}
                  onChange={() => handleSelectCorrectOption(qIndex, oIndex)}
                  style={{ marginRight: '10px' }}
                  required
                />
                <input
                  type="text"
                  value={opt.option_text}
                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                  required
                  placeholder={`Option ${oIndex + 1}`}
                  style={{ flex: 1, padding: '6px' }}
                />
              </div>
            ))}
            <button type="button" onClick={() => handleAddOption(qIndex)} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>
              + Add Option
            </button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={handleAddQuestion} style={{ padding: '8px 12px', cursor: 'pointer' }}>
            + Add Another Question
          </button>
          <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Saving Quiz...' : 'Save Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizBuilder;