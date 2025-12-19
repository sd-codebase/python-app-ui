import { AppProviders } from '@providers/AppProviders';
import { AppRoutes } from '@routes/index';

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
