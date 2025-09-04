import { ReactNode } from "react";

const Card = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`rounded-sm bg-white p-4 md:p-8 shadow-[0_0_6px_rgba(0,0,0,0.16)] ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
