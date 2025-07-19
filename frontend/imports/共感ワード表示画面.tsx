import svgPaths from "./svg-l5kd0cjzun";

function Frame9() {
  return (
    <div className="absolute h-[55px] left-[22px] top-[248px] w-[346px]">
      <div
        className="absolute font-['SF_Pro:Heavy',_'Noto_Sans_JP:Bold',_sans-serif] font-[860] h-[109px] leading-[0] left-0 text-[#000000] text-[30px] text-left top-0 tracking-[1.5px] w-[455px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[normal]">
          今日の共感ワードは…？
        </p>
      </div>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute h-[114.21px] left-0 top-0 w-[166px]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 166 115"
        >
          <ellipse
            cx="83"
            cy="57.1052"
            fill="var(--fill-0, #98BEFF)"
            id="Ellipse 5"
            rx="83"
            ry="57.1052"
          />
        </svg>
      </div>
      <div
        className="absolute font-['SF_Pro:Heavy',_'Noto_Sans_JP:Bold',_sans-serif] font-[860] h-[26.873px] leading-[0] left-[31.881px] text-[#000000] text-[30px] text-left top-[44.042px] tracking-[1.5px] w-[102.238px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[normal]">疲れた</p>
      </div>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents left-[135px] top-[78px]">
      <div className="absolute h-[71px] left-[135px] top-[78px] w-[142px]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 142 71"
        >
          <ellipse
            cx="71"
            cy="35.5"
            fill="var(--fill-0, #FF9A9A)"
            id="Ellipse 6"
            rx="71"
            ry="35.5"
          />
        </svg>
      </div>
      <div
        className="absolute font-['SF_Pro:Heavy',_'Noto_Sans_JP:Bold',_sans-serif] font-[860] h-[18px] leading-[0] left-[174.101px] text-[#000000] text-[30px] text-left top-[104.5px] tracking-[1.5px] w-[63.797px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[normal]">快晴</p>
      </div>
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents left-[70px] top-[114px]">
      <div className="absolute h-[55px] left-[70px] top-[114px] w-[81.312px]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 82 55"
        >
          <ellipse
            cx="40.6559"
            cy="27.5"
            fill="var(--fill-0, #D9D9D9)"
            id="Ellipse 7"
            rx="40.6559"
            ry="27.5"
          />
        </svg>
      </div>
      <div
        className="absolute font-['SF_Pro:Heavy',_'Noto_Sans_JP:Bold',_sans-serif] font-[860] h-[22px] leading-[0] left-[98.245px] text-[#000000] text-[30px] text-left top-[130.5px] tracking-[1.5px] w-[25.677px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[normal]">犬</p>
      </div>
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute contents left-0 top-0">
      <Group5 />
      <Group6 />
      <Group7 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute h-[169px] left-14 top-[324px] w-[277px]">
      <Group8 />
    </div>
  );
}

function ArrowLeft() {
  return (
    <div className="h-9 relative shrink-0 w-[35px]" data-name="Arrow left">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 35 36"
      >
        <g id="Arrow left">
          <path
            d={svgPaths.p34d70400}
            id="Icon"
            stroke="var(--stroke-0, #1E1E1E)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute bg-[#c6c6c6] box-border content-stretch flex flex-row gap-2.5 h-[61px] items-center justify-start left-0 px-[13px] py-3 top-0 w-[390px]">
      <ArrowLeft />
    </div>
  );
}

function Frame11() {
  return (
    <div className="absolute h-[61px] left-0 top-0 w-[390px]">
      <Frame2 />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-[132px] top-[768px]">
      <div className="absolute bg-[#d9d9d9] h-[33px] left-[132px] rounded-[28px] top-[768px] w-[125px]" />
      <div
        className="absolute font-['SF_Pro:Heavy',_'Noto_Sans_JP:Bold',_sans-serif] font-[860] leading-[0] left-[166px] text-[#000000] text-[11px] text-left text-nowrap top-[778px] tracking-[0.55px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[normal] whitespace-pre">
          マッチング
        </p>
      </div>
    </div>
  );
}

export default function Component() {
  return (
    <div
      className="bg-[#ffffff] relative size-full"
      data-name="共感ワード表示画面"
    >
      <Frame9 />
      <Frame10 />
      <Frame11 />
      <Group3 />
    </div>
  );
}