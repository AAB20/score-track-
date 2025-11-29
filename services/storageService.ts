import { Subject } from '../types';

const STORAGE_KEY = 'scholartrack_python_v1';

const defaultSubjects: Subject[] = [
  {
    id: 'sub_py1',
    name: 'Python Fundamentals',
    code: 'PY101',
    color: '#306998', // Python Blue
    targetScore: 95,
    credits: 3,
    scores: [
      { id: 's1', title: 'Variables & Types', obtained: 20, total: 20, date: '2023-09-10', type: 'Quiz' },
      { id: 's2', title: 'Loops & Logic', obtained: 42, total: 50, date: '2023-09-25', type: 'Assignment' },
      { id: 's3', title: 'OOP Concept Exam', obtained: 88, total: 100, date: '2023-10-15', type: 'Exam' },
    ]
  },
  {
    id: 'sub_py2',
    name: 'Data Science with Pandas',
    code: 'DS201',
    color: '#150458', // Pandas Dark Blue
    targetScore: 90,
    credits: 4,
    scores: [
      { id: 's4', title: 'DataFrame Manipulation', obtained: 18, total: 20, date: '2023-11-05', type: 'Quiz' },
      { id: 's5', title: 'Exploratory Analysis Project', obtained: 92, total: 100, date: '2023-11-20', type: 'Project' },
    ]
  },
  {
    id: 'sub_st1',
    name: 'Streamlit Web Apps',
    code: 'ST301',
    color: '#FF4B4B', // Streamlit Red
    targetScore: 100,
    credits: 3,
    scores: [
      { id: 's6', title: 'Session State Quiz', obtained: 15, total: 15, date: '2023-12-01', type: 'Quiz' },
      { id: 's7', title: 'Dashboard Deployment', obtained: 98, total: 100, date: '2023-12-15', type: 'Project' },
    ]
  },
  {
    id: 'sub_ml1',
    name: 'Machine Learning',
    code: 'ML401',
    color: '#F59E0B', // Orange/Yellow
    targetScore: 85,
    credits: 4,
    scores: [
      { id: 's8', title: 'Linear Regression', obtained: 35, total: 50, date: '2023-11-10', type: 'Assignment' },
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