import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { EventPage, MyTickets, Portal, TenantHome } from './pages.js';
import { resolveRoute } from './routing.js';

function App() {
  const route = resolveRoute(window.location);
  switch (route.page) {
    case 'portal':
      return <Portal />;
    case 'home':
      return <TenantHome tenant={route.tenant} basePath={route.basePath} />;
    case 'event':
      return <EventPage tenant={route.tenant} basePath={route.basePath} eventId={route.eventId} />;
    case 'tickets':
      return <MyTickets {...route} />;
    default:
      return <main style={{ padding: 32 }}><h1>Página no encontrada</h1></main>;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
