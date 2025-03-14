#!/bin/bash

# Fetch latest tags
git fetch --tags
LAST=$(git describe --tags --abbrev=0)

# Ensure LAST is a valid SemVer, default to v0.0.0 if no tags exist
if ! [[ $LAST =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  LAST="v0.0.0"
fi

# Extract major, minor, and patch numbers from the latest tag
IFS='.' read -r MAJOR MINOR PATCH <<<"${LAST#v}"

# Function to prompt for custom version
custom() {
  semver_regex="^v[0-9]+\.[0-9]+\.[0-9]+$"

  while true; do
    read -rp "Enter a semantic version (latest: $LAST): " VERSION

    if [[ $VERSION =~ $semver_regex ]]; then
      break
    else
      echo "Invalid version. Please enter a valid SemVer (vX.Y.Z format)."
    fi
  done
}

# Determine the next version based on the argument
case "$1" in
  major)
    ((MAJOR++))
    MINOR=0
    PATCH=0
    VERSION="v$MAJOR.$MINOR.$PATCH"
    ;;
  minor)
    ((MINOR++))
    PATCH=0
    VERSION="v$MAJOR.$MINOR.$PATCH"
    ;;
  patch)
    ((PATCH++))
    VERSION="v$MAJOR.$MINOR.$PATCH"
    ;;
  custom)
    custom
    ;;
  *)
    echo "Usage: $0 {major|minor|patch|custom} [commit message]"
    exit 1
    ;;
esac

# Determine commit message
if [[ -n "$2" ]]; then
  COMMIT_MSG="$2"
else
  read -rp "Enter commit message: " COMMIT_MSG
fi

# Show the version being tagged
echo "Tagging new version: $VERSION"

# Git commit and tag process
git add --all
git commit -a -m "$COMMIT_MSG"
git tag "$VERSION"

# Push changes and tag
git push origin main
git push origin "$VERSION"