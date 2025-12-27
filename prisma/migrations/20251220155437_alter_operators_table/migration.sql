/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `operators` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `operators` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `operators` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `operators` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "operators" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'OPERATOR',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "operators_email_key" ON "operators"("email");
