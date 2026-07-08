'use client';

export function IPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full items-center justify-center px-0 py-0 md:px-6 md:py-10">
      <div className="relative h-screen w-screen overflow-hidden bg-black md:h-[860px] md:w-[430px] md:rounded-[3.2rem] md:border md:border-white/10 md:shadow-phone">
        <div className="absolute left-1/2 top-3 z-20 hidden h-8 w-36 -translate-x-1/2 rounded-full bg-black/80 md:block" />
        {children}
      </div>
    </div>
  );
}
