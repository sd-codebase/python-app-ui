import { ApiService } from './api.service';
import type {
  TestType,
  SetTestListResponse,
  SetTestResponse,
  TopicTestCreate,
  TopicTestUpdate,
  ChapterTestCreate,
  ChapterTestUpdate,
  SubjectTestCreate,
  SubjectTestUpdate,
  CourseTestCreate,
  CourseTestUpdate,
} from '@app-types/index';

class SetTestService extends ApiService {
  async getSetTests(testType?: TestType): Promise<SetTestListResponse[]> {
    const url = testType
      ? `/api/set-tests?test_type=${testType}`
      : '/api/set-tests';
    const response = await this.get<SetTestListResponse[]>(url);
    return response.data || [];
  }

  async getSetTest(setTestId: string): Promise<SetTestResponse | null> {
    const response = await this.get<SetTestResponse>(`/api/set-tests/${setTestId}`);
    return response.data || null;
  }

  async deleteSetTest(setTestId: string): Promise<boolean> {
    await this.delete(`/api/set-tests/${setTestId}`);
    return true;
  }

  // Topic Test
  async createTopicTest(data: TopicTestCreate): Promise<SetTestResponse | null> {
    const response = await this.post<SetTestResponse, TopicTestCreate>(
      '/api/set-tests/topic',
      data
    );
    return response.data || null;
  }

  async updateTopicTest(setTestId: string, data: TopicTestUpdate): Promise<SetTestResponse | null> {
    const response = await this.put<SetTestResponse, TopicTestUpdate>(
      `/api/set-tests/topic/${setTestId}`,
      data
    );
    return response.data || null;
  }

  // Chapter Test
  async createChapterTest(data: ChapterTestCreate): Promise<SetTestResponse | null> {
    const response = await this.post<SetTestResponse, ChapterTestCreate>(
      '/api/set-tests/chapter',
      data
    );
    return response.data || null;
  }

  async updateChapterTest(setTestId: string, data: ChapterTestUpdate): Promise<SetTestResponse | null> {
    const response = await this.put<SetTestResponse, ChapterTestUpdate>(
      `/api/set-tests/chapter/${setTestId}`,
      data
    );
    return response.data || null;
  }

  // Subject Test
  async createSubjectTest(data: SubjectTestCreate): Promise<SetTestResponse | null> {
    const response = await this.post<SetTestResponse, SubjectTestCreate>(
      '/api/set-tests/subject',
      data
    );
    return response.data || null;
  }

  async updateSubjectTest(setTestId: string, data: SubjectTestUpdate): Promise<SetTestResponse | null> {
    const response = await this.put<SetTestResponse, SubjectTestUpdate>(
      `/api/set-tests/subject/${setTestId}`,
      data
    );
    return response.data || null;
  }

  // Course Test
  async createCourseTest(data: CourseTestCreate): Promise<SetTestResponse | null> {
    const response = await this.post<SetTestResponse, CourseTestCreate>(
      '/api/set-tests/course',
      data
    );
    return response.data || null;
  }

  async updateCourseTest(setTestId: string, data: CourseTestUpdate): Promise<SetTestResponse | null> {
    const response = await this.put<SetTestResponse, CourseTestUpdate>(
      `/api/set-tests/course/${setTestId}`,
      data
    );
    return response.data || null;
  }
}

export const setTestService = new SetTestService();
