-- Harden refresh-token storage and support session auditing.
-- Existing plaintext sessions are invalidated because they cannot be converted
-- safely to SHA-256 hashes after the raw token has left the server.
DELETE FROM `UserToken`;

ALTER TABLE `UserToken`
  MODIFY COLUMN `refreshToken` VARCHAR(64) NOT NULL COMMENT 'SHA-256 hash of refresh token',
  ADD COLUMN `userAgent` VARCHAR(500) NULL AFTER `expiresAt`,
  ADD COLUMN `ipAddress` VARCHAR(45) NULL AFTER `userAgent`,
  ADD KEY `idx_user_token_expires_at` (`expiresAt`);

ALTER TABLE `Account`
  ADD KEY `idx_account_role_status` (`role`, `status`);
