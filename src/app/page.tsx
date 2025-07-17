import fs from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import matter from "gray-matter"; // Import gray-matter
import { HeroSection } from "@/components/home/heroSection";
import { AboutSection } from "@/components/home/aboutSection";
import { CategoriesSection } from "@/components/home/categoriesSection";

/**
 * A helper function to read MDX files from the `content` directory.
 * This keeps the main component cleaner.
 * @param fileName - The name of the MDX file to read.
 * @returns The content of the file as a string.
 */
async function readMdxFile(fileName: string): Promise<string> {
  const filePath = path.join(process.cwd(), "content", fileName);
  return fs.readFile(filePath, "utf8");
}

// The homepage is a Server Component, so we make it `async`.
export default async function HomePage() {
  // 1. Fetch all necessary data at the top of the component.
  // This happens in parallel on the server for maximum efficiency.
  const [session, aboutContent] = await Promise.all([
    auth(),
    readMdxFile("descricao-teste.mdx"),

  ]);

   // Read the categories file
  const categoriesFile = await fs.readFile(path.join(process.cwd(), "content", "riasec-categorias.mdx"), "utf8");
  // Parse the file with gray-matter
  const { data, content } = matter(categoriesFile);

  // 2. Assemble the page by rendering section components.
  // Pass the fetched data down as props to the components that need it.
  return (
    <>
      <HeroSection session={session} />
      <AboutSection content={aboutContent} />
      <CategoriesSection categories={data.categories} introContent={content} />
      {/* You can add more section components here as you build them */}
      {/* e.g., <HowItWorksSection /> */}
      {/* e.g., <CallToActionSection /> */}
    </>
  );
}