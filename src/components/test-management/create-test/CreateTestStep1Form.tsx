import { CallIcon, DataIcon, SmsIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { TestType } from "@/data/mock";
import type { CreationMethod } from "@/types/create-test";

type CreateTestStep1FormProps = {
  creationMethod: CreationMethod | null;
  onCreationMethodChange: (value: CreationMethod) => void;
  testType: TestType | null;
  onTestTypeChange: (value: TestType | null) => void;
};

const testTypes: {
  type: TestType;
  title: string;
  description: string;
  icon: typeof CallIcon;
  iconBg: string;
  iconColor: string;
}[] = [
    {
      type: "Call",
      title: "Call Test",
      description: "Measures call success rate and quality.",
      icon: CallIcon,
      iconBg: "bg-vess-primary-50",
      iconColor: "text-vess-primary-500",
    },
    {
      type: "SMS",
      title: "SMS Test",
      description: "Measures message delivery rate.",
      icon: SmsIcon,
      iconBg: "bg-vess-secondary-50",
      iconColor: "text-vess-secondary-500",
    },
    {
      type: "Data",
      title: "Data Test",
      description: "Measures network speed & latency.",
      icon: DataIcon,
      iconBg: "bg-vess-green-50",
      iconColor: "text-vess-green-500",
    },
  ];

export function CreateTestStep1Form({
  creationMethod,
  onCreationMethodChange,
  testType,
  onTestTypeChange,
}: CreateTestStep1FormProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start gap-1 text-[18px] font-normal leading-[21.6px]">
          <span className="text-vess-grey-950">Select Creation Method</span>
          <span className="text-vess-red-500">*</span>
        </div>
        <div className="flex flex-wrap gap-8">
          <RadioChoice
            selected={creationMethod === "single"}
            onSelect={() => onCreationMethodChange("single")}
            label="Single Creation"
            name="creation"
          />
          <RadioChoice
            selected={creationMethod === "bulk"}
            onSelect={() => {
              onCreationMethodChange("bulk");
              onTestTypeChange(null);
            }}
            label="Bulk Upload"
            name="creation"
          />
        </div>
      </div>

      {creationMethod === "single" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start gap-1 text-[18px] font-normal leading-[21.6px]">
            <span className="text-vess-grey-950">Select Test Type</span>
            <span className="text-vess-red-500">*</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {testTypes.map(({ type, title, description, icon: Icon, iconBg, iconColor }) => (
              <button
                key={type}
                type="button"
                onClick={() => onTestTypeChange(type)}
                className={cn(
                  "flex w-full flex-col items-center gap-4 rounded-2xl border-2 bg-vess-grey-50 p-3 text-left transition-colors",
                  testType === type ? "border-vess-primary-500" : "border-vess-grey-100",
                )}
              >
                <div
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full",
                    iconBg,
                    iconColor,
                  )}
                >
                  <Icon className="size-6" />
                </div>
                <div className="flex w-full flex-col items-center gap-3">
                  <p className="text-[18px] font-semibold leading-[21.6px] text-vess-grey-950">
                    {title}
                  </p>
                  <p className="text-[15px] font-normal text-center leading-[18px] text-vess-grey-500">
                    {description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RadioChoice({
  selected,
  onSelect,
  label,
  name,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  name: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="radio"
        name={name}
        className="sr-only"
        checked={selected}
        onChange={onSelect}
      />
      <span
        className={cn(
          "box-border flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-solid bg-vess-grey-50",
          selected ? "border-vess-primary-500" : "border-vess-grey-200",
        )}
      >
        {selected && (
          <span className="size-2.5 rounded-full bg-vess-primary-500" aria-hidden />
        )}
      </span>
      <span className="text-[18px] font-normal leading-[21.6px] text-vess-grey-950">
        {label}
      </span>
    </label>
  );
}
