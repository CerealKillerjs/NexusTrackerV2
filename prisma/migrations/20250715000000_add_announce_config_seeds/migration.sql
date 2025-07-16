-- Add default announce config values if not present
INSERT INTO "Configuration" ("key", "value", "updatedAt")
SELECT 'MINIMUM_RATIO', '0.4', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Configuration" WHERE "key" = 'MINIMUM_RATIO');

INSERT INTO "Configuration" ("key", "value", "updatedAt")
SELECT 'BONUS_PER_GB', '1', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Configuration" WHERE "key" = 'BONUS_PER_GB');

INSERT INTO "Configuration" ("key", "value", "updatedAt")
SELECT 'MAXIMUM_HITNRUNS', '5', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Configuration" WHERE "key" = 'MAXIMUM_HITNRUNS'); 