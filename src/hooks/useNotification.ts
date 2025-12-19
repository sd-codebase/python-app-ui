import { message, notification } from 'antd';
import type { NotificationArgsProps } from 'antd';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

export const useNotification = () => {
  const showMessage = (type: NotificationType, content: string) => {
    message[type](content);
  };

  const showNotification = (
    type: NotificationType,
    title: string,
    description?: string,
    options?: Partial<NotificationArgsProps>
  ) => {
    notification[type]({
      message: title,
      description,
      placement: 'topRight',
      ...options,
    });
  };

  return {
    success: (content: string) => showMessage('success', content),
    error: (content: string) => showMessage('error', content),
    info: (content: string) => showMessage('info', content),
    warning: (content: string) => showMessage('warning', content),
    notify: {
      success: (title: string, description?: string) =>
        showNotification('success', title, description),
      error: (title: string, description?: string) =>
        showNotification('error', title, description),
      info: (title: string, description?: string) =>
        showNotification('info', title, description),
      warning: (title: string, description?: string) =>
        showNotification('warning', title, description),
    },
  };
};
