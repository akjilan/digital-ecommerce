\set ON_ERROR_STOP off
ALTER TABLE "Product" ADD COLUMN embedding vector(384);
\set ON_ERROR_STOP on
SELECT column_name, udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'embedding';
