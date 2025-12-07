
#!/bin/bash

curl -s https://lichess.org/api/broadcast | while IFS= read -r line; do
  slug=$(echo "$line" | jq -r '.tour.slug')
  echo "$line" | jq -c '.rounds[]' | while IFS= read -r round; do
    roundSlug=$(echo "$round" | jq -r '.slug')
    roundId=$(echo "$round" | jq -r '.id')
    url="https://lichess.org/api/broadcast/$slug/$roundSlug/$roundId"
    echo "Checking $url"
    games=$(curl -s "$url" | jq '.games[]? | select(.link != null)')
    if [ -n "$games" ]; then
      echo "✅ Streamable"
    else
      echo "❌ No live links"
    fi
  done
done
