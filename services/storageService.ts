import { Subject } from '../types';

const STORAGE_KEY = 'scholartrack_data_v1';

const defaultSubjects: Subject[] = [
  {
    id: 'sub_1',
    name: 'Mathematics',
    code: 'MATH101',
    color: '#4F46E5',
    targetScore: 90,
    credits: 4,
    scores: [
      { id: 's1', title: 'Midterm Exam', obtained: 85, total: 100, date: '2023-10-15', type: 'Exam' },
      { id: 's2', title: 'Calculus Quiz', obtained: 18, total: 20, date: '2023-11-02', type: 'Quiz' },
    ]
  },
  {
    id: 'sub_2',
    name: 'Computer Science',
    code: 'CS202',
    color: '#10B981',
    targetScore: 95,
    credits: 3,
    scores: [
      { id: 's3', title: 'Algorithm Project', obtained: 98, total: 100, date: '2023-11-20', type: 'Project' },
    ]
  }
];

export const loadSubjects = (): Subject[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return defaultSubjects;
  } catch (error) {
    console.error("Failed to load data", error);
    return defaultSubjects;
  }
};

export const saveSubjects = (subjects: Subject[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
  } catch (error) {
    console.error("Failed to save data", error);
  }
};