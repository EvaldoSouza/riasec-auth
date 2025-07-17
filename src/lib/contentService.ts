import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter'; // 1. We will use the gray-matter library for parsing.

// Define the shape of a category object from the frontmatter for type safety.
type RiasecCategory = {
  title: string;
  description: string;
};

/**
 * Reads and parses the riasec-categorias.mdx file to extract the descriptions
 * for a given list of RIASEC type names.
 * @param typeNames - An array of type names to find (e.g., ["Social", "Artístico"]).
 * @returns An object mapping each type name to its description.
 */
export async function getTypeDescriptions(typeNames: string[]): Promise<Record<string, string>> {
  try {
    // 2. Read the entire MDX file into a string, just like before.
    const filePath = path.join(process.cwd(), 'content', 'riasec-categorias.mdx');
    const fileContent = await fs.readFile(filePath, 'utf8');

    // 3. Use matter() to parse the file. This separates the YAML frontmatter
    // into the `data` object and the rest of the content into the `content` string.
    const { data } = matter(fileContent);

    // 4. Check if the parsed data has the 'categories' array we expect.
    if (!data.categories || !Array.isArray(data.categories)) {
      console.warn("Could not find 'categories' array in riasec-categorias.mdx frontmatter.");
      return {};
    }
    
    const allCategories = data.categories as RiasecCategory[];
    const descriptionMap: Record<string, string> = {};

    // 5. Efficiently build a map of the descriptions we need.
    for (const typeName of typeNames) {
      // Find the category object that matches the requested typeName.
      const category = allCategories.find(cat => cat.title.toLowerCase() === typeName.toLowerCase());
      if (category) {
        descriptionMap[typeName] = category.description;
      }
    }

    return descriptionMap;
    
  } catch (error) {
    console.error("Error parsing riasec-categorias.mdx:", error);
    return {}; // Return an empty object on failure.
  }
}