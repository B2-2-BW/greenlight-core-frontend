import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import MyPosition from './MyPosition';
import PositionPanelRenewal from './PositionPanelRenewal';

function Upcoming({ actionData, setLandingTimeYn, customerData }) {
  document.title = '랜딩 시작 전 | Greenlight';

  const landingStartAt = useMemo(
    () => Date.parse(actionData?.landingStartAt),
    [actionData]
  );
  const calculateTimeLeft = useCallback(() => {
    return Math.max(landingStartAt - Date.now(), 0) / 1000;
  }, [landingStartAt]);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [shouldGetReady, setShouldGetReady] = useState(false);

  const [isImageLoading, setIsImageLoading] = useState(true);
  const initialPosition = useRef(null);
  const [positionData, setPositionData] = useState(null);
  const [progress, setProgress] = useState(0);

  const [isConnected, setIsConnected] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isUpcomingOpened, setIsUpcomingOpened] = useState(false);

    const onWaitingImageLoad = () => {
    setIsImageLoading(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = calculateTimeLeft();
      if (diff <= 10 && !shouldGetReady) {
        setShouldGetReady(true);
      }
      if (diff <= 0) {
        //랜딩시간 되는 경우 다시 대기열 화면으로 이동
        setLandingTimeYn(true);
      }
      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
  }, [landingStartAt]);

  const formatTime = (ms) => {
    if (ms <= 1) {
      return `지금 입장하기`;
    }
    const seconds = Math.floor(ms) % 60;
    const minutes = Math.floor(ms / 60) % 60;
    const hours = Math.floor(ms / (60 * 60));

    return `${hours}시간 ${minutes}분 ${seconds}초`;
  };

    // [POC용] 액션 그룹 ID에 따라 이미지 경로 반환하는 함수
  const getImageUrl = () => {
    if (customerData?.actionGroupId == null) {
      return '';
    }
    if (customerData?.actionGroupId === 6) {
      return '/resources/images/LI_sample.png';
    }
    if (customerData?.actionGroupId === 7) {
      return '/resources/images/GF_sample2.png';
    }
    // 기본 이미지
    return '/resources/images/mohan_sample.jpg';
  };

    // [POC용2] 액션 그룹 ID에 따른 스타일 반환 함수 추가
  const getThemeStyles = () => {
    // 특정 그룹 ID (예: 7) 일 때 색상 변경
    if (customerData?.actionGroupId === 7) {
      return {
        headerText: 'text-[#1e1e1e]', // 2. 접속 대기중이에요 텍스트 색
        positionNum: 'text-[#918C00]', // 1. 나의 대기순서 숫자 색
        boxBg: 'bg-[#f5f5f5]', // 3. 박스 배경 색
        behindNum: 'text-[#918C00]', // 4. 뒤에 기다리는 사람 숫자 색
      };
    }
    // 기본 스타일 (원래 코드의 색상값)
    return {
      headerText: '', // 기본 검정
      positionNum: 'text-[#375A4E]', // 기존 초록색
      boxBg: 'bg-[#f5f5f5]', // 기존 분홍색 배경
      behindNum: 'text-[#375A4E]', // 기존 초록색
    };
  };

  const theme = getThemeStyles(); // 스타일 객체 생성

  const tryWaiting = (mouseEvent) => {
    if (shouldGetReady) {
      fanfare(mouseEvent);
    }
    if (calculateTimeLeft() <= 0) {
      //랜딩시간 되는 경우 다시 대기열 화면으로 이동
      setLandingTimeYn(true);
    }
  };

  const getClickOrigin = (mouseEvent) => {
    return {
      x: mouseEvent.clientX / window.innerWidth,
      y: mouseEvent.clientY / window.innerHeight,
    };
  };
  const fanfare = (mouseEvent) => {
    const defaults = {
      spread: 360,
      ticks: 40,
      gravity: 0,
      decay: 0.9,
      startVelocity: 5,
      colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
      origin: getClickOrigin(mouseEvent),
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
    // <div className="m-auto w-[75%] max-w-[320px] flex flex-col items-center">
    //   <div className="mb-3 mt-[-108px]">
    //     <img src="/heendy.svg" alt="heendy" style={{ width: '48px' }} />
    //   </div>
    //   <h1 className="text-2xl font-bold mt-5">이벤트 오픈 전입니다</h1>
    //   <div
    //     onClick={tryWaiting}
    //     className="bg-[#F5E7F4] hover:bg-[#f3e0f2] transition-colors py-2 my-4 text-sm text-center rounded w-full cursor-pointer select-none"
    //   >
    //     <div className="mb-1 flex flex-col">
    //       {shouldGetReady ? (
    //         <span className="text-lg text-neutral-600 mb-1">
    //           곧 입장합니다. 마구 클릭해주세요!
    //         </span>
    //       ) : (
    //         <span className="text-lg text-neutral-600 mb-1">
    //           이벤트 시작까지
    //         </span>
    //       )}
    //       <span className="text-xl text-[#375A4E] font-semibold">
    //         {formatTime(timeLeft)}
    //       </span>
    //     </div>
    //   </div>
    //   <section className="flex flex-col items-center">
    //     <button className="rounded-full text-neutral-700 border-[1px] border-neutral-200 px-2 py-2">
    //       이전으로 돌아가기
    //     </button>
    //   </section>
    // </div>
    <>
          <div className="flex items-center justify-center h-dvh">
            <div className="m-auto w-[75%] max-w-[480px] flex flex-col items-center">
              <div className="w-full flex flex-col items-center relative">
                {/* 광고 이미지 */}
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
                {/* 그린푸드 poc */}
                <h1
                  className={`text-lg sm:text-xl md:text-2xl font-semibold text-center ${theme.headerText}`}
                >
                  {/* <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-center"> */}
                  사용자가 많아 접속 대기중이에요
                </h1>
              </section>
              {/* 그린푸드 poc */}
              <MyPosition
                position={positionData?.currentPosition}
                isLoading={isConnected}
                progress={progress}
                numColor={theme.positionNum}
              />
              <PositionPanelRenewal
                isLoading={isConnected}
                behindCount={positionData?.behindCount}
                estimatedWaitTime={positionData?.estimatedWaitTime}
                boxColor={theme.boxBg}
                numColor={theme.behindNum}
              />
              {/* 
              <MyPosition
                position={currentPosition}
                isLoading={isLoading}
                progress={progress}
              />
    
              <PositionPanelRenewal
                isLoading={isLoading}
                behindCount={behindCount}
                estimatedWaitTime={estimatedWaitTime}
              />
               */}
              <section className="flex flex-col items-center text-neutral-500 mb-5 text-xs">
                <p className="whitespace-nowrap">
                  잠시만 기다리시면 순서에 따라 자동 접속됩니다.
                </p>
                <p>새로고침하면 대기시간이 길어질 수 있어요</p>
              </section>
              <section className="flex flex-col items-center">
                {/*<button className="rounded-full text-neutral-700 border-[1px] border-neutral-200 px-2 py-2">*/}
                {/*  이전으로 돌아가기*/}
                {/*</button>*/}
              </section>
            </div>
          </div>
        </>
  );
}

export default Upcoming;
