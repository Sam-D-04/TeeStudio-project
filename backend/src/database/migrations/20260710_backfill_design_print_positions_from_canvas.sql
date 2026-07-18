-- Backfill print positions for existing designs created before admin studio
-- started writing DesignPrintPosition rows.
--
-- Existing DesignPrintPosition rows are left untouched. Missing rows are
-- inferred from CustomDesign.canvasData.shirtView:
--   "back" -> MAT_SAU
--   any other/missing value -> MAT_TRUOC

INSERT INTO `DesignPrintPosition` (`designId`, `printPositionId`, `extraCost`)
SELECT
  cd.`id`,
  pp.`id`,
  pp.`extraCost`
FROM `CustomDesign` cd
JOIN `PrintPosition` pp
  ON pp.`code` = CASE
    WHEN JSON_UNQUOTE(JSON_EXTRACT(cd.`canvasData`, '$.shirtView')) = 'back'
      THEN 'MAT_SAU'
    ELSE 'MAT_TRUOC'
  END
  AND pp.`isActive` = 1
WHERE NOT EXISTS (
  SELECT 1
  FROM `DesignPrintPosition` dpp
  WHERE dpp.`designId` = cd.`id`
);
