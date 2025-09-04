import Card from "@/components/card";
import ChevronIcon from "@/components/icons/chevronIcon";
import { IconText } from "@/components/iconText";
import { Notification } from "@/components/notifications";
import Link from "next/link";

const Tab = ({ label, activeTab }: { label: string; activeTab: string }) => {
  const isActive = label.toLowerCase() == activeTab.toLocaleLowerCase();
  return (
    <Link
      href={`/berichtenbox/${label.toLowerCase()}`}
      className={`px-2 py-1 ${isActive && "border-primary border-b-3 font-extrabold"}`}
    >
      {label}
    </Link>
  );
};

export const BerichtenboxTableRow = ({ index }: { index: number }) => {
  return (
    <tr className="cursor-pointer border-b border-neutral-200 hover:bg-gray-100">
      <td className="w-2/6 max-w-2/6 py-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 appearance-none rounded-sm border-2 border-gray-500 bg-white"
          />
          {index === 0 ? (
            <span className="flex flex-row items-center gap-2 pl-3 font-bold">
              <span className="circle h-2 w-2 rounded-full bg-red-500"></span>
              <span>Belastingdienst</span>
            </span>
          ) : (
            <span className="pl-3">Belastingdienst</span>
          )}
        </div>
      </td>
      <td className="w-3/6 max-w-3/6 py-2 px-2">
        {index === 0 ? (
          <span className="text-blue-text hover:underline">
            Aanslag belastingen 2025
          </span>
        ) : (
          <span className="text-gray hover:text-blue-text hover:underline">
            Aanslag belastingen 2025
          </span>
        )}
      </td>
      <td className="w-1/6 max-w-1/6 py-2">
        <div className="flex items-center">
          <svg
            fill="#000000"
            width="15px"
            height="20px"
            viewBox="0 0 32 32"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              xmlns="http://www.w3.org/2000/svg"
              d="M23.679 32a6.263 6.263 0 0 1-4.472-1.874L4.59 15.314c-3.453-3.5-3.453-9.192 0-12.691a8.786 8.786 0 0 1 12.523 0L28.152 13.81c.494.5.494 1.312 0 1.812a1.252 1.252 0 0 1-1.79 0L15.325 4.436a6.278 6.278 0 0 0-8.946 0c-2.465 2.5-2.465 6.565 0 9.065l14.618 14.812a3.767 3.767 0 0 0 5.367 0 3.89 3.89 0 0 0 .095-5.339L11.743 8.062a1.256 1.256 0 0 0-1.788 0 1.295 1.295 0 0 0 0 1.812l11.041 11.188c.494.5.494 1.311 0 1.813-.495.5-1.295.5-1.79 0L8.168 11.686a3.884 3.884 0 0 1 0-5.436 3.766 3.766 0 0 1 5.366-.001l14.619 14.813c2.464 2.499 2.464 6.565 0 9.064A6.265 6.265 0 0 1 23.679 32"
              fill="#282828"
              fillRule="evenodd"
            />
          </svg>
          <span className="pl-1">21/02/2025</span>

          <svg
            fill="#077ec8"
            version="1.1"
            baseProfile="tiny"
            width="20px"
            height="20px"
            viewBox="0 0 42 42"
            className="pl-2"
          >
            <polygon
              fillRule="evenodd"
              points="13.933,1 34,21.068 14.431,40.637 9.498,35.704 24.136,21.068 9,5.933 "
            />
          </svg>
        </div>
      </td>
    </tr>
  );
};

const BerichtenboxPage = async ({
  params,
}: {
  params: Promise<{ status: string }>;
}) => {
  const { status } = await params;

  //staat een redirect in next.config.ts dat /berichtenbox -> /berichtenbox/inbox gaat
  return (
    <>
      <h1 className="text-h1">Mijn Berichtenbox</h1>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 w-full space-y-5 md:col-span-8">
          <Card>
            <div className="space-y-5">
              <div className="flex w-full space-x-2 border-b-1 border-neutral-200">
                <Tab label={"Inbox"} activeTab={status} />
                <Tab label={"Archief"} activeTab={status} />
                <Tab label={"Prullenbak"} activeTab={status} />
              </div>
              <div className="w-full overflow-x-auto">
              <table className="table-auto text-left border-spacing-4 w-[100%]">
                <thead className="bg-blue-gray-50 text-primary border-primary mb-4 border-b">
                  <tr>
                    {/* ik snap niet waarom mijnoverheid.nl dit niet gewoon links uitlijnt, 
                      het staat halverwege de checkbox / text?  daarom de pl-5
                      */}
                    <th className="py-2 pl-5">Afzender</th>
                    <th className="py-2">Onderwerp</th>
                    <th className="py-2">Ontvangen</th>
                  </tr>
                </thead>
                <tbody className="w-full">
                  {Array.from(Array(10).keys()).map((x) => (
                    <BerichtenboxTableRow index={x} key={x} />
                  ))}
                </tbody>
              </table>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 appearance-none rounded-sm border-2 border-gray-500 bg-white"
                />
                <span className="pl-3 font-bold">
                  (de)selecteer alle berichten
                </span>
              </div>
              <div className="flex w-full gap-4 space-x-2 bg-stone-100 px-3">
                <div className="flex cursor-not-allowed items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    className="w-4"
                  >
                    <path
                      d="M5.052 28.401c-.817 0-1.482-.703-1.482-1.566V14.2l10.036 7.058a4.28 4.28 0 0 0 2.465.79c.857 0 1.715-.264 2.463-.79L28.57 14.2v12.635c0 .863-.665 1.566-1.482 1.566H5.052ZM15.2 3.998a1.45 1.45 0 0 1 1.6 0L27 10.757l-10.2 6.758a1.446 1.446 0 0 1-1.6 0L5 10.757l10.2-6.76ZM32 10.749v-.005c0-.019-.005-.036-.005-.054a1.733 1.733 0 0 0-.025-.252c-.009-.044-.025-.084-.036-.127-.017-.056-.03-.112-.052-.167-.025-.062-.059-.12-.092-.178-.017-.029-.027-.061-.047-.09 0-.002-.003-.003-.003-.004a1.575 1.575 0 0 0-.188-.233c-.047-.05-.102-.09-.155-.132-.026-.02-.05-.045-.077-.064-.053-.036-.108-.062-.165-.092l-.04-.022L18.549.79a4.515 4.515 0 0 0-5.098 0L.885 9.329l-.03.017c-.06.03-.12.059-.176.097-.024.017-.044.039-.067.057a1.266 1.266 0 0 0-.164.14c-.07.07-.132.149-.187.231l-.004.005c-.019.03-.031.062-.05.093-.031.058-.065.114-.09.175-.022.055-.035.113-.05.169-.013.043-.028.082-.036.125a1.616 1.616 0 0 0-.026.253c0 .018-.005.034-.005.053v16.558C0 29.892 2.064 32 4.6 32h22.8c2.536 0 4.6-2.108 4.6-4.698V10.749Z"
                      fill="#696969"
                      fillRule="evenodd"
                    />
                  </svg>
                  <span className="pl-1 font-bold text-stone-500">
                    Verplaats naar inbox
                  </span>
                </div>
                <div className="flex cursor-not-allowed items-center gap-1 py-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    className="w-4"
                  >
                    <path
                      fill="#696969"
                      fillRule="evenodd"
                      d="M19.188 17.874c1 0 1.81.81 1.81 1.81v4.503a1.81 1.81 0 1 1-3.62 0v-4.503c0-1 .81-1.81 1.81-1.81zm-6.38 0c1 0 1.81.81 1.81 1.81v4.503a1.81 1.81 0 1 1-3.621 0v-4.503c0-1 .81-1.81 1.81-1.81zm11.93 9.52a.987.987 0 0 1-.986.986H8.243a.986.986 0 0 1-.985-.985V15.363h17.48v12.032zM4.32 10.302a1.79 1.79 0 0 1 1.788-1.788h19.778a1.79 1.79 0 0 1 1.787 1.788v1.442H4.32v-1.442zm9-6.681 5.352-.032v1.305H13.32V3.62zm12.566 1.273h-3.593V3.588A3.592 3.592 0 0 0 18.707 0h-5.418A3.592 3.592 0 0 0 9.7 3.588v1.305H6.11A5.414 5.414 0 0 0 .7 10.301v3.252c0 1 .81 1.81 1.81 1.81h1.127v12.032A4.61 4.61 0 0 0 8.243 32h15.51a4.611 4.611 0 0 0 4.606-4.605V15.363h1.126c1 0 1.81-.81 1.81-1.81v-3.252a5.414 5.414 0 0 0-5.408-5.408z"
                    />
                  </svg>
                  <span className="pl-1 font-bold text-stone-500">
                    Verplaats naar archief
                  </span>
                </div>
              </div>
              <div className="flex w-full">
                <div className="mx-auto flex items-center gap-3">
                  <a
                    href="#"
                    className="bg-primary rounded-sm px-1.5 text-sm font-bold text-white"
                  >
                    1
                  </a>
                  {Array.from(Array(4).keys()).map((x) => (
                    <a
                      key={x}
                      href="#"
                      className="hover-up rounded-sm px-1.5 text-sm hover:bg-stone-100"
                    >
                      {x + 2}
                    </a>
                  ))}
                  <a href="#" className="hover-up">
                    <svg
                      fill="#077ec8"
                      version="1.1"
                      baseProfile="tiny"
                      width="20px"
                      height="20px"
                      viewBox="0 0 42 42"
                      className="pl-2"
                    >
                      <polygon
                        fillRule="evenodd"
                        points="13.933,1 34,21.068 14.431,40.637 9.498,35.704 24.136,21.068 9,5.933 "
                      />
                    </svg>
                  </a>
                </div>
              </div>

              <Notification
                text={
                  "Meer informatie over de berichtenbox. Uw zakelijke brievenbus van de overheid."
                }
              />
            </div>
          </Card>

          <Card>
            <div className="space-y-5">
              <h2 className="text-2xl">Uw E-mailadres(sen) aanpassen</h2>
              <p>
                Wilt u de e-mailadres(sen) waarop u meldingen ontvangt aanpassen
                of aanpassen welke organisaties u digitaal berichten mogen
                sturen? Dit staat onder Bedrijfsprofiel
              </p>

              <Link
                className="text-primary flex font-bold"
                href={"/bedrijfsprofiel"}
              >
                Ga naar bedrijfsprofiel
                <svg
                  fill="#077ec8"
                  version="1.1"
                  baseProfile="tiny"
                  width="20px"
                  height="20px"
                  viewBox="0 0 42 42"
                  className="pl-2"
                >
                  <polygon
                    fillRule="evenodd"
                    points="13.933,1 34,21.068 14.431,40.637 9.498,35.704 24.136,21.068 9,5.933 "
                  />
                </svg>
              </Link>
            </div>
          </Card>
        </div>
        <div className="col-span-12 md:col-span-4">
          <Card>
            <div className="space-y-4">
              <h2 className="text-2xl">
                Bent u gemachtigd voor iemand anders?
              </h2>
              <p>U kunt hier uw machtiging ophalen en gebruiken.</p>
              <a href="#" className="text-blue-text hover-up font-bold">
                <span className="flex flex-row items-center gap-2">
                  <IconText IconAfter={ChevronIcon}>
                    {"Haal machtigingen op"}
                  </IconText>
                </span>
              </a>

              <Notification
                text={
                  "Ondek hoe u gemachtigd kunt worden om diditale post van iemand anders te lezen."
                }
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default BerichtenboxPage;
