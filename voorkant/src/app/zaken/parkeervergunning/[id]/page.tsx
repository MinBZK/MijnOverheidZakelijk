import { components } from "@/network/mock/generated";
import zakenClient from "@/network/mock";
import { format } from "date-fns";
import Card from "@/components/card";

const ParkeervergunningDetail = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const { data } = await zakenClient.GET("/vng/aanvragen/{id}", {
    params: { path: { id: id } },
  });
  const aanvraag = data as components["schemas"]["VngAanvraagResponse"];

  return (
    <Card>
      <h1 className="mb-6 text-2xl font-bold">Parkeervergunning details</h1>
      <div className="space-y-2">
        <div>
          <strong>Referentie:</strong> {aanvraag.referentie}
        </div>
        <div>
          <strong>BedrijfsKvk:</strong> {aanvraag.bedrijfsKvk}
        </div>
        <div>
          <strong>Kenteken:</strong> {aanvraag.kenteken}
        </div>
        <div>
          <strong>Motivatie:</strong> {aanvraag.motivatie}
        </div>
        <div>
          <strong>Status:</strong> {aanvraag.status}
        </div>
        <div>
          <strong>Type:</strong> {aanvraag.type}
        </div>
        <div>
          <strong>Timestamp:</strong>{" "}
          {format(new Date(aanvraag.timestamp!), "dd/MM/yyyy")}
        </div>
      </div>
    </Card>
  );
};

export default ParkeervergunningDetail;
