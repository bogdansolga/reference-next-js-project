#!/bin/bash

# Deep Architecture Validation Script
# Runs comprehensive checks for architecture violations beyond basic hierarchy

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
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo "Running deep architecture checks..."
echo ""

# ============================================================================
# 1. Repository Layer Purity
# ============================================================================
echo "1/6 Checking repository layer purity..."

if [[ -d "$REPO_LAYER_PATH" ]]; then
    HTTP_IN_REPOS=$(grep -r "from ['\"]${HTTP_MODULE_PATH}" "$REPO_LAYER_PATH" --include="*.ts" 2>/dev/null || true)
    if [ -n "$HTTP_IN_REPOS" ]; then
        echo -e "${RED}x Repository layer imports HTTP concepts:${NC}"
        echo "$HTTP_IN_REPOS"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}v Repository layer is pure (no HTTP imports)${NC}"
    fi
else
    echo -e "${YELLOW}! Repository path not found: $REPO_LAYER_PATH${NC}"
fi

# ============================================================================
# 2. Routes Using HOF Pattern
# ============================================================================
echo ""
echo "2/6 Checking routes use HOF pattern..."

if [[ -d "$ROUTES_PATH" ]]; then
    ROUTES_WITHOUT_HOF=$(find "$ROUTES_PATH" -name "route.ts" -type f -exec sh -c '
        if ! grep -q "'"$HOF_FUNCTION"'" "$1" && ! grep -q "text/event-stream" "$1"; then
            echo "$1"
        fi
    ' _ {} \; 2>/dev/null || true)

    if [ -n "$ROUTES_WITHOUT_HOF" ]; then
        echo -e "${YELLOW}! Routes without $HOF_FUNCTION (review required):${NC}"
        echo "$ROUTES_WITHOUT_HOF" | while read -r f; do
            echo "  - $f"
        done
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}v All routes use $HOF_FUNCTION HOF pattern${NC}"
    fi
else
    echo -e "${YELLOW}! Routes path not found: $ROUTES_PATH${NC}"
fi

# ============================================================================
# 3. Routes Have Authentication
# ============================================================================
echo ""
echo "3/6 Checking routes have authentication..."

if [[ -d "$ROUTES_PATH" ]]; then
    ROUTES_WITHOUT_AUTH=$(find "$ROUTES_PATH" -name "route.ts" -type f -exec sh -c '
        if grep -q "text/event-stream" "$1"; then
            exit 0
        fi
        if ! grep -q "'"$AUTH_FUNCTION"'" "$1"; then
            echo "$1"
        fi
    ' _ {} \; 2>/dev/null || true)

    if [ -n "$ROUTES_WITHOUT_AUTH" ]; then
        echo -e "${YELLOW}! Routes without $AUTH_FUNCTION (may be intentional):${NC}"
        echo "$ROUTES_WITHOUT_AUTH" | while read -r f; do
            echo "  - $f"
        done
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}v All routes have authentication${NC}"
    fi
fi

# ============================================================================
# 4. HTTP_STATUS Import Consistency
# ============================================================================
echo ""
echo "4/6 Checking HTTP_STATUS import consistency..."

WRONG_HTTP_STATUS=$(grep -r 'import.*HTTP_STATUS.*from "@/lib/core/constants"' src/app/api --include="*.ts" 2>/dev/null || true)
if [ -n "$WRONG_HTTP_STATUS" ]; then
    echo -e "${YELLOW}! HTTP_STATUS imported from constants (should use $HTTP_STATUS_SOURCE):${NC}"
    echo "$WRONG_HTTP_STATUS" | while read -r line; do
        echo "  - $line"
    done
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}v HTTP_STATUS consistently imported${NC}"
fi

# ============================================================================
# 5. Services Throw Domain Errors
# ============================================================================
echo ""
echo "5/6 Checking services throw domain errors..."

if [[ -d "$SERVICES_PATH" ]]; then
    GENERIC_ERRORS=$(grep -r "throw new Error(" "$SERVICES_PATH" --include="*.ts" 2>/dev/null || true)
    if [ -n "$GENERIC_ERRORS" ]; then
        echo -e "${RED}x Services throwing generic Error (use domain errors):${NC}"
        echo "$GENERIC_ERRORS" | while read -r line; do
            echo "  - $line"
        done
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}v Services use domain-specific errors${NC}"
    fi
else
    echo -e "${YELLOW}! Services path not found: $SERVICES_PATH${NC}"
fi

# ============================================================================
# 6. Routes Not Importing Repositories
# ============================================================================
echo ""
echo "6/6 Checking routes don't import repositories..."

ROUTES_WITH_REPOS=$(grep -r "from ['\"]${REPO_IMPORT_PATTERN}" src/app/api --include="*.ts" 2>/dev/null || true)
if [ -n "$ROUTES_WITH_REPOS" ]; then
    echo -e "${RED}x Routes importing repositories directly (use services):${NC}"
    echo "$ROUTES_WITH_REPOS" | while read -r line; do
        echo "  - $line"
    done
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}v Routes use services layer (no direct repository imports)${NC}"
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "----------------------------------------"

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}x Deep architecture check failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}! Deep architecture check passed with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${GREEN}v All deep architecture checks passed${NC}"
    exit 0
fi
