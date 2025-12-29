/*
  Warnings:

  - You are about to drop the column `name` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `operators` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `operators` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `operators` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `operators` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `operators` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `operators` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_userId_fkey";

-- DropForeignKey
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_userId_fkey";

-- DropForeignKey
ALTER TABLE "operators" DROP CONSTRAINT "operators_userId_fkey";

-- DropIndex
DROP INDEX "operators_email_key";

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "name",
ALTER COLUMN "company" DROP NOT NULL,
ALTER COLUMN "region" DROP NOT NULL,
ALTER COLUMN "cpfCnpj" DROP NOT NULL;

-- AlterTable
ALTER TABLE "drivers" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "operators" DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "password",
DROP COLUMN "role",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operators" ADD CONSTRAINT "operators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
