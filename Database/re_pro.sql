-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 05, 2023 at 11:50 PM
-- Server version: 10.4.25-MariaDB
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `re_pro`
--

-- --------------------------------------------------------

--
-- Table structure for table `currency`
--

CREATE TABLE `currency` (
  `number` varchar(400) NOT NULL,
  `owner` varchar(400) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `total_amount` varchar(100) NOT NULL,
  `expenses` varchar(100) NOT NULL,
  `profit` varchar(100) NOT NULL,
  `loss` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `currency`
--

INSERT INTO `currency` (`number`, `owner`, `date`, `total_amount`, `expenses`, `profit`, `loss`) VALUES
('+250727155252', 'Regis', '2023-05-04 14:30:50', '120000', '1200', '118800', '0');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `doc_id` int(11) NOT NULL,
  `doc_name` varchar(400) NOT NULL,
  `path` varchar(400) NOT NULL,
  `subject` varchar(400) NOT NULL,
  `details` varchar(4000) NOT NULL,
  `date_sent` varchar(200) NOT NULL DEFAULT current_timestamp(),
  `church` varchar(200) NOT NULL,
  `reporter` varchar(100) NOT NULL,
  `receiver` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `otps`
--

CREATE TABLE `otps` (
  `number` varchar(255) NOT NULL,
  `otp` varchar(400) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `number` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `profilePic` varchar(400) DEFAULT NULL,
  `cloudinaryId` varchar(400) DEFAULT NULL,
  `church` varchar(255) DEFAULT NULL,
  `language` varchar(255) DEFAULT NULL,
  `verified` varchar(255) DEFAULT 'False',
  `position` varchar(255) DEFAULT NULL,
  `idNumber` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `password`, `number`, `name`, `profilePic`, `cloudinaryId`, `church`, `language`, `verified`, `position`, `idNumber`) VALUES
(2, 'irumvaregis@gmail.com', '$2a$10$SojusqUPtlYlBT5hoF8HEeKsqeGM4x8eJ3x3w7A4kx6gSp5j.zVw.', '+250727155252', 'Regis', '', '', 'musanze', 'kinyarwanda', 'True', 'secretary', 12345);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `currency`
--
ALTER TABLE `currency`
  ADD PRIMARY KEY (`date`),
  ADD UNIQUE KEY `number` (`number`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`doc_id`);

--
-- Indexes for table `otps`
--
ALTER TABLE `otps`
  ADD PRIMARY KEY (`number`),
  ADD UNIQUE KEY `number` (`number`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `number` (`number`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `doc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
