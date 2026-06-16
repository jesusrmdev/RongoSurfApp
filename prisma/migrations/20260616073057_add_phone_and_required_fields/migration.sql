-- Add phone column initially as nullable
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

-- Update existing rows with a placeholder phone
UPDATE "User" SET "phone" = '000000000' WHERE "phone" IS NULL;

-- Now make phone NOT NULL
ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL;

-- Update existing NULL values in weight/height/wetsuitSize with defaults
UPDATE "User" SET "weight" = 70 WHERE "weight" IS NULL;
UPDATE "User" SET "height" = 170 WHERE "height" IS NULL;
UPDATE "User" SET "wetsuitSize" = 'M' WHERE "wetsuitSize" IS NULL;

-- Now make columns required
ALTER TABLE "User" ALTER COLUMN "weight" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "height" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "wetsuitSize" SET NOT NULL;
