import { useEffect, useRef } from 'react';
import { CountUp } from 'countup.js';

function PositionPanel({ customer }) {
  const positionRef = useRef(null);
  const countUpInstance = useRef(null);

  const options = {
    duration: 0.5,
  };
  useEffect(() => {
    if (positionRef.current && !countUpInstance.current) {
      countUpInstance.current = new CountUp(
        positionRef.current,
        customer?.position,
        options
      );
      countUpInstance.current.start();
    }
  }, []);

  useEffect(() => {
    if (countUpInstance.current) {
      countUpInstance.current.update(customer?.position);
    }
  }, [customer]);

  const formatTime = (s) => {
    if (s < 1) {
      return '곧 입장합니다.';
    }
    const seconds = Math.floor(s % 60);
    const minutes = Math.floor(s / 60);

    return `${minutes}분 ${seconds}초`;
  };
  return (
    <div className="bg-[#F5E7F4] py-2 my-4 text-sm text-center rounded w-full max-w-[200px]">
      <div className="mb-1">
        <span className="mr-2 text-xs">대기순번</span>
        <span ref={positionRef} className="text-[#375A4E] font-semibold"></span>
      </div>
      <div>
        <span className="mr-2 text-xs">남은 시간</span>
        <span className="text-[#375A4E] font-semibold">
          약 {formatTime(customer?.estimatedWaitTime)}
        </span>
      </div>
    </div>
  );
}

export default PositionPanel;
