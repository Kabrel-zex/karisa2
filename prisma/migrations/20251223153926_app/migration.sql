/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `vendors` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `vendors` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VendorApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "slug" VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE "vendor_applications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "business_name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "businessType" VARCHAR(100),
    "legalStatus" VARCHAR(100),
    "siret" VARCHAR(50),
    "iban_encrypted" TEXT,
    "portfolio" JSONB,
    "motivation" TEXT,
    "status" "VendorApplicationStatus" NOT NULL DEFAULT 'pending',
    "admin_note" TEXT,
    "decided_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "vendor_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_applications_user_id_key" ON "vendor_applications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_applications_slug_key" ON "vendor_applications"("slug");

-- CreateIndex
CREATE INDEX "vendor_applications_status_idx" ON "vendor_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_slug_key" ON "vendors"("slug");

-- AddForeignKey
ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
