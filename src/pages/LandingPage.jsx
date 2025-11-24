import Waiting from '../components/Waiting.jsx';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams,useLocation } from 'react-router-dom';
import Upcoming from '../components/Upcoming.jsx';
import { GREENLIGHT_CORE_API_URL } from '../config/config.js';
import SplashScreen from '../components/SplashScreen.jsx';
import ApiClient from '../client/api.js';

const DEFAULT_POLLING_INTERVAL = 3000;

//대기필요 없는 상태 리스트
const redirectStatuses = ['ENTERED', 'BYPASSED', 'DISABLED', 'ENDED'];

function LandingPage() {
  // 전체적인 프로세스
  // Step 1: actionId 요청 후 Step 2로 이동
  // Step 2: 랜딩 시간 상태 확인
  // Step 3 : 대기상태에 따른 화면 이동
  //  - WAITING : 대기화면
  //  - READY,ENTERED : destinationUrl로 화면이동(대기열 안타는거임)
  //  - BYPASSED, DISABLED : 일단 destinationUrl로 화면이동(대기열 안타는거임)
  // bypassed : 오류하면이나 alert 잘못된 접근 / desintionurl + disalbed면 대기열 꺼진거니까 바로 destinationurl로 넘기기
  const { landingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [actionData, setActionData] = useState(null);
  const [landingTimeYn, setLandingTimeYn] = useState(false);
  const [waitStatus, setWaitStatus] = useState(null);
  const [queueEnterResp, setQueueEnterResp] = useState(null);
  const location = useLocation();
  // URL 쿼리에서 redirectUrl 추출 (있을 때만 사용)
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
  // 1) 앱에 들어온 '초기 referrer' 스냅샷 (외부→우리 앱 진입 경로)
  const initialReferrerRef = useRef(document.referrer || null);
  useEffect(() => {
    // console.log('[Initial Referrer]', initialReferrerRef.current);
    console.log('[Current URL]', window.location.href);
  }, []);

  // 2) SPA 내부 라우팅에서의 '직전 라우트' 추적
  const prevRouteRef = useRef(null);
  useEffect(() => {
    const current = location.pathname + location.search + location.hash;
    console.log('[Prev Route]', prevRouteRef.current, '→ [Current Route]', current);
    prevRouteRef.current = current;
  }, [location]);

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // 초기 실행
    setVh();
    window.addEventListener('resize', setVh);

    return () => window.removeEventListener('resize', setVh);
  }, []);

  // 초기 로직 실행 (랜딩 정보 + 큐 호출)
  useEffect(() => {
    document.title = '랜딩페이지 | Greenlight';
    fetchActionIdAndQueue();
  }, []);

  // Step 1: actionId 요청 후 Step 2로 이동
  const fetchActionIdAndQueue = async () => {
    try {
      const res = await ApiClient.get(
        `${GREENLIGHT_CORE_API_URL}/actions/landing/${landingId}`
      );

      const data = res?.data;
      if (!data || Object.keys(data).length === 0) {
        throw new Error('actionId 없음');
      }

      console.log('[Greenlight] 랜딩 actionData:', data);
      setActionData(data);

      // Step 2: 랜딩 시간 상태 확인
      setEventStatusFromDate(data.landingStartAt, data.landingEndAt);
    } catch (error) {
      console.error('fetchActionId 실패:', error);
      setWaitStatus('ERROR');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Step 3: 큐 상태 확인(토큰 셋팅 등등)
    const fetchQueue = async () => {
      try {
        const queueRequest = {
          actionId: actionData.id,// redirectUrl이 있으면 그걸로 목적지를 덮어씀
          destinationUrl: redirectOverride ?? actionData.landingDestinationUrl,
        };
        const queueEnterResp = await ApiClient.post(
          '/api/v1/queue/check-or-enter',
          queueRequest
        );

        console.log('[Greenlight] fetchQueue 응답:', queueEnterResp.data);

        if (landingTimeYn) {
          setWaitStatus(queueEnterResp?.data?.waitStatus || 'WAITING'); // 기본 WAITING
        }
        setQueueEnterResp(queueEnterResp.data);
      } catch (error) {
        console.error('fetchQueue 실패:', error);
        setWaitStatus('ERROR');
      }
    };

    if (landingTimeYn) fetchQueue();
  }, [landingTimeYn, actionData?.id, actionData?.landingDestinationUrl, redirectOverride]);

  // Step 4: 대기열 필요 없는 상태는 자동 이동
  useEffect(() => {
    //대기필요 없는 상태인 경우
    if (
      redirectStatuses.includes(waitStatus) &&
      (redirectOverride || actionData?.landingDestinationUrl)
    ) {
      const url = redirectOverride ?? actionData.landingDestinationUrl;
      console.log('[Redirect → non-waiting]', url);
      window.location.href = url;
    }

    //입장 가능 상태인경우 토큰이랑 같이 보내줌
    if (waitStatus == 'READY') {
      // 서버가 큐 진입 때 받은 destinationUrl을 보통 되돌려줌.
      // 그래도 확실하게 redirectOverride를 우선 적용.
      let destinationUrl = redirectOverride || queueEnterResp?.destinationUrl;
      if (destinationUrl && destinationUrl.includes('?')) {
        destinationUrl += '&g=' + queueEnterResp.jwtToken;
      } else {
        destinationUrl += '?&g=' + queueEnterResp.jwtToken;
      }
      console.log('[Redirect → READY]', destinationUrl);
      window.location.href = destinationUrl;
    }
  }, [waitStatus, actionData, queueEnterResp, redirectOverride]);

  // 상태별 렌더링 함수
  const renderSwitch = () => {
    if (loading) {
      return <div>⏳ 대기열 정보를 불러오는 중...</div>; // 로딩 화면 추가
    }

    switch (waitStatus) {
      //랜딩 시간 아닌경우 ( 대기열 전 이벤트 대기화면 )
      case 'UPCOMING':
        return (
          <Upcoming
            actionData={actionData}
            setLandingTimeYn={setLandingTimeYn}
          />
        );
      //대기 필요 상태
      case 'WAITING':
        return (
          landingTimeYn && (
            <Waiting
              queueEnterResp={queueEnterResp}
              setWaitStatus={setWaitStatus}
              actionData={actionData}
            />
          )
        );
      //CoreAPI 호출 오류
      case 'ERROR':
        return (
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-5">
            API 호출 실패!
          </div>
        );
      //대기 필요 없는 상태 (랜딩 시간 종료 등) -> landingDestinationUrl로 이동
      default:
        return null;
    }
  };

  //랜딩 시간 확인
  const setEventStatusFromDate = (startStr, endStr) => {
    const now = Date.now();

    if (now < new Date(startStr).getTime()) {
      setWaitStatus('UPCOMING');
    } else if (now > new Date(endStr).getTime()) {
      setWaitStatus('ENDED');
    } else {
      setLandingTimeYn(true);
    }
  };

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <>
      <div className="flex items-center justify-center h-dvh">
        {renderSwitch()}
      </div>
    </>
  );
}

export default LandingPage;
