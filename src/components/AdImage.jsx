import React from 'react';
import clsx from 'clsx';

const AdImage = () => {
  const containerClass = clsx(
    'w-full',
    'max-w-[320px]',
    'm-auto',
    'flex',
    'flex-col',
    'items-start' // 왼쪽 정렬
  );

  const badgeClass = clsx(
    'text-xs',
    'font-bold',
    'text-gray-900',
    'bg-yellow-400',
    'py-[2px]',
    'px-[6px]',
    'rounded-full',
    'mb-1',
    'ml-[10%]',
    'shadow-sm'
  );

  const imageClass = clsx(
    'w-full',
    'rounded',
    'shadow-md'
  );

  return (
    <div className={containerClass}>
      <div className={badgeClass}>AD</div>
      <img
        src="/resources/images/adSample.png"
        alt="광고구좌 샘플"
        className={imageClass}
      />
    </div>
  );
};

export default AdImage;
