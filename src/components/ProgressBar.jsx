import { useEffect, useMemo, useRef } from "react";

/**
 * 초기 position을 내부에서 한 번만 스냅샷 → 현재 position이 줄수록 % 상승
 * props:
 *  - position: 현재 나의 대기 순서 (number | null)
 *  - className: 래퍼 클래스 (선택)
 */
export default function QueueProgressBar({ position, className = "" }) {
  const initialRef = useRef(null);

  // 최초 position만 1회 저장
  useEffect(() => {
    if (initialRef.current == null && position != null) {
      initialRef.current = position;
    }
  }, [position]);

  const progress = useMemo(() => {
    const init = initialRef.current;
    if (init == null || position == null) return null; // 아직 데이터 없음 → 부모에서 스피너 표시
    if (init <= 1) return 100;
    const pct = ((init - position) / (init - 1)) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }, [position]);

  if (progress == null) return null;

  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={99}
        aria-valuenow={progress}
        aria-valuetext={`${progress}%`}
        className="w-full h-3 rounded-full bg-neutral-200 overflow-hidden"
      >
        <div
         className="h-full rounded-full bg-[#09917c] transition-[width] duration-500 ease-out flex items-center justify-center"
         style={{ width: `${progress}%` }}
         >
          <span className="text-white text-xs font-semibold leading-none select-none">
           {/*{progress}%*/}
          </span>
        </div>
      </div>
      {/*<div className="mt-1 text-sm text-neutral-600 text-center">*/}
      {/*  {progress}%*/}
      {/*</div>*/}
    </div>
  );
}
