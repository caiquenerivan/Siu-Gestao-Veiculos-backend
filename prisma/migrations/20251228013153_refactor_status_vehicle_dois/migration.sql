/*
  Warnings:

  - The values [ROUBO] on the enum `StatusVeiculo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusVeiculo_new" AS ENUM ('REGULAR', 'FURTO', 'IRREGULAR');
ALTER TABLE "vehicles" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "vehicles" ALTER COLUMN "status" TYPE "StatusVeiculo_new" USING ("status"::text::"StatusVeiculo_new");
ALTER TYPE "StatusVeiculo" RENAME TO "StatusVeiculo_old";
ALTER TYPE "StatusVeiculo_new" RENAME TO "StatusVeiculo";
DROP TYPE "StatusVeiculo_old";
ALTER TABLE "vehicles" ALTER COLUMN "status" SET DEFAULT 'REGULAR';
COMMIT;
