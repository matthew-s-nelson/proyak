#!/bin/bash
set -e

echo "Deploying all Supabase Edge Functions..."

# Loop over each function folder
for dir in supabase/functions/*/ ; do
  func=$(basename "$dir")
  echo "➡️  Deploying $func..."
  supabase functions deploy "$func"
done

echo "✅ All functions deployed!"
