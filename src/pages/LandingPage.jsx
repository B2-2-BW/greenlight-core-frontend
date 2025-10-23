import Waiting from '../components/Waiting.jsx';
import { useState, useEffect, act } from 'react';
import { useParams } from 'react-router-dom';
import Upcoming from '../components/Upcoming.jsx';
import { GREENLIGHT_CORE_API_URL } from '../config/config.js';
import SplashScreen from '../components/SplashScreen.jsx';
import ApiClient from '../client/api.js';

const DEFAULT_POLLING_INTERVAL = 3000;

function LandingPage() {
  // 전체적인 프로세스
  // 1) 화면 열리면 fetchEvent() 함수 통해서 상태값 및 /check-or-enter api 통해서 받은 응답 queueEnterResp에 셋팅
  // 2) 대기상태에 따라
  //  - WAITING : 대기화면
  //  - READY,ENTERED : destinationUrl로 화면이동(대기열 안타는거임)
  //todo 이거 어떻게 처리할꽈,...
  //  - BYPASSED, DISABLED : 일단 destinationUrl로 화면이동(대기열 안타는거임)
  // bypassed : 오류하면이나 alert 잘못된 접근 / desintionurl + disalbed면 대기열 꺼진거니까 바로 destinationurl로 넘기기
  const { landingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [actionData, setActionData] = useState(null);
  const [landingTimeYn, setLandingTimeYn] = useState(false);
  const [waitStatus, setWaitStatus] = useState(null);
  const [queueEnterResp, setQueueEnterResp] = useState(null);

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
    document.title = '이벤트 | Greenlight';
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

      console.log('랜딩 actionData:', data);
      setActionId(data.id);
      setActionData(data);

      // Step 2: 랜딩 시간 상태 확인
      setEventStatusFromDate(data.landingStartAt, data.landingEndAt);

      // Step 3: 큐 상태 확인
      await fetchQueue(data.id);
    } catch (error) {
      console.error('fetchActionId 실패:', error);
      setWaitStatus('ERROR');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: 큐 상태 확인
  const fetchQueue = async (actionId) => {
    try {
      const queueRequest = { actionId };
      const queueEnterResp = await ApiClient.post(
        '/api/v1/queue/check-or-enter',
        queueRequest
      );

      console.log('queue 응답:', queueEnterResp.data);
      setWaitStatus(queueEnterResp?.data?.waitStatus || 'WAITING'); // 기본 WAITING
      setQueueEnterResp(queueEnterResp.data);
    } catch (error) {
      console.error('fetchQueue 실패:', error);
      setWaitStatus('ERROR');
    }
  };

  // Step 4: 대기열 필요 없는 상태는 자동 이동
  useEffect(() => {
    const redirectStatuses = [
      'READY',
      'ENTERED',
      'BYPASSED',
      'DISABLED',
      'ENDED',
    ];
    if (
      redirectStatuses.includes(waitStatus) &&
      actionData?.landingDestinationUrl
    ) {
      window.location.href = actionData.landingDestinationUrl;
    }
  }, [waitStatus, actionData]);

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
        return landingTimeYn && <Waiting queueEnterResp={queueEnterResp} />;
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

  const setEventStatusFromDate = (startStr, endStr) => {
    const now = Date.now();
    if (now < new Date(startStr)) {
      setLandingTimeYn(true);
    } else if (now > new Date(endStr)) {
      setWaitStatus('ENDED');
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
