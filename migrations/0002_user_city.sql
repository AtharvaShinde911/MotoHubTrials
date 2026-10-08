-- City picked during account setup; drives on-road price estimates (ids from src/lib/location.ts).
ALTER TABLE users ADD COLUMN city TEXT;
