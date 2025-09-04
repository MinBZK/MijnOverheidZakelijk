import Button from "@/components/button";
import Card from "@/components/card";
import zakenClient from "@/network/mock";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { format } from "date-fns";
import Link from "next/link";
const Personeel = async () => {
  const kvk = await getKvkFromCookie();
  const { data } = await zakenClient.GET("/uwv/meldingen/{bedrijfsKvk}", {
    params: { path: { bedrijfsKvk: kvk! } },
  });

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 w-full space-y-5 md:col-span-12">
          <Card className="space-y-4">
            <h2 className="text-2xl">Nieuwe meldingen</h2>
            <div className="flex flex-col gap-2">
              <Link href="/personeel/zwangerschapsverlof/nieuw">
                <Button>Zwangerschapsverlof melden</Button>
              </Link>
            </div>
          </Card>
          <Card className="space-y-4">
            <h2 className="text-2xl">Lopende meldingen</h2>
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Referentie</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Datum aanvraag</th>
                  <th className="px-4 py-2 text-left">Acties</th>
                </tr>
              </thead>
              <tbody className="w-full">
                {data?.map((item) => {
                  return (
                    <tr key={item.referentie} className="border-t">
                      <td className="px-4 py-2">{item.referentie}</td>

                      <td className="px-4 py-2">{item.status}</td>

                      <td className="px-4 py-2">
                        {format(new Date(item.ontvangenOp!), "dd/MM/yyyy")}
                      </td>

                      <td className="px-4 py-2">
                        <Link
                          className="text-blue-400 underline"
                          href={`/personeel/zwangerschapsverlof/${item.referentie}`}
                        >
                          Opmerking toevoegen
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Personeel;
