import { getKvkFromCookie } from "@/utils/kvknummer";
import NewZwangerschapsverlofForm from "./newZwangerschapsverlofForm";

const NewZwangerschapsverlof = async () => {
  const kvk = await getKvkFromCookie();

  return <NewZwangerschapsverlofForm kvk={kvk!} />;
};

export default NewZwangerschapsverlof;
