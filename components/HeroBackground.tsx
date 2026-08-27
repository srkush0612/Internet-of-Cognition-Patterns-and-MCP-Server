/** Animated gradient + orbs — shared by homepage hero and advisor landing. */
export function HeroBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 animate-gradient-shift bg-[length:200%_200%]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(210,194,255,0.25) 0%, rgba(255,255,255,0.9) 45%, rgba(0,188,235,0.08) 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(0,188,235,0.12) 0%, transparent 45%), radial-gradient(circle at 80% 30%, rgba(147,69,225,0.1) 0%, transparent 40%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/4 h-72 w-72 animate-float rounded-full bg-[rgba(0,188,235,0.15)] blur-3xl" />
        <div
          className="absolute right-0 top-1/3 h-96 w-96 animate-float-slow rounded-full bg-[rgba(210,194,255,0.2)] blur-3xl"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-64 w-64 animate-pulse-glow rounded-full bg-cyan-400/20 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
      </div>
    </>
  );
}
