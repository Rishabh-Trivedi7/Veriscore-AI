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

    if (examData.questions.some(q => !q.questionText.trim() || !q.correctAnswer.trim())) {
      setError('All questions must have question text and correct answer');
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/v1/admin/exams', examData);
      setSuccess('Exam created successfully!');
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 relative overflow-hidden">
      {/* Abstract background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="text-blue-400 hover:text-blue-300 mb-4 text-sm flex items-center gap-2 transition-colors"
          >
            <span>←</span> Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
            Create New Assessment
          </h1>
          <p className="text-slate-400 mt-2">Design your exam with AI-powered grading support</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm backdrop-blur-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm backdrop-blur-md">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Exam Basic Info - Glassmorphic Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              General Configuration
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Exam Title *</label>
                <input
                  type="text"
                  value={examData.title}
                  onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                  placeholder="e.g., Senior Node.js Assessment"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-600 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={examData.description}
                  onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                  placeholder="Describe the objective of this exam..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-600 h-28 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Passing Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={examData.passingScore}
                    onChange={(e) => setExamData({ ...examData, passingScore: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={examData.duration}
                    onChange={(e) => setExamData({ ...examData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={examData.isActive}
                    onChange={(e) => setExamData({ ...examData, isActive: e.target.value === 'true' })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none transition-all"
                  >
                    <option value={true} className="bg-slate-900">Active</option>
                    <option value={false} className="bg-slate-900">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                Assessment Questions
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-900/40"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-8">
              {examData.questions.map((question, qIndex) => (
                <div key={qIndex} className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    {examData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <span className="text-xs font-bold uppercase tracking-widest">Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-8">
                    <span className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      {qIndex + 1}
                    </span>
                    <h3 className="font-semibold text-lg">Question Details</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Question Text *</label>
                      <textarea
                        value={question.questionText}
                        onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                        placeholder="What do you want to ask?"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-600 h-24 resize-none transition-all"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Question Type</label>
                        <select
                          value={question.questionType}
                          onChange={(e) => updateQuestion(qIndex, 'questionType', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none transition-all"
                        >
                          <option value="descriptive" className="bg-slate-900">Descriptive</option>
                          <option value="multiple-choice" className="bg-slate-900">Multiple Choice</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Points</label>
                        <input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all"
                        />
                      </div>
                    </div>

                    {question.questionType === 'multiple-choice' && (
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                        <label className="block text-sm font-medium text-slate-300 mb-4">Multiple Choice Options</label>
                        <div className="space-y-3">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex gap-3">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-600 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(qIndex, oIndex)}
                                className="text-slate-500 hover:text-red-400 p-2"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-1 mt-2"
                          >
                            <span>+</span> Add Option
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Model Answer (For AI Evaluation) *</label>
                      <textarea
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                        placeholder="Provide the ideal answer for Gemini to evaluate against..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-600 h-24 resize-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-4 pb-12">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 px-10 py-3 rounded-xl disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-emerald-900/20"
            >
              {loading ? 'Processing...' : 'Publish Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
