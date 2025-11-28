export type AssessmentType = 'Exam' | 'Quiz' | 'Assignment' | 'Project' | 'Other';

export interface Score {
  id: string;
  title: string;
  obtained: number;
  total: number;
  date: string; // ISO date string
  type: AssessmentType;
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  color: string;
  targetScore: number;
  credits: number;
  scores: Score[];
}

export interface InsightData {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
}
