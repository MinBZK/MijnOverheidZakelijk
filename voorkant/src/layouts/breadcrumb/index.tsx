"use client";

import React from "react";

import { usePathname } from "next/navigation";
import Link from "next/link";

const Breadcrumb = () => {
  const paths = usePathname();
  const pathNames = paths.split("/").filter((path) => path);

  // Geen breadcrumbs op home page
  if (pathNames.length == 0) {
    return;
  }
  const separator = <span className="px-2"> {">"} </span>;
  return (
    <div>
      <ul className="flex">
        <li className={""}>
          <Link
            href={"/"}
            className="text-blue-text text-sub uppercase hover:underline"
          >
            Home
          </Link>
        </li>
        {pathNames.length > 0 && separator}
        {pathNames.map((link, index) => {
          const href = `/${pathNames.slice(0, index + 1).join("/")}`;
          const itemLink = link[0].toUpperCase() + link.slice(1, link.length);
          return (
            <React.Fragment key={index}>
              <li className={""}>
                <Link
                  href={href}
                  className={`text-sub uppercase ${href == paths ? "text-black" : "text-blue-text hover:underline"}`}
                >
                  {itemLink}
                </Link>
              </li>
              {pathNames.length !== index + 1 && separator}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default Breadcrumb;
