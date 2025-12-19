import { ApiService } from './api.service';
import type {
  GenerateTestRequest,
  TestMetadataResponse,
  TestDetailResponse,
  SubmitTestRequest,
  SubmitTestResponse,
} from '@app-types/index';

class TestService extends ApiService {
  async generateTest(data: GenerateTestRequest): Promise<TestMetadataResponse | null> {
    const response = await this.post<TestMetadataResponse, GenerateTestRequest>(
      '/api/tests/generate',
      data
    );
    return response.data || null;
  }

  async getTests(skip = 0, limit = 20): Promise<TestMetadataResponse[]> {
    const response = await this.get<TestMetadataResponse[]>(
      `/api/tests?skip=${skip}&limit=${limit}`
    );
    return response.data || [];
  }

  async getTest(testId: string): Promise<TestDetailResponse | null> {
    const response = await this.get<TestDetailResponse>(`/api/tests/${testId}`);
    return response.data || null;
  }

  async submitTest(testId: string, data: SubmitTestRequest): Promise<SubmitTestResponse | null> {
    const response = await this.post<SubmitTestResponse, SubmitTestRequest>(
      `/api/tests/${testId}/submit`,
      data
    );
    return response.data || null;
  }
}

export const testService = new TestService();
