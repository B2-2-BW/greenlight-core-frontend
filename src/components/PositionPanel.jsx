import { useEffect, useRef } from 'react';
import { CountUp } from 'countup.js';

function PositionPanel({ position, estimatedWaitTime, isReady }) {
  const positionRef = useRef(null);
  const countUpInstance = useRef(null);

  const options = {
    duration: 0.5,
  };
  useEffect(() => {
    if (positionRef.current && !countUpInstance.current) {
      countUpInstance.current = new CountUp(
        positionRef.current,
        position,
        options
      );
      countUpInstance.current.start();
    }
  }, []);

  useEffect(() => {
    if (countUpInstance.current && !isReady) {
      countUpInstance.current.update(position);
    }
  }, [position, isReady]);

  const formatTime = (s) => {
    if (s < 0) {
      return 'N/A';
    }
    const seconds = Math.floor(s % 60);
    const minutes = Math.floor(s / 60);
    if (isNaN(seconds) || isNaN(minutes)) {
      return '계산중...';
    }
    return `약 ${minutes}분 ${seconds}초`;
  };
  return (
    <div className="bg-[#F5E7F4] py-2 my-4 text-sm text-center rounded w-[200px] h-[60px]">
      {isReady ? (
        <div className="h-full flex flex-col justify-center items-center">
          <span className="text-[#375A4E] font-semibold">곧 입장합니다.</span>
          <span className="text-default-400 text-xs">준비해주세요!</span>
        </div>
      ) : (
        <>
          <div className="mb-1">
            <span className="mr-2 text-xs">대기순번</span>
            <span
              ref={positionRef}
              className="text-[#375A4E] font-semibold"
            ></span>
          </div>
          <div>
            <span className="mr-2 text-xs">남은 시간</span>
            <span className="text-[#375A4E] font-semibold">
              {formatTime(estimatedWaitTime)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default PositionPanel;
