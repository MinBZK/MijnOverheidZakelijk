import { getKvkFromCookie } from "@/utils/kvknummer";
import ContactmomentenPage from "./contactMomenten";

const Index = async () => {
  const kvk = await getKvkFromCookie();

  return <ContactmomentenPage kvk={kvk!} />;
};

export default Index;
