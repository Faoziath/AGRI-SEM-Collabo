import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Start Mock Service Worker
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/browser');
  const { seedDatabase } = await import('./mocks/seed');
  
  // Seed the database
  seedDatabase();
  
  // Start MSW worker
  return worker.start({
    onUnhandledRequest: 'bypass',
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
