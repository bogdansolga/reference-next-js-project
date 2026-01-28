#!/bin/bash

# Install git hooks and architecture checks to a project
# Usage: ./install.sh [project-path]
#   project-path: Target project (default: current directory)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCH_CHECKS_DIR="$SCRIPT_DIR/../arch-checks"
TARGET_DIR="${1:-.}"

# Resolve to absolute path
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

# Verify it's a git repository
if [ ! -d "$TARGET_DIR/.git" ]; then
    echo "Error: $TARGET_DIR is not a git repository"
    exit 1
fi

HOOKS_DIR="$TARGET_DIR/.git/hooks"
SCRIPTS_DIR="$TARGET_DIR/scripts"

echo "Installing to: $TARGET_DIR"
echo ""

# Install git hooks
echo "Git hooks:"
for hook in pre-commit pre-push; do
    if [ -f "$SCRIPT_DIR/$hook" ]; then
        cp "$SCRIPT_DIR/$hook" "$HOOKS_DIR/$hook"
        chmod +x "$HOOKS_DIR/$hook"
        echo "  ✓ $hook"
    fi
done

# Install arch-checks
if [ -d "$ARCH_CHECKS_DIR" ]; then
    echo ""
    echo "Architecture checks:"
    mkdir -p "$SCRIPTS_DIR"

    for script in check-architecture.sh check-schemas.sh check-deep-architecture.sh; do
        if [ -f "$ARCH_CHECKS_DIR/$script" ]; then
            cp "$ARCH_CHECKS_DIR/$script" "$SCRIPTS_DIR/$script"
            chmod +x "$SCRIPTS_DIR/$script"
            echo "  ✓ $script"
        fi
    done

    # Copy config if not exists (don't overwrite customizations)
    if [ ! -f "$SCRIPTS_DIR/arch-checks.conf" ]; then
        cp "$ARCH_CHECKS_DIR/arch-checks.conf" "$SCRIPTS_DIR/arch-checks.conf"
        echo "  ✓ arch-checks.conf (new)"
    else
        echo "  - arch-checks.conf (kept existing)"
    fi
fi

echo ""
echo "Done! Hooks run on commit/push. Edit scripts/arch-checks.conf to customize."
