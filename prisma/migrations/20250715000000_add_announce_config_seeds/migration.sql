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

-- Add new hit and run system configuration
INSERT INTO "Configuration" ("key", "value", "updatedAt")
SELECT 'REQUIRED_SEEDING_MINUTES', '4320', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Configuration" WHERE "key" = 'REQUIRED_SEEDING_MINUTES');

INSERT INTO "Configuration" ("key", "value", "updatedAt")
SELECT 'HIT_AND_RUN_THRESHOLD', '5', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Configuration" WHERE "key" = 'HIT_AND_RUN_THRESHOLD'); 