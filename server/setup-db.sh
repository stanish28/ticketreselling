#!/bin/bash

echo "Setting up database..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push database schema
echo "Pushing database schema..."
npx prisma db push

echo "Database setup completed!" 