#!/bin/bash

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Generate Prisma client (skip if DATABASE_URL is not available)
if [ -n "$DATABASE_URL" ]; then
    echo "Generating Prisma client..."
    npx prisma generate
else
    echo "DATABASE_URL not available, skipping Prisma generation"
fi

echo "Build completed!" 