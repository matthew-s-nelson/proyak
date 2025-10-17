#!/bin/bash
set -e

echo "Deploying all Supabase Edge Functions..."

# Loop over each function folder
for dir in supabase/functions/*/ ; do
  func=$(basename "$dir")
  
  # Skip shared folders and other non-function directories
  if [[ "$func" == "_shared" || "$func" == ".*" ]]; then
    echo "⏭️  Skipping $func (shared/hidden folder)"
    continue
  fi
  
  echo "➡️  Deploying $func..."
  supabase functions deploy "$func"
done

echo "✅ All functions deployed!"
