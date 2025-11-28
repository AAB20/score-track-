import React, { useState } from 'react';
import { Subject, Score, AssessmentType } from '../types';
import { ArrowLeft, Plus, Trash2, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface SubjectDetailProps {
  subject: Subject;
  onBack: () => void;
  onAddScore: (subjectId: string, score: Omit<Score, 'id'>) => void;
  onDeleteScore: (subjectId: string, scoreId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
}

const SubjectDetail: React.FC<SubjectDetailProps> = ({ 
  subject, 
  onBack, 
  onAddScore,
  onDeleteScore,
  onDeleteSubject
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newScore, setNewScore] = useState<Partial<Score>>({
    title: '',
    obtained: 0,
    total: 100,
    type: 'Quiz',
    date: new Date().toISOString().split('T')[0]
  });

  const totalObtained = subject.scores.reduce((acc, curr) => acc + curr.obtained, 0);
  const totalPossible = subject.scores.reduce((acc, curr) => acc + curr.total, 0);
  const overallPercentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;

  const chartData = subject.scores.map(s => ({
    name: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: Number(((s.obtained / s.total) * 100).toFixed(1)),
    title: s.title
  }));

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (newScore.title && newScore.obtained !== undefined && newScore.total && newScore.date && newScore.type) {
      onAddScore(subject.id, {
        title: newScore.title,
        obtained: Number(newScore.obtained),
        total: Number(newScore.total),
        date: newScore.date,
        type: newScore.type as AssessmentType,
        notes: newScore.notes || ''
      });
      setIsAddModalOpen(false);
      setNewScore({ title: '', obtained: 0, total: 100, type: 'Quiz', date: new Date().toISOString().split('T')[0] });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        <div className="flex space-x-2">
           <button 
            onClick={() => onDeleteSubject(subject.id)}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Delete Subject
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Score
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1 md:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
            Performance Trend
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{fontSize: 12}} />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number) => [`${value}%`, 'Score']}
                />
                <ReferenceLine y={subject.targetScore} stroke={subject.color} strokeDasharray="3 3" label={{ position: 'right', value: 'Target', fill: subject.color, fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke={subject.color} 
                  strokeWidth={3} 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                  dot={{ r: 4, fill: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
           <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 relative" style={{ background: `conic-gradient(${subject.color} ${overallPercentage}%, #F3F4F6 0)` }}>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{overallPercentage.toFixed(1)}%</span>
              </div>
           </div>
           <h3 className="font-semibold text-gray-900">{subject.name}</h3>
           <p className="text-gray-500 text-sm mb-4">Overall Grade</p>
           <div className="w-full bg-gray-50 rounded-lg p-3 text-left">
             <div className="flex justify-between text-xs mb-1">
               <span className="text-gray-500">Target</span>
               <span className="font-medium text-gray-900">{subject.targetScore}%</span>
             </div>
             <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
               <div className="h-full bg-gray-400" style={{ width: `${subject.targetScore}%` }}></div>
             </div>
           </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Assessment History</h3>
          <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
            {subject.scores.length} entries
          </span>
        </div>
        
        {subject.scores.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No scores recorded yet. Add your first score to start tracking!
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {[...subject.scores].reverse().map((score) => (
              <div key={score.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    score.type === 'Exam' ? 'bg-purple-100 text-purple-600' :
                    score.type === 'Quiz' ? 'bg-blue-100 text-blue-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {score.type === 'Exam' ? <CheckCircle size={18} /> : <Calendar size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{score.title}</h4>
                    <p className="text-xs text-gray-500">{new Date(score.date).toLocaleDateString()} • {score.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <span className="block text-sm font-bold text-gray-900">{score.obtained}/{score.total}</span>
                    <span className={`text-xs font-medium ${
                      (score.obtained/score.total)*100 >= subject.targetScore ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {((score.obtained/score.total)*100).toFixed(1)}%
                    </span>
                  </div>
                  <button 
                    onClick={() => onDeleteScore(subject.id, score.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Score"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Score Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">Add New Score</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmitScore} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Title</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Midterm Exam"
                  value={newScore.title}
                  onChange={e => setNewScore({...newScore, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score Obtained</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newScore.obtained}
                    onChange={e => setNewScore({...newScore, obtained: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Possible</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newScore.total}
                    onChange={e => setNewScore({...newScore, total: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newScore.type}
                    onChange={e => setNewScore({...newScore, type: e.target.value as AssessmentType})}
                  >
                    <option value="Exam">Exam</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Project">Project</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newScore.date}
                    onChange={e => setNewScore({...newScore, date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  rows={2}
                  value={newScore.notes}
                  onChange={e => setNewScore({...newScore, notes: e.target.value})}
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md"
                >
                  Save Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectDetail;