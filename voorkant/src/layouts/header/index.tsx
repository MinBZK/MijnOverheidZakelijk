"use client";

import ProfileSelect from "@/components/profileSelect";
import { SignOutAction } from "@/utils/auth/signOutAction";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Navigation from "../navigation";
import ChevronIcon from "@/components/icons/chevronIcon";

const Header = ({ kvk }: { kvk: string }) => {
  const [menuOpened, setMenuOpened] = useState(false);
  const mobileMenuRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (menuOpened && mobileMenuRef.current) mobileMenuRef.current.showModal();
    if (menuOpened === false && mobileMenuRef.current)
      mobileMenuRef.current.close();
  }, [menuOpened]);


  return (
    <>
      <header className="border-primary mb-3 border-b-2 bg-white shadow">
        <div className="container mx-auto grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] grid-rows-1 gap-x-2 md:gap-x-4 px-2 md:grid-rows-[auto_minmax(0,1fr)]">
          <button
            type="button"
            onClick={() => setMenuOpened(true)}
            className="col-1 row-1 flex items-center gap-2 md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16"
              viewBox="0 0 16 16"
              width="16"
            >
              <path
                d="M2.5 12h11a1 1 0 0 1 0 2h-11a1 1 0 0 1 0-2zm11-5a1 1 0 0 1 0 2h-11a1 1 0 1 1 0-2zm0-5a1 1 0 0 1 0 2h-11a1 1 0 1 1 0-2z"
                fill="#007bc7"
                fillRule="evenodd"
              />
            </svg>
            <span className="font-bold">menu</span>
          </button>
          <Image
            src="/logo.png"
            alt="Logo"
            width={44}
            height={78}
            className="col-2 row-1 w-[32px] pb-2 md:w-[44px]"
          />
          <div className="col-3 row-1 flex items-center justify-between md:col-start-1 md:col-end-4 md:row-2 md:pb-2.5">
            <h1 className="text-h4 md:text-h1">MijnOverheidZakelijk</h1>
            <div className="hidden md:flex">
              <ProfileSelect selectedKvK={kvk} />
              <button
                type="button"
                className="hover-up ml-16 cursor-pointer font-semibold"
                onClick={() => {
                  SignOutAction();
                }}
              >
                <svg
                  className="text-primary mr-1 inline-block h-4 w-4 align-[-0.1rem]"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M16.512 0a1.81 1.81 0 1 1 0 3.62c-4.032 0-7.405.2-10.027.597-.642.097-1.119.492-1.214 1.005-.42 2.282-.65 6.11-.65 10.778s.23 8.496.65 10.779c.095.513.57.906 1.214 1.004 2.622.395 5.995.597 10.027.597a1.81 1.81 0 1 1 0 3.62c-4.212 0-7.768-.214-10.567-.637-2.194-.33-3.856-1.873-4.235-3.93C1.093 24.072 1 18.828 1 16v-.382c.009-2.897.12-7.834.71-11.05C2.09 2.51 3.75.967 5.944.635 8.744.214 12.3 0 16.512 0zm3.477 7.84a1.814 1.814 0 0 1 2.56 0l6.888 6.887.056.07c.06.065.118.13.168.206.034.05.059.104.086.158.027.051.059.1.081.153.026.063.041.128.06.193.014.049.033.096.043.146.024.117.036.235.036.355a1.86 1.86 0 0 1-.036.354c-.01.053-.03.102-.045.154-.019.061-.033.124-.058.185-.024.06-.058.113-.09.17-.025.047-.046.095-.076.14-.067.1-.142.194-.227.278l-6.87 6.87a1.811 1.811 0 1 1-2.561-2.56l3.782-3.78H10.64a1.811 1.811 0 0 1 0-3.622h13.146l-3.796-3.796a1.81 1.81 0 0 1 0-2.56z"
                  ></path>
                </svg>
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      </header>
      <dialog
        ref={mobileMenuRef}
        className={`fixed inset-0 z-1 w-[288px] backdrop:bg-black/50 md:hidden`}
        onClick={() => setMenuOpened(false)}
      >
        <div className="flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setMenuOpened(false)}
            className="flex gap-2 p-4"
          >
            <ChevronIcon className="stroke-primary w-4 rotate-180" />
            <span className="font-bold">menu</span>
          </button>

          <Navigation />
          <div className="px-2">
            <ProfileSelect selectedKvK={kvk} />
          </div>
          <button
            type="button"
            className="hover-up cursor-pointer p-4 font-semibold"
            onClick={() => {
              SignOutAction();
            }}
          >
            <div className="flex items-center gap-2">
              <svg
                className="text-primary h-4 w-4 align-[-0.1rem]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M16.512 0a1.81 1.81 0 1 1 0 3.62c-4.032 0-7.405.2-10.027.597-.642.097-1.119.492-1.214 1.005-.42 2.282-.65 6.11-.65 10.778s.23 8.496.65 10.779c.095.513.57.906 1.214 1.004 2.622.395 5.995.597 10.027.597a1.81 1.81 0 1 1 0 3.62c-4.212 0-7.768-.214-10.567-.637-2.194-.33-3.856-1.873-4.235-3.93C1.093 24.072 1 18.828 1 16v-.382c.009-2.897.12-7.834.71-11.05C2.09 2.51 3.75.967 5.944.635 8.744.214 12.3 0 16.512 0zm3.477 7.84a1.814 1.814 0 0 1 2.56 0l6.888 6.887.056.07c.06.065.118.13.168.206.034.05.059.104.086.158.027.051.059.1.081.153.026.063.041.128.06.193.014.049.033.096.043.146.024.117.036.235.036.355a1.86 1.86 0 0 1-.036.354c-.01.053-.03.102-.045.154-.019.061-.033.124-.058.185-.024.06-.058.113-.09.17-.025.047-.046.095-.076.14-.067.1-.142.194-.227.278l-6.87 6.87a1.811 1.811 0 1 1-2.561-2.56l3.782-3.78H10.64a1.811 1.811 0 0 1 0-3.622h13.146l-3.796-3.796a1.81 1.81 0 0 1 0-2.56z"
                ></path>
              </svg>
              Uitloggen
            </div>
          </button>
        </div>
      </dialog>
    </>
  );
};

export default Header;
