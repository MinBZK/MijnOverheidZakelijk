import Button from "@/components/button";
import Card from "@/components/card";
import zakenClient from "@/network/mock";
import { components } from "@/network/mock/generated";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { format } from "date-fns";
import Link from "next/link";

const Zaken = async () => {
  const kvk = await getKvkFromCookie();
  const { data } = await zakenClient.GET(
    "/vng/aanvragen/bedrijf/{bedrijfsKvk}",
    {
      params: { path: { bedrijfsKvk: kvk! } },
    },
  );

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 w-full space-y-5 md:col-span-12">
        <Card className="space-y-4">
          <h2 className="text-2xl">Nieuwe aanvraag</h2>
          <div className="flex flex-col gap-2">
            <Link href="/zaken/parkeervergunning/nieuw">
              <Button>Parkeervergunning aanvragen</Button>
            </Link>

            <Link href="/zaken/subsidie/nieuw">
              <Button>Subsidie aanvragen</Button>
            </Link>
          </div>
        </Card>
        <Card className="space-y-4 overflow-x-auto">
          <h1 className="mb-6 text-2xl">Lopende aanvragen</h1>
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Referentie</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Context</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Datum aanvraag</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(data) &&
                data.map(
                  (item: components["schemas"]["VngAanvraagResponse"]) => (
                    <tr key={item.referentie} className="border-t">
                      <td className="px-4 py-2 text-blue-400 underline">
                        <Link
                          href={`zaken/${item.type?.toLocaleLowerCase()}/${item.referentie}`}
                        >
                          {item.referentie}
                        </Link>
                      </td>
                      <td className="px-4 py-2">{item.type}</td>
                      <td className="px-4 py-2">
                        {item.kenteken ?? item.subtype}
                      </td>
                      <td className="px-4 py-2">{item.status}</td>
                      <td className="px-4 py-2">
                        {format(new Date(item.timestamp!), "dd/MM/yyyy")}
                      </td>
                    </tr>
                  ),
                )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

export default Zaken;
