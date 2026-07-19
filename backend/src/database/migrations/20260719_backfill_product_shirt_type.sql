-- Backfill Product.shirtType for products created before the admin form sent this field.
UPDATE Product
SET shirtType = CASE
  WHEN LOWER(TRIM(form)) IN ('tshirt', 'polo', 'hoodie') THEN LOWER(TRIM(form))
  WHEN LOWER(name) LIKE '%hoodie%' THEN 'hoodie'
  WHEN LOWER(name) LIKE '%polo%' THEN 'polo'
  ELSE 'tshirt'
END
WHERE shirtType IS NULL OR TRIM(shirtType) = '';
