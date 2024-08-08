CREATE DATABASE IF NOT EXISTS animal_db;

USE animal_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS animals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  breed VARCHAR(50) NOT NULL,
  image VARCHAR(255) NOT NULL
);

INSERT INTO animals (type, breed, image) VALUES 
('cat', 'persian', '/images/cat.jpg'),
('fish', 'goldfish', '/images/fish.jpg')
ON DUPLICATE KEY UPDATE image=image;
ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL UNIQUE;


select*from users;
select*from animals;
