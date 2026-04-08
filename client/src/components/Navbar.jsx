export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#1C1C2E] bg-[#090910]/80 backdrop-blur-md">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-md bg-[#C8FF00] flex items-center
                          justify-center text-[#090910] font-display text-base leading-none"
          >
            C
          </span>
          <span className="font-display text-xl tracking-widest text-[#F0F0FF]">
            CDP
          </span>
          <span className="text-[10px] font-mono text-[#2E2E42] border border-[#1C1C2E]
                           rounded px-1.5 py-0.5 ml-1">
            CAMPUS
          </span>
        </div>

        {/* Right side — placeholder for Member A's auth */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full border border-[#1C1C2E]
                          flex items-center justify-center">
            <span className="text-[10px] text-[#52526E]">U1</span>
          </div>
        </div>
      </div>
    </header>
  );
}