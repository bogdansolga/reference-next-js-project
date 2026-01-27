#!/bin/bash

# Deep Architecture Validation Script
# Runs comprehensive checks for architecture violations beyond basic hierarchy

set -e

# Colors for output
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
echo "1/4 Checking repository layer purity..."

# Repositories should not import HTTP layer concepts
if [ -d "src/lib/repositories" ]; then
    HTTP_IN_REPOS=$(grep -r "from ['\"]@/lib/core/http\|from ['\"]next/server" src/lib/repositories --include="*.ts" 2>/dev/null || true)
    if [ -n "$HTTP_IN_REPOS" ]; then
        echo -e "${RED}✗ Repository layer imports HTTP concepts:${NC}"
        echo "$HTTP_IN_REPOS" | while read -r line; do echo "  - $line"; done
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓ Repository layer is pure (no HTTP imports)${NC}"
    fi
else
    echo -e "${GREEN}✓ No repositories directory (skipped)${NC}"
fi

# ============================================================================
# 2. Services Throw Domain Errors
# ============================================================================
echo ""
echo "2/4 Checking services throw domain errors..."

if [ -d "src/lib/services" ]; then
    GENERIC_ERRORS=$(grep -r "throw new Error(" src/lib/services --include="*.ts" 2>/dev/null || true)
    if [ -n "$GENERIC_ERRORS" ]; then
        echo -e "${RED}✗ Services throwing generic Error (use domain errors):${NC}"
        echo "$GENERIC_ERRORS" | while read -r line; do echo "  - $line"; done
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓ Services use domain-specific errors${NC}"
    fi
else
    echo -e "${GREEN}✓ No services directory (skipped)${NC}"
fi

# ============================================================================
# 3. Routes Not Importing Repositories
# ============================================================================
echo ""
echo "3/4 Checking routes don't import repositories..."

if [ -d "src/app/api" ]; then
    ROUTES_WITH_REPOS=$(grep -r "from ['\"]@/lib/repositories" src/app/api --include="*.ts" 2>/dev/null || true)
    if [ -n "$ROUTES_WITH_REPOS" ]; then
        echo -e "${RED}✗ Routes importing repositories directly (use services):${NC}"
        echo "$ROUTES_WITH_REPOS" | while read -r line; do echo "  - $line"; done
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓ Routes use services layer (no direct repository imports)${NC}"
    fi
else
    echo -e "${GREEN}✓ No API routes directory (skipped)${NC}"
fi

# ============================================================================
# 4. Pages Not Importing Server Code
# ============================================================================
echo ""
echo "4/4 Checking pages don't import server code..."

if [ -d "src/app" ]; then
    PAGES_WITH_DB=$(grep -r "from ['\"]@/lib/db\|from ['\"]@/lib/repositories\|from ['\"]@/lib/services" src/app --include="page.tsx" 2>/dev/null || true)
    if [ -n "$PAGES_WITH_DB" ]; then
        echo -e "${RED}✗ Pages importing server-side code:${NC}"
        echo "$PAGES_WITH_DB" | while read -r line; do echo "  - $line"; done
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓ Pages don't import server code directly${NC}"
    fi
else
    echo -e "${GREEN}✓ No app directory (skipped)${NC}"
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "----------------------------------------"

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}✗ Deep architecture check failed with $ERRORS error(s)${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}! Deep architecture check passed with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${GREEN}✓ All deep architecture checks passed${NC}"
    exit 0
fi
