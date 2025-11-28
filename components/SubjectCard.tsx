import React from 'react';
import { Subject } from '../types';
import { ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

interface SubjectCardProps {
  subject: Subject;
  onClick: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
  const totalObtained = subject.scores.reduce((acc, curr) => acc + curr.obtained, 0);
  const totalPossible = subject.scores.reduce((acc, curr) => acc + curr.total, 0);
  const percentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;
  
  const isPassing = percentage >= (subject.targetScore - 10); // Simple threshold logic
  const isOnTrack = percentage >= subject.targetScore;

  const chartData = subject.scores.slice(-5).map((s, i) => ({
    name: i.toString(),
    value: (s.obtained / s.total) * 100
  }));

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-all hover:border-indigo-200 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {subject.name}
          </h3>
          <p className="text-xs text-gray-500 font-medium">{subject.code || 'No Code'}</p>
        </div>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
          style={{ backgroundColor: subject.color }}
        >
          {subject.name.substring(0, 2).toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Current Grade</p>
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-bold ${isOnTrack ? 'text-gray-900' : 'text-amber-600'}`}>
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="h-12 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={chartData}>
               <Bar dataKey="value" fill={subject.color} radius={[2, 2, 0, 0]} />
               <Tooltip cursor={{fill: 'transparent'}} contentStyle={{display:'none'}} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center text-xs text-gray-500">
           <span className="font-medium mr-1">{subject.scores.length}</span> assessments
        </div>
        <div className={`flex items-center text-xs font-medium ${isOnTrack ? 'text-green-600' : 'text-red-500'}`}>
          {isOnTrack ? (
            <>
              <ArrowUpRight className="w-3 h-3 mr-1" />
              On Track
            </>
          ) : (
            <>
              <ArrowDownRight className="w-3 h-3 mr-1" />
              Needs Focus
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;