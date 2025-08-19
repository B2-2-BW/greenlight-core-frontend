import Spinner from './Spinner.jsx';
import PositionPanel from './PositionPanel.jsx';
import { useState, useEffect } from 'react';
import AdImage from './AdImage.jsx';
import { GREENLIGHT_PROTOTYPE_CORE_API_URL } from '../config/config.js'


function Waiting({ queueEnterResp, setWaitStatus }) {
 
  const [sseResp, setSseResp] = useState(null);

  useEffect(() => {
    document.title = '대기화면 | Greenlight';
    
  const eventSource = new EventSource(GREENLIGHT_PROTOTYPE_CORE_API_URL+`/waiting/sse?actionId=${queueEnterResp.actionId}&customerId=${queueEnterResp.customerId}`);
  //const eventSource = new EventSource(`http://15.164.75.216:18080/waiting/sse?actionId=1&customerId=1:0MGQ4TB0V61BZ`);

  eventSource.onmessage = (event) => {
    setSseResp(JSON.parse(event.data));
    console.log('[Greenlight] sse 응답결과' + JSON.stringify(sseResp));
  };

  eventSource.onerror = (error) => {
    console.error('SSE 연결 오류 :', error);
    eventSource.close();
  };
    
    if (sseResp?.waitStatus == 'READY') {
        eventSource.close();
        setWaitStatus('READY')
    }
  }, [sseResp]);

  return (
    <div className="m-auto w-[75%] max-w-[320px] flex flex-col items-center">
      <div className="w-full flex flex-col items-center">
        <div className="w-[80%] flex flex-col items-start">
          <div className="text-xs font-bold text-gray-900 bg-yellow-400 py-[2px] px-[6px] rounded-full mb-1 shadow-sm">
            AD
          </div>
          <img
            src="/resources/images/adSample.png"
            alt="광고구좌 샘플"
            className="w-full h-auto rounded shadow-md"
          />
        </div>
      </div>
      <section className="w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mt-5">
          사용자가 많아 접속 대기중이에요
        </h1>
      </section>

      <div className="relative h-12">
        <Spinner />
      </div>

      <PositionPanel
        position={sseResp?.position}
        estimatedWaitTime={sseResp?.estimatedWaitTime}
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
