import { ApiService } from './api.service';
import type {
  CreatePredefinedTestRequest,
  PredefinedTestListItem,
  PredefinedTestDetail,
  GenerationStatusResponse,
  AvailablePredefinedTest,
  StartAttemptResponse,
  OngoingAttempt,
  SaveProgressRequest,
  SubmitAttemptRequest,
  SubmitAttemptResponse,
  AttemptHistoryItem,
  ReviewAttemptResponse,
  TestType,
} from '@app-types/index';

// Admin Service for Predefined Tests
class AdminPredefinedTestServiceClass extends ApiService {
  // Create a new predefined test (async generation)
  async createPredefinedTest(data: CreatePredefinedTestRequest): Promise<PredefinedTestListItem | null> {
    const response = await this.post<PredefinedTestListItem, CreatePredefinedTestRequest>(
      '/api/admin/predefined-tests',
      data
    );
    return response.data || null;
  }

  // List all predefined tests
  async getPredefinedTests(): Promise<PredefinedTestListItem[]> {
    const response = await this.get<PredefinedTestListItem[]>('/api/admin/predefined-tests');
    return response.data || [];
  }

  // Get predefined test with questions
  async getPredefinedTest(id: string): Promise<PredefinedTestDetail | null> {
    const response = await this.get<PredefinedTestDetail>(`/api/admin/predefined-tests/${id}`);
    return response.data || null;
  }

  // Poll generation status
  async getGenerationStatus(id: string): Promise<GenerationStatusResponse | null> {
    const response = await this.get<GenerationStatusResponse>(`/api/admin/predefined-tests/${id}/status`);
    return response.data || null;
  }

  // Archive a test
  async archiveTest(id: string): Promise<PredefinedTestListItem | null> {
    const response = await this.put<PredefinedTestListItem>(`/api/admin/predefined-tests/${id}/archive`);
    return response.data || null;
  }

  // Publish/republish a test
  async publishTest(id: string): Promise<PredefinedTestListItem | null> {
    const response = await this.put<PredefinedTestListItem>(`/api/admin/predefined-tests/${id}/publish`);
    return response.data || null;
  }

  // Delete a test
  async deleteTest(id: string): Promise<boolean> {
    await this.delete(`/api/admin/predefined-tests/${id}`);
    return true;
  }
}

// User Service for Predefined Tests
class UserPredefinedTestServiceClass extends ApiService {
  // List available predefined tests
  async getAvailableTests(testType?: TestType): Promise<AvailablePredefinedTest[]> {
    const url = testType
      ? `/api/predefined-tests?test_type=${testType}`
      : '/api/predefined-tests';
    const response = await this.get<AvailablePredefinedTest[]>(url);
    return response.data || [];
  }

  // Get tests by reference (topic/chapter/subject/course)
  async getTestsByReference(type: TestType, id: string): Promise<AvailablePredefinedTest[]> {
    const response = await this.get<AvailablePredefinedTest[]>(
      `/api/predefined-tests/by-reference/${type}/${id}`
    );
    return response.data || [];
  }

  // Start a test attempt
  async startAttempt(testId: string): Promise<StartAttemptResponse | null> {
    const response = await this.post<StartAttemptResponse>(`/api/predefined-tests/${testId}/start`);
    return response.data || null;
  }

  // Get ongoing attempt
  async getOngoingAttempt(attemptId: string): Promise<OngoingAttempt | null> {
    const response = await this.get<OngoingAttempt>(`/api/predefined-tests/attempts/${attemptId}`);
    return response.data || null;
  }

  // Auto-save progress
  async saveProgress(attemptId: string, data: SaveProgressRequest): Promise<boolean> {
    await this.put<unknown, SaveProgressRequest>(
      `/api/predefined-tests/attempts/${attemptId}/save`,
      data
    );
    return true;
  }

  // Submit attempt
  async submitAttempt(attemptId: string, data: SubmitAttemptRequest): Promise<SubmitAttemptResponse | null> {
    const response = await this.post<SubmitAttemptResponse, SubmitAttemptRequest>(
      `/api/predefined-tests/attempts/${attemptId}/submit`,
      data
    );
    return response.data || null;
  }

  // Get attempt history
  async getAttemptHistory(): Promise<AttemptHistoryItem[]> {
    const response = await this.get<AttemptHistoryItem[]>('/api/predefined-tests/history');
    return response.data || [];
  }

  // Review submitted attempt
  async reviewAttempt(attemptId: string): Promise<ReviewAttemptResponse | null> {
    const response = await this.get<ReviewAttemptResponse>(
      `/api/predefined-tests/history/${attemptId}/review`
    );
    return response.data || null;
  }
}

export const adminPredefinedTestService = new AdminPredefinedTestServiceClass();
export const userPredefinedTestService = new UserPredefinedTestServiceClass();
