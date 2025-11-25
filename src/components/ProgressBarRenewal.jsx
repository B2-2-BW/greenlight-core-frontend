import { useEffect, useMemo, useRef } from 'react';

/**
 * position을 컴포넌트 내부에 저장/계산하지 않고,
 * 최초 position 저장 및 계산은 상위 컴포넌트에서 수행하도록 계산한 버전.
 * 이 컴포넌트에서는 최종 % 값만 받아서 표기
 */
export default function ProgressBarRenewal({ value = 0.0 }) {
  return (
    <div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={99}
        aria-valuenow={value * 100}
        aria-valuetext={`${value * 100}%`}
        className="w-full h-3 rounded-full bg-neutral-200 overflow-hidden"
      >
        <div
          className="h-full rounded-full bg-[#375A42] transition-[width] duration-500 ease-out flex items-center justify-center"
          style={{ width: `${value * 100}%` }}
        >
          <span className="text-white text-xs font-semibold leading-none select-none"></span>
        </div>
      </div>
    </div>
  );
}
