#!/bin/bash

# Architecture Hierarchy Checker
# Enforces: pages -> API routes -> services -> repositories
#
# Usage:
#   ./scripts/check-architecture.sh [--staged]
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

# Get files to check
get_files() {
    local pattern="$1"
    if $STAGED_ONLY; then
        git diff --cached --name-only --diff-filter=ACM | grep -E "$pattern" || true
    else
        find src -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | grep -E "$pattern" || true
    fi
}

# Check for violations in a file
check_file() {
    local file="$1"
    local layer="$2"
    shift 2
    local forbidden_patterns=("$@")

    for pattern in "${forbidden_patterns[@]}"; do
        local matches
        matches=$(grep -n "$pattern" "$file" 2>/dev/null || true)
        if [[ -n "$matches" ]]; then
            while IFS= read -r match; do
                local line_num=$(echo "$match" | cut -d: -f1)
                local line_content=$(echo "$match" | cut -d: -f2-)
                echo -e "${RED}x${NC} $file:$line_num"
                echo "    $layer cannot import $pattern"
                echo "    $line_content"
                echo ""
                VIOLATIONS_FOUND=1
            done <<< "$matches"
        fi
    done
}

echo "Checking architecture hierarchy..."
echo ""

# Check pages
PAGE_FILES=$(get_files "$PAGE_PATTERN")
if [[ -n "$PAGE_FILES" ]]; then
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        check_file "$file" "Page" $PAGE_FORBIDDEN
    done <<< "$PAGE_FILES"
fi

# Check routes
ROUTE_FILES=$(get_files "$ROUTE_PATTERN")
if [[ -n "$ROUTE_FILES" ]]; then
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        check_file "$file" "API Route" $ROUTE_FORBIDDEN
    done <<< "$ROUTE_FILES"
fi

# Check services
SERVICE_FILES=$(get_files "$SERVICE_PATTERN")
if [[ -n "$SERVICE_FILES" ]]; then
    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        check_file "$file" "Service" $SERVICE_FORBIDDEN
    done <<< "$SERVICE_FILES"
fi

# Summary
if [[ $VIOLATIONS_FOUND -eq 1 ]]; then
    echo "----------------------------------------"
    echo -e "${RED}x Architecture hierarchy violations found!${NC}"
    echo ""
    echo "Required hierarchy: pages -> API routes -> services -> repositories"
    echo ""
    echo "  - Pages can only fetch from API routes"
    echo "  - API routes can only call services"
    echo "  - Services can only call repositories"
    echo "----------------------------------------"
    exit 1
else
    echo -e "${GREEN}v${NC} Architecture hierarchy check passed"
    exit 0
fi
