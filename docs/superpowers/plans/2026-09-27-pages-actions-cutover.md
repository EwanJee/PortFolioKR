# GitHub Pages 배포 방식 전환 구현 계획

> 에이전트 작업자용: 필수 하위 스킬은 superpowers:subagent-driven-development(권장) 또는 superpowers:executing-plans다. 작업 단위로 진행하고, 단계는 체크박스(`- [ ]`)로 추적한다.

- 목표: 지금 사이트의 내용은 그대로 두고, GitHub Pages 배포 방식을 브랜치 빌드(legacy)에서 GitHub Actions 배포로 바꾼다.
- 구조: `master`의 정적 파일을 `_site` 폴더로 모으는 스크립트와, 그 폴더를 Pages 아티팩트로 올려 배포하는 워크플로를 둔다. 워크플로는 처음에 수동 실행 전용으로 넣는다. 저장소 주인이 Pages 소스를 "GitHub Actions"로 바꾼 뒤, push 트리거를 켜는 커밋을 올려 첫 배포를 한다.
- 기술: GitHub Actions(`actions/checkout@v7`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`), bash, curl, `gh`(조회만)
- 설계 문서: `docs/superpowers/specs/2026-09-27-ewanjee-portfolio-renewal-design.md` 8장 "끊김 없는 전환 순서" 1~2단계
- 이 계획은 사이트 개편 계획(`2026-09-27-site-renewal.md`)보다 먼저 끝낸다.

## 전역 제약

- push는 저장소 전용 배포 키 별칭으로 한다. `git remote get-url origin`이 `git@github-ewanjee:EwanJee/PortFolioKR.git`이어야 한다.
- 커밋 작성자는 `Ewan Jee <111678598+EwanJee@users.noreply.github.com>`이다. 커밋 전에 `git config user.email`로 확인한다.
- 사이트 내용(HTML, CSS, 이미지)은 바꾸지 않는다.
- Pages 소스 전환은 저장소 주인(`EwanJee`)이 웹에서 한다. 토큰을 만들거나 쓰지 않는다.
- 모든 커밋 메시지는 제목, 빈 줄, 그리고 다음 두 줄로 끝난다.
  - `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  - `Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7`
- 사내 이름, 사내 주소, 티켓 키를 커밋이나 파일에 쓰지 않는다.

## 리뷰 초점

- `_site`에 빠진 파일이 있으면 이미지나 스타일이 깨진다. 사람은 지금과 똑같은 화면을 기대한다. Task 1 테스트가 추적 중인 사이트 파일이 모두 복사됐는지 확인한다.
- Pages 소스를 바꾼 뒤 사용자 도메인이나 HTTPS 강제가 풀릴 수 있다. 사람은 `https://ewanjee.com`이 계속 열리기를 기대한다. Task 3에서 Pages API로 `cname`과 `https_enforced`를 확인한다.
- `www.ewanjee.com`이 `ewanjee.com`으로 넘어가지 않으면 예전 링크가 깨진다. Task 3에서 301과 이동 주소를 확인한다.
- `.DS_Store` 같은 로컬 파일이 공개 배포에 섞일 수 있다. Task 1 테스트가 없는지 확인한다.
- 소스를 바꾸기 전에 워크플로가 자동으로 돌면 배포 권한이 없어 실패한다. Task 2는 수동 실행 전용으로 넣어 자동 실행을 막는다.
- 이 저장소는 포크라서 GitHub Actions가 꺼져 있다(2026-09-27 조회 시 워크플로·실행 0건). 켜지 않으면 워크플로가 아예 돌지 않는다. Task 3 Step 2에서 저장소 주인이 켜고, Step 3에서 워크플로가 보이는지 확인한다.

---

### Task 1: 정적 사이트 스테이징 스크립트

Files:
- Create: `scripts/stage-static-site.sh`
- Test: `tests/stage-static-site.test.sh`

Interfaces:
- Consumes: 없음
- Produces: `bash scripts/stage-static-site.sh <출력 폴더>`가 사이트 파일을 출력 폴더(기본 `_site`)에 모은다. Task 2 워크플로가 이 스크립트를 부른다.

- [ ] Step 1: `master` 기준 작업 폴더를 따로 만든다

계획 문서는 `renewal` 브랜치에 커밋돼 있다. 같은 폴더에서 `master` 기준 브랜치로 바꾸면 계획 문서가 폴더에서 사라지므로, 이 계획의 작업은 별도 작업 폴더(git worktree)에서 한다. 이 계획의 나머지 명령은 모두 `../PortFolioKR-ci`에서 실행한다.

```bash
cd PortFolioKR
git status --short            # 비어 있어야 한다(계획 문서는 renewal에 커밋됨)
git fetch origin
git worktree add ../PortFolioKR-ci -b ci/pages-actions origin/master
cd ../PortFolioKR-ci
git config user.email         # 111678598+EwanJee@users.noreply.github.com 이어야 한다
git remote get-url origin     # git@github-ewanjee:EwanJee/PortFolioKR.git 이어야 한다
```

- [ ] Step 2: 실패하는 테스트를 쓴다

`tests/stage-static-site.test.sh`:

```bash
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
```

- [ ] Step 3: 테스트를 돌려 실패를 확인한다

Run: `bash tests/stage-static-site.test.sh`
Expected: 스크립트가 없어서 `bash: scripts/stage-static-site.sh: No such file or directory`로 실패

- [ ] Step 4: 스크립트를 쓴다

`scripts/stage-static-site.sh`:

```bash
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
```

- [ ] Step 5: 테스트를 돌려 통과를 확인한다

Run: `bash tests/stage-static-site.test.sh`
Expected: `PASS stage-static-site`

- [ ] Step 6: 모은 폴더를 로컬에서 띄워 화면이 그대로인지 확인한다

```bash
bash scripts/stage-static-site.sh _site
python3 -m http.server 8765 --directory _site >/dev/null 2>&1 &
SERVER=$!
sleep 1
curl -s http://localhost:8765/ | grep -c "지예환's Portfolio"                     # 1
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8765/assets/css/style.css  # 200
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8765/assets/img/profile.jpg # 200
kill "$SERVER"
rm -rf _site
```

Expected: `1`, `200`, `200`

- [ ] Step 7: 커밋한다

```bash
git add scripts/stage-static-site.sh tests/stage-static-site.test.sh
git commit -F - <<'EOF'
ci: 정적 사이트를 Pages 아티팩트 폴더로 모으는 스크립트 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
```

### Task 2: 수동 실행 전용 배포 워크플로를 `master`에 넣기

Files:
- Create: `.github/workflows/deploy.yml`
- Modify: `.gitignore` (끝에 `_site/` 추가)

Interfaces:
- Consumes: Task 1의 `scripts/stage-static-site.sh`
- Produces: 워크플로 이름 `Deploy`, 잡 `build`와 `deploy`. 사이트 개편 계획이 이 파일을 Astro 빌드용으로 바꾼다.

- [ ] Step 1: 워크플로를 쓴다

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - name: Stage static site
        run: bash scripts/stage-static-site.sh _site
      - name: Check staged site
        run: bash tests/stage-static-site.test.sh
      - uses: actions/upload-pages-artifact@v5
        with:
          path: _site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    # 배포 권한은 배포 잡에만 준다.
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] Step 2: `_site/`를 추적하지 않게 한다

