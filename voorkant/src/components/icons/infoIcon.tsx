import { tv } from "tailwind-variants";

const IconTV = tv({
  variants: {
    variant: {
      information: "fill-(--color-primary)",
      warning: "fill-orange-600",
      error: "fill-red-600",
      success: "fill-green-600",
    },
  },
  defaultVariants: {
    variant: "information",
  },
});

export const Icon = ({
  variant = "information",
  handleClick,
}: {
  variant?: "information" | "warning" | "error" | "success";
  handleClick?: () => void;
}) => {
  return (
    <svg
      onClick={handleClick}
      className="inline-block align-[-0.1rem]"
      width="20px"
      height="20px"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22ZM12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V11C12.75 10.5858 12.4142 10.25 12 10.25C11.5858 10.25 11.25 10.5858 11.25 11V17C11.25 17.4142 11.5858 17.75 12 17.75ZM12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7Z"
        className={IconTV({ variant })}
      />
    </svg>
  );
};
