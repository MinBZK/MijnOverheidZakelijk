import React from "react";
import { Icon } from "../icons/infoIcon";
import { tv } from "tailwind-variants";

const NotificationTV = tv({
  base: "px-4 py-2 shadow-md",
  variants: {
    variant: {
      information: "bg-blue-100",
      warning: "bg-orange-200",
      error: "bg-red-200",
      success: "bg-green-200",
    },
  },
  defaultVariants: {
    variant: "information",
  },
});

export const Notification = ({
  text,
  variant = "information",
  header,
}: {
  text: string;
  variant?: "information" | "warning" | "error" | "success";
  header?: string;
}) => {
  return (
    <div className={NotificationTV({ variant })} role="alert">
      <div className="flex">
        <div className="py-1">
          <Icon variant={variant} />
        </div>
        <div className="ml-2">
          {header && <p className="font-bold">{header}</p>}
          <span className="whitespace-pre-line">{text}</span>
        </div>
      </div>
    </div>
  );
};
