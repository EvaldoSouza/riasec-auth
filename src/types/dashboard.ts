/**
 * @file This file centralizes the TypeScript types for data related to the dashboard.
 * Using a central type definition file is a best practice for ensuring
 * that both our real and mock data services adhere to the same data "contract".
 */

import { RiasecType } from "@prisma/client";

// Represents the calculated scores and code after processing raw test answers.
// This is the clean data object our <ResultsOverview /> component will expect.
export type CalculatedRiasecResult = {
  riasecCode: string; // e.g. "SAI"
  scores: Record<RiasecType, number>
};

// Represents a single career suggestion.
// We use `Pick` from a hypothetical Prisma `Career` type to create a DTO (Data Transfer Object).
// This is a best practice because we only send the data the UI needs, not the entire database object.
export type CareerSuggestion = {
  id: string;
  title: string;
  description: string;
};