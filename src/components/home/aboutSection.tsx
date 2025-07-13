import { MDXRemote } from "next-mdx-remote/rsc";

// Define the component's props. It expects to receive the MDX content as a string.
interface AboutSectionProps {
  content: string;
}

export function AboutSection({ content }: AboutSectionProps) {
  return (
    // Use a <section> tag for semantic structure.
    // The `py-16` or similar gives it vertical spacing from other sections.
    <section className="bg-slate-50 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/*
          This is the key part for styling. The `prose` class from the
          @tailwindcss/typography plugin will automatically style all the
          HTML elements rendered from your MDX file (h1, p, strong, etc.).
          `prose-lg` makes the text slightly larger for better readability.
          `mx-auto` centers the content block in the section.
        */}
        <article className="prose prose-lg max-w-3xl mx-auto">
          {/*
            The MDXRemote component from `next-mdx-remote/rsc` safely
            parses and renders your MDX string into HTML.
          */}
          <MDXRemote source={content} />
        </article>
      </div>
    </section>
  );
}