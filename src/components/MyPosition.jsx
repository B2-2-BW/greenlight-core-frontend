import Spinner from './Spinner.jsx';
import ProgressBarRenewal from './ProgressBarRenewal.jsx';
import { NumberUtil } from '../util/numberUtil.js';

export default function MyPosition({ position, isLoading, progress }) {
  return (
    <div className="w-full h-20">
      {isLoading ? (
        <>
          <div className="h-3/4 flex justify-center relative">
            <Spinner />
          </div>
          <div className="text-center text-sm text-neutral-600">
            연결을 준비하고 있어요
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col mb-2 items-center">
            <span className="text-sm">나의 대기 순서</span>
            <span className="text-4xl text-[#375A4E] font-semibold">
              {NumberUtil.formatNumber(position)}
            </span>
          </div>
          <ProgressBarRenewal value={progress} />
        </>
      )}
    </div>
  );
}
