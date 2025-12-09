import { useState, useRef, useCallback, useEffect } from 'react';

function Upcoming({ landingStartAt }) {
  document.title = '랜딩 시작 전 | Greenlight';

  const calculateTimeLeft = useCallback(() => {
  return Math.max(new Date(landingStartAt) - Date.now(), 0) / 1000;
}, [landingStartAt]);

  const [isImageLoading, setIsImageLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  
  const onWaitingImageLoad = () => {
    setIsImageLoading(false);
  };

  const mudoTempRandom = useRef(Math.random());

  const formatDate = (landingStartAt) => {
    const date = new Date(landingStartAt);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let hour = date.getHours();
    const minute = date.getMinutes();

    // 오전/오후 판별
    const period = hour >= 12 ? "오후" : "오전";

    // 12시간제로 변환 (13 → 1, 15 → 3)
    hour = hour % 12 || 12; // 0 → 12, 13 → 1

    // 분이 1자리면 05 이런 식으로 표시
    const minuteStr = String(minute).padStart(2, "0");

    return `${month}월 ${day}일 ${period} ${hour}시 ${minuteStr}분`;
  };

useEffect(() => {
  const interval = setInterval(() => {
    const diff = calculateTimeLeft();
    if (diff <= 0) {
      //랜딩시간 되는 경우 다시 대기열 화면으로 이동
      window.location.reload();
    }
    setTimeLeft(diff);
  }, 500);

  return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
}, [landingStartAt]);

  // 대기 이미지 업로드
  const getImageUrl = () => {
    if (mudoTempRandom.current > 0.5) {
      return '/resources/images/251209_muhan_1.jpg';
    } else {
      return '/resources/images/251209_muhan_2.png';
    }
  };

  return (
    <>
          <div className="flex items-center justify-center h-dvh">
            <div className="m-auto w-[75%] max-w-[480px] flex flex-col items-center">
              <div className="w-full flex flex-col items-center relative">
                {/* 대기 중 광고 이미지 */}
                <div className="image-wrapper">
                  {isImageLoading && <div className="image-skeleton" />}
                  <img
                    src={getImageUrl()}
                    alt=""
                    className="image"
                    onLoad={onWaitingImageLoad}
                  />
                </div>
              </div>
              <section className="w-full flex flex-col items-center mt-5 mb-3">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-center">
                  {/* 아직 접속 대기 중이에요 */}
                  설렘 가득한 기다림👀
                </h1>
              </section>
               <div
                className="bg-[#f5f5f5] py-2 my-4 text-sm text-center rounded w-full select-none"
              >
                <div className="mb-1 flex flex-col">
                  <span className="text-lg text-neutral-600 mb-1">
                   OPEN
                    </span>
                  <span className="text-xl text-[#375A4E] font-semibold">
                    {formatDate(landingStartAt)}
                  </span>
                </div>
              </div>
    
              <section className="flex flex-col items-center text-neutral-500 mb-5 text-xs">
                <p className="whitespace-nowrap">
                 페이지를 새로고침하지 않고 유지해 주세요.
                </p>
                <p>입장시간이 되면 자동으로 접속이 진행됩니다</p>
              </section>
              <section className="flex flex-col items-center">
              </section>
            </div>
          </div>
        </>
  );
}

export default Upcoming;
