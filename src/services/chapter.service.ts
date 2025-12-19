import { ApiService } from './api.service';
import type { Chapter } from '@app-types/index';

class ChapterService extends ApiService {
  async getChapters(subjectId?: string): Promise<Chapter[]> {
    const url = subjectId
      ? `/api/chapters/?subject_id=${subjectId}`
      : '/api/chapters/';
    const response = await this.get<Chapter[]>(url);
    return response.data || [];
  }

  async getChapterById(id: string): Promise<Chapter | null> {
    const response = await this.get<Chapter>(`/api/chapters/${id}`);
    return response.data || null;
  }
}

export const chapterService = new ChapterService();
