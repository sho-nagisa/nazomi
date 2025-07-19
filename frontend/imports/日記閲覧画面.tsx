import svgPaths from "./svg-56hwv34ena";

function ChevronUp() {
  return (
    <div className="relative shrink-0 size-5" data-name="Chevron up">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Chevron up">
          <path
            d="M15 12.5L10 7.5L5 12.5"
            id="Icon"
            stroke="var(--stroke-0, #1E1E1E)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function AccordionTitle() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Accordion Title"
    >
      <div className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1e1e1e] text-[16px] text-left">
        <p className="block leading-[1.4]">2022/3/1</p>
      </div>
      <ChevronUp />
    </div>
  );
}

function AccordionContent() {
  return (
    <div
      className="box-border content-stretch flex flex-row items-center justify-center p-0 relative shrink-0 w-full"
      data-name="Accordion Content"
    >
      <div className="basis-0 flex flex-col font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1e1e1e] text-[16px] text-left">
        <p className="block leading-[1.4]">今日は…</p>
      </div>
    </div>
  );
}

function AccordionItem() {
  return (
    <div
      className="bg-[#ffffff] relative rounded-lg shrink-0 w-full"
      data-name="Accordion Item"
    >
      <div className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-lg" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-[16px] relative w-full">
          <AccordionTitle />
          <AccordionContent />
        </div>
      </div>
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-5" data-name="Chevron down">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Chevron down">
          <path
            d="M5 7.5L10 12.5L15 7.5"
            id="Icon"
            stroke="var(--stroke-0, #1E1E1E)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function AccordionTitle1() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-row gap-2 grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="Accordion Title"
    >
      <div className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1e1e1e] text-[16px] text-left">
        <p className="block leading-[1.4]">2022/3/2</p>
      </div>
      <ChevronDown />
    </div>
  );
}

function AccordionItem1() {
  return (
    <div
      className="bg-neutral-100 relative rounded-lg shrink-0 w-full"
      data-name="Accordion Item"
    >
      <div className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-lg" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-start p-[16px] relative w-full">
          <AccordionTitle1 />
        </div>
      </div>
    </div>
  );
}

function ChevronDown1() {
  return (
    <div className="relative shrink-0 size-5" data-name="Chevron down">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Chevron down">
          <path
            d="M5 7.5L10 12.5L15 7.5"
            id="Icon"
            stroke="var(--stroke-0, #1E1E1E)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function AccordionTitle2() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-row gap-2 grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="Accordion Title"
    >
      <div className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1e1e1e] text-[16px] text-left">
        <p className="block leading-[1.4]">2022/3/3</p>
      </div>
      <ChevronDown1 />
    </div>
  );
}

function AccordionItem2() {
  return (
    <div
      className="bg-neutral-100 relative rounded-lg shrink-0 w-full"
      data-name="Accordion Item"
    >
      <div className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-lg" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-start p-[16px] relative w-full">
          <AccordionTitle2 />
        </div>
      </div>
    </div>
  );
}

function ChevronDown2() {
  return (
    <div className="relative shrink-0 size-5" data-name="Chevron down">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Chevron down">
          <path
            d="M5 7.5L10 12.5L15 7.5"
            id="Icon"
            stroke="var(--stroke-0, #1E1E1E)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function AccordionTitle3() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-row gap-2 grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="Accordion Title"
    >
      <div className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1e1e1e] text-[16px] text-left">
        <p className="block leading-[1.4]">2022/3/4</p>
      </div>
      <ChevronDown2 />
    </div>
  );
}

function AccordionItem3() {
  return (
    <div
      className="bg-neutral-100 relative rounded-lg shrink-0 w-full"
      data-name="Accordion Item"
    >
      <div className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-lg" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-start p-[16px] relative w-full">
          <AccordionTitle3 />
        </div>
      </div>
    </div>
  );
}

function ChevronDown3() {
  return (
    <div className="relative shrink-0 size-5" data-name="Chevron down">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Chevron down">
          <path
            d="M5 7.5L10 12.5L15 7.5"
            id="Icon"
            stroke="var(--stroke-0, #1E1E1E)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function AccordionTitle4() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-row gap-2 grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="Accordion Title"
    >
      <div className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1e1e1e] text-[16px] text-left">
        <p className="block leading-[1.4]">2022/3/5</p>
      </div>
      <ChevronDown3 />
    </div>
  );
}

function AccordionItem4() {
  return (
    <div
      className="bg-neutral-100 relative rounded-lg shrink-0 w-full"
      data-name="Accordion Item"
    >
      <div className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-lg" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-start p-[16px] relative w-full">
          <AccordionTitle4 />
        </div>
      </div>
    </div>
  );
}

function Accordion() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-4 h-[307px] items-start justify-start p-0 relative shrink-0 w-[342px]"
      data-name="Accordion"
    >
      <AccordionItem />
      <AccordionItem1 />
      <AccordionItem2 />
      <AccordionItem3 />
      <AccordionItem4 />
    </div>
  );
}

function Component() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-2.5 h-[844px] items-center justify-center left-0 px-4 py-[76px] top-0 w-[390px]"
      data-name="日記閲覧画面"
    >
      <Accordion />
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

export default function Component1() {
  return (
    <div className="relative size-full" data-name="日記閲覧画面">
      <Component />
      <Frame2 />
    </div>
  );
}