import svgPaths from "./svg-mn7zcpghp2";

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

function Frame1() {
  return (
    <div className="absolute bg-[#c6c6c6] box-border content-stretch flex flex-row gap-2.5 h-[61px] items-center justify-start left-0 px-[13px] py-3 top-0 w-[390px]">
      <ArrowLeft />
    </div>
  );
}

export default function Component() {
  return (
    <div
      className="bg-[#ffffff] relative size-full"
      data-name="チャットルーム画面"
    >
      <Frame1 />
      <div
        className="[text-shadow:rgba(0,0,0,0.25)_0px_4px_4px] absolute font-['SF_Pro:Heavy',_'Noto_Sans_JP:Bold',_sans-serif] font-[860] h-[62px] leading-[0] right-[327px] text-[#000000] text-[50px] text-left top-[83px] tracking-[2.5px] translate-x-[100%] w-[327px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[normal]">共感ワード</p>
      </div>
      <div
        className="absolute font-['SF_Pro:Heavy',_'Noto_Sans_JP:Bold',_sans-serif] font-[860] leading-[0] left-[119px] text-[#000000] text-[16px] text-left text-nowrap top-[145px] tracking-[0.8px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[normal] whitespace-pre">
          終了まで23:24:05
        </p>
      </div>
    </div>
  );
}