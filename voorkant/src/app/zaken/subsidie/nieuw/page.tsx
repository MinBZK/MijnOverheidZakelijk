import { getKvkFromCookie } from "@/utils/kvknummer";
import NewSubsidieForm from "./newSubsidieForm";

const NewSubsidieAanvraag = async () => {
  const kvk = await getKvkFromCookie();
  return <NewSubsidieForm kvk={kvk!} />;
};

export default NewSubsidieAanvraag;
