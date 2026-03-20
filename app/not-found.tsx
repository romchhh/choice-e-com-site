import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#FFF9F0] text-[#3D1A00] px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-5xl relative">
        {/* Background blobs */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-[#3D1A00]/10 blur-3xl" />
          <div className="absolute top-24 -right-24 w-[360px] h-[360px] rounded-full bg-[#8B9A47]/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[680px] h-[260px] bg-[#D7D799]/20 blur-3xl" />
        </div>

        <div className="relative rounded-3xl border border-[#3D1A00]/10 bg-white/60 backdrop-blur p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start">
            <div className="flex-1 text-center lg:text-left">
              <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-['Montserrat'] uppercase tracking-wider text-[#3D1A00]/70">
                <span className="inline-block w-2 h-2 rounded-full bg-[#3D1A00] opacity-80" />
                Сторінка не знайдена
              </p>

              {/* Glitch 404 */}
              <h1
                className="mt-4 font-light font-['Montserrat'] leading-none tracking-tighter"
                style={{
                  fontSize: "clamp(64px, 12vw, 160px)",
                  position: "relative",
                }}
              >
                <span className="relative inline-block">
                  404
                  <span
                    aria-hidden
                    className="absolute left-0 top-0"
                    style={{
                      textShadow: "2px 0 #8B9A47",
                      opacity: 0.8,
                      transform: "translate(1px, 0)",
                      animation: "glitchMove 2.6s infinite",
                    }}
                  >
                    404
                  </span>
                  <span
                    aria-hidden
                    className="absolute left-0 top-0"
                    style={{
                      textShadow: "-2px 0 #3D1A00",
                      opacity: 0.7,
                      transform: "translate(-1px, 0)",
                      animation: "glitchMove2 3.2s infinite",
                    }}
                  >
                    404
                  </span>
                </span>
              </h1>

              <div className="mt-4 space-y-3">
                <h2 className="text-xl sm:text-2xl font-medium font-['Montserrat']">
                  Можливо, вона переїхала або вже не доступна
                </h2>
                <p className="text-base sm:text-lg font-['Montserrat'] text-[#3D1A00]/75 leading-relaxed">
                  Але ми не залишимо вас сам на сам. Ось швидкі варіанти, куди перейти далі.
                </p>
              </div>
            </div>

            <div className="w-full lg:w-[420px]">
              <div className="rounded-2xl border border-[#3D1A00]/10 bg-white/70 p-5">
                <p className="text-sm font-['Montserrat'] uppercase tracking-wider text-[#3D1A00]/70">
                  Швидкі дії
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href="/catalog"
                    className="px-5 py-3 bg-[#3D1A00] text-[#FFF9F0] font-['Montserrat'] font-medium text-sm uppercase tracking-wider hover:bg-[#2d1200] transition-colors rounded-full inline-flex items-center justify-center"
                  >
                    Каталог
                  </Link>
                  <Link
                    href="/contacts"
                    className="px-5 py-3 border border-[#3D1A00]/25 text-[#3D1A00] font-['Montserrat'] font-medium text-sm uppercase tracking-wider hover:bg-[#3D1A00]/5 transition-colors rounded-full inline-flex items-center justify-center"
                  >
                    Контакти
                  </Link>
                  <Link
                    href="/delivery-and-payment"
                    className="px-5 py-3 border border-[#3D1A00]/25 text-[#3D1A00] font-['Montserrat'] font-medium text-sm uppercase tracking-wider hover:bg-[#3D1A00]/5 transition-colors rounded-full inline-flex items-center justify-center"
                  >
                    Доставка
                  </Link>
                  <Link
                    href="/"
                    className="px-5 py-3 border border-[#3D1A00]/25 text-[#3D1A00] font-['Montserrat'] font-medium text-sm uppercase tracking-wider hover:bg-[#3D1A00]/5 transition-colors rounded-full inline-flex items-center justify-center"
                  >
                    На головну
                  </Link>
                </div>

                <div className="mt-4 rounded-xl bg-[#D7D799]/25 border border-[#D7D799]/40 p-4">
                  <p className="text-sm font-['Montserrat'] text-[#3D1A00]">
                    Код: <span className="font-semibold">404</span>
                  </p>
                  <p className="text-xs sm:text-sm font-['Montserrat'] text-[#3D1A00]/70 leading-relaxed mt-1">
                    Якщо це ваш коректний URL — напишіть нам, і ми швидко розберемось.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes glitchMove {
            0% { transform: translate(1px, 0); clip-path: inset(0 0 80% 0); }
            15% { transform: translate(1px, 1px); clip-path: inset(40% 0 40% 0); }
            30% { transform: translate(1px, 0); clip-path: inset(0 0 60% 0); }
            55% { transform: translate(1px, -1px); clip-path: inset(30% 0 30% 0); }
            75% { transform: translate(1px, 0); clip-path: inset(0 0 70% 0); }
            100% { transform: translate(1px, 0); clip-path: inset(0 0 80% 0); }
          }
          @keyframes glitchMove2 {
            0% { transform: translate(-1px, 0); clip-path: inset(70% 0 0 0); }
            20% { transform: translate(-1px, -1px); clip-path: inset(30% 0 40% 0); }
            45% { transform: translate(-1px, 0); clip-path: inset(60% 0 10% 0); }
            65% { transform: translate(-1px, 1px); clip-path: inset(20% 0 55% 0); }
            100% { transform: translate(-1px, 0); clip-path: inset(70% 0 0 0); }
          }
        `}</style>
      </div>
    </div>
  );
}

