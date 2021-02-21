-- Adminer 4.7.7 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `masakr_bitva`;
CREATE TABLE `masakr_bitva` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `field_x` tinyint(4) DEFAULT NULL,
  `field_y` tinyint(4) DEFAULT NULL,
  `status` tinyint(4) DEFAULT NULL,
  `inserted` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;
