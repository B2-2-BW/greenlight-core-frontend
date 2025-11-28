import { useEffect, useMemo, useRef, useState } from 'react';
import PositionPanelRenewal from '../components/PositionPanelRenewal.jsx';
import MyPosition from '../components/MyPosition.jsx';
import ApiClient from '../client/api.js';
import { GREENLIGHT_CORE_API_URL } from '../config/config.js';
import { retryable } from '../util/retry.js';
import { useParams } from 'react-router-dom';

//대기필요 없는 상태 리스트
const bypassStatus = ['ENTERED', 'BYPASSED', 'DISABLED', 'ENDED'];

export default function WaitingPage() {
  // 로딩 완료여부 판별
  const [isLoading, setIsLoading] = useState(true);

  // 최초 진입 시 action 데이터 추출
  const [actionData, setActionData] = useState(null);

  const [customerId, setCustomerId] = useState(null);
  const [destinationUrl, setDestinationUrl] = useState(null);

  const initialPosition = useRef(null);
  const [waitStatus, setWaitStatus] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [behindCount, setBehindCount] = useState(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(null);
  const [progress, setProgress] = useState(0);
  const { landingId } = useParams();

  // [POC용] 액션 그룹 ID에 따라 이미지 경로 반환하는 함수
  const getImageUrl = () => {
    const groupId = actionData?.actionGroupId; // actionData에서 ID 확인

    if (groupId === 6) {
      return '/resources/images/LI_sample.png';
    }
    if (groupId === 7) {
      return '/resources/images/GF_sample2.png';
    }

    // 기본 이미지
    return '/resources/images/adSample.png';
  };

  // [POC용2] 액션 그룹 ID에 따른 스타일 반환 함수 추가
  const getThemeStyles = () => {
    const groupId = actionData?.actionGroupId;

    // 특정 그룹 ID (예: 7) 일 때 색상 변경
    if (groupId === 7) { 
      return {
        headerText: 'text-[#1e1e1e]',      // 2. 접속 대기중이에요 텍스트 색
        positionNum: 'text-[#918C00]',     // 1. 나의 대기순서 숫자 색
        boxBg: 'bg-[#f5f5f5]',             // 3. 박스 배경 색
        behindNum: 'text-[#918C00]',       // 4. 뒤에 기다리는 사람 숫자 색
      };
    }

    // 기본 스타일 (원래 코드의 색상값)
    return {
      headerText: '',                      // 기본 검정
      positionNum: 'text-[#375A4E]',       // 기존 초록색
      boxBg: 'bg-[#F5E7F4]',               // 기존 분홍색 배경
      behindNum: 'text-[#375A4E]',         // 기존 초록색
    };
  };

  const theme = getThemeStyles(); // 스타일 객체 생성

  useEffect(() => {
    let newProgress =
      (initialPosition.current - currentPosition) / initialPosition.current;
    newProgress = Math.max(0, Math.min(1.0, newProgress));
    setProgress(newProgress);
  }, [currentPosition]);

  const redirectOverride = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const val = sp.get('redirectUrl');
    if (!val) return null;
    try {
      const decoded = decodeURIComponent(val);
      // http/https만 허용 (원하면 제거 가능)
      if (/^https?:\/\//i.test(decoded)) return decoded;
      if (/^https?:\/\//i.test(val)) return val;
      return null;
    } catch {
      return /^https?:\/\//i.test(val) ? val : null;
    }
  }, [location.search]);

  /* ************************************** */

  const retryOptions = {
    retries: 10,
    baseDelay: 3000,
    maxDelay: 20000,
  };

  // 1. 최초 로딩 시 action 조회
  useEffect(() => {
    document.title = '랜딩페이지 | Greenlight';
  }, []);

  // 2. action을 조회한 뒤 완료되면 입장요청
  useEffect(() => {
    retryable(checkOrEnter, retryOptions).catch(console.error);
  }, [landingId]);

  const checkOrEnter = async () => {
    if (landingId) {
      console.log('call check-landing', landingId);
    }
    const body = {
      landingId: landingId, // redirectUrl이 있으면 그걸로 목적지를 덮어씀
      destinationUrl: redirectOverride ?? actionData.landingDestinationUrl,
    };
    const res = await ApiClient.post('/api/v1/queue/check-landing', body);
    if (res?.status === 200 && res?.data?.customerId != null) {
      const data = res.data;
      setCustomerId(data.customerId);
      setWaitStatus(data.waitStatus);
      setDestinationUrl(data.destinationUrl);
    } else {
      console.error('checkOrEnter 응답 비정상', {
        data: res?.data,
        status: res?.status,
      });
      throw new Error('checkOrEnter returned invalid response');
    }
  };

  const fetchAction = async () => {
    const res = await ApiClient.get(
      `${GREENLIGHT_CORE_API_URL}/actions/landing/${landingId}`
    );

    if (res?.status === 200 && res?.data?.id != null) {
      setActionData(res?.data);
    } else {
      console.error('fetchActionId 응답 비정상', {
        data: res?.data,
        status: res?.status,
      });
      throw new Error('fetchActionId returned invalid response');
    }
  };

  const eventSourceRef = useRef(null);
  const eventRetryTimeoutRef = useRef(null);
  const retryInterval = 5000;
  // 3. customerId가 있을때 sse 연결 시작
  useEffect(() => {
    if (customerId == null) {
      return;
    }

    const cleanup = () => {
      if (eventRetryTimeoutRef.current !== null) {
        window.clearTimeout(eventRetryTimeoutRef.current);
        eventRetryTimeoutRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };

    const connect = () => {
      cleanup(); // 기존 연결/타이머 정리

      const es = new EventSource(
        GREENLIGHT_CORE_API_URL + `/waiting/sse?customerId=${customerId}`
      );
      eventSourceRef.current = es;

      es.onopen = () => {
        console.log('SSE connected');
      };

      es.onmessage = (event) => {
        if (isLoading) {
          setIsLoading(false);
        }
        const data = JSON.parse(event.data);

        if (initialPosition.current == null) {
          initialPosition.current = data.position;
        }
        setCurrentPosition(data.position);
        setWaitStatus(data.waitStatus);
        setEstimatedWaitTime(data.estimatedWaitTime);
        setBehindCount(data.behindCount);
        console.log('[Greenlight] sse 응답결과', data); // 이게 실제 최신 데이터
      };

      es.onerror = (error) => {
        console.log('SSE 연결 재시도중'); // error는 단순 이벤트가 노출되므로 운영에서는 출력 제외
        es.close();
        // 일정 시간 후 재연결
        eventRetryTimeoutRef.current = window.setTimeout(
          connect,
          retryInterval
        );
      };
    };

    connect();

    return () => {
      cleanup();
    };
  }, [customerId]);

  // Step 4: 대기열 필요 없는 상태는 자동 이동
  useEffect(() => {
    //대기필요 없는 상태인 경우
    if (
      bypassStatus.includes(waitStatus) &&
      (redirectOverride || actionData?.landingDestinationUrl)
    ) {
      const url = redirectOverride ?? actionData.landingDestinationUrl;
      console.log('[Redirect → non-waiting]', url);
      window.location.href = url;
    }

    //입장 가능 상태인경우 토큰이랑 같이 보내줌
    if (waitStatus === 'READY') {
      let redirectTo = redirectOverride || destinationUrl;

      if (redirectTo) {
        // 1. 혹시 모를 해시(#) 처리 (해시는 건드리지 않고 분리)
        const [urlBeforeHash, hash] = redirectTo.split('#');

        // 2. 물음표(?) 기준으로 '경로'와 '쿼리' 분리
        const [basePath, queryString] = urlBeforeHash.split('?');

        // 3. 쿼리 파라미터 객체 생성 (쿼리가 없으면 빈 상태로 시작)
        const params = new URLSearchParams(queryString || '');

        // 4. gUserId 설정 (있으면 덮어쓰고, 없으면 추가됨 -> 중복 해결)
        params.set('gUserId', customerId);

        // 5. 기존 형식 그대로 재조립 (경로 + 새 쿼리 + 해시)
        redirectTo = `${basePath}?${params.toString()}`;

        console.log('[Redirect → READY]', redirectTo);
        window.location.href = redirectTo;
      }
    }
  }, [waitStatus, actionData, destinationUrl, redirectOverride]);

  return (
    <>
      <div className="flex items-center justify-center h-dvh">
        <div className="m-auto w-[75%] max-w-[480px] flex flex-col items-center">
          <div className="w-full flex flex-col items-center relative">
            {/* 광고 이미지 */}
            <div className="relative h-[40vh]">
              <img
                src={getImageUrl()}
                alt="광고구좌 샘플"
                className="max-h-full rounded shadow-md object-contain"
              />

              {/* AD 태그 */}
              <div className="absolute top-2 right-2 text-xs font-bold text-gray-900 bg-yellow-400 py-[2px] px-[6px] rounded-full shadow-sm">
                AD
              </div>
            </div>
          </div>
          <section className="w-full flex flex-col items-center mt-5 mb-3">
            {/* 그린푸드 poc */}
            <h1 className={`text-lg sm:text-xl md:text-2xl font-semibold text-center ${theme.headerText}`}>
            {/* <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-center"> */}
              사용자가 많아 접속 대기중이에요
            </h1>
          </section>
          {/* 그린푸드 poc */}
          <MyPosition
            position={currentPosition}
            isLoading={isLoading}
            progress={progress}
            numColor={theme.positionNum} 
          />
          <PositionPanelRenewal
            isLoading={isLoading}
            behindCount={behindCount}
            estimatedWaitTime={estimatedWaitTime}
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
