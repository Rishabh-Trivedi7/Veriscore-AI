import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import api, { API_BASE_URL } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import useProctor from '../hooks/useProctor';

const ExamConsole = () => {
  const { id: examIdFromParams } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [profileDescriptor, setProfileDescriptor] = useState(null);
  const [lookAwayStartTime, setLookAwayStartTime] = useState(null);
  const [activeViolation, setActiveViolation] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleViolation = (type, description) => {
    setActiveViolation({ type, description });
  };

  const { violations: proctorViolations, videoRef, modelsLoaded } = useProctor(
    exam?._id || examIdFromParams,
    isExamStarted,
    handleViolation
  );

  // Refs for state to avoid stale closures in event listeners
  const isExamStartedRef = useRef(false);
  const activeViolationRef = useRef(null);
  const isSubmittingRef = useRef(false);

  const MAX_VIOLATIONS = 3;
  const totalViolations = proctorViolations.tabSwitches + proctorViolations.faceViolations + proctorViolations.fullscreenExits;

  // Auto-submit on violation limit
  useEffect(() => {
    if (totalViolations >= MAX_VIOLATIONS) {
      const reason = "Violation limit reached. Exam automatically submitted.";
      setActiveViolation({ description: reason });
      setTimeout(() => {
        handleSubmit(reason);
      }, 3000);
    }
  }, [totalViolations]);

  useEffect(() => {
    isExamStartedRef.current = isExamStarted;
  }, [isExamStarted]);

  useEffect(() => {
    activeViolationRef.current = activeViolation;
  }, [activeViolation]);

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  useEffect(() => {
    loadExam();
    if (!profileDescriptor && user?.profilePicture) {
      loadFaceModels(); // Still needed for profile descriptor comparison if requested
    }
  }, []);

  const loadExam = async () => {
    try {
      const endpoint = examIdFromParams ? `/api/v1/exam/${examIdFromParams}` : '/api/v1/exam/questions';
      const response = await api.get(endpoint);
      const examData = response.data.data.exam;
      setExam(examData);
      setAnswers({}); // Reset answers
      setTimeLeft(examData.duration * 60); // Convert minutes to seconds
    } catch (error) {
      console.error('Failed to load exam:', error);
      const message = error.response?.data?.message || 'Failed to load exam. Please try again.';
      showAlert(message, 'error');
      if (error.response?.status === 400 || error.response?.status === 403) {
        setTimeout(() => navigate('/candidate'), 3000);
      }
    }
  };

  const loadFaceModels = async () => {
    // Note: useProctor already loads some models, but we might need more for recognition
    try {
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      loadProfileDescriptor();
    } catch (error) {
      console.error('Failed to load face recognition models:', error);
    }
  };

  const loadProfileDescriptor = async () => {
    try {
      const imgUrl = user.profilePicture.startsWith('http')
        ? user.profilePicture
        : `${API_BASE_URL}${user.profilePicture}`;

      const img = await faceapi.fetchImage(imgUrl);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setProfileDescriptor(detection.descriptor);
      }
    } catch (error) {
      console.error('Failed to load profile descriptor:', error);
    }
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleContinueExam = () => {
    setActiveViolation(null);
    requestFullscreen();
  };

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('Fullscreen request failed:', error);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    if (activeViolation) return;
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const handleSubmit = async (reason = '') => {
    if (isSubmittingRef.current) return;
    setIsSubmitting(true);

    try {
      const timeSpent = exam.duration * 60 - timeLeft;
      await api.post('/api/v1/exam/submit', {
        examId: exam._id,
        answers,
        tabSwitches: proctorViolations.tabSwitches,
        faceViolations: proctorViolations.faceViolations,
        fullscreenExits: proctorViolations.fullscreenExits,
        timeSpent: Math.max(0, Math.floor(timeSpent / 60)),
      });

      showAlert(reason || 'Exam submitted successfully!', 'success');
      setTimeout(() => {
        navigate('/candidate');
      }, 2000);
    } catch (error) {
      console.error('Submission failed:', error);
      showAlert('Failed to submit exam. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  const handleAcceptRules = () => {
    setIsExamStarted(true);
    requestFullscreen();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-xl text-blue-900 font-medium animate-pulse">Initializing Exam Environment...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-blue-900 p-4 transition-colors duration-500 ${activeViolation ? 'bg-red-50 overflow-hidden' : ''}`}>
      {/* Violation Overlay */}
      {activeViolation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-blue-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-t-8 border-red-500 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-3xl font-black mb-2 text-red-600">VIOLATION!</h2>
            <p className="text-slate-600 font-medium mb-8 leading-relaxed">{activeViolation.description}</p>

            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Remaining Chances</div>
              <div className="text-4xl font-black text-slate-900">
                {Math.max(0, MAX_VIOLATIONS - totalViolations)} / {MAX_VIOLATIONS}
              </div>
            </div>

            {totalViolations < MAX_VIOLATIONS ? (
              <button
                onClick={handleContinueExam}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all duration-200 text-lg shadow-lg hover:shadow-blue-200 active:scale-[0.98]"
              >
                I Understand, Resume Exam
              </button>
            ) : (
              <div className="flex items-center justify-center gap-3 text-red-600 font-bold">
                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent animate-spin rounded-full"></div>
                Limit Reached. Submitting...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className={`max-w-7xl mx-auto transition-all duration-500 ${activeViolation ? 'blur-xl scale-95 pointer-events-none opacity-50' : ''}`}>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">Active Assessment</span>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{exam.title}</h1>
            </div>
            <p className="text-slate-500 text-sm">{exam.description}</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[200px] justify-between">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Timer</div>
            <div className={`text-3xl font-mono font-black ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Floating Widgets */}
        <div className="fixed top-6 right-6 flex flex-col gap-3 z-50">
          <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-xl px-4 py-3 shadow-xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Violations Tracking</div>
            <div className="flex items-center gap-4 font-black text-slate-700">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">Tab</span>
                <span>{proctorViolations.tabSwitches}</span>
              </div>
              <div className="w-[1px] h-6 bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">Face</span>
                <span>{proctorViolations.faceViolations}</span>
              </div>
              <div className="w-[1px] h-6 bg-slate-200"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">FS</span>
                <span>{proctorViolations.fullscreenExits}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {alert && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl font-bold animate-in slide-in-from-top-4 duration-300 ${alert.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
            }`}>
            {alert.message}
          </div>
        )}

        {/* Proctored Video Preview */}
        <div className="fixed bottom-6 left-6 w-56 h-40 bg-slate-900 rounded-2xl border-2 border-white shadow-2xl overflow-hidden z-40 group">
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          <div className="absolute bottom-3 left-3 right-3 bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isExamStarted ? 'PROCTOR ACTIVE' : 'SYSTEM IDLE'}
          </div>
        </div>

        {/* Question Containers */}
        <div className="max-w-3xl mx-auto space-y-6 pb-24">
          {exam.questions.map((question, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black">
                  {index + 1}
                </div>
                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {question.points} Points
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
                {question.questionText}
              </h3>
              <textarea
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder="Compose your technical response here..."
                className="w-full h-48 px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50/50 focus:bg-white focus:border-blue-200 text-slate-800 text-lg transition-all resize-none shadow-inner"
              />
            </div>
          ))}

          <div className="flex justify-center pt-8">
            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !isExamStarted}
              className="group bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 px-16 rounded-2xl transition-all duration-300 disabled:opacity-30 shadow-xl shadow-emerald-100 hover:-translate-y-1 active:translate-y-0"
            >
              {isSubmitting ? 'Finalizing Submission...' : 'FINISH & SUBMIT ASSESSMENT'}
            </button>
          </div>
        </div>
      </div>

      {/* Initiation Overlay */}
      {!isExamStarted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-500">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-10 border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900">Protocols Required</h2>
                <p className="text-slate-500 font-medium">Verify compliance to begin</p>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <div className="p-5 rounded-2xl bg-orange-50 border border-orange-100 flex gap-4">
                <span className="text-3xl">🤖</span>
                <p className="text-sm font-semibold text-orange-900 leading-relaxed">
                  <strong>PROCTORING ACTIVE:</strong> AI-driven vision and behavioral analysis will be performed throughout this session.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: '💠', label: 'Locked Fullscreen', desc: 'Exit triggers alert' },
                  { icon: '📸', label: 'Face Tracking', desc: 'Continuous verification' },
                  { icon: '🔗', label: 'No External Navigation', desc: 'App/Tab switch logs' },
                  { icon: '🛑', label: '3-Strike Policy', desc: 'Auto-kick on limit' }
                ].map((rule, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xl">{rule.icon}</span>
                    <div>
                      <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">{rule.label}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{rule.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleAcceptRules}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all duration-300 text-xl shadow-2xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98]"
            >
              INITIALIZE ASSESSMENT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamConsole;
