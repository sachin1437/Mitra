import React from 'react';

export default function SectionSkeleton() {
  return (
    <div className="w-full h-full min-h-[50vh] py-32 flex flex-col items-center justify-center animate-pulse opacity-40">
      <div className="max-w-5xl w-full px-6 flex flex-col gap-6">
        <div className="w-1/3 h-12 bg-white/10 rounded-lg" />
        <div className="w-2/3 h-6 bg-white/5 rounded-md" />
        <div className="w-1/2 h-6 bg-white/5 rounded-md" />
      </div>
    </div>
  );
}
