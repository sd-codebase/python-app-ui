import { ApiService } from './api.service';
import type { Course } from '@app-types/index';

class CourseService extends ApiService {
  async getCourses(): Promise<Course[]> {
    const response = await this.get<Course[]>('/api/courses/');
    return response.data || [];
  }

  async getCourseById(id: string): Promise<Course | null> {
    const response = await this.get<Course>(`/api/courses/${id}`);
    return response.data || null;
  }
}

export const courseService = new CourseService();
