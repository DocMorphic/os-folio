import {useId} from "react";

const KINDS = ["Milk block", "Wafer fingers", "Golden truffles", "Hazelnut bar", "White chocolate", "Caramel bites", "Praline triangles", "Chocolate cup"] as const;

/** Vector confectionery: distinct moulds, fillings and packaging, crisp at cabinet zoom. */
export function ChocolateProduct({index=0,label="DD",className}:{index?:number;label?:string;className?:string}) {
  const id = useId().replace(/:/g, "");
  const variant = ((Math.floor(index) % KINDS.length) + KINDS.length) % KINDS.length;
  const paint = (name:string) => `url(#${id}-${name})`;
  const badge = (x:number,y:number,color:string,size=22) => <text x={x} y={y} textAnchor="middle" fill={color} fontFamily="Georgia,serif" fontWeight="bold" fontSize={size}>{label}</text>;
  const caption = (text:string,x:number,y:number,color="#fff1d2",size=8) => <text x={x} y={y} textAnchor="middle" fill={color} fontFamily="Arial,sans-serif" fontWeight="bold" fontSize={size} letterSpacing="1">{text}</text>;
  return <div className={className} aria-hidden="true" data-chocolate={KINDS[variant]}>
    <svg viewBox="0 0 120 190" fill="none" focusable="false">
      <defs>
        <linearGradient id={`${id}-milk`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#bd8056"/><stop offset=".4" stopColor="#865032"/><stop offset="1" stopColor="#482517"/></linearGradient>
        <linearGradient id={`${id}-dark`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#865437"/><stop offset=".45" stopColor="#4c291f"/><stop offset="1" stopColor="#281610"/></linearGradient>
        <linearGradient id={`${id}-white`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff7d7"/><stop offset=".5" stopColor="#ecd7a4"/><stop offset="1" stopColor="#bea36f"/></linearGradient>
        <linearGradient id={`${id}-foil`}><stop stopColor="#818e92"/><stop offset=".22" stopColor="#f5f5eb"/><stop offset=".4" stopColor="#b0bec0"/><stop offset=".68" stopColor="#fffdf0"/><stop offset="1" stopColor="#97a6a6"/></linearGradient>
        <radialGradient id={`${id}-gold`} cx=".3" cy=".2" r=".85"><stop stopColor="#fff1ac"/><stop offset=".45" stopColor="#d7a646"/><stop offset="1" stopColor="#8c5c1e"/></radialGradient>
      </defs>

      {variant===0&&<g data-shape="segmented-tablet">
        <rect x="18" y="12" width="84" height="160" rx="5" fill="#482719"/>
        {Array.from({length:8},(_,i)=><g key={i} transform={`translate(${23+i%2*39} ${17+Math.floor(i/2)*34})`}><rect width="35" height="29" rx="3" fill={paint("milk")} stroke="#4d2c1c" strokeWidth="2"/><path d="M4 24V4H30" stroke="#d2976b" strokeWidth="2" opacity=".55"/></g>)}
        <path d="M13 86L27 80L39 91L57 81L70 88L92 80L107 89V175H13Z" fill={paint("foil")}/>
        <path d="M13 101H107V179H13Z" fill="#6e4a8d"/><path d="M17 106H103M17 173H103" stroke="#d3af77"/>
        {caption("THE ORIGINAL",60,122)}{badge(60,152,"#fff1d2",28)}
        {caption("MILK CHOCOLATE",60,168,"#fff1d2",7)}
      </g>}

      {variant===1&&<g data-shape="twin-wafer-fingers">
        {[26,62].map((x,i)=><g key={x} transform={`rotate(${i?5:-5} ${x+14} 95)`}>
          <rect x={x} y="15" width="29" height="139" rx="7" fill={paint("milk")} stroke="#57331e" strokeWidth="2"/>
          <path d={`M${x+6} 24v109M${x+10} 20h11`} stroke="#d99a64" opacity=".6" strokeWidth="2"/>
          {[43,76,109].map(y=><path key={y} d={`M${x+2} ${y}h25`} stroke="#60341f" strokeWidth="3"/>)}
          {i===1&&<g><path d={`M${x} 16l9-5 10 4 10-2v18H${x}Z`} fill="#d8a469"/>{[19,24,29].map(y=><path key={y} d={`M${x+2} ${y}h24`} stroke="#86502a" strokeWidth="2"/>)}</g>}
        </g>)}
        <path d="M15 101L31 90L48 98L72 88L101 100L106 178H13Z" fill={paint("foil")}/>
        <path d="M13 114H106V180L99 177L91 182L81 177L72 182L60 177L48 182L37 177L24 182L13 178Z" fill="#be4937"/>
        <path d="M18 129L102 117V150L18 163Z" fill="#fff0cd"/>
        {badge(60,149,"#a13829",26)}{caption("CRISPY WAFERS",60,172,"#fff1d2",7)}
      </g>}

      {variant===2&&<g data-shape="round-foil-truffles">
        {[[43,49,-12],[80,87,12],[42,130,-8]].map(([x,y,r],i)=><g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <path d={`M${x-20} ${y-10}l-15-8 3 18-3 17 15-9M${x+20} ${y-10}l15-8-3 18 3 17-15-9`} fill={paint("gold")} stroke="#ad772a"/>
          <circle cx={x} cy={y} r="24" fill={paint("gold")} stroke="#b48235"/>
          <path d={`M${x-16} ${y-14}l9 12-12 9 17-3 6 14 4-13 13-3-15-9 8-10-15 5Z`} stroke="#fff3b0" opacity=".5"/>
          <ellipse cx={x} cy={y} rx="14" ry="10" fill="#653b2c"/>{badge(x,y+4,"#fff1cf",11)}
        </g>)}
        {caption("GOLDEN TRUFFLES",60,178,"#62432c",8)}
      </g>}

      {variant===3&&<g data-shape="whole-nut-slab">
        <path d="M32 14L78 11L91 22L93 156L26 157L24 27Z" fill={paint("dark")} stroke="#42291c" strokeWidth="3"/>
        {[[43,30],[70,26],[61,50],[39,63],[75,73],[50,88],[73,103]].map(([x,y],i)=><g key={i} transform={`rotate(${i*47} ${x} ${y})`}><ellipse cx={x} cy={y} rx="8" ry="11" fill="#ad7947" stroke="#5c3623" strokeWidth="2"/><path d={`M${x-2} ${y-7}q-4 8 1 13`} stroke="#e2b981" strokeWidth="2"/></g>)}
        <path d="M20 108L37 98L54 111L72 101L96 111L100 180H20Z" fill="#dec7a0"/>
        <path d="M20 125H100V180H20Z" fill="#345b43"/>
        {caption("ROASTED",60,139,"#f7deb0",7)}{badge(60,160,"#f7deb0",23)}{caption("HAZELNUT",60,174,"#f7deb0",7)}
      </g>}

      {variant===4&&<g data-shape="white-chocolate-window-box">
        <rect x="12" y="25" width="96" height="151" rx="3" fill="#b45868"/>
        <path d="M12 25l9-9h81l6 9M108 25v151l-6 7H17l-5-7" fill="#8b3d52"/>
        <rect x="20" y="32" width="80" height="92" rx="2" fill="#773d42"/>
        {Array.from({length:9},(_,i)=><g key={i} transform={`translate(${24+i%3*25} ${36+Math.floor(i/3)*28})`}><rect width="22" height="25" rx="3" fill={paint("white")} stroke="#c6aa76"/><path d="M4 21V4H18" stroke="#fff9e6"/>{i%2===0&&<><ellipse cx="9" cy="12" rx="2" ry="3" fill="#b57475"/><circle cx="16" cy="19" r="1.4" fill="#b57475"/></>}</g>)}
        {badge(60,150,"#fff0d7",25)}{caption("WHITE & BERRY",60,167,"#fff0d7",7)}
      </g>}

      {variant===5&&<g data-shape="caramel-cross-section">
        <path d="M17 84L101 78L106 176L16 180Z" fill="#e2a747"/><path d="M17 84L27 77L33 85L44 78L52 84L63 76L72 83L85 77L94 83L101 78" stroke="#f4d690" strokeWidth="5"/>
        <rect x="25" y="107" width="72" height="59" rx="2" fill="#79442b"/>{caption("SOFT CENTRE",61,119,"#ffedc2",7)}{badge(61,145,"#ffedc2",24)}{caption("CARAMEL BITES",61,158,"#ffedc2",6.5)}
        <g transform="rotate(-13 49 58)"><path d="M17 40L69 32L86 49V85L29 91L17 77Z" fill={paint("milk")}/><path d="M29 54L86 49V79L29 85Z" fill="#592e1c"/><path d="M34 59L81 55V75L34 80Z" fill="#dfa347"/><path d="M36 63L78 59" stroke="#ffda84" strokeWidth="3"/><path d="M18 42L30 53L83 47" stroke="#c28a5d" strokeWidth="2"/><path d="M58 77Q57 104 65 99Q72 94 69 77" fill="#dfa347"/></g>
      </g>}

      {variant===6&&<g data-shape="triangular-praline-peaks">
        <g transform="rotate(-8 60 88)">
          {[18,52,86].map((y,i)=><g key={y}><path d={`M25 ${y+34}L58 ${y}L91 ${y+29}L66 ${y+43}Z`} fill={paint("milk")} stroke="#603822" strokeWidth="2"/><path d={`M58 ${y}L66 ${y+43}L91 ${y+29}Z`} fill="#572d1e"/><path d={`M33 ${y+30}L56 ${y+7}`} stroke="#d79e68" strokeWidth="2"/>{i===0&&<path d={`M56 ${y+13}l-13 16 16 5Z`} fill="#d3ad76"/>}</g>)}
          <path d="M18 119L59 131L103 116V165L60 183L18 170Z" fill="#284e75"/><path d="M59 131V183L103 165V116Z" fill="#1a375b"/>
          {badge(59,156,"#f9df9e",21)}{caption("PRALINE",59,169,"#f9df9e",7)}
        </g>
      </g>}

      {variant===7&&<g data-shape="fluted-chocolate-cup">
        <path d="M19 96L32 130Q60 147 89 130L104 96Z" fill="#47291f"/>
        {[27,38,49,60,71,82,93].map(x=><path key={x} d={`M${x} 101L${60+(x-60)*.75} 133`} stroke="#a27653" strokeWidth="2"/>)}
        <ellipse cx="61" cy="93" rx="43" ry="23" fill={paint("dark")} stroke="#9b6440" strokeWidth="2"/>
        <ellipse cx="61" cy="88" rx="34" ry="17" fill={paint("milk")}/>
        <path d="M32 85Q52 67 84 82M31 91Q59 75 91 92M43 99Q67 85 87 99" stroke="#dca069" strokeWidth="3" strokeLinecap="round"/>
        <g transform="rotate(10 72 54)"><path d="M46 61L53 34L93 30L101 53L89 70Z" fill={paint("dark")} stroke="#7b4a2d" strokeWidth="2"/><path d="M51 57L57 40L88 37L95 52L84 63Z" fill="#c89658"/><path d="M57 46L88 42M55 52L92 49" stroke="#eac387" strokeWidth="2"/></g>
        <path d="M22 147H101V177H22Z" fill="#e8c897"/>{badge(42,168,"#59392a",18)}{caption("CHOC",79,159,"#59392a",7)}{caption("CUP",79,170,"#59392a",7)}
      </g>}
    </svg>
  </div>;
}
