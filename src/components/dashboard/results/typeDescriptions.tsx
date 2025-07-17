import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// 1. Import our new content-fetching function.
import { getTypeDescriptions } from "@/lib/contentService";

interface TypeDescriptionsProps {
  topTypes: string[];
}

/**
 * Displays detailed descriptions for the user's top three RIASEC types
 * by fetching the content dynamically from an MDX file.
 */
// 2. Make the component `async` so we can use `await` inside it.
export async function TypeDescriptions({ topTypes }: TypeDescriptionsProps) {
  // 3. Call the service to get the descriptions for only the top types.
  const descriptions = await getTypeDescriptions(topTypes);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entendendo Seus Tipos Dominantes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 4. Map over the original `topTypes` array to maintain order. */}
        {topTypes.map((type) => (
          <div key={type}>
            <h3 className="text-lg font-semibold text-primary">{type}</h3>
            {/* Look up the description from the object we fetched. */}
            <p className="mt-1 text-muted-foreground">
              {descriptions[type] ?? "Descrição não disponível."}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}