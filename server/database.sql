/**
 *  KodIt
 *  Copyright (C) 2023, ICpEP.SE - TUPV
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

BEGIN TRANSACTION;

-- TABLES
CREATE TABLE IF NOT EXISTS user_types (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  type VARCHAR(8) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  type INTEGER NOT NULL,
  username VARCHAR(64) NOT NULL,
  password VARCHAR(72) NOT NULL,
  date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_user_types FOREIGN KEY (type) REFERENCES user_types(id)
);

CREATE TABLE IF NOT EXISTS users_log (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  uniq_id VARCHAR(36) NOT NULL UNIQUE,
  user INTEGER NOT NULL,
  date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_log_users FOREIGN KEY (user) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(6) NOT NULL,
  default_image VARCHAR(8) DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  user INTEGER NOT NULL,
  date_start DATETIME DEFAULT NULL,
  date_end DATETIME DEFAULT NULL,
  date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quizzes_users FOREIGN KEY (user) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS enlistment (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  user INTEGER NOT NULL,
  quiz INTEGER NOT NULL,
  date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_enlistment_users FOREIGN KEY (user) REFERENCES users(id),
  CONSTRAINT fk_enlistment_quizzes FOREIGN KEY (quiz) REFERENCES quizzes(id)
);

CREATE TABLE IF NOT EXISTS problems (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  quiz INTEGER NOT NULL,
  problem TEXT NOT NULL,
  CONSTRAINT fk_problems_quizzes FOREIGN KEY (quiz) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS testcases (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  problem INTEGER NOT NULL,
  expected_output TEXT NOT NULL,
  points INTEGER NOT NULL,
  hidden TINYINT(1) NOT NULL,
  inputs TEXT NOT NULL,
  inputs_interval INTEGER NOT NULL,
  CONSTRAINT fk_testcases_problems FOREIGN KEY (problem) REFERENCES problems(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scores (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  testcase INTEGER NOT NULL,
  code TEXT NOT NULL,
  language VARCHAR(255) NOT NULL,
  output TEXT NOT NULL,
  score INTEGER NOT NULL,
  user INTEGER NOT NULL,
  date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_scores_testcases FOREIGN KEY (testcase) REFERENCES testcases(id) ON DELETE CASCADE,
  CONSTRAINT fk_scores_users FOREIGN KEY (user) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  user INTEGER NOT NULL,
  quiz INTEGER NOT NULL,
  date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_submissions_users FOREIGN KEY (user) REFERENCES users(id),
  CONSTRAINT fk_submissions_quizzes FOREIGN KEY (quiz) REFERENCES quizzes(id)
);

-- TRIGGERS
CREATE TRIGGER IF NOT EXISTS users_update AFTER UPDATE ON users FOR EACH ROW
WHEN NEW.date_updated < OLD.date_updated
BEGIN
  UPDATE users SET date_updated=CURRENT_TIMESTAMP WHERE id=OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS users_log_update AFTER UPDATE ON users_log FOR EACH ROW
WHEN NEW.date_updated < OLD.date_updated
BEGIN
  UPDATE users_log SET date_updated=CURRENT_TIMESTAMP WHERE id=OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS quizzes_update AFTER UPDATE ON quizzes FOR EACH ROW
WHEN NEW.date_updated < OLD.date_updated
BEGIN
  UPDATE quizzes SET date_updated=CURRENT_TIMESTAMP WHERE id=OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS enlistment_update AFTER UPDATE ON enlistment FOR EACH ROW
WHEN NEW.date_updated < OLD.date_updated
BEGIN
  UPDATE enlistment SET date_updated=CURRENT_TIMESTAMP WHERE id=OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS scores_update AFTER UPDATE ON scores FOR EACH ROW
WHEN NEW.date_updated < OLD.date_updated
BEGIN
  UPDATE scores SET date_updated=CURRENT_TIMESTAMP WHERE id=OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS submissions_update AFTER UPDATE ON submissions FOR EACH ROW
WHEN NEW.date_updated < OLD.date_updated
BEGIN
  UPDATE submissions SET date_updated=CURRENT_TIMESTAMP WHERE id=OLD.id;
END;

-- DEFAULT DATA
INSERT OR IGNORE INTO user_types (id, type)
VALUES
  (1, 'teacher'),
  (2, 'student');

COMMIT;
