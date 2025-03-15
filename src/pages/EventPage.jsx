import Waiting from '../components/Waiting.jsx';
import { useState, useEffect } from 'react';
import Upcoming from '../components/Upcoming.jsx';
import SplashScreen from '../components/SplashScreen.jsx';
import ApiClient from '../client/api.js';
import { useParams } from 'react-router';

const DEFAULT_POLLING_INTERVAL = 1000;

function EventPage() {
  const [loading, setLoading] = useState(true);
  // UPCOMING: event 시작 전, OPEN: 이벤트 입장 가능, ENDED: 이벤트 입장 불가, ERROR: 알 수 없는 오류
  const [eventStatus, setEventStatus] = useState(null);
  const { eventName } = useParams();
  const [event, setEvent] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [pollingFailureCount, setPollingFailureCount] = useState(0);

  const renderSwitch = () => {
    switch (eventStatus) {
      case 'UPCOMING':
        return <Upcoming event={event} />;
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
    document.title = '대시보드 | MyApp';
  }, []);
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
        const now = Date.now();
        const eventStartTime = Date.parse(eventData.eventStartTime);
        const eventEndTime = Date.parse(eventData.eventEndTime);
        if (now < eventStartTime) {
          setEventStatus('UPCOMING');
        } else if (now > eventEndTime) {
          setEventStatus('ENDED');
        } else {
          setEventStatus('OPEN');
        }
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
        return;
      }

      setCustomer(customerStatusData);
    }, DEFAULT_POLLING_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [event, customer]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <>
      <div className="w-full h-screen overflow-hidden bg-gray-100 font-sans">
        <div className="w-full h-full relative bg-white">{renderSwitch()}</div>
      </div>
    </>
  );
}

export default EventPage;
