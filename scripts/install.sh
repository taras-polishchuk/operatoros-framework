#!/usr/bin/env bash
# OperatorOS Core installer
# Downloads the bundled single-file binary and installs to ~/.local/bin/operatoros
set -euo pipefail

REPO="taras-polishchuk/operatoros-framework"
# Stable install default = v0.5.1-alpha.2 (last release with binaries before
# the v0.5.2-alpha source drop). v0.5.2-alpha IS NOW PUBLISHED with binary
# assets at https://github.com/taras-polishchuk/operatoros-framework/releases/tag/v0.5.2-alpha
# — opt into it explicitly: OPERATOROS_VERSION=v0.5.2-alpha ./install.sh
# Defaulting to v0.5.1-alpha.2 avoids silently upgrading people who pinned to
# the previous version.
VERSION="${OPERATOROS_VERSION:-v0.5.1-alpha.2}"
INSTALL_DIR="${OPERATOROS_INSTALL_DIR:-$HOME/.local/bin}"
BIN_NAME="operatoros"

if ! command -v node >/dev/null 2>&1; then
  echo "  node is required (Node.js >= 20). Install Node.js first: https://nodejs.org/"
  exit 1
fi

NODE_MAJOR=$(node -v | sed -E 's/^v([0-9]+).*/\1/')
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "  Node.js >= 20 required (you have $(node -v))"
  exit 1
fi

echo "  -> installing $BIN_NAME $VERSION -> $INSTALL_DIR/$BIN_NAME"

URL="https://github.com/$REPO/releases/download/$VERSION/operatoros"
mkdir -p "$INSTALL_DIR"
curl -fsSL --retry 3 -o "$INSTALL_DIR/$BIN_NAME" "$URL"
chmod +x "$INSTALL_DIR/$BIN_NAME"

echo ""
echo "OK installed $BIN_NAME $VERSION"
"$INSTALL_DIR/$BIN_NAME" version
echo ""
echo "Next: ensure $INSTALL_DIR is on your PATH. Add to ~/.bashrc:"
echo "  export PATH=\"$INSTALL_DIR:\$PATH\""