export interface Course {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  course_id?: string;
  is_active: boolean;
}

export interface Chapter {
  id: string;
  name: string;
  description?: string;
  order_num: number;
  subject_id?: string;
  is_active: boolean;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  order_num: number;
  chapter_id?: string;
  is_active: boolean;
}

export type TestType = 'topic' | 'chapter' | 'subject' | 'course';

// Test Format Types
export interface DifficultyDistribution {
  L1: number; // Easy (default - remaining questions)
  L2: number; // Medium
  L3: number; // Hard
}

export interface TestSection {
  id: string;
  name: string;
  question_count: number;
  attempt_count: number;
  marks_per_question: number;
  negative_marks: number;
  is_numerical: boolean;
  difficulty?: DifficultyDistribution;
}

export interface SubjectSectionInput {
  subject_id: string;
  subject_name: string;
  sections: TestSection[];
}

export interface TestFormatBase {
  id?: string;
  name: string;
  test_type: TestType;
  time_limit_minutes: number;
  is_active: boolean;
}

export interface CourseTestFormat extends TestFormatBase {
  test_type: 'course';
  course_id: string | 'any';
  subject_sections: SubjectSectionInput[];
}

export interface SubjectTestFormat extends TestFormatBase {
  test_type: 'subject';
  subject_id: 'any';
  sections: TestSection[];
}

export interface ChapterTestFormat extends TestFormatBase {
  test_type: 'chapter';
  chapter_id: 'any';
  question_count: number;
  marks_per_question: number;
  negative_marks: number;
  difficulty: DifficultyDistribution;
}

export interface TopicTestFormat extends TestFormatBase {
  test_type: 'topic';
  topic_id: 'any';
  question_count: number;
  marks_per_question: number;
  negative_marks: number;
  difficulty: DifficultyDistribution;
}

export type TestFormat = CourseTestFormat | SubjectTestFormat | ChapterTestFormat | TopicTestFormat;

export interface GenerateTestRequest {
  test_type: TestType;
  reference_id: string;
}

export interface TestMetadataResponse {
  id: string;
  test_type: string;
  reference_id: string;
  reference_name: string;
  total_questions: number;
  is_submitted: boolean;
  score?: number | null;
  created_at: string;
}

export interface QuestionForTaking {
  question_id: string;
  question: string;
  options?: Record<string, string> | null;
  has_integer_answer?: boolean;
  user_answer?: string | null;
}

export interface TestDetailResponse {
  id: string;
  test_type: string;
  reference_id: string;
  reference_name: string;
  total_questions: number;
  is_submitted: boolean;
  score?: number | null;
  questions: QuestionForTaking[];
  created_at: string;
}

export interface AnswerItem {
  question_id: string;
  user_answer: string | null;
}

export interface SubmitTestRequest {
  answers: AnswerItem[];
}

export interface QuestionResult {
  question_id: string;
  user_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
}

export interface SubmitTestResponse {
  test_id: string;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  unanswered: number;
  score: number;
  max_score: number;
  percentage: number;
  negative_marking_applied: boolean;
  results: QuestionResult[];
}

// Set Test API Types
export interface SetTestListResponse {
  id: string;
  name: string;
  time_limit_minutes: number;
  is_active: boolean;
  test_type: TestType;
  created_at: string;
  updated_at: string;
}

export interface SetTestResponse extends SetTestListResponse {
  topic_id?: string | null;
  chapter_id?: string | null;
  subject_id?: string | null;
  course_id?: string | null;
  question_count?: number | null;
  marks_per_question?: number | null;
  negative_marks?: number | null;
  difficulty?: DifficultyDistribution | null;
  sections?: TestSection[] | null;
  subject_sections?: SubjectSectionInput[] | null;
}

export interface TopicTestCreate {
  name: string;
  time_limit_minutes: number;
  is_active?: boolean;
  topic_id: string;
  question_count: number;
  marks_per_question: number;
  negative_marks?: number;
  difficulty: DifficultyDistribution;
}

export interface ChapterTestCreate {
  name: string;
  time_limit_minutes: number;
  is_active?: boolean;
  chapter_id: string;
  question_count: number;
  marks_per_question: number;
  negative_marks?: number;
  difficulty: DifficultyDistribution;
}

export interface SubjectTestCreate {
  name: string;
  time_limit_minutes: number;
  is_active?: boolean;
  subject_id: string;
  sections: TestSection[];
}

export interface CourseTestCreate {
  name: string;
  time_limit_minutes: number;
  is_active?: boolean;
  course_id: string;
  subject_sections: SubjectSectionInput[];
}

export interface TopicTestUpdate {
  name?: string | null;
  time_limit_minutes?: number | null;
  is_active?: boolean | null;
  topic_id?: string | null;
  question_count?: number | null;
  marks_per_question?: number | null;
  negative_marks?: number | null;
  difficulty?: DifficultyDistribution | null;
}

export interface ChapterTestUpdate {
  name?: string | null;
  time_limit_minutes?: number | null;
  is_active?: boolean | null;
  chapter_id?: string | null;
  question_count?: number | null;
  marks_per_question?: number | null;
  negative_marks?: number | null;
  difficulty?: DifficultyDistribution | null;
}

export interface SubjectTestUpdate {
  name?: string | null;
  time_limit_minutes?: number | null;
  is_active?: boolean | null;
  subject_id?: string | null;
  sections?: TestSection[] | null;
}

export interface CourseTestUpdate {
  name?: string | null;
  time_limit_minutes?: number | null;
  is_active?: boolean | null;
  course_id?: string | null;
  subject_sections?: SubjectSectionInput[] | null;
}
