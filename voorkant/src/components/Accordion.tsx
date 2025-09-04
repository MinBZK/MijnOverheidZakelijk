"use client";

import { ReactNode, useId, useState } from "react";
import ChevronIcon from "./icons/chevronIcon";

const AccordionItem = ({
  title,
  content,
  headingLevel, // Accordion uses h2 as default
}: {
  title: string;
  content: ReactNode;
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6;
}) => {
  const [opened, setOpened] = useState(false);
  const id = useId();

  const HeadingTag = `h${headingLevel}` as keyof React.JSX.IntrinsicElements;

  return (
    <li
      className={`accordion-item rounded border-2 border-solid border-stone-100 ${opened ? "" : "hover-up"}`}
    >
      <button
        className="flex w-full flex-row items-baseline gap-2 bg-stone-100 p-2 text-left font-bold"
        type="button"
        aria-expanded={opened}
        aria-controls={`collapse${id}`}
        onClick={() => setOpened(!opened)}
      >
        <ChevronIcon
          className="mt-1 w-4 transition-[rotate] duration-300 ease-in-out"
          aria-hidden="true"
          style={{ rotate: opened ? "90deg" : "0deg" }}
        />
        <HeadingTag className="accordion-header">{title}</HeadingTag>
      </button>
      <div
        id={`collapse${id}`}
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out`}
        style={{
          gridTemplateRows: opened ? "minmax(0, 1fr)" : "minmax(0, 0fr)",
        }}
      >
        <div className="accordion-body p-4 pl-8">{content}</div>
      </div>
    </li>
  );
};

export const Accordion = ({
  items,
  headingLevel = 2,
}: {
  items: Array<{ title: string; content: React.ReactNode }>;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}) => {
  return (
    <ul className="accordion flex flex-col gap-1">
      {items.map((item, index) => (
        <AccordionItem key={index} {...item} headingLevel={headingLevel} />
      ))}
    </ul>
  );
};
