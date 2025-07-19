function Input() {
  return (
    <div
      className="bg-[#ffffff] min-w-60 relative rounded-lg shrink-0 w-full"
      data-name="Input"
    >
      <div className="flex flex-row items-center min-w-inherit overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-start min-w-inherit px-4 py-3 relative w-full">
          <div className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#b3b3b3] text-[16px] text-left">
            <p className="block leading-none">Value</p>
          </div>
        </div>
      </div>
      <div className="absolute border border-[#d9d9d9] border-solid inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
    </div>
  );
}

function InputField() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Input Field"
    >
      <div
        className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#1e1e1e] text-[16px] text-left"
        style={{ width: "min-content" }}
      >
        <p className="block leading-[1.4]">Email</p>
      </div>
      <Input />
    </div>
  );
}

function Input1() {
  return (
    <div
      className="bg-[#ffffff] min-w-60 relative rounded-lg shrink-0 w-full"
      data-name="Input"
    >
      <div className="flex flex-row items-center min-w-inherit overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-row items-center justify-start min-w-inherit px-4 py-3 relative w-full">
          <div className="basis-0 font-['Inter:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#b3b3b3] text-[16px] text-left">
            <p className="block leading-none">Value</p>
          </div>
        </div>
      </div>
      <div className="absolute border border-[#d9d9d9] border-solid inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
    </div>
  );
}

function InputField1() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Input Field"
    >
      <div
        className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#1e1e1e] text-[16px] text-left"
        style={{ width: "min-content" }}
      >
        <p className="block leading-[1.4]">Password</p>
      </div>
      <Input1 />
    </div>
  );
}

function Button1() {
  return (
    <div
      className="basis-0 bg-[#2c2c2c] grow min-h-px min-w-px relative rounded-lg shrink-0"
      data-name="Button"
    >
      <div className="flex flex-row items-center justify-center overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2 items-center justify-center p-[12px] relative w-full">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[16px] text-left text-neutral-100 text-nowrap">
            <p className="block leading-none whitespace-pre">Sign In</p>
          </div>
        </div>
      </div>
      <div className="absolute border border-[#2c2c2c] border-solid inset-0 pointer-events-none rounded-lg" />
    </div>
  );
}

function ButtonGroup() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-4 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Button Group"
    >
      <Button1 />
    </div>
  );
}

function TextLink() {
  return (
    <div
      className="box-border content-stretch flex flex-row items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Text Link"
    >
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#1e1e1e] text-[16px] text-left text-nowrap">
        <p className="[text-decoration-line:underline] [text-decoration-skip-ink:none] [text-decoration-style:solid] [text-underline-position:from-font] block leading-[1.4] whitespace-pre">
          Forgot password?
        </p>
      </div>
    </div>
  );
}

function FormLogIn() {
  return (
    <div
      className="bg-[#ffffff] box-border content-stretch flex flex-col gap-6 items-center justify-center min-w-80 p-[24px] relative rounded-lg shrink-0"
      data-name="Form Log In"
    >
      <div className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-lg" />
      <InputField />
      <InputField1 />
      <ButtonGroup />
      <TextLink />
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-[#ffffff] relative size-full" data-name="ログイン画面">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center p-[36px] relative size-full">
          <FormLogIn />
        </div>
      </div>
    </div>
  );
}