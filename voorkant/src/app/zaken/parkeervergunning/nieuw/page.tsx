import { getKvkFromCookie } from "@/utils/kvknummer";
import ParkeervergunningForm from "./newParkeervergunningForm";

const ParkeervergunningNieuw = async () => {
  const kvk = await getKvkFromCookie();
  return <ParkeervergunningForm kvk={kvk!} />;
};

export default ParkeervergunningNieuw;
