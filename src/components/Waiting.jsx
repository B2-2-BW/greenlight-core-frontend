import Spinner from './Spinner.jsx';
import PositionPanel from './PositionPanel.jsx';

function Waiting({ customer }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-5">
      {/*<div>{JSON.stringify(customer)}</div>*/}
      <div className="relative h-10">
        <Spinner />
      </div>
      <h1 className="text-sm font-bold mt-5">
        사용자가 많아 접속 대기중이에요
      </h1>
      <PositionPanel
        position={customer?.position}
        estimatedWaitTime={customer?.estimatedWaitTime}
        isReady={customer?.waitingPhase === 'READY'}
      />

      <div className="text-[10px] text-neutral-500 mb-5">
        <p>잠시만 기다리시면 순서에 따라 자동 접속됩니다.</p>
        <p>새로고침하면 대기시간이 길어질 수 있어요</p>
      </div>
      <button className="rounded-full border-[1px] border-neutral-200 px-2 py-2 text-[10px]">
        이전으로 돌아가기
      </button>
    </div>
  );
}
export default Waiting;
