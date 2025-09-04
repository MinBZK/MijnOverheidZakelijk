import Card from "@/components/card";
import profielClient from "@/network/profiel";
import { getKvkFromCookie } from "@/utils/kvknummer";

const Detail = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => (
  <div>
    <h4 className="text-sm font-medium text-gray-700">{label}</h4>
    <p className="text-gray-900">
      {value || <span className="text-gray-400">-</span>}
    </p>
  </div>
);

const IdentiteitPage = async () => {
  const kvk = await getKvkFromCookie();
  const { data: profiel, response } = await profielClient.GET(
    "/ondernemingen/{kvkNummer}",
    {
      params: { path: { kvkNummer: kvk! } },
    },
  );

  if (!profiel || response.status != 200) {
    throw new Error("Server-side error occurred");
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 w-full space-y-5 md:col-span-8">
        <h1 className="text-h1">Mijn bedrijfsprofiel</h1>
        <Card>
          <div className="grid grid-cols-1 gap-4 divide-y-1 divide-neutral-300 *:py-4">
            <h2 className="text-h2">Algemeen</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Detail label="Naam" value={profiel.KvkProfiel.naam} />
              <Detail
                label="formeleRegistratiedatum"
                value={profiel.KvkProfiel.formeleRegistratiedatum}
              />
              <Detail
                label="indNonMailing"
                value={profiel.KvkProfiel.indNonMailing}
              />
              <Detail
                label="statutaireNaaReactm"
                value={profiel.KvkProfiel.statutaireNaam}
              />
              <Detail
                label="vestigingsnummer"
                value={
                  profiel.KvkProfiel._embedded?.hoofdvestiging?.vestigingsnummer
                }
              />
              <Detail
                label="totaalWerkzamePersonen"
                value={profiel.KvkProfiel.totaalWerkzamePersonen}
              />
            </div>

            {profiel.KvkProfiel._embedded?.hoofdvestiging?.adressen &&
              profiel.KvkProfiel._embedded.hoofdvestiging.adressen.length >
                0 && (
                <div className="divide-y-1 divide-neutral-300 *:py-4">
                  <h2 className="text-h2">Adressen</h2>
                  {profiel.KvkProfiel._embedded?.hoofdvestiging?.adressen?.map(
                    (adres) => {
                      return (
                        <div
                          key={adres.volledigAdres}
                          className={`grid grid-cols-1 gap-4 border-b border-neutral-300 pb-4 md:grid-cols-2`}
                        >
                          <Detail
                            label="volledigAdres"
                            value={adres.volledigAdres}
                          />
                          <Detail label="postcode" value={adres.postcode} />
                          <Detail label="plaats" value={adres.plaats} />
                          <Detail label="land" value={adres.land} />
                          <Detail label="type" value={adres.type} />
                          <Detail
                            label="indAfgeschermd"
                            value={adres.indAfgeschermd}
                          />
                        </div>
                      );
                    },
                  )}
                </div>
              )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default IdentiteitPage;
