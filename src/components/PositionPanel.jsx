import { useEffect, useState } from 'react';

function PositionPanel({ position, estimatedWaitTime, isReady }) {
  const [timeLeft, setTimeLeft] = useState(estimatedWaitTime);
  const [positionLeft, setPositionLeft] = useState(position);
  const [isBlocked, setIsBlocked] = useState(false);

  // estimatedWaitTime prop이 바뀌면 timeLeft 초기화
  useEffect(() => {
    if (estimatedWaitTime == -1) { //대기 잔여시간이 -1인경우 진입 불가 상태
      setIsBlocked(true);
    }
    setTimeLeft(estimatedWaitTime);
    setPositionLeft(position)
  }, [estimatedWaitTime, position]);

  const formatTime = (s) => {
    const seconds = Math.floor(s % 60);
    const minutes = Math.floor(s / 60);
    if (isNaN(seconds) || isNaN(minutes)) {
      return '계산중...';
    }
    return `약 ${minutes}분 ${seconds}초`;
  };

  return (
    <div className="w-full bg-[#F5E7F4] py-2 my-4 text-xl text-center rounded">
      { isBlocked ? (
        <div className="h-full flex flex-col justify-center items-center">
          <span className="text-[#375A4E] font-semibold">지금은 진입 불가 상태입니다.</span>
          <span className="text-default-400 text-lg">나중에 다시 시도해주세요.</span>
        </div>
      ) : isReady ? (
        <div className="h-full flex flex-col justify-center items-center">
          <span className="text-[#375A4E] font-semibold">곧 입장하실 차례입니다!</span>
          <span className="text-default-400 text-lg">페이지가 곧 이동합니다.</span>
        </div>
      ) : (
        <>
          <div className="mb-1">
            <span className="mr-2 text-lg">대기순번</span>
            <span className="text-[#375A4E] font-semibold">
              {positionLeft}
            </span>
          </div>
          <div>
            <span className="mr-2 text-lg">남은 시간</span>
            <span className="text-[#375A4E] font-semibold">
              {formatTime(timeLeft)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default PositionPanel;
