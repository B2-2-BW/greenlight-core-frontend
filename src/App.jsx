import './App.css';
import { Route, Routes } from 'react-router';
import WaitingPage from './pages/WaitingPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { useEffect, useState } from 'react';
import SplashScreen from './components/SplashScreen.jsx';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 500); // 0.7초 (0.5~1초 사이로 조절)
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/l/:landingId" element={<WaitingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* 그 위에 Splash 오버레이 */}
      {showSplash && <SplashScreen />}
    </>
  );
}

export default App;
