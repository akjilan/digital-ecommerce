-- Database initialisation script
-- Runs automatically when the PostgreSQL container is first created.

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- for full-text / fuzzy search

-- (Add your initial schema DDL here, or rely on TypeORM migrations)
