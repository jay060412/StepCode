
export type UserRole = 'user' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: number;
  progress: number;
  missed_concepts: Problem[]; 
  last_track_id: string | null; 
  completed_lesson_ids: string[]; 
  role?: UserRole;
  is_banned?: boolean;
  updated_at?: string;
  theme?: 'dark' | 'light';
  settings?: {
    push: boolean;
    email: boolean;
    browser: boolean;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning';
  is_read: boolean;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  is_important: boolean;
  created_at: string;
  author_id?: string;
}

export interface SupportQuestion {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  is_resolved: boolean;
  created_at: string;
  answer?: string;
  answered_by?: string;
  answered_at?: string;
}

export interface CommunityQuestion {
  id: string;
  user_id: string;
  user_name: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface CommunityComment {
  id: string;
  question_id: string;
  user_id: string;
  user_name: string;
  content: string;
  parent_id: string | null;
  created_at: string;
}

export interface PlaygroundSnippet {
  id: string;
  user_id: string;
  title: string;
  code: string;
  language: string;
  created_at: string;
  updated_at: string;
}

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
  mastered?: boolean; 
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
  QUESTION = 'question',
  SETTINGS = 'settings',
  NOTICE = 'notice'
}

export interface UserAccount extends UserProfile {
  password?: string;
}