```bash
printf '_site/\n' >> .gitignore
```

- [ ] Step 3: YAML 문법을 확인한다

Run: `ruby -ryaml -e 'y = YAML.load_file(".github/workflows/deploy.yml"); puts y["jobs"].keys.join(",")'`
Expected: `build,deploy`

- [ ] Step 4: 커밋하고 `master`에 올린다

`on`이 `workflow_dispatch`뿐이라 push해도 워크플로는 돌지 않는다. `master`에 push하면 지금의 브랜치 빌드가 같은 내용으로 다시 배포될 뿐이다.

```bash
git add .github/workflows/deploy.yml .gitignore
git commit -F - <<'EOF'
ci: GitHub Actions 배포 워크플로 추가(수동 실행 전용)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
git push origin ci/pages-actions
git push origin ci/pages-actions:master
```

- [ ] Step 5: 사이트가 그대로인지 확인한다

```bash
sleep 60
curl -s https://ewanjee.com/ | grep -c "지예환's Portfolio"   # 1
```

Expected: `1`

### Task 3: Pages 소스 전환(사용자), 첫 Actions 배포, 확인

Files:
- Modify: `.github/workflows/deploy.yml` (`on`에 push 트리거 추가)

Interfaces:
- Consumes: Task 2의 워크플로
- Produces: `master`에 push할 때마다 Actions가 배포한다. Pages `build_type`이 `workflow`가 된다.

- [ ] Step 1: 전환 전 상태를 기록한다

Run: `gh api repos/EwanJee/PortFolioKR/pages --jq '{build_type, cname, https_enforced, status}'`
Expected: `{"build_type":"legacy","cname":"ewanjee.com","https_enforced":true,"status":"built"}`

- [ ] Step 2: 저장소 주인에게 전환을 요청한다

사용자에게 다음을 안내하고 끝났다는 답을 기다린다.
- `EwanJee` 계정으로 `https://github.com/EwanJee/PortFolioKR/actions`를 연다. 포크 저장소라 워크플로를 켜는 버튼("I understand my workflows, go ahead and enable them")이 보이면 누른다. 버튼이 없으면 `https://github.com/EwanJee/PortFolioKR/settings/actions`에서 Actions permissions를 "Allow all actions and reusable workflows"로 둔다.
- 이어서 `https://github.com/EwanJee/PortFolioKR/settings/pages`를 연다.
- Build and deployment → Source에서 "GitHub Actions"를 고른다.
- Custom domain 칸에 `ewanjee.com`이 그대로 있는지, "Enforce HTTPS"가 켜져 있는지 본다.

