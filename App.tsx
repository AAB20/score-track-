import React, { useState, useEffect } from 'react';
import { Subject, Score, InsightData } from './types';
import { loadSubjects, saveSubjects } from './services/storageService';
import { generateAcademicInsights } from './services/geminiService';
import SubjectCard from './components/SubjectCard';
import SubjectDetail from './components/SubjectDetail';
import { Plus, LayoutDashboard, GraduationCap, Sparkles, X, Menu } from 'lucide-react';

// Simple unique ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [view, setView] = useState<'dashboard' | 'subject_detail'>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Modal states
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState<Partial<Subject>>({
    name: '',
    code: '',
    targetScore: 90,
    credits: 3,
    color: '#4F46E5'
  });

  // AI Insights State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<InsightData | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setSubjects(loadSubjects());
  }, []);

  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubject.name && newSubject.targetScore) {
      const subject: Subject = {
        id: generateId(),
        name: newSubject.name,
        code: newSubject.code || '',
        color: newSubject.color || '#4F46E5',
        targetScore: Number(newSubject.targetScore),
        credits: Number(newSubject.credits),
        scores: []
      };
      setSubjects([...subjects, subject]);
      setIsAddSubjectModalOpen(false);
      setNewSubject({ name: '', code: '', targetScore: 90, credits: 3, color: '#4F46E5' });
    }
  };

  const deleteSubject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject and all its scores?')) {
      setSubjects(subjects.filter(s => s.id !== id));
      setView('dashboard');
      setSelectedSubjectId(null);
    }
  };

  const addScore = (subjectId: string, scoreData: Omit<Score, 'id'>) => {
    const newScore: Score = { ...scoreData, id: generateId() };
    setSubjects(subjects.map(s => {
      if (s.id === subjectId) {
        return { ...s, scores: [...s.scores, newScore] };
      }
      return s;
    }));
  };

  const deleteScore = (subjectId: string, scoreId: string) => {
    setSubjects(subjects.map(s => {
      if (s.id === subjectId) {
        return { ...s, scores: s.scores.filter(sc => sc.id !== scoreId) };
      }
      return s;
    }));
  };

  const generateAIInsights = async () => {
    if (!process.env.API_KEY) {
      alert("API Key not found. Please configure the environment.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setIsAIModalOpen(true);
    try {
      const data = await generateAcademicInsights(subjects);
      setAiData(data);
    } catch (err: any) {
      setAiError(err.message || "Failed to generate insights.");
    } finally {
      setAiLoading(false);
    }
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const overallAverage = subjects.reduce((acc, sub) => {
    const subTotal = sub.scores.reduce((a, b) => a + b.obtained, 0);
    const subMax = sub.scores.reduce((a, b) => a + b.total, 0);
    const subPct = subMax > 0 ? (subTotal / subMax) * 100 : 0;
    return acc + subPct;
  }, 0) / (subjects.length || 1);

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] text-gray-900 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static
      `}>
        <div className="p-6 flex items-center border-b border-gray-100">
          <GraduationCap className="w-8 h-8 text-indigo-600 mr-3" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            ScholarTrack
          </span>
        </div>
        
        <nav className="p-4 space-y-1">
          <button 
            onClick={() => { setView('dashboard'); setSidebarOpen(false); }}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Your Subjects
          </div>
          
          {subjects.map(sub => (
            <button
              key={sub.id}
              onClick={() => { 
                setSelectedSubjectId(sub.id); 
                setView('subject_detail'); 
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors group ${selectedSubjectId === sub.id && view === 'subject_detail' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="w-2 h-2 rounded-full mr-3 group-hover:scale-110 transition-transform" style={{ backgroundColor: sub.color }}></span>
              {sub.name}
            </button>
          ))}

          <button
             onClick={() => { setIsAddSubjectModalOpen(true); setSidebarOpen(false); }}
             className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors mt-2 border border-dashed border-gray-200"
          >
            <Plus className="w-4 h-4 mr-3" />
            Add Subject
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-100 bg-gray-50/50">
          {process.env.API_KEY && (
             <button
              onClick={generateAIInsights}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Insights
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="mr-3 text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-gray-900">ScholarTrack</span>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {view === 'dashboard' ? (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Academic Overview</h1>
                  <p className="text-gray-500 mt-1">Track your progress and achieve your goals.</p>
                </div>
                <button 
                  onClick={() => setIsAddSubjectModalOpen(true)}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:bg-indigo-700 transition-all flex items-center self-start"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Subject
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Overall GPA Estimate</p>
                  <h3 className="text-3xl font-bold text-gray-900">{overallAverage.toFixed(1)}%</h3>
                  <p className="text-xs text-green-600 mt-2 font-medium flex items-center">
                     Across {subjects.length} subjects
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <p className="text-sm text-gray-500 mb-1">Total Assessments</p>
                   <h3 className="text-3xl font-bold text-gray-900">
                     {subjects.reduce((acc, s) => acc + s.scores.length, 0)}
                   </h3>
                   <p className="text-xs text-indigo-600 mt-2 font-medium">Recorded so far</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <p className="text-sm text-gray-500 mb-1">Highest Performing</p>
                   <h3 className="text-xl font-bold text-gray-900 truncate">
                     {subjects.length > 0 
                        ? subjects.sort((a,b) => {
                             const getAvg = (s: Subject) => s.scores.reduce((x,y)=>x+y.obtained,0) / Math.max(1, s.scores.reduce((x,y)=>x+y.total,0));
                             return getAvg(b) - getAvg(a);
                          })[0].name
                        : '—'
                     }
                   </h3>
                   <p className="text-xs text-gray-400 mt-2">Keep it up!</p>
                </div>
              </div>

              {/* Subjects Grid */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Subjects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {subjects.map(subject => (
                    <SubjectCard 
                      key={subject.id} 
                      subject={subject} 
                      onClick={() => { setSelectedSubjectId(subject.id); setView('subject_detail'); }} 
                    />
                  ))}
                  <button 
                    onClick={() => setIsAddSubjectModalOpen(true)}
                    className="flex flex-col items-center justify-center h-full min-h-[240px] rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-medium">Add New Subject</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            selectedSubject && (
              <SubjectDetail 
                subject={selectedSubject} 
                onBack={() => setView('dashboard')}
                onAddScore={addScore}
                onDeleteScore={deleteScore}
                onDeleteSubject={deleteSubject}
              />
            )
          )}
        </div>
      </main>

      {/* Add Subject Modal */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">Create New Subject</h3>
              <button onClick={() => setIsAddSubjectModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleAddSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Advanced Physics"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newSubject.name}
                  onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                   <input 
                     type="text" 
                     placeholder="PHY201"
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                     value={newSubject.code}
                     onChange={e => setNewSubject({...newSubject, code: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                   <input 
                     type="number" 
                     min="1"
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                     value={newSubject.credits}
                     onChange={e => setNewSubject({...newSubject, credits: Number(e.target.value)})}
                   />
                 </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Score (%)</label>
                <div className="flex items-center">
                  <input 
                    type="range" 
                    min="50" max="100" 
                    className="w-full mr-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    value={newSubject.targetScore}
                    onChange={e => setNewSubject({...newSubject, targetScore: Number(e.target.value)})}
                  />
                  <span className="text-sm font-bold text-gray-900 w-12 text-right">{newSubject.targetScore}%</span>
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Color Label</label>
                 <div className="flex space-x-3">
                   {['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'].map(color => (
                     <button
                       key={color}
                       type="button"
                       onClick={() => setNewSubject({...newSubject, color})}
                       className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${newSubject.color === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                       style={{ backgroundColor: color }}
                     />
                   ))}
                 </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md">
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Insights Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-fade-in-up border border-gray-100">
             <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-gray-900 text-lg">AI Academic Coach</h3>
                </div>
                <button onClick={() => setIsAIModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8">
               {aiLoading ? (
                 <div className="flex flex-col items-center justify-center py-12 space-y-4">
                   <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                   <p className="text-gray-500 font-medium animate-pulse">Analyzing your performance patterns...</p>
                 </div>
               ) : aiError ? (
                 <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                   <p>{aiError}</p>
                   <button onClick={generateAIInsights} className="mt-2 text-sm underline hover:text-red-800">Try Again</button>
                 </div>
               ) : aiData ? (
                 <div className="space-y-8">
                   <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                     <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-wide mb-2">Summary</h4>
                     <p className="text-gray-800 leading-relaxed">{aiData.summary}</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <h4 className="flex items-center text-green-700 font-bold mb-3">
                         <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                         Strengths
                       </h4>
                       <ul className="space-y-2">
                         {aiData.strengths.map((s, i) => (
                           <li key={i} className="flex items-start text-sm text-gray-700 bg-green-50/50 p-3 rounded-lg">
                             <span className="mr-2">•</span> {s}
                           </li>
                         ))}
                       </ul>
                     </div>
                     <div>
                       <h4 className="flex items-center text-amber-700 font-bold mb-3">
                         <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                         Focus Areas
                       </h4>
                       <ul className="space-y-2">
                         {aiData.weaknesses.map((w, i) => (
                           <li key={i} className="flex items-start text-sm text-gray-700 bg-amber-50/50 p-3 rounded-lg">
                             <span className="mr-2">•</span> {w}
                           </li>
                         ))}
                       </ul>
                     </div>
                   </div>

                   <div>
                     <h4 className="font-bold text-gray-900 mb-4 border-b pb-2">Actionable Study Tips</h4>
                     <div className="space-y-3">
                       {aiData.tips.map((tip, i) => (
                         <div key={i} className="flex items-start bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                           <div className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 mr-3">
                             {i + 1}
                           </div>
                           <p className="text-gray-700 text-sm leading-relaxed">{tip}</p>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>
               ) : null}
             </div>
             
             {!aiLoading && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                  <button onClick={() => setIsAIModalOpen(false)} className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                    Close
                  </button>
                </div>
             )}
           </div>
        </div>
      )}

    </div>
  );
}

export default App;