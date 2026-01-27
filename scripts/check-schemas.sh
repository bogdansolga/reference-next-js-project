#!/bin/bash

# Schema Location Checker
# Enforces: API routes and services should import schemas from @/lib/schemas/, not define them inline
#
# Usage:
#   ./scripts/check-schemas.sh [--staged]
#
# Options:
#   --staged    Only check staged files (for pre-commit)
#   (no args)   Check all files (for pre-push)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

VIOLATIONS_FOUND=0
STAGED_ONLY=false

if [[ "$1" == "--staged" ]]; then
    STAGED_ONLY=true
fi

# Get route files to check
get_route_files() {
    if $STAGED_ONLY; then
        git diff --cached --name-only --diff-filter=ACM | grep -E 'src/app/api/.*route\.ts$' || true
    else
        find src/app/api -type f -name "route.ts" 2>/dev/null || true
    fi
}

# Get service files to check
get_service_files() {
    if $STAGED_ONLY; then
        git diff --cached --name-only --diff-filter=ACM | grep -E 'src/lib/services/.*\.ts$' || true
    else
        find src/lib/services -type f -name "*.ts" 2>/dev/null || true
    fi
}

echo "Checking for inline Zod schemas..."
echo ""

# Check route files
ROUTE_FILES=$(get_route_files)

if [[ -n "$ROUTE_FILES" ]]; then
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue

        # Check if file imports z from "zod" directly
        if grep -q "import.*{.*z.*}.*from.*['\"]zod['\"]" "$file" 2>/dev/null; then
            line_num=$(grep -n "import.*{.*z.*}.*from.*['\"]zod['\"]" "$file" | head -1 | cut -d: -f1)

            echo -e "${RED}x${NC} $file:$line_num"
            echo "    Route file imports 'z' from 'zod' directly"
            echo "    Schemas should be defined in src/lib/schemas/ and imported from there"
            echo ""
            VIOLATIONS_FOUND=1
        fi
    done <<< "$ROUTE_FILES"
fi

# Check service files
SERVICE_FILES=$(get_service_files)

if [[ -n "$SERVICE_FILES" ]]; then
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue

        # Check if file imports z from "zod" directly
        if grep -q "import.*{.*z.*}.*from.*['\"]zod['\"]" "$file" 2>/dev/null; then
            line_num=$(grep -n "import.*{.*z.*}.*from.*['\"]zod['\"]" "$file" | head -1 | cut -d: -f1)

            echo -e "${RED}x${NC} $file:$line_num"
            echo "    Service file imports 'z' from 'zod' directly"
            echo "    Schemas should be defined in src/lib/schemas/ and imported from there"
            echo ""
            VIOLATIONS_FOUND=1
        fi
    done <<< "$SERVICE_FILES"
fi

# Summary
if [[ $VIOLATIONS_FOUND -eq 1 ]]; then
    echo "----------------------------------------"
    echo -e "${RED}x Inline schema violations found!${NC}"
    echo ""
    echo "API routes and services should not define Zod schemas inline."
    echo "Instead, schemas should be:"
    echo "  1. Defined in src/lib/schemas/<domain>.schema.ts"
    echo "  2. Imported using @/lib/schemas/<domain>.schema"
    echo "----------------------------------------"
    exit 1
else
    echo -e "${GREEN}✓${NC} Schema location check passed"
    exit 0
fi
