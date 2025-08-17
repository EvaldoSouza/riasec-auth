import { CardForm } from "../cardForm";

export default function CreateCardPage() {
  return (
    <div className="w-full space-y-6 max-w-2xl">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Criar Novo Cartão</h1>
        <p className="text-muted-foreground">Preencha os detalhes para o novo cartão.</p>
      </div>
      {/* Render the form in "create" mode (no 'card' prop) */}
      <CardForm />
    </div>
  );
}