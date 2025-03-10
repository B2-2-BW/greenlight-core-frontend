import Waiting from '../components/Waiting.jsx';
import { useState, useEffect, useCallback } from 'react';
import Upcoming from '../components/Upcoming.jsx';
import SplashScreen from '../components/SplashScreen.jsx';
import ApiClient from '../client/api.js';
import { useParams } from 'react-router';

function EventPage() {
  const [loading, setLoading] = useState(true);
  // UPCOMING: event 시작 전, OPEN: 이벤트 입장 가능, ENDED: 이벤트 입장 불가, ERROR: 알 수 없는 오류
  const [eventStatus, setEventStatus] = useState(null);
  const { eventName } = useParams();
  const [event, setEvent] = useState(null);
  const [customer, setCustomer] = useState(null);

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
    // 페이지 로드 시 이벤트 상태 확인
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
          setEventStatus('ERROR');
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
          const customerResponse = await ApiClient.post('/customers', {
            eventName,
          });
          const customerData = customerResponse?.data;
          console.log('customerData', customerData);
          setCustomer(customerData);
          setEventStatus('OPEN');
          const intervalId = setInterval(async () => {
            const customerStatusResponse = await ApiClient.get(
              `/customers/${customerData.customerId}/status`
            );
            const customerStatusData = customerStatusResponse?.data;
            console.log(customerStatusData);
            setCustomer(customerStatusData);
          }, 3000);
          return () => {
            // Clear interval using intervalId
            // This function run when component unmount
            clearInterval(intervalId);
          };
        }
      } catch (error) {
        console.error('API 호출 실패:', error);
        setEventStatus('ERROR');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, []);

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
