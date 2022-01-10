#!/usr/bin/env bash

set -eo pipefail

VERSION="$(git describe --dirty --abbrev=8 --always)"
echo "Version: $VERSION"

for file in "$@"; do
  echo "Processing file $file"
  sed -i -e "s/##VERSION##/$VERSION/g" "$file"
done
