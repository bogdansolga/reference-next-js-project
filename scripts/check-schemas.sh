#!/bin/bash

# Schema Location Checker
# Enforces: API routes and services should import schemas, not define them inline
#
# Usage:
#   ./scripts/check-schemas.sh [--staged]
#
# Options:
#   --staged    Only check staged files (for pre-commit)
#   (no args)   Check all files (for pre-push)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load config (check project root first, then script dir)
if [[ -f "./scripts/arch-checks.conf" ]]; then
    source "./scripts/arch-checks.conf"
elif [[ -f "$SCRIPT_DIR/arch-checks.conf" ]]; then
    source "$SCRIPT_DIR/arch-checks.conf"
else
    echo "Error: arch-checks.conf not found"
    echo "Copy from scripts/arch-checks/arch-checks.conf and customize"
    exit 1
fi

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
        git diff --cached --name-only --diff-filter=ACM | grep -E "${SCHEMA_CHECK_ROUTES}/.*route\.ts$" || true
    else
        find "$SCHEMA_CHECK_ROUTES" -type f -name "route.ts" 2>/dev/null || true
    fi
}

# Get service files to check
get_service_files() {
    if $STAGED_ONLY; then
        git diff --cached --name-only --diff-filter=ACM | grep -E "${SCHEMA_CHECK_SERVICES}/.*\.ts$" || true
    else
        find "$SCHEMA_CHECK_SERVICES" -type f -name "*.ts" 2>/dev/null || true
    fi
}

echo "Checking for inline Zod schemas..."
echo ""

# Check route files
ROUTE_FILES=$(get_route_files)

if [[ -n "$ROUTE_FILES" ]]; then
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue

        if grep -q "import.*{.*z.*}.*from.*['\"]zod['\"]" "$file" 2>/dev/null; then
            line_num=$(grep -n "import.*{.*z.*}.*from.*['\"]zod['\"]" "$file" | head -1 | cut -d: -f1)

            echo -e "${RED}x${NC} $file:$line_num"
            echo "    Route file imports 'z' from 'zod' directly"
            echo "    Schemas should be defined in $SCHEMA_LOCATION"
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

        if grep -q "import.*{.*z.*}.*from.*['\"]zod['\"]" "$file" 2>/dev/null; then
            line_num=$(grep -n "import.*{.*z.*}.*from.*['\"]zod['\"]" "$file" | head -1 | cut -d: -f1)

            echo -e "${RED}x${NC} $file:$line_num"
            echo "    Service file imports 'z' from 'zod' directly"
            echo "    Schemas should be defined in $SCHEMA_LOCATION"
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
    echo "  1. Defined in $SCHEMA_LOCATION"
    echo "  2. Imported from there"
    echo "----------------------------------------"
    exit 1
else
    echo -e "${GREEN}v${NC} Schema location check passed"
    exit 0
fi