- [ ] Step 3: 전환을 확인한다

Run: `gh api repos/EwanJee/PortFolioKR/pages --jq '{build_type, cname, https_enforced}'`
Expected: `{"build_type":"workflow","cname":"ewanjee.com","https_enforced":true}`

Run: `gh api repos/EwanJee/PortFolioKR/actions/workflows --jq '[.workflows[].path]'`
Expected: `[".github/workflows/deploy.yml"]`가 들어 있다(Actions가 켜졌다는 뜻). 비어 있으면 Step 2의 Actions 켜기를 다시 요청한다.

`cname`이 비었거나 `https_enforced`가 `false`면 멈추고, 사용자에게 Custom domain에 `ewanjee.com`을 다시 넣고 "Enforce HTTPS"를 켜 달라고 요청한다.

- [ ] Step 4: push 트리거를 켠다

`.github/workflows/deploy.yml`의 `on:` 블록을 다음으로 바꾼다.

```yaml
on:
  push:
    branches: [master]
  workflow_dispatch:
```

- [ ] Step 5: 커밋하고 올려서 첫 배포를 시작한다

```bash
git add .github/workflows/deploy.yml
git commit -F - <<'EOF'
ci: master push마다 GitHub Actions로 배포

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
git push origin ci/pages-actions:master
```

- [ ] Step 6: 배포가 끝날 때까지 기다린다

방금 올린 커밋의 실행만 보도록 `head_sha`로 거른다(거르지 않으면 이전 실행 결과를 읽고 일찍 끝날 수 있다).

```bash
SHA=$(git rev-parse HEAD)
for i in $(seq 1 30); do
  st=$(gh api "repos/EwanJee/PortFolioKR/actions/workflows/deploy.yml/runs?head_sha=$SHA&per_page=1" --jq '.workflow_runs[0] | "\(.status) \(.conclusion)"')
  echo "$st"
  case "$st" in completed*) break;; esac
  sleep 20
done
```

Expected: 마지막 줄이 `completed success`

`completed failure`면 `gh api "repos/EwanJee/PortFolioKR/actions/workflows/deploy.yml/runs?head_sha=$SHA&per_page=1" --jq '.workflow_runs[0].html_url'`로 실행 페이지 주소를 사용자에게 보여 주고, 실패한 단계의 로그를 함께 확인한다.

- [ ] Step 7: 사이트와 도메인을 확인한다

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://ewanjee.com/                        # 200
curl -s https://ewanjee.com/ | grep -c "지예환's Portfolio"                          # 1
curl -s -o /dev/null -w '%{http_code}\n' https://ewanjee.com/assets/css/style.css   # 200
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.ewanjee.com/   # 301 https://ewanjee.com/
gh api repos/EwanJee/PortFolioKR/pages --jq '{build_type, cname, https_enforced, status}'
```

Expected: `200`, `1`, `200`, `301 https://ewanjee.com/`, 그리고 `{"build_type":"workflow","cname":"ewanjee.com","https_enforced":true,"status":"built"}`

- [ ] Step 8: 되돌리는 방법을 기록한다

문제가 생기면 사용자가 Settings → Pages → Source를 "Deploy from a branch"(`master`, `/ (root)`)로 되돌린다. 그러면 예전 브랜치 빌드로 같은 사이트가 다시 배포된다.

이 되돌리기는 사이트 개편(`2026-09-27-site-renewal.md`)을 `master`에 합치기 전까지만 쓴다. 합친 뒤의 `master`에는 루트 `index.html`이 없어서, 브랜치 빌드로 되돌리면 소스 파일이 그대로 공개되고 사이트가 깨진다. 합친 뒤에는 사이트 개편 계획 Task 14의 되돌리기(합친 커밋을 `git revert -m 1`)를 쓴다. 이 내용을 세션 결정 로그에 남긴다.

세션 결정 로그는 작업 폴더별로 쌓이므로, 지울 작업 폴더가 아닌 저장소 폴더에서 남긴다.

```bash
(cd ../PortFolioKR && bash ~/.claude/hooks/session-decide.sh "Pages 배포를 GitHub Actions로 전환 완료. 되돌리기(사이트 개편 합치기 전까지만): Settings → Pages → Source를 Deploy from a branch(master, root)로. 개편을 합친 뒤에는 합친 커밋을 git revert -m 1")
```

- [ ] Step 9: 작업 폴더를 정리한다

```bash
cd ../PortFolioKR
git -C ../PortFolioKR-ci status --short   # 도구가 만든 `?? .omc/` 같은 추적하지 않는 폴더만 있어야 한다
git worktree remove --force ../PortFolioKR-ci
```

추적 중인 파일이 바뀌어 있으면(`M`, `A` 등) 지우지 말고 멈춘다.
