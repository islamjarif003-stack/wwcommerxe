-- docker/postgres/init.sql
-- Runs once when the PostgreSQL container is first created
-- Creates the database and sets up extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- for fast LIKE/ILIKE full-text on products
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- for accent-insensitive search
