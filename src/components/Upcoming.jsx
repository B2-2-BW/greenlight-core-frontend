import { useCallback, useEffect, useMemo, useState } from 'react';

function Upcoming({ event }) {
  const eventStartTime = useMemo(
    () => Date.parse(event?.eventStartTime),
    [event]
  );
  const calcDiff = useCallback(() => {
    return Math.max(eventStartTime - Date.now(), 0);
  }, [eventStartTime]);
  const [timeDiff, setTimeDiff] = useState(calcDiff());

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = calcDiff();
      if (diff <= 0) {
        window.location.reload();
      }
      setTimeDiff(diff);
    }, 1000);

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
  }, [eventStartTime]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));

    return `${hours}시간 ${minutes}분 ${seconds}초`;
  };
  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-5">
      <div className="h-10 mb-3">
        <img src="/public/heendy.svg" alt="heendy" style={{ width: '36px' }} />
      </div>
      <h1 className="text-sm font-bold mt-5">이벤트 오픈 전입니다</h1>
      <div className="bg-[#F5E7F4] py-2 my-4 text-sm text-center rounded w-full max-w-[200px]">
        <div className="mb-1 flex flex-col">
          <span className="">이벤트 시작까지</span>
          <span className="text-[#375A4E] font-semibold">
            {formatTime(timeDiff)}
          </span>
        </div>
      </div>
      <div className="text-[10px] text-neutral-500 mb-5">
        <p>이벤트 시작 시간에 맞춰 자동으로 입장 페이지로 이동됩니다.</p>
      </div>
      <button className="rounded-full border-[1px] border-neutral-200 px-2 py-2 text-[10px]">
        이전으로 돌아가기
      </button>
    </div>
  );
}
export default Upcoming;
