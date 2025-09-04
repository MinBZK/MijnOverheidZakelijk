import React, { ReactNode } from "react";

interface Props extends React.HTMLProps<HTMLButtonElement> {
  type?: "submit" | "reset" | "button" | undefined;
  children: ReactNode;
}

const Button = ({ children, type = "button", ...props }: Props) => {
  return (
    <button
      {...props}
      type={type}
      className="bg-primary hover:bg-primary-600 focus:bg-primary-600 active:bg-primary-700 hover-up inline-block w-fit cursor-pointer rounded px-6 pt-2.5 pb-2 text-xs leading-normal font-extrabold text-white uppercase shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out focus:ring-0 focus:outline-none"
    >
      {children}
    </button>
  );
};

export default Button;
