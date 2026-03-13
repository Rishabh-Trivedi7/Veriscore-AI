import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const [activeViolation, setActiveViolation] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleViolation = (type, description) => {
    setActiveViolation({ type, description });
    setIsPaused(true);
  };

  const { violations: proctorViolations, videoRef, modelsLoaded, stopCamera } = useProctor(
    exam?._id || examIdFromParams,
    isExamStarted,
    handleViolation
  );

  // Refs for state to avoid stale closures in event listeners
  const isExamStartedRef = useRef(false);
  const activeViolationRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const timeInitializedRef = useRef(false);
  const timeLeftRef = useRef(0);

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

  // Keep timeLeftRef in sync
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Timer countdown — does NOT depend on timeLeft to avoid interval recreation
  useEffect(() => {
    if (!isExamStarted || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit('Time is up! Exam automatically submitted.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, isPaused]);

  useEffect(() => {
    loadExam();
    // Cleanup on unmount: Hardware Kill-Switch
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
      }
      if (stopCamera) stopCamera();
    };
  }, []);

  const loadExam = async () => {
    try {
      const endpoint = examIdFromParams ? `/api/v1/exam/${examIdFromParams}` : '/api/v1/exam/questions';
      const response = await api.get(endpoint);
      const examData = response.data.data.exam;
      setExam(examData);
      setAnswers({}); // Reset answers
      // Only initialize timeLeft once to prevent resets
      if (!timeInitializedRef.current) {
        setTimeLeft(examData.duration * 60); // Convert minutes to seconds
        timeInitializedRef.current = true;
      }
    } catch (error) {
      console.error('Failed to load exam:', error);
      const message = error.response?.data?.message || 'Failed to load exam. Please try again.';
      showAlert(message, 'error');
      if (error.response?.status === 400 || error.response?.status === 403) {
        setTimeout(() => navigate('/candidate'), 3000);
      }
    }
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleContinueExam = () => {
    setActiveViolation(null);
    setIsPaused(false);
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
      // Ensure answers is a clean plain object for backend validation
      const finalAnswers = answers instanceof Map ? Object.fromEntries(answers) : { ...answers };
      
      const submissionData = {
        examId: exam._id,
        answers: finalAnswers,
        tabSwitches: Number(proctorViolations.tabSwitches) || 0,
        aiViolations: (Number(proctorViolations.faceViolations) || 0) + (Number(proctorViolations.fullscreenExits) || 0),
        timeSpent: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
      };

      await api.post('/api/v1/exam/submit', submissionData);

      showAlert(reason || 'Exam submitted successfully!', 'success');
      setTimeout(() => {
        navigate('/candidate');
      }, 2000);
    } catch (error) {
      console.error('Submission failed:', error);
      const errorMsg = error.response?.data?.message || 'Failed to submit exam. Please try again.';
      showAlert(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
      // HARDWARE KILL-SWITCH: Mandatory shutdown
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => {
          track.stop();
          console.log(`[Hardware] Stopped track: ${track.label}`);
        });
        videoRef.current.srcObject = null;
      }
      if (stopCamera) stopCamera();

      // If exam ended due to time/violations, ensure redirect to dashboard and exit fullscreen
      if (reason) {
        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            await document.exitFullscreen();
          }
        } catch (e) {
          // ignore fullscreen exit errors
        }
        navigate('/candidate');
      }
    }
  };

  const handleAcceptRules = () => {
    setIsExamStarted(true);
    setStartTime(Date.now());
    requestFullscreen();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="text-xl text-blue-400 font-medium animate-pulse tracking-tight">Initializing Secure Environment...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-obsidian text-slate-100 transition-colors duration-500 ${activeViolation ? 'bg-rose-950/20' : ''}`}>
      {/* Violation Overlay */}
      {activeViolation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-obsidian/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="glass rounded-3xl shadow-2xl max-w-md w-full p-8 border-t-8 border-rose-500 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 glow-rose">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-rose-500">Protocol Breach</h2>
            <p className="text-slate-400 font-medium mb-8 leading-relaxed">{activeViolation.description}</p>

            <div className="bg-slate-900/50 rounded-2xl p-6 mb-8 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 text-center">Remaining Attempts</div>
              <div className="text-4xl font-mono text-slate-100 font-bold">
                {Math.max(0, MAX_VIOLATIONS - totalViolations)} <span className="text-slate-700">/</span> {MAX_VIOLATIONS}
              </div>
            </div>

            {totalViolations < MAX_VIOLATIONS ? (
              <button
                onClick={handleContinueExam}
                className="btn-primary w-full py-4 text-lg"
              >
                I Understand, Resume Exam
              </button>
            ) : (
              <div className="flex items-center justify-center gap-3 text-rose-500 font-bold">
                <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent animate-spin rounded-full"></div>
                Limit Reached. Finalizing Submission...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className={`transition-all duration-500 ${activeViolation ? 'blur-2xl scale-95 pointer-events-none opacity-50' : ''}`}>
        {/* Header Section — Fixed Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/5">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* Left — Exam Title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-500/20">Active Session</span>
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-100 truncate">{exam.title}</h1>
            </div>

            {/* Center — Timer */}
            <div className="flex flex-col items-center px-8 border-x border-white/5 h-full justify-center">
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Time Remaining</div>
              <div className={`text-4xl font-mono-timer font-bold tracking-tight ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-blue-400'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Right — Violations Counter */}
            <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-6 px-4">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tab</span>
                  <span className={`text-lg font-bold font-mono-timer ${proctorViolations.tabSwitches > 0 ? 'text-rose-400' : 'text-slate-300'}`}>{proctorViolations.tabSwitches}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Face</span>
                  <span className={`text-lg font-bold font-mono-timer ${proctorViolations.faceViolations > 0 ? 'text-rose-400' : 'text-slate-300'}`}>{proctorViolations.faceViolations}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Exit</span>
                  <span className={`text-lg font-bold font-mono-timer ${proctorViolations.fullscreenExits > 0 ? 'text-rose-400' : 'text-slate-300'}`}>{proctorViolations.fullscreenExits}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {alert && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl font-bold animate-in slide-in-from-top-4 duration-300 ${alert.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-obsidian'}`}>
            {alert.message}
          </div>
        )}

        {/* Camera Preview — Enlarged Floating Bubble */}
        <div className={`fixed bottom-8 left-8 w-64 h-48 rounded-3xl border-4 overflow-hidden z-40 shadow-2xl transition-all duration-300 ${activeViolation ? 'border-rose-500 glow-rose scale-110' : 'border-emerald-500 glow-emerald'}`}>
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover grayscale-[0.2]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center pb-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isExamStarted ? 'bg-emerald-500' : 'bg-slate-500'}`} />
              <span className="text-[9px] font-bold text-white tracking-widest uppercase">{isExamStarted ? 'Live' : 'Idle'}</span>
            </div>
          </div>
        </div>

        {/* Question Containers — Central Focus Column */}
        <div className="max-w-2xl mx-auto pt-32 pb-32">
          <div className="space-y-12">
            {exam.questions.map((question, index) => (
              <div key={index} className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-black text-white/5 font-mono">{String(index + 1).padStart(2, '0')}</span>
                    <h3 className="text-xl font-medium text-slate-100 tracking-tight leading-relaxed">
                      {question.questionText}
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-700">
                    {question.points} PTS
                  </span>
                </div>
                
                <textarea
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="Draft your response intelligently..."
                  className="w-full h-64 px-8 py-7 bg-white/5 border border-white/5 rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-white/[0.07] focus:border-white/10 text-slate-200 text-lg transition-all resize-none shadow-2xl placeholder-slate-600 font-light leading-relaxed"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-20">
            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !isExamStarted}
              className="btn-primary px-20 py-5 text-base"
            >
              {isSubmitting ? 'Finalizing Assessment...' : 'Submit Final Response'}
            </button>
          </div>
        </div>
      </div>

      {/* Initiation Overlay */}
      {!isExamStarted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/90 backdrop-blur-2xl p-4 animate-in fade-in duration-500">
          <div className="glass rounded-[2rem] shadow-2xl max-w-xl w-full p-12 border border-white/5 animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 glow-blue">
                <span className="text-3xl">⚡</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-100">Protocols Required</h2>
                <p className="text-slate-400 text-sm font-medium">System verification for secure assessment</p>
              </div>
            </div>

            <div className="space-y-4 mb-12">
              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-5">
                <span className="text-3xl">🤖</span>
                <p className="text-sm font-medium text-amber-200 leading-relaxed">
                  <strong className="text-amber-100 uppercase tracking-wider block mb-1">AI Proctoring Enabled</strong> 
                  Biometric analysis and environmental monitoring will be active. Maintain focus within the portal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: '💠', label: 'Locked Fullscreen', desc: 'Exit triggers alert' },
                  { icon: '📸', label: 'Face Tracking', desc: 'Continuous verification' },
                  { icon: '🔗', label: 'No Off-tab Navigation', desc: 'Immediate breach logging' },
                  { icon: '🛑', label: '3-Strike Policy', desc: 'Protocol termination' }
                ].map((rule, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-2xl">{rule.icon}</span>
                    <div>
                      <div className="font-bold text-slate-100 text-[11px] uppercase tracking-wider mb-0.5">{rule.label}</div>
                      <div className="text-[10px] text-slate-500 font-medium leading-tight">{rule.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleAcceptRules}
              className="btn-primary w-full py-5 text-xl tracking-tight"
            >
              Initialize Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamConsole;
