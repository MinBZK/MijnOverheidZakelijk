import PatchZwangerschapsverlofForm from "./patchZwangerschapsverlofForm";

const Index = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <PatchZwangerschapsverlofForm zaakId={id} />;
};

export default Index;
