import './App.css';
import LandingPage from './pages/LandingPage.jsx';
import { Route, Routes } from 'react-router';
import WaitingPage from './pages/WaitingPage.jsx';

function App() {
  return (
    <>
      <Routes>
        <Route path="/l/:landingId" element={<WaitingPage />} />
      </Routes>
    </>
  );
}

export default App;
