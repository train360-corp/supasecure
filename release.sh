#!/bin/bash

semver_regex="^[0-9]+\.[0-9]+\.[0-9]+$"

while true; do
  read -rp "Enter a semantic version (e.g., 1.0.0): " version

  if [[ $version =~ $semver_regex ]]; then
    echo "Valid version: $version"
    break
  else
    echo "Invalid version. Please enter a valid SemVer (x.y.z format)."
  fi
done

git add --all
git commit -a -m "chore: ci/cd"
git tag v"$version"

git push origin main
git push origin v"$version"