import './App.css';
import LandingPage from './pages/LandingPage.jsx';
import { Route, Routes } from 'react-router';

function App() {
  return (
    <>
      <Routes>
        <Route path="/l/:landingId" element={<LandingPage />} />
      </Routes>
    </>
  );
}

export default App;
