import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Game from "@/models/Game";
import { GameForm } from "@/components/admin/GameForm";

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let game = null;
  try {
    await connectDB();
    game = await Game.findById(id).lean();
  } catch {
    game = null;
  }

  if (!game) notFound();

  const plain = JSON.parse(JSON.stringify(game));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Game</h1>
      <GameForm initialValues={plain} />
    </div>
  );
}
