export const IconText = ({
  children,
  IconBefore,
  IconAfter,
  iconProps,
}: {
  children: React.ReactNode;
  IconBefore?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  IconAfter?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconProps?: React.SVGProps<SVGSVGElement>;
}) => {
  return (
    <span className="flex items-baseline gap-2 active:underline">
      {IconBefore && <IconBefore className="w-3" {...iconProps} />}
      {children}
      {IconAfter && <IconAfter className="w-3" {...iconProps} />}
    </span>
  );
};
