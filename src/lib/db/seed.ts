// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

// Interface defining the structure of a row from the CSV file.
interface CsvRow {
  TIPO: string;       // This will map to the 'riasecType' field.
  AFIRMAÇÃO: string;  // This will map to the 'question' field.
}

async function main() {
  console.log('🌱 Starting to seed the cards table...');

  // --- 1. Read and Parse the CSV Data ---
  const cardsFromCsv: CsvRow[] = [];
  const csvFilePath = path.resolve(
  __dirname,                   // Starts from the script's directory (/src/lib/db)
  '..',                        // Moves up to /src/lib
  '..',                        // Moves up to /src
  '..',                        // Moves up to the project root (riasec-auth/)
  'content',                   // Moves into the content folder
  'holland-cards-data.csv'     // Specifies the file
);

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row: CsvRow) => {
        // We only process rows that have a valid affirmation.
        if (row.AFIRMAÇÃO && row.AFIRMAÇÃO.trim() !== '') {
          cardsFromCsv.push(row);
        }
      })
      .on('end', () => {
        console.log(`✅ CSV file successfully processed. Found ${cardsFromCsv.length} valid rows.`);
        resolve();
      })
      .on('error', (error) => {
        console.error('❌ Error while reading CSV file:', error);
        reject(error);
      });
  });

  if (cardsFromCsv.length === 0) {
    console.log('No cards to seed. Exiting.');
    return;
  }

  // --- 2. Clear Existing Data (Best Practice for Seeding) ---
  // This makes the script idempotent, meaning you can run it multiple times
  // without creating duplicate entries.
  //Not going to do it right now
//   console.log('🗑️ Deleting existing cards to ensure a clean slate...');
//   await prisma.card.deleteMany({});

  // --- 3. Prepare Data for Prisma ---
  // We map the data from the CSV rows to match the 'Card' model structure.
  const cardsToCreate = cardsFromCsv.map(card => ({
    question: card.AFIRMAÇÃO,
    riasecType: card.TIPO,
    // The 'inUse' field will default to 'false' as defined in your schema.
  }));

  // --- 4. Create New Records in the Database ---
  // Using `createMany` is highly efficient for inserting a large number of records at once.
  console.log(`✍️ Creating ${cardsToCreate.length} new cards in the database...`);
  const result = await prisma.card.createMany({
    data: cardsToCreate,
    skipDuplicates: true, // Although we deleted records, this is an extra safety measure.
  });

  console.log(`✅ Seeding finished successfully. ${result.count} cards were created.`);
}

// --- Execute the Script ---
main()
  .catch((e) => {
    console.error('❌ An error occurred while seeding the database:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Ensure the Prisma Client connection is closed gracefully.
    await prisma.$disconnect();
  });
  