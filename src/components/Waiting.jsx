import Spinner from './Spinner.jsx';
import PositionPanel from './PositionPanel.jsx';
import { useState, useEffect } from 'react';
import { GREENLIGHT_CORE_API_URL, S3_BASE_URL } from '../config/config.js';
import ProgressBar from './ProgressBar.jsx';

function Waiting({ queueEnterResp, setWaitStatus, actionData }) {
  const [sseResp, setSseResp] = useState(null);

  useEffect(() => {
    document.title = '대기화면 | Greenlight';

    const eventSource = new EventSource(
      GREENLIGHT_CORE_API_URL +
        `/waiting/sse?actionId=${queueEnterResp.actionId}&customerId=${queueEnterResp.customerId}`
    );

    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      setSseResp(parsed);
      console.log('[Greenlight] sse 응답결과', parsed);
    };

    eventSource.onerror = (error) => {
      console.error('SSE 연결 오류 :', error);
      eventSource.close();
    };

    if (sseResp?.waitStatus === 'READY') {
      eventSource.close();
      setWaitStatus('READY');
    }
  }, [sseResp, queueEnterResp, setWaitStatus]); // 의존성 배열 보강

  // [추가] 이미지 URL 생성 함수
  const getImageUrl = () => {
    const imageUrl = actionData?.imageUrl;
    if (!imageUrl) {
      return '/resources/images/adSample.png';
    }
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `${S3_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };
  return (
    <div className="m-auto w-[75%] max-w-[320px] flex flex-col items-center">
      <div className="w-full flex flex-col items-center relative">
        {/* 로고 이미지 (더현대홈으로 이동 연결) */}
        <a
          href="https://m.thehyundai.com/Home.html"
          className="block w-1/3 mb-4 z-10"
        >
          <img
            src="/resources/images/thd_logo.png"
            alt="로고"
            className="w-full h-auto rounded"
          />
        </a>

        {/* 광고 이미지 */}
        <div className="relative w-full">
          <img
            src={getImageUrl()} // [수정] 동적 URL 사용
            alt="대기열 이미지"
            className="w-full h-auto rounded shadow-md"
          />

          {/* AD 태그 (이미지가 있을 때만 보이거나, 정책에 따라 유지) */}
          {/* 만약 사용자가 등록한 이미지가 '광고'가 아니라면 이 태그는 제거하거나 조건부로 보여줘야 할 수 있습니다. */}
          {/* 현재는 UI 유지를 위해 남겨둡니다. */}
          <div className="absolute top-2 right-2 text-xs font-bold text-gray-900 bg-yellow-400 py-[2px] px-[6px] rounded-full shadow-sm">
            AD
          </div>
        </div>
      </div>
      <section className="w-full flex flex-col items-center">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold mt-5">
          사용자가 많아 접속 대기중이에요
        </h1>
      </section>

      {/*<div className="relative h-12">*/}
      {/*  <Spinner />*/}
      {/*</div>*/}

      <div className="w-full px-4 my-2">
        {sseResp?.position == null
          ? <div className="relative h-12"><Spinner /></div>
          : <ProgressBar position={sseResp?.position} />}
      </div>

      <PositionPanel
        position={sseResp?.position}
        aheadCount={sseResp?.aheadCount}
        behindCount={sseResp?.behindCount}
        estimatedWaitTime={sseResp?.estimatedWaitTime}
      />
      <section className="flex flex-col items-center text-neutral-500 mb-5">
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
  );
}
export default Waiting;
