#!/usr/bin/env bash

VERSION="$(git describe --dirty --abbrev=8 --always)"
echo "Version: $VERSION"

for file in "$@"; do
  if [[ -w "$file" ]]; then
    echo "Processing file $file"
    sed -i -e "s/##VERSION##/$VERSION/g" "$file"
  else
    echo "File $file is not writeable!"
    exit 1
  fi
done
