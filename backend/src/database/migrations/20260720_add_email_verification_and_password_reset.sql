-- Thêm xác minh email và hạ tầng token dùng chung cho xác minh email / đặt lại mật khẩu.
ALTER TABLE `Account`
  ADD COLUMN `emailVerified` TINYINT(1) NOT NULL DEFAULT 0 AFTER `status`,
  ADD COLUMN `emailVerifiedAt` DATETIME NULL AFTER `emailVerified`;

-- Tài khoản đã tồn tại trước tính năng này coi như đã xác minh, tránh gián đoạn người dùng cũ.
UPDATE `Account` SET `emailVerified` = 1, `emailVerifiedAt` = `createdAt`;

CREATE TABLE `AccountActionToken` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `accountId` INT NOT NULL,
  `tokenHash` VARCHAR(64) NOT NULL COMMENT 'SHA-256 hash of raw token',
  `purpose` VARCHAR(30) NOT NULL COMMENT 'EMAIL_VERIFICATION | PASSWORD_RESET',
  `expiresAt` DATETIME NOT NULL,
  `consumedAt` DATETIME NULL,
  `requestIp` VARCHAR(45) NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_account_action_token_hash` (`tokenHash`),
  KEY `idx_account_action_token_lookup` (`accountId`, `purpose`),
  KEY `idx_account_action_token_expires` (`expiresAt`),
  CONSTRAINT `fk_account_action_token_account` FOREIGN KEY (`accountId`)
    REFERENCES `Account` (`id`) ON DELETE CASCADE
);
