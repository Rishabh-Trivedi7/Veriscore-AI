import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CreateExam = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [examData, setExamData] = useState({
    title: '',
    description: '',
    passingScore: 60,
    duration: 60,
    isActive: true,
    questions: [
      {
        questionText: '',
        questionType: 'descriptive',
        correctAnswer: '',
        points: 10,
        options: [],
      },
    ],
  });

  const addQuestion = () => {
    setExamData({
      ...examData,
      questions: [
        ...examData.questions,
        {
          questionText: '',
          questionType: 'descriptive',
          correctAnswer: '',
          points: 10,
          options: [],
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    if (examData.questions.length > 1) {
      const newQuestions = examData.questions.filter((_, i) => i !== index);
      setExamData({ ...examData, questions: newQuestions });
    }
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...examData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setExamData({ ...examData, questions: newQuestions });
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...examData.questions];
    newQuestions[questionIndex].options = [
      ...newQuestions[questionIndex].options,
      '',
    ];
    setExamData({ ...examData, questions: newQuestions });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...examData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setExamData({ ...examData, questions: newQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...examData.questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setExamData({ ...examData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate
    if (!examData.title.trim()) {
      setError('Exam title is required');
      setLoading(false);
      return;
    }

    if (examData.questions.some(q => !q.questionText.trim() || (q.questionType === 'descriptive' && !q.correctAnswer.trim()))) {
      setError('All descriptive questions must have question text and model answer');
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/v1/admin/exams', examData);
      setSuccess('Assessment published successfully!');
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-slate-100 p-6 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12">
          <button
            onClick={() => navigate('/admin')}
            className="btn-ghost flex items-center gap-2 mb-6 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Dashboard
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-slate-100 mb-2">
            Build <span className="text-blue-400">Secure</span> Assessment
          </h1>
          <p className="text-slate-500 font-light">Configure the environment and technical items for your candidates.</p>
        </header>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-2xl mb-8 text-sm animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-2xl mb-8 text-sm animate-in fade-in slide-in-from-top-2">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12 pb-32">
          {/* General Config - Glass Card */}
          <div className="glass rounded-[2rem] p-10 border border-white/5 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
              <h2 className="text-xl font-bold tracking-tight">Deployment Configuration</h2>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Assessment Title</label>
                <input
                  type="text"
                  value={examData.title}
                  onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                  placeholder="e.g., Senior Systems Architecture"
                  className="input-dark text-base py-4"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Context / Description</label>
                <textarea
                  value={examData.description}
                  onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                  placeholder="Briefly outline the objective of this session..."
                  className="input-dark h-32 resize-none text-base font-light py-4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Passing Threshold (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={examData.passingScore}
                    onChange={(e) => setExamData({ ...examData, passingScore: parseInt(e.target.value) })}
                    className="input-dark py-4 font-mono-timer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Max Duration (MIN)</label>
                  <input
                    type="number"
                    min="1"
                    value={examData.duration}
                    onChange={(e) => setExamData({ ...examData, duration: parseInt(e.target.value) })}
                    className="input-dark py-4 font-mono-timer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">System State</label>
                  <select
                    value={examData.isActive}
                    onChange={(e) => setExamData({ ...examData, isActive: e.target.value === 'true' })}
                    className="input-dark py-4 font-bold"
                  >
                    <option value={true} className="bg-obsidian">ACTIVE</option>
                    <option value={false} className="bg-obsidian">INACTIVE</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="space-y-8">
            <div className="flex justify-between items-end px-2 sticky top-16 z-20 bg-obsidian/80 backdrop-blur-md pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-1">Assessment Registry</h2>
                <p className="text-slate-500 text-sm font-light">Structure the technical challenges below.</p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-primary text-xs px-6 py-2.5"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-10">
              {examData.questions.map((question, qIndex) => (
                <div key={qIndex} className="glass rounded-[2rem] p-10 border border-white/5 relative group animate-in slide-in-from-bottom-4 duration-500">
                  <div className="absolute top-8 right-8">
                    {examData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-slate-500 hover:text-rose-500 transition-colors text-[10px] font-bold uppercase tracking-widest"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-10">
                    <span className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-mono text-xl font-bold">
                      {String(qIndex + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-semibold text-lg tracking-tight">Question Intelligence</h3>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Challenge Prompt</label>
                      <textarea
                        value={question.questionText}
                        onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                        placeholder="Define the technical challenge..."
                        className="input-dark h-28 resize-none py-4 font-light text-base"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Response Type</label>
                        <div className="input-dark py-4 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                          Descriptive Response Only
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Item Value (Points)</label>
                        <input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                          className="input-dark py-4 font-mono-timer"
                        />
                      </div>
                    </div>

                    {/* Multiple choice configuration removed; only descriptive questions are supported */}

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Intelligence Archetype (Model Answer)</label>
                      <textarea
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                        placeholder="Describe the ideal technical response for AI evaluation accuracy..."
                        className="input-dark h-32 resize-none py-4 font-light text-base"
                        required
                      />
                      <p className="mt-3 text-[10px] text-slate-600 font-medium italic">Gemini will use this as the primary ground truth for semantic grading.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-10">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="btn-ghost px-10"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-12 py-5 text-base"
            >
              {loading ? 'Publishing Securely...' : 'Deploy Assessment Protocol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
