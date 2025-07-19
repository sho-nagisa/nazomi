import svgPaths from "./svg-w7nub29lr1";

function Frown() {
  return (
    <div className="absolute left-[130px] size-12 top-0" data-name="Frown">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 48 48"
      >
        <g id="Frown">
          <path
            d={svgPaths.p33775800}
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

function Meh() {
  return (
    <div className="absolute left-[65px] size-12 top-0" data-name="Meh">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 48 48"
      >
        <g id="Meh">
          <path
            d={svgPaths.p1dd46000}
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

function Smile() {
  return (
    <div className="absolute left-0 size-12 top-0" data-name="Smile">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 48 48"
      >
        <g id="Smile">
          <path
            d={svgPaths.p237a4200}
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

function Group4() {
  return (
    <div className="absolute contents left-0 top-0">
      <Frown />
      <Meh />
      <Smile />
    </div>
  );
}

function Frame6() {
  return (
    <div className="h-12 relative shrink-0 w-[178px]">
      <Group4 />
    </div>
  );
}

function Textarea() {
  return (
    <div
      className="bg-[#ffffff] min-h-20 min-w-60 relative rounded-lg shrink-0 w-full"
      data-name="Textarea"
    >
      <div className="min-h-inherit min-w-inherit overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-row items-start justify-start min-h-inherit min-w-inherit px-4 py-3 relative w-full">
          <div className="basis-0 font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1e1e1e] text-[16px] text-left">
            <p className="block leading-[1.4]">今日は…</p>
          </div>
          <div
            className="absolute bottom-[6.019px] right-[5.019px] size-[6.627px]"
            data-name="Drag"
          >
            <div
              className="absolute bottom-[-5.335%] left-[-5.335%] right-[-5.335%] top-[-5.335%]"
              style={
                {
                  "--stroke-0":
                    "rgba(179.000004529953, 179.000004529953, 179.000004529953, 1)",
                } as React.CSSProperties
              }
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                role="presentation"
                viewBox="0 0 8 8"
              >
                <path
                  d={svgPaths.p508fbdc}
                  id="Drag"
                  stroke="var(--stroke-0, #B3B3B3)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute border border-[#d9d9d9] border-solid inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
    </div>
  );
}

function TextareaField() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 h-[217px] items-start justify-start p-0 relative shrink-0 w-[299px]"
      data-name="Textarea Field"
    >
      <div className="font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#1e1e1e] text-[16px] text-left w-full">
        <p className="block leading-[1.4]">今日はどんな1日でしたか？</p>
      </div>
      <Textarea />
    </div>
  );
}

function Frame5() {
  return (
    <div className="box-border content-stretch flex flex-col gap-2.5 items-end justify-end px-9 py-0 relative shrink-0">
      <TextareaField />
    </div>
  );
}

function Button() {
  return (
    <div
      className="absolute bg-[#2c2c2c] left-0 rounded-lg top-0"
      data-name="Button"
    >
      <div className="box-border content-stretch flex flex-row gap-2 items-center justify-center overflow-clip p-[12px] relative">
        <div className="font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[16px] text-left text-neutral-100 text-nowrap">
          <p className="block leading-none whitespace-pre">投稿する</p>
        </div>
      </div>
      <div className="absolute border border-[#2c2c2c] border-solid inset-0 pointer-events-none rounded-lg" />
    </div>
  );
}

function Frame7() {
  return (
    <div className="h-10 relative shrink-0 w-[88px]">
      <Button />
    </div>
  );
}

function Component() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-2.5 h-[844px] items-center justify-center left-0 overflow-clip p-[10px] top-0 w-[390px]"
      data-name="日記投稿画面"
    >
      <Frame6 />
      <Frame5 />
      <Frame7 />
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

function Frame1() {
  return (
    <div className="absolute bg-[#c6c6c6] box-border content-stretch flex flex-row gap-2.5 h-[61px] items-center justify-start left-0 px-[13px] py-3 top-0 w-[390px]">
      <ArrowLeft />
    </div>
  );
}

export default function Component1() {
  return (
    <div className="relative size-full" data-name="日記投稿画面">
      <Component />
      <Frame1 />
    </div>
  );
}