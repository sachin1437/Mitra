import React from 'react';

export default function RobotSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-white/5 blur-3xl animate-pulse" />
    </div>
  );
}
