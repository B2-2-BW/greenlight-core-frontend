import Spinner from './Spinner.jsx';
import PositionPanel from './PositionPanel.jsx';
import { useState, useEffect } from 'react';
import { GREENLIGHT_PROTOTYPE_CORE_API_URL } from '../config/config.js'


function Waiting({ queueEnterResp }) {

  const [sseResp, setSseResp] = useState(null);

  useEffect(() => {
  const eventSource = new EventSource(GREENLIGHT_PROTOTYPE_CORE_API_URL+`/waiting/sse?actionId=${queueEnterResp.actionId}&customerId=${queueEnterResp.customerId}`);
  //const eventSource = new EventSource(`http://15.164.75.216:18080/waiting/sse?actionId=1&customerId=1:0MGQ4TB0V61BZ`);

  eventSource.onmessage = (event) => {
    setSseResp(JSON.parse(event.data));
    console.log('sseresp>>' + JSON.stringify(sseResp));
    console.log('[] SSE 응답 데이터 :', event.data);
  };

  eventSource.onerror = (error) => {
    console.error('[] SSE 연결 오류 :', error);
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
  }, [queueEnterResp?.actionId, queueEnterResp?.customerId]);
  
  useEffect(() => {
  console.log('sseresp updated:', sseResp); // 상태 변경 감지용
}, [sseResp]);

  return (
    <div className="m-auto w-[75%] max-w-[320px] flex flex-col items-center">
      <div className="relative h-12">
        <Spinner />
      </div>
      <section className="w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mt-5">
          사용자가 많아 접속 대기중이에요
        </h1>
      </section>

      <PositionPanel
        position={sseResp?.position}
        estimatedWaitTime={sseResp?.estimatedWaitTime}
        isReady={'WAiting' === 'READY'}
      />
      <section className="flex flex-col items-center text-neutral-500 mb-5">
        <p>잠시만 기다리시면 순서에 따라 자동 접속됩니다.</p>
        <p>새로고침하면 대기시간이 길어질 수 있어요</p>
      </section>
      <section className="flex flex-col items-center">
        <button className="rounded-full text-neutral-700 border-[1px] border-neutral-200 px-2 py-2">
          이전으로 돌아가기
        </button>
      </section>
    </div>
  );
}
export default Waiting;
