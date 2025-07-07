-- CreateEnum
CREATE TYPE "Role" AS ENUM ('APLICADOR', 'CLIENTE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CLIENTE';
