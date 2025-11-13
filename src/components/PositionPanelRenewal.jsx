import { useEffect, useState } from 'react';

export default function PositionPanelRenewal({
  isLoading,
  estimatedWaitTime,
  isReady,
  behindCount,
}) {
  const [timeLeft, setTimeLeft] = useState(estimatedWaitTime);
  const [isBlocked, setIsBlocked] = useState(false);
  // estimatedWaitTime prop이 바뀌면 timeLeft 초기화
  useEffect(() => {
    //대기 잔여시간이 -1인경우 진입 불가 상태
    setIsBlocked(estimatedWaitTime === -1);
    setTimeLeft(estimatedWaitTime);
  }, [estimatedWaitTime]);

  const formatTime = (s) => {
    if (!Number.isFinite(s)) return '계산중...';
    s = Math.max(0, Math.floor(s));

    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;

    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    if (hours === 0) {
      return `${mm}분 ${ss}초`;
    } else {
      return `${hours}시간 ${mm}분 ${ss}초`;
    }
  };

  return (
    <>
      <div className="h-16 w-full flex flex-col justify-center bg-[#F5E7F4] py-2 my-4 text-sm sm:text-base md:text-lg text-center rounded">
        {isLoading ? (
          <div className="h-full flex flex-col justify-center items-center">
            <span className="px-4">
              그거 아셨나요? 흰디의 MBTI는 호기심 많은 예술가 ISFP랍니다
            </span>
          </div>
        ) : isReady ? (
          <div className="h-full flex flex-col justify-center items-center">
            <span className="text-[#375A4E] font-semibold">
              곧 입장하실 차례입니다!
            </span>
            <span className="text-default-400 text-lg">
              페이지가 곧 이동합니다.
            </span>
          </div>
        ) : (
          <>
            <div>
              <span className="mr-2">예상 대기 시간</span>
              <span className="text-[#375A4E] font-semibold">
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="text-neutral-600">
              <span className="mr-2"></span>
              <span className="mr-1">뒤에</span>
              <span className="text-[#375A4E] font-semibold">
                {behindCount}
              </span>
              <span className="mr-2">명이 기다리고 있어요</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
