import { useEffect, useMemo, type CSSProperties } from "react";

type CinematicLoaderProps = {
  onDone: () => void;
  reduceMotion: boolean;
  shrinkToNavbar: boolean;
};

type ParticleSpec = {
  sx: string;
  sy: string;
  tx: string;
  ty: string;
  delay: string;
  size: string;
};

const CONVERGE_PARTICLES: ParticleSpec[] = [
  { sx: "-44vw", sy: "-31vh", tx: "-62px", ty: "-10px", delay: "0ms", size: "8px" },
  { sx: "42vw", sy: "-27vh", tx: "-48px", ty: "14px", delay: "70ms", size: "7px" },
  { sx: "-38vw", sy: "24vh", tx: "-36px", ty: "-26px", delay: "140ms", size: "6px" },
  { sx: "36vw", sy: "30vh", tx: "-20px", ty: "2px", delay: "210ms", size: "9px" },
  { sx: "-18vw", sy: "-39vh", tx: "-8px", ty: "-20px", delay: "280ms", size: "7px" },
  { sx: "25vw", sy: "-36vh", tx: "8px", ty: "16px", delay: "350ms", size: "6px" },
  { sx: "-25vw", sy: "36vh", tx: "20px", ty: "-11px", delay: "420ms", size: "8px" },
  { sx: "18vw", sy: "33vh", tx: "38px", ty: "2px", delay: "490ms", size: "7px" },
  { sx: "-47vw", sy: "4vh", tx: "50px", ty: "-16px", delay: "560ms", size: "6px" },
  { sx: "45vw", sy: "3vh", tx: "62px", ty: "9px", delay: "630ms", size: "7px" },
  { sx: "-34vw", sy: "-14vh", tx: "-92px", ty: "0px", delay: "200ms", size: "5px" },
  { sx: "33vw", sy: "15vh", tx: "92px", ty: "0px", delay: "300ms", size: "5px" },
  { sx: "-30vw", sy: "-27vh", tx: "-70px", ty: "26px", delay: "380ms", size: "5px" },
  { sx: "29vw", sy: "26vh", tx: "72px", ty: "-25px", delay: "460ms", size: "5px" },
  { sx: "-13vw", sy: "-44vh", tx: "-14px", ty: "32px", delay: "540ms", size: "4px" },
  { sx: "14vw", sy: "43vh", tx: "16px", ty: "-32px", delay: "620ms", size: "4px" },
];

export function CinematicLoader({ onDone, reduceMotion, shrinkToNavbar }: CinematicLoaderProps) {
  const duration = reduceMotion ? 900 : 3300;

  const ambientParticles = useMemo(
    () => Array.from({ length: reduceMotion ? 0 : 20 }, (_, index) => ({
      id: index,
      left: `${(index * 37) % 100}%`,
      top: `${(index * 53) % 100}%`,
      delay: `${(index % 7) * -0.6}s`,
      duration: `${5.5 + (index % 5) * 0.7}s`,
      scale: `${0.6 + (index % 4) * 0.18}`,
    })),
    [reduceMotion],
  );

  useEffect(() => {
    const timer = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onDone]);

  useEffect(() => {
    const skip = () => onDone();
    const onKeyDown = () => skip();
    window.addEventListener("keydown", onKeyDown, { once: true });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onDone]);

  return (
    <div
      className={`cinematic-loader ${reduceMotion ? "reduce-motion" : ""} ${shrinkToNavbar ? "shrink-navbar" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading JadeGuard"
      onClick={onDone}
    >
      <span className="visually-hidden">Loading JadeGuard</span>
      <div className="loader-vignette" aria-hidden="true" />
      <div className="loader-ambient" aria-hidden="true">
        {ambientParticles.map((particle) => (
          <i
            key={particle.id}
            className="ambient-particle"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              transform: `scale(${particle.scale})`,
            }}
          />
        ))}
      </div>

      <div className="loader-centerpiece" aria-hidden="true">
        <div className="converge-field">
          {!reduceMotion && CONVERGE_PARTICLES.map((particle, index) => (
            <i
              key={index}
              className="converge-particle"
              style={{
                "--sx": particle.sx,
                "--sy": particle.sy,
                "--tx": particle.tx,
                "--ty": particle.ty,
                "--delay": particle.delay,
                "--size": particle.size,
              } as CSSProperties}
            />
          ))}
        </div>

        <div className="loader-logo-lockup">
          <span className="loader-mark">JG</span>
          <span className="loader-wordmark">JadeGuard</span>
          <span className="loader-shimmer" />
        </div>
      </div>

      <p className="loader-skip-hint">Press any key or click to skip</p>
    </div>
  );
}
