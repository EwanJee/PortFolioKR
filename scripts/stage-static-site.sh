#!/usr/bin/env bash
# 지금 정적 사이트를 GitHub Pages 아티팩트 폴더로 모은다. 사이트 내용은 바꾸지 않는다.
set -euo pipefail
out="${1:-_site}"
cd "$(dirname "$0")/.."

rm -rf "$out"
mkdir -p "$out"
for item in index.html favicon.svg CNAME assets projects website_images; do
  cp -R "$item" "$out/"
done
find "$out" -name '.DS_Store' -delete
echo "staged $(find "$out" -type f | wc -l | tr -d ' ') files into $out"
