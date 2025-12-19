import type { TestType, DifficultyDistribution } from './education.types';

// Generation status
export type GenerationStatus = 'pending' | 'in_progress' | 'published' | 'failed' | 'archived';

// Question structure for predefined tests
export interface PredefinedTestQuestion {
  question_id: string;
  question: string;
  options?: Record<string, string> | null;
  has_integer_answer?: boolean;
}

// Admin - Create predefined test request
export interface CreatePredefinedTestRequest {
  set_test_id: string;
  reference_id: string; // actual topic/chapter/subject/course id
  name?: string;
}

// Admin - Predefined test list item
export interface PredefinedTestListItem {
  id: string;
  name: string;
  test_type: TestType;
  reference_id: string;
  reference_name: string;
  set_test_id: string;
  set_test_name: string;
  total_questions: number;
  time_limit_minutes: number;
  status: GenerationStatus;
  is_published: boolean;
  attempt_count: number;
  created_at: string;
  updated_at: string;
}

// Admin - Predefined test with questions
export interface PredefinedTestDetail extends PredefinedTestListItem {
  questions: PredefinedTestQuestion[];
  difficulty?: DifficultyDistribution | null;
}

// Admin - Generation status response
export interface GenerationStatusResponse {
  id: string;
  status: GenerationStatus;
  progress?: number;
  error_message?: string;
}

// User - Available predefined test
export interface AvailablePredefinedTest {
  id: string;
  name: string;
  test_type: TestType;
  reference_id: string;
  reference_name: string;
  total_questions: number;
  time_limit_minutes: number;
  difficulty?: DifficultyDistribution | null;
  user_attempts: number;
  best_score?: number | null;
}

// User - Start attempt response
export interface StartAttemptResponse {
  attempt_id: string;
  test_id: string;
  test_name: string;
  total_questions: number;
  time_limit_minutes: number;
  started_at: string;
  questions: PredefinedTestQuestion[];
}

// User - Ongoing attempt
export interface OngoingAttempt {
  attempt_id: string;
  test_id: string;
  test_name: string;
  total_questions: number;
  time_limit_minutes: number;
  started_at: string;
  time_remaining_seconds: number;
  questions: PredefinedTestQuestion[];
  answers: Record<string, string | null>;
}

// User - Save progress request
export interface SaveProgressRequest {
  answers: Record<string, string | null>;
}

// User - Submit attempt request
export interface SubmitAttemptRequest {
  answers: Record<string, string | null>;
}

// User - Submit attempt response
export interface SubmitAttemptResponse {
  attempt_id: string;
  test_id: string;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  unanswered: number;
  score: number;
  max_score: number;
  percentage: number;
  time_taken_seconds: number;
}

// User - Attempt history item
export interface AttemptHistoryItem {
  attempt_id: string;
  test_id: string;
  test_name: string;
  test_type: TestType;
  reference_name: string;
  total_questions: number;
  correct_count: number;
  score: number;
  max_score: number;
  percentage: number;
  started_at: string;
  submitted_at: string;
  time_taken_seconds: number;
}

// User - Review attempt (with correct answers)
export interface ReviewAttemptQuestion {
  question_id: string;
  question: string;
  options?: Record<string, string> | null;
  has_integer_answer?: boolean;
  user_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
}

export interface ReviewAttemptResponse {
  attempt_id: string;
  test_id: string;
  test_name: string;
  test_type: TestType;
  reference_name: string;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  unanswered: number;
  score: number;
  max_score: number;
  percentage: number;
  time_taken_seconds: number;
  questions: ReviewAttemptQuestion[];
}
