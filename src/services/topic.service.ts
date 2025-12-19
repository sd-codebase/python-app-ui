import { ApiService } from './api.service';
import type { Topic } from '@app-types/index';

class TopicService extends ApiService {
  async getTopics(chapterId?: string): Promise<Topic[]> {
    const url = chapterId
      ? `/api/topics/?chapter_id=${chapterId}`
      : '/api/topics/';
    const response = await this.get<Topic[]>(url);
    return response.data || [];
  }

  async getTopicById(id: string): Promise<Topic | null> {
    const response = await this.get<Topic>(`/api/topics/${id}`);
    return response.data || null;
  }
}

export const topicService = new TopicService();
