import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { Refine } from '@refinedev/core';
import { RefineThemes, useNotificationProvider } from '@refinedev/antd';
import routerBindings from '@refinedev/react-router';
import { QueryProvider } from './QueryProvider';
import { authProvider } from './AuthProvider';
import { ErrorBoundary } from '@components/common';

import '@refinedev/antd/dist/reset.css';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryProvider>
          <ConfigProvider theme={RefineThemes.Blue}>
            <AntApp>
              <Refine
                authProvider={authProvider}
                routerProvider={routerBindings}
                notificationProvider={useNotificationProvider}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  disableTelemetry: true,
                }}
              >
                {children}
              </Refine>
            </AntApp>
          </ConfigProvider>
        </QueryProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
