"use client";

import { Video, FileText, HelpCircle, ClipboardList } from "lucide-react";

export type ContentType = "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT";

interface ContentTypeSelectorProps {
  value: ContentType;
  onChange: (type: ContentType) => void;
  disabled?: boolean;
}

const contentTypes = [
  {
    value: "TEXT" as ContentType,
    label: "Text Content",
    icon: FileText,
    description: "Rich text lesson content",
    available: true,
  },
  {
    value: "VIDEO" as ContentType,
    label: "Video",
    icon: Video,
    description: "Video lesson with optional text",
    available: true,
  },
  {
    value: "QUIZ" as ContentType,
    label: "Quiz",
    icon: HelpCircle,
    description: "Interactive quiz",
    available: false,
  },
  {
    value: "ASSIGNMENT" as ContentType,
    label: "Assignment",
    icon: ClipboardList,
    description: "Assignment task",
    available: false,
  },
];

export default function ContentTypeSelector({
  value,
  onChange,
  disabled = false,
}: Readonly<ContentTypeSelectorProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {contentTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.value;
        const isDisabled = disabled || !type.available;

        return (
          <button
            key={type.value}
            type="button"
            onClick={() => !isDisabled && onChange(type.value)}
            disabled={isDisabled}
            className={`p-4 border rounded-lg text-left transition-colors ${
              isSelected
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-primary/50"
            } ${
              isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <div className="flex items-start gap-3">
              <Icon
                className={`h-5 w-5 mt-0.5 ${
                  isSelected ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <div>
                <h4 className="font-medium text-sm">
                  {type.label}
                  {!type.available && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Coming Soon)
                    </span>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {type.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export { contentTypes };
