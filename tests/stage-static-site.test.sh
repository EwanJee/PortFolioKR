#!/usr/bin/env bash
# stage-static-site.sh가 지금 사이트 파일을 빠짐없이, 잡파일 없이 모으는지 확인한다.
set -euo pipefail
cd "$(dirname "$0")/.."

out="$(mktemp -d)/_site"
bash scripts/stage-static-site.sh "$out" >/dev/null

fail=0
while IFS= read -r f; do
  if [ ! -e "$out/$f" ]; then
    echo "MISSING $f"
    fail=1
  fi
done < <(git ls-files index.html favicon.svg CNAME assets projects website_images | grep -v '\.DS_Store$')

# 최상위에 있으면 안 되는 것만 본다. assets/vendor 아래 라이브러리의 LICENSE, README.md는 사이트 파일이라 그대로 둔다.
for bad in .git .github scripts tests docs Readme.md LICENSE; do
  if [ -e "$out/$bad" ]; then
    echo "UNEXPECTED $bad"
    fail=1
  fi
done
if find "$out" -name '.DS_Store' -print -quit | grep -q .; then
  echo "UNEXPECTED .DS_Store"
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "PASS stage-static-site"
fi
exit "$fail"
