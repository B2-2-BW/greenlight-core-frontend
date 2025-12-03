import './LoadingSignal.css';

const LoadingSignal = () => (
  <div className="loading-signal">
    <div className="dot dot-red"></div>
    <div className="dot dot-orange"></div>
    <div className="dot dot-green"></div>
  </div>
);

function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center text-center p-5 bg-white z-50">
      {/*<img src="/thehyundai-logo.png" alt="thehyundai-logo" width={80} />*/}
      <LoadingSignal />
    </div>
  );
}

export default SplashScreen;
