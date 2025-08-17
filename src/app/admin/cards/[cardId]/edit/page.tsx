import { getCardById } from "@/services/cardService"; // Create this service function
import { CardForm } from "../../cardForm";
import { notFound } from 'next/navigation';

export default async function EditCardPage({ params }: { params: { cardId: string } }) {
  const card = await getCardById(params.cardId);
  if (!card) return notFound();

  return (
    <div className="w-full space-y-6 max-w-2xl">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Editar Cartão</h1>
        <p className="text-muted-foreground">Atualize os detalhes do cartão ID: {card.id_cartao}</p>
      </div>
      {/* Render the form in "edit" mode by passing the card data */}
      <CardForm card={card} />
    </div>
  );
}