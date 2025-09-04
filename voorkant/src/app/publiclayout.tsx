"use client";

import Link from "next/link";
import Image from "next/image";
import Card from "@/components/card";
import { signIn } from "next-auth/react";
import { Footer } from "@/layouts/footer";
import { useCookie } from "@/utils/useCookie";

const PublicRootLayout = () => {
  const { set } = useCookie("loginMethod");

  return (
    <div className="flex min-h-[100vh] flex-col">
      <header className="border-b-0 bg-transparent bg-[url(/public-background.png)] bg-cover bg-center pb-[100px]">
        <div className="container mx-auto grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] grid-rows-1 gap-x-4 px-2 md:grid-rows-[auto_minmax(0,1fr)]">
          <Image
            src="/logo.png"
            alt="Logo"
            width={44}
            height={78}
            className="col-2 row-1 w-[32px] pb-2 md:w-[44px]"
          />
        </div>
        <div className="relative mt-10 flex flex-col items-center justify-center space-y-12 px-4 text-center text-white">
          <h1 className="mb-4 text-4xl font-extrabold">MijnOverheidZakelijk</h1>
          <p className="">
            Uw zakelijke communicatie met de overheid op één plek
          </p>

          <button
            onClick={() => {
              set("digid");
              signIn();
            }}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-[#e17000] px-4 py-2 font-semibold text-white shadow-md hover:bg-orange-600"
          >
            <svg viewBox="0 0 150 150" width={40} height={40}>
              <path
                xmlns="http://www.w3.org/2000/svg"
                d="M136 150H14c-8 0-14-6-14-14V14C0 6 6 0 14 0h122c8 0 14 6 14 14v122c0 8-6 14-14 14z"
              />
              <path
                xmlns="http://www.w3.org/2000/svg"
                d="M17 115V79h10c12 0 19 6 19 17 0 13-8 19-19 19H17zm6-6h4c7 0 12-4 12-13 0-8-5-12-13-12h-3v25zm31-32c3 0 4 1 4 3s-1 4-4 4c-2 0-3-2-3-4s1-3 3-3zm3 38h-6V88h6v27zm15-6h6c6 0 9 3 9 7 0 5-4 9-14 9-8 0-11-2-11-7 0-2 1-4 4-6l-2-3c0-2 1-3 3-4-3-2-4-4-4-8 0-6 4-10 11-10l4 1h9v4h-4l2 5c0 6-4 9-12 9h-3l-1 1c0 2 1 2 3 2zm1 12c6 0 8-2 8-4s-1-2-3-2l-9-1-2 3c0 2 2 4 6 4zm6-24c0-3-2-5-5-5s-5 1-5 5 1 5 5 5c3 0 5-1 5-5z"
                fill="#fff"
              />
              <path
                xmlns="http://www.w3.org/2000/svg"
                d="M94 77c2 0 3 1 3 3s-1 4-3 4c-3 0-4-2-4-4s1-3 4-3zm3 38h-6V88h6v27zm8 0V79h10c12 0 18 6 18 17 0 13-7 19-19 19h-9zm6-6h4c7 0 12-4 12-13 0-8-5-12-13-12h-3v25z"
                fill="#E17000"
              />
            </svg>
            <p className="font-extrabold">Inloggen met DigiD</p>
          </button>

          <button
            onClick={() => {
              set("eherkenning");
              signIn();
            }}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-white px-4 py-2 font-semibold text-black shadow-md hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              aria-hidden="true"
              viewBox="0 0 64 64"
            >
              <path fill="transparent" d="M0 0h64v64H0z" />
              <path
                fill="#E2066E"
                d="M34.706 48h5.305V33.927h-5.305zM34.706 28.826h5.305V16h-5.305zM54.87 16v12.852H43.069l-2.266 5.033H54.87V48h5.29V16z"
              />
              <path
                fill="#053775"
                d="M12.525 48c-4.799-.001-8.683-3.835-8.685-8.569V24.583c.002-4.732 3.886-8.566 8.685-8.568h16.84v5.328h-16.84c-1.813.002-3.283 1.453-3.283 3.24V39.43c0 1.79 1.47 3.237 3.283 3.24h16.84V48h-16.84Z"
              />
              <path
                fill="#053775"
                d="M13.237 28.83v5.059h12.626l2.331-5.059z"
              />
            </svg>
            <p className="font-extrabold">Inloggen met E-Herkenning</p>
          </button>

          <a href="#" className="text-white underline hover:text-blue-300">
            Bekijk alle inlogmogelijkheden
          </a>

          <button className="rounded border border-white px-4 py-2 font-bold text-white transition hover:bg-white hover:text-blue-600">
            Ik ben nieuw
          </button>
        </div>
      </header>

      <main className="border-b-ro-blue after:bg-ro-blue relative -mt-[80px] border-b-2 pb-[68] after:absolute after:bottom-0 after:left-1/2 after:block after:h-[32px] after:w-[44px] after:-translate-x-1/2 after:content-['']">
        <div className="container mx-auto w-full space-y-5 px-4 py-4 md:w-3/5">
          <Card className="space-y-5">
            <h1 className="text-3xl">Wat is MijnOverheidZakelijk?</h1>
            <div className="space-y-4 border-t border-neutral-200 pt-4">
              <p>
                Dit is een prototype-website voor het project{" "}
                <strong>MijnOverheidZakelijk (MOZa)</strong>. Dit betekent dat
                het een voorlopige versie is, bedoeld om ideeën en
                functionaliteiten te testen. De inhoud en werking zijn nog in
                ontwikkeling en kunnen nog wijzigen.
              </p>

              <p>
                <span className="underline">Let op:</span> deze website bevat{" "}
                <span className="underline">geen</span> echte DigiD/E-Herkenning
                koppeling.
              </p>

              <p>
                Wilt u toch een indruk krijgen van het huidige prototype, dan
                kunt u inloggen met de volgende testgegevens:
              </p>

              <ul className="list-inside list-disc">
                <li>
                  <span className="font-semibold">Gebruikersnaam:</span> bedrijf
                </li>
                <li>
                  <span className="font-semibold">Wachtwoord:</span> password
                </li>
              </ul>

              <p>
                Na het inloggen komt u op de hoofdpagina. Rechtsboven kunt u het
                bedrijf wijzigen om verschillende scenario’s te verkennen.
              </p>
            </div>
          </Card>

          <Card className="flex flex-col items-center gap-6 p-6 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="mb-4 text-xl">Meer weten?</h2>
              <p className="mb-4 list-inside list-disc space-y-1 text-gray-800">
                Ga naar{" "}
                <Link
                  href="https://www.mijnoverheidzakelijk.nl/"
                  className="text-blue-500 underline"
                >
                  https://www.mijnoverheidzakelijk.nl
                </Link>{" "}
                voor meer informatie zoals documentatie en de designs
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicRootLayout;
