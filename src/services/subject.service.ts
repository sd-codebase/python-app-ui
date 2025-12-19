import { ApiService } from './api.service';
import type { Subject } from '@app-types/index';

class SubjectService extends ApiService {
  async getSubjects(courseId?: string): Promise<Subject[]> {
    const url = courseId
      ? `/api/subjects/?course_id=${courseId}`
      : '/api/subjects/';
    const response = await this.get<Subject[]>(url);
    return response.data || [];
  }

  async getSubjectById(id: string): Promise<Subject | null> {
    const response = await this.get<Subject>(`/api/subjects/${id}`);
    return response.data || null;
  }
}

export const subjectService = new SubjectService();
