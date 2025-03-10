import './App.css';
import EventPage from './pages/EventPage.jsx';
import { Route, Routes } from 'react-router';

function App() {
  return (
    <>
      <Routes>
        <Route path="/events/:eventName" element={<EventPage />} />
      </Routes>
    </>
  );
}

export default App;
