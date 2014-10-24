-- phpMyAdmin SQL Dump
-- version 3.4.10.1deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 24, 2014 at 02:54 PM
-- Server version: 5.5.29
-- PHP Version: 5.3.10-1ubuntu3.11

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `blocker`
--

-- --------------------------------------------------------

--
-- Table structure for table `blocks`
--

CREATE TABLE IF NOT EXISTS `blocks` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `serverTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `hash` varchar(64) NOT NULL,
  `totalBTCSent` bigint(20) NOT NULL,
  `version` int(1) NOT NULL,
  `prevBlockIndex` int(11) NOT NULL,
  `mrklRoot` varchar(64) NOT NULL,
  `time` int(10) NOT NULL,
  `bits` int(20) NOT NULL,
  `fee` bigint(14) NOT NULL,
  `nonce` int(10) NOT NULL,
  `nTx` int(3) NOT NULL,
  `size` int(5) NOT NULL,
  `blockIndex` int(6) NOT NULL,
  `main_chain` tinyint(1) NOT NULL,
  `height` int(11) NOT NULL,
  `received_time` int(10) NOT NULL,
  `relayed_by` varchar(14) NOT NULL,
  `txs` varchar(1000) NOT NULL,
  `estimatedBTCSent` bigint(20) NOT NULL,
  `reward` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=10 ;

--
-- Dumping data for table `blocks`
--


-- --------------------------------------------------------

--
-- Table structure for table `confirmed_tx`
--

CREATE TABLE IF NOT EXISTS `confirmed_tx` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tx_index` int(12) NOT NULL,
  `block` int(12) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4000 ;

--
-- Dumping data for table `confirmed_tx`
--


-- --------------------------------------------------------

--
-- Table structure for table `txs`
--

CREATE TABLE IF NOT EXISTS `txs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ver` int(1) NOT NULL,
  `size` int(11) NOT NULL,
  `btc_sent` double(10,8) NOT NULL,
  `time` int(11) NOT NULL,
  `tx_index` int(11) NOT NULL,
  `vin_sz` int(11) NOT NULL,
  `hash` varchar(64) NOT NULL,
  `vout_sz` int(11) NOT NULL,
  `relayed_by` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4687 ;

--
-- Dumping data for table `txs`
--

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
