/*
  Warnings:

  - Made the column `apellido1` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `apellido2` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "apellido1" SET NOT NULL,
ALTER COLUMN "apellido2" SET NOT NULL;
