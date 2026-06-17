import { useId } from 'react'

const styles = `
  @keyframes spinCW  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes spinCCW { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }

  @keyframes barPop {
    0%, 100% { transform: scaleY(0.35); opacity: 0.25; }
    50%       { transform: scaleY(1);   opacity: 1; }
  }
  @keyframes dashScroll {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -28; }
  }
  @keyframes rupeeGlow {
    0%, 100% { opacity: 0.75; }
    50%       { opacity: 1; }
  }
  @keyframes dotBeat {
    0%, 100% { transform: scale(1);   opacity: 1; }
    50%       { transform: scale(1.5); opacity: 0.6; }
  }

  .rl-ring-outer { animation: spinCW  10s linear infinite; transform-origin: center; }
  .rl-ring-mid   { animation: spinCCW  7s linear infinite; transform-origin: center; }

  .rl-bar { transform-box: fill-box; transform-origin: bottom; animation: barPop 2.2s ease-in-out infinite; }
  .rl-bar1 { animation-delay: 0s; }
  .rl-bar2 { animation-delay: 0.18s; }
  .rl-bar3 { animation-delay: 0.36s; }
  .rl-bar4 { animation-delay: 0.54s; }
  .rl-bar5 { animation-delay: 0.72s; }

  .rl-trend  { animation: dashScroll 1.4s linear infinite; }
  .rl-rupee  { animation: rupeeGlow  2.2s ease-in-out infinite; }

  .rl-dot  { transform-box: fill-box; transform-origin: center; animation: dotBeat 2.2s ease-in-out infinite; }
  .rl-dot1 { animation-delay: 0s; }
  .rl-dot2 { animation-delay: 0.55s; }
  .rl-dot3 { animation-delay: 1.1s; }
  .rl-dot4 { animation-delay: 1.65s; }
  .rl-dd1  { animation-delay: 0.2s; }
  .rl-dd2  { animation-delay: 0.75s; }
  .rl-dd3  { animation-delay: 1.3s; }
  .rl-dd4  { animation-delay: 1.85s; }
`

export default function RupeeLoader({ size = 200 }) {
  const clipId = useId()

  return (
    <>
      <style>{styles}</style>
      <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg className="rl-ring-outer" viewBox="0 0 300 300" style={{ position: 'absolute', width: size, height: size }} xmlns="http://www.w3.org/2000/svg">
          <circle cx="150" cy="150" r="145" fill="none" stroke="#0d9488" strokeWidth="1.2" opacity="0.28"/>
          <g transform="translate(150,150)">
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <rect x="130" y="-2" width={deg % 90 === 0 ? 12 : 7} height="4" rx="2" fill="#0d9488" opacity={deg % 90 === 0 ? 0.9 : 0.45}/>
              </g>
            ))}
          </g>
          <circle cx="150" cy="5"   r="5" fill="#0d9488" className="rl-dot rl-dot1"/>
          <circle cx="295" cy="150" r="5" fill="#0d9488" className="rl-dot rl-dot2"/>
          <circle cx="150" cy="295" r="5" fill="#0d9488" className="rl-dot rl-dot3"/>
          <circle cx="5"   cy="150" r="5" fill="#0d9488" className="rl-dot rl-dot4"/>
          <circle cx="253" cy="47"  r="3.5" fill="#0d9488" opacity="0.6" className="rl-dot rl-dd1"/>
          <circle cx="47"  cy="47"  r="3.5" fill="#0d9488" opacity="0.6" className="rl-dot rl-dd2"/>
          <circle cx="47"  cy="253" r="3.5" fill="#0d9488" opacity="0.6" className="rl-dot rl-dd3"/>
          <circle cx="253" cy="253" r="3.5" fill="#0d9488" opacity="0.6" className="rl-dot rl-dd4"/>
        </svg>

        <svg className="rl-ring-mid" viewBox="0 0 260 260" style={{ position: 'absolute', width: size * 0.867, height: size * 0.867 }} xmlns="http://www.w3.org/2000/svg">
          <circle cx="130" cy="130" r="126" fill="none" stroke="#0d9488" strokeWidth="1" opacity="0.2"/>
        </svg>

        <svg viewBox="0 0 220 220" style={{ position: 'absolute', width: size * 0.733, height: size * 0.733 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id={clipId}>
              <circle cx="110" cy="110" r="105"/>
            </clipPath>
          </defs>
          <circle cx="110" cy="110" r="105" fill="#0d9488"/>
          <g clipPath={`url(#${clipId})`}>
            <line x1="30" y1="148" x2="190" y2="148" stroke="#fff" strokeWidth="0.5" opacity="0.12"/>
            <line x1="30" y1="128" x2="190" y2="128" stroke="#fff" strokeWidth="0.5" opacity="0.12"/>
            <line x1="30" y1="108" x2="190" y2="108" stroke="#fff" strokeWidth="0.5" opacity="0.12"/>

            <rect className="rl-bar rl-bar1" x="42"  y="165" width="20" height="10" rx="3" fill="#fff"/>
            <rect className="rl-bar rl-bar2" x="72"  y="150" width="20" height="25" rx="3" fill="#fff"/>
            <rect className="rl-bar rl-bar3" x="102" y="132" width="20" height="43" rx="3" fill="#fff"/>
            <rect className="rl-bar rl-bar4" x="132" y="110" width="20" height="65" rx="3" fill="#fff"/>
            <rect className="rl-bar rl-bar5" x="162" y="84"  width="20" height="91" rx="3" fill="#fff"/>

            <line x1="32" y1="175" x2="192" y2="175" stroke="#fff" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>

            <polyline
              className="rl-trend"
              points="52,168 82,153 112,135 142,113 172,87"
              fill="none" stroke="#fff" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="5 4"
            />

            <text
              className="rl-rupee"
              x="68" y="125"
              fontFamily="Georgia, serif"
              fontWeight="700"
              fontSize="58"
              fill="#fff"
            >₹</text>
          </g>
        </svg>
      </div>
    </>
  )
}

export function rupeeSpinProps(size = 90) {
  return { spinning: true, indicator: <RupeeLoader size={size} /> }
}
