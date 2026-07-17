#!/usr/bin/env bash
# OperatorOS Core installer
# Downloads the bundled single-file binary and installs to ~/.local/bin/operatoros
#
# IMPORTANT: this script REQUIRES bash (not sh, not dash).
# Invoke as one of:
#   bash <(curl -fsSL https://.../scripts/install.sh)
#   curl -fsSL https://.../scripts/install.sh | bash
#   bash scripts/install.sh                  # direct invocation
#
# DO NOT invoke with `sh` — `curl ... | sh` fails on systems where
# /bin/sh is dash (Debian/Ubuntu/Alpine) because the shebang is ignored
# when piped and dash doesn't support bash-isms.
#
# Environment:
#   OPERATOROS_VERSION     pin to a specific tag (default: v0.8.0)
#   OPERATOROS_INSTALL_DIR override install directory (default: ~/.local/bin)

set -euo pipefail

REPO="taras-polishchuk/operatoros-framework"
VERSION="${OPERATOROS_VERSION:-v0.8.0}"
INSTALL_DIR="${OPERATOROS_INSTALL_DIR:-$HOME/.local/bin}"
BIN_NAME="operatoros"

# Detect platform
PLATFORM="$(uname -s 2>/dev/null || echo Unknown)"
case "$PLATFORM" in
  Linux*)   PLATFORM_DISPLAY="Linux" ;;
  Darwin*)  PLATFORM_DISPLAY="macOS" ;;
  MINGW*|CYGWIN*|MSYS*) PLATFORM_DISPLAY="Windows (use install.ps1 instead)" ;;
  *)        PLATFORM_DISPLAY="$PLATFORM" ;;
esac

echo ""
echo "OperatorOS installer"
echo "  platform: $PLATFORM_DISPLAY"
echo "  version:  $VERSION"
echo "  target:   $INSTALL_DIR/$BIN_NAME"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node is required (Node.js >= 20)." >&2
  echo "" >&2
  echo "Install Node.js first:" >&2
  case "$PLATFORM" in
    Linux*)
      echo "  - nvm (recommended): https://github.com/nvm-sh/nvm" >&2
      echo "  - system package:     sudo apt install nodejs (verify >= 20)" >&2
      echo "  - official:           https://nodejs.org/" >&2
      ;;
    Darwin*)
      echo "  - Homebrew: brew install node@20 (or newer)" >&2
      echo "  - official: https://nodejs.org/" >&2
      ;;
    *)
      echo "  - official: https://nodejs.org/" >&2
      ;;
  esac
  exit 1
fi

NODE_MAJOR=$(node -v | sed -E 's/^v([0-9]+).*/\1/')
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "ERROR: Node.js >= 20 required (you have $(node -v))." >&2
  echo "Upgrade Node.js: https://nodejs.org/" >&2
  exit 1
fi

URL="https://github.com/$REPO/releases/download/$VERSION/$BIN_NAME"
mkdir -p "$INSTALL_DIR"
echo "Downloading $BIN_NAME $VERSION..."
if ! curl -fsSL --retry 3 -o "$INSTALL_DIR/$BIN_NAME" "$URL"; then
  echo "" >&2
  echo "ERROR: download failed from $URL" >&2
  echo "" >&2
  echo "Possible causes:" >&2
  echo "  - The version '$VERSION' does not exist." >&2
  echo "    Available versions: https://github.com/$REPO/releases" >&2
  echo "  - Network/firewall blocked the request." >&2
  echo "  - GitHub is temporarily unavailable." >&2
  exit 1
fi
chmod +x "$INSTALL_DIR/$BIN_NAME"

echo ""
echo "OK installed $BIN_NAME $VERSION"
"$INSTALL_DIR/$BIN_NAME" version

# PATH check
if ! command -v operatoros >/dev/null 2>&1; then
  echo ""
  echo "Next: add $INSTALL_DIR to your PATH."
  echo ""
  case "$PLATFORM" in
    Linux*)
      USER_SHELL="$(basename "${SHELL:-/bin/bash}")"
      case "$USER_SHELL" in
        bash) RC_FILE="~/.bashrc" ;;
        zsh)  RC_FILE="~/.zshrc" ;;
        fish) RC_FILE="~/.config/fish/config.fish" ;;
        *)    RC_FILE="~/.profile" ;;
      esac
      echo "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> $RC_FILE"
      echo "  source $RC_FILE"
      ;;
    Darwin*)
      echo "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.zshrc"
      echo "  source ~/.zshrc"
      ;;
    *)
      echo "  Add \$HOME/.local/bin to your PATH for your shell."
      ;;
  esac
  echo ""
  echo "Then run: operatoros init --target my-os"
else
  echo ""
  echo "Try it: operatoros init --target my-os"
fi
