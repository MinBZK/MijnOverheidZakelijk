import { components } from "@/network/omc/generated";
import { tv } from "tailwind-variants";

const TimelineButtonTV = tv({
  base: "ml-3.5 flex h-3 w-3 items-center justify-center rounded-full border border-white bg-slate-300 text-slate-500 shadow",
  variants: {
    variant: {
      Accepted: "bg-green-300",
      PermanentFailure: "bg-red-400",
      default: "bg-gray-400",
    },
  },
  defaultVariants: {
    variant: "Accepted",
  },
});

const ContactMoment = ({
  notificatie,
}: {
  notificatie: components["schemas"]["Notificatie"];
}) => {
  const date = new Date(notificatie.createdAt!);
  const sendAt = date.toLocaleString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    dateStyle: "short",
    timeStyle: "short",
  });

  const x: boolean = ["Accepted", "PermanentFailure"].includes(
    notificatie.status!,
  );

  return (
    <div className="relative flex items-center">
      <div
        className={TimelineButtonTV({
          variant: x
            ? (notificatie.status as "Accepted" | "PermanentFailure")
            : "default",
        })}
      ></div>
      <div className="ml-2 w-full rounded border border-slate-200 bg-white p-2 shadow">
        <div className="flex items-center justify-between">
          <div className="font-bold text-slate-900">
            Scenario 8 met kanaalherstel
          </div>
          <time className="font-caveat text-primary font-medium">{sendAt}</time>
        </div>
        <div className="text-slate-500">Status: {notificatie.status}</div>
        <div className="text-slate-500">Medium: {notificatie.type}</div>

        <div
          className={`font- w-fit rounded border-1 border-purple-500 bg-purple-500 p-1 text-xs text-white`}
        >
          UWV
        </div>
      </div>
    </div>
  );
};

export default ContactMoment;
