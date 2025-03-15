import { useCallback, useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';

function Upcoming({ event }) {
  const eventStartTime = useMemo(
    () => Date.parse(event?.eventStartTime),
    [event]
  );
  const calculateTimeLeft = useCallback(() => {
    return Math.max(eventStartTime - Date.now(), 0) / 1000;
  }, [eventStartTime]);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [shouldGetReady, setShouldGetReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = calculateTimeLeft();
      console.log(diff);
      if (diff <= 10 && !shouldGetReady) {
        setShouldGetReady(true);
      }
      if (diff <= 0) {
        window.location.reload();
      }
      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
  }, [eventStartTime]);

  const formatTime = (ms) => {
    if (ms <= 1) {
      return `지금 입장하기`;
    }
    const seconds = Math.floor(ms) % 60;
    const minutes = Math.floor(ms / 60) % 60;
    const hours = Math.floor(ms / (60 * 60));

    return `${hours}시간 ${minutes}분 ${seconds}초`;
  };

  const tryWaiting = (event) => {
    if (shouldGetReady) {
      fanfare(event);
    }
    if (calculateTimeLeft() <= 0) {
      window.location.reload();
    }
  };

  const getClickOrigin = (event) => {
    const origin = {
      x: event.clientX / window.innerWidth,
      y: event.clientY / window.innerHeight,
    };
    console.log(origin);
    return origin;
  };
  const fanfare = (event) => {
    const defaults = {
      spread: 360,
      ticks: 40,
      gravity: 0,
      decay: 0.9,
      startVelocity: 5,
      colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
      origin: getClickOrigin(event),
    };

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 8,
        scalar: 0.7,
        shapes: ['star'],
      });

      confetti({
        ...defaults,
        particleCount: 4,
        scalar: 0.5,
        shapes: ['circle'],
      });
    }

    shoot();
  };
  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-5 select-none">
      <div className="h-10 mb-3">
        <img src="/heendy.svg" alt="heendy" style={{ width: '36px' }} />
      </div>
      <h1 className="text-sm font-bold mt-5">이벤트 오픈 전입니다</h1>
      <div
        onClick={tryWaiting}
        className="bg-[#F5E7F4] hover:bg-[#f3e0f2] transition-colors py-2 my-4 text-sm text-center rounded w-full max-w-[200px] cursor-pointer "
      >
        <div className="mb-1 flex flex-col">
          {shouldGetReady ? (
            <span className="text-xs text-neutral-600 mb-1">
              곧 입장합니다. 마구 클릭해주세요!
            </span>
          ) : (
            <span className="text-xs text-neutral-600 mb-1">
              이벤트 시작까지
            </span>
          )}
          <span className="text-[#375A4E] font-semibold">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
      <button className="rounded-full border-[1px] border-neutral-200 px-2 py-2 text-[10px]">
        이전으로 돌아가기
      </button>
    </div>
  );
}
export default Upcoming;
