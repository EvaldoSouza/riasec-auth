import { MDXRemote } from "next-mdx-remote/rsc";
import { Wrench, Beaker, Paintbrush, Users, Briefcase, Calculator } from 'lucide-react';

const iconMap = {
  Realista: <Wrench className="h-8 w-8 text-primary" />,
  Investigativo: <Beaker className="h-8 w-8 text-primary" />,
  Artístico: <Paintbrush className="h-8 w-8 text-primary" />,
  Social: <Users className="h-8 w-8 text-primary" />,
  Empreendedor: <Briefcase className="h-8 w-8 text-primary" />,
  Convencional: <Calculator className="h-8 w-8 text-primary" />,
};

// --- FIX PART 1: Create a specific type for our keys ---
// This line automatically creates a new type that is a union of all the keys in iconMap.
// RiasecCategoryTitle becomes: "Realista" | "Investigativo" | "Artístico" | ...
type RiasecCategoryTitle = keyof typeof iconMap;

// Define the shape of a single category from our frontmatter.
interface Category {
  // --- FIX PART 2: Use our new, specific type instead of a generic 'string' ---
  title: RiasecCategoryTitle;
  description: string;
}

// Define the component's props.
interface CategoriesSectionProps {
  categories: Category[];
  introContent: string;
}

export function CategoriesSection({ categories, introContent }: CategoriesSectionProps) {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto prose prose-lg">
          <MDXRemote source={introContent} />
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category.title} className="p-8 bg-slate-50 rounded-lg shadow-sm">
              {/* This line is now type-safe! */}
              {/* TypeScript knows that category.title is guaranteed to be a key of iconMap. */}
              {iconMap[category.title]}
              <h3 className="mt-4 text-xl font-semibold">{category.title}</h3>
              <p className="mt-2 text-base text-muted-foreground">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}