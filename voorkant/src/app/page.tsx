import { Accordion } from "@/components/Accordion";
import Button from "@/components/button";
import Card from "@/components/card";
import { IconText } from "@/components/iconText";
import ChevronIcon from "@/components/icons/chevronIcon";
import { Notification } from "@/components/notifications";
import profielClient from "@/network/profiel";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { BerichtenboxTableRow } from "./berichtenbox/[status]/page";
import Link from "next/link";

const accordionItems = [
  {
    title: "Wat is MijnOverheidZakelijk?",
    content: (
      <p>
        MijnOverheidZakelijk is uw centrale platform voor het veilig en
        efficiënt beheren van zakelijke overheidszaken. Alles op één plek,
        speciaal afgestemd op de behoeften van de zakelijke gebruiker.
      </p>
    ),
  },
  {
    title: "Wat kan ik doen via MijnOverheidZakelijk?",
    content: (
      <p>
        Van het ontvangen van berichten van overheidsinstanties tot het
        raadplegen van digitale post en het regelen van lopende zaken:
        MijnOverheidZakelijk biedt overzicht, gemak en betrouwbaarheid.
      </p>
    ),
  },
  {
    title: "Voor wie is MijnOverheidZakelijk bedoeld?",
    content: (
      <div className="fle-col flex gap-4">
        <p>
          Of u nu ondernemer bent, een organisatie vertegenwoordigt of als
          intermediair optreedt — via dit portaal heeft u altijd en overal
          inzicht in belangrijke overheidscommunicatie.
        </p>
        <Accordion
          items={[
            {
              title: "Child accordion",
              content: (
                <Accordion
                  items={[
                    {
                      title: "Deeper child accordion",
                      content: <p>Some child content </p>,
                    },
                  ]}
                  headingLevel={4}
                />
              ),
            },
          ]}
          headingLevel={3}
        />
      </div>
    ),
  },
] as const satisfies Array<{ title: string; content: React.ReactNode }>;

const Home = async () => {
  const kvk = await getKvkFromCookie();
  const { data, response } = await profielClient.GET(
    "/ondernemingen/EmailBekend/{kvkNummer}",
    {
      params: { path: { kvkNummer: kvk! } },
    },
  );

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 w-full space-y-6 md:col-span-9">
        {response.status != 200 ? (
          <Notification
            header="Er ging iets fout"
            text={"Er is een probleem met een achter liggend system"}
            variant={"error"}
          />
        ) : (
          !data && (
            <Notification
              variant={"warning"}
              header="E-mailadres nog niet gekoppeld"
              text={
                "Uw bedrijf heeft nog geen e-mailadres gekoppeld aan het bedrijfsprofiel. \nGa naar het tabblad Bedrijfsprofiel en vul hier het e-mailadres in.\n Zo weten wij hoe we uw organisatie kunnen bereiken met belangrijke berichten en updates."
              }
            />
          )
        )}

        <h1 className="text-h1">
          <span>{"Welkom gemachtigde voor KVK nummer: "}</span>
          <span className="font-bold">{kvk}</span>
        </h1>
        <Card className="flex flex-col gap-4">
          <h2 className="text-h2">Recente berichten in uw Berichtenbox</h2>
          <div className="w-full overflow-x-auto">
            <table className="w-[100%] table-auto text-left">
              <tbody className="w-full border-t border-neutral-200">
                <BerichtenboxTableRow index={0} />
                <BerichtenboxTableRow index={1} />
              </tbody>
            </table>
          </div>
          <Link href={"/berichtenbox/inbox"}>
            <Button>
              <IconText IconAfter={ChevronIcon}>
                {"Naar uw berichtenbox"}
              </IconText>
            </Button>
          </Link>
        </Card>
        <Card>
          <h2 className="text-h2">Wat is MijnOverheidZakelijk?</h2>
          <p className="py-4">
            MijnOverheidZakelijk is uw centrale platform voor het veilig en
            efficiënt beheren van zakelijke overheidszaken. Of u nu ondernemer
            bent, een organisatie vertegenwoordigt of als intermediair optreedt
            — via dit portaal heeft u altijd en overal inzicht in belangrijke
            overheidscommunicatie. <br />
            Van het ontvangen van berichten van overheidsinstanties tot het
            raadplegen van digitale post en het regelen van lopende zaken:
            MijnOverheidZakelijk biedt overzicht, gemak en betrouwbaarheid.
            Alles op één plek, speciaal afgestemd op de behoeften van de
            zakelijke gebruiker. <br />
            Maak uw administratie eenvoudiger, werk efficiënter samen met de
            overheid en houd grip op uw verplichtingen.
          </p>
          <Accordion items={accordionItems} />
        </Card>
      </div>
    </div>
  );
};

export default Home;
