
export interface ConceptPage {
  id: string;
  title: string;
  code: string;
  content: string;
  explanations: ExplanationBlock[];
  exampleOutput?: string;
  traceFlow?: number[];
  variableHistory?: Record<string, any>[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: 'tutorial' | 'language';
  status: 'locked' | 'current' | 'completed';
  pages: ConceptPage[];
  conceptProblems: Problem[];
  codingProblems: Problem[];
}

export interface Track {
  id: string;
  title: string;
  description: string;
  category: 'tutorial' | 'language';
  lessons: Lesson[];
  iconType: 'python' | 'c' | 'algorithm';
}

export interface ExplanationBlock {
  id: string;
  codeLine: number;
  text: string;
  title: string;
  type: 'yellow' | 'blue' | 'purple' | 'red' | 'orange' | 'green';
  badge: string;
}

export interface Problem {
  id: string;
  question: string;
  options?: string[];
  answer: string;
  hint: string;
  explanation?: string;
  type: 'concept' | 'coding';
  exampleInput?: string;
  exampleOutput?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export enum AppRoute {
  HOME = 'home',
  LEARN = 'learn',
  CURRICULUM = 'curriculum',
  GAP_FILLER = 'gap-filler',
  PLAYGROUND = 'playground',
  ADMIN = 'admin',
  STUDY_GUIDE = 'study-guide',
  QUESTION = 'question'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: number;
  progress: number;
  missedConcepts: Problem[];
  selectedTrackId: string | null;
  completedLessonIds: string[];
}

export interface SupportQuestion {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  is_resolved: boolean;
  created_at: string;
}

export interface UserAccount extends UserProfile {
  password?: string;
}
