-- Allow admins to detach a custom design from its current customer.
-- A nullable foreign key still enforces Account(id) when userId has a value,
-- while permitting NULL for reusable/unassigned designs.
ALTER TABLE `CustomDesign`
  MODIFY COLUMN `userId` INT NULL;
