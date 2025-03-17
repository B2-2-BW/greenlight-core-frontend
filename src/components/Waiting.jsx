import Spinner from './Spinner.jsx';
import PositionPanel from './PositionPanel.jsx';

function Waiting({ customer }) {
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
        position={customer?.position}
        estimatedWaitTime={customer?.estimatedWaitTime}
        isReady={customer?.waitingPhase === 'READY'}
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
