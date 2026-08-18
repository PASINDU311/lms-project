import React, { useEffect, useState } from 'react';
import API from './api';

interface Option {
  id: number;
  option_text: string;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
}

interface Quiz {
  id: number;
  title: string;
  questions: Question[];
}

interface QuizPlayerProps {
  sectionId: number;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ sectionId }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<{ score: number; passed: boolean; correct_count: number; total: number } | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchQuiz();
  }, [sectionId]);

  const fetchQuiz = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      const res = await API.get(`/quizzes/section/${sectionId}`);
      setQuiz(res.data.quiz);
      setError('');
    } catch (err: any) {
      setError('No quiz found for this section.');
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    try {
      const res = await API.post('/quizzes/submit', {
        quiz_id: quiz.id,
        answers: answers,
      });
      setResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit quiz');
    }
  };

  if (loading) return <p>Loading Quiz...</p>;
  if (error) return <p style={{ color: '#888', fontStyle: 'italic' }}>{error}</p>;
  if (!quiz) return null;

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', marginTop: '20px', backgroundColor: '#f9f9f9' }}>
      <h3>📝 Quiz: {quiz.title}</h3>

      {result ? (
        <div style={{ padding: '15px', borderRadius: '5px', backgroundColor: result.passed ? '#e6fffa' : '#ffebe9', border: `1px solid ${result.passed ? '#319795' : '#e53e3e'}` }}>
          <h4>Result: {result.passed ? '🎉 Passed!' : '❌ Failed'}</h4>
          <p>Score: <strong>{result.score}%</strong> ({result.correct_count} / {result.total} Correct)</p>
          <button onClick={fetchQuiz} style={{ padding: '8px 12px', cursor: 'pointer' }}>Retake Quiz</button>
        </div>
      ) : (
        <div>
          {quiz.questions?.map((q, idx) => (
            <div key={q.id} style={{ marginBottom: '20px', textAlign: 'left' }}>
              <p><strong>Q{idx + 1}: {q.question}</strong></p>
              {q.options?.map((opt) => (
                <label key={opt.id} style={{ display: 'block', margin: '5px 0', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    value={opt.id}
                    checked={answers[q.id] === opt.id}
                    onChange={() => handleOptionSelect(q.id, opt.id)}
                  />{' '}
                  {opt.option_text}
                </label>
              ))}
            </div>
          ))}
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length === 0}
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizPlayer;