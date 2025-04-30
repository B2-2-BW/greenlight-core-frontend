import Waiting from '../components/Waiting.jsx';
import { useState, useEffect } from 'react';
import Upcoming from '../components/Upcoming.jsx';
import SplashScreen from '../components/SplashScreen.jsx';
import ApiClient from '../client/api.js';
import { useParams } from 'react-router';

const DEFAULT_POLLING_INTERVAL = 3000;

function EventPage() {
  const [loading, setLoading] = useState(true);
  // UPCOMING: event 시작 전, OPEN: 이벤트 입장 가능, ENDED: 이벤트 입장 불가, ERROR: 알 수 없는 오류
  const [eventStatus, setEventStatus] = useState(null);
  const { eventName } = useParams();
  const [event, setEvent] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [pollingFailureCount, setPollingFailureCount] = useState(0);

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

  const renderSwitch = () => {
    switch (eventStatus) {
      case 'UPCOMING':
        return (
          <Upcoming event={event} reloadEventStatus={setEventStatusFromDate} />
        );
      case 'OPEN':
        return <Waiting customer={customer} />;
      default:
        return (
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-5">
            Unknown Error
          </div>
        );
    }
  };
  useEffect(() => {
    document.title = '이벤트 | Greenlight';
  }, []);

  const connectSSE = () => {
    const eventSource = new EventSource(`/sse/${customerId}`);

    eventSource.onmessage = (event) => { // 연결 성공
      console.log('[Greenlight] SSE 응답 데이터 :', event.data);
    };

    eventSource.onerror = (error) => { // 연결 오류
      console.log('[Greenlight] SSE 연결 오류 :', error);
    };
  }

  // 페이지 로드 시 eventStatus 세팅
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // API 호출
        const eventResponse = await ApiClient.get(`/events/${eventName}`);
        const eventData = eventResponse?.data;
        setEvent(eventData);
        if (
          eventData?.eventStartTime == null ||
          eventData?.eventEndTime == null
        ) {
          setEventStatus('UNKNOWN');
          return;
        }
        setEventStatusFromDate(
          eventData.eventStartTime,
          eventData.eventEndTime
        );
      } catch (error) {
        console.error('API 호출 실패:', error);
        setEventStatus('ERROR');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventName]);

  // eventStatus 로딩 완료 시 customer set
  useEffect(() => {
    const createCustomer = async () => {
      const customerResponse = await ApiClient.post('/customers', {
        eventName,
      });
      if (customerResponse?.data) {
        setCustomer(customerResponse.data);

        //고객 SSE연결
        connectSSE(customers);
      }
    };
    if (eventStatus === 'OPEN') {
      createCustomer();
    }
  }, [eventStatus]);

  useEffect(() => {
    if (event == null || customer == null) {
      return;
    }
    const intervalId = setInterval(async () => {
      const customerStatusResponse = await ApiClient.get(
        `/customers/${customer.customerId}/status`
      );
      const customerStatusData = customerStatusResponse?.data;

      if (customerStatusData?.waitingPhase === 'READY') {
        location.href = event.eventUrl;
        eventSource.close(); //대기열 입장하는 경우 SSE 연결 종료
        return;
      }

      setCustomer(customerStatusData);
    }, DEFAULT_POLLING_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [event, customer]);

  const setEventStatusFromDate = (startStr, endStr) => {
    const now = Date.now();
    if (now < new Date(startStr)) {
      setEventStatus('UPCOMING');
    } else if (now > new Date(endStr)) {
      setEventStatus('ENDED');
    } else {
      setEventStatus('OPEN');
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

export default EventPage;
