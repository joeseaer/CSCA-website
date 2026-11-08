#!/usr/bin/env bash
# Generated 2026-11-08: fetch the trusted GitHub main branch and atomically publish static HTML.
set -Eeuo pipefail
umask 022

# Git may update this script during a release. Run one immutable in-memory copy.
if [[ "$0" != csca-deploy-snapshot ]]; then
    exec /bin/bash -c "$(cat -- "$0")" csca-deploy-snapshot
fi

readonly REPO=/wwwdata/wwwdata/CSCA-website
readonly RELEASES=/wwwdata/wwwdata/CSCA-website-releases
readonly PUBLIC=/wwwdata/wwwdata/CSCA-website-public
readonly STATE=/wwwdata/wwwdata/CSCA-website-state
readonly UPSTREAM=ssh://git@ssh.github.com:443/joeseaer/CSCA-website.git
export PATH=/www/server/nodejs/v26.4.0/bin:/usr/local/bin:/usr/bin:/bin
export GIT_TERMINAL_PROMPT=0 ASTRO_TELEMETRY_DISABLED=1 BASE_PATH=/
export npm_config_cache="$STATE/npm-cache"

log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*"; }
fail() { log "ERROR: $*" >&2; exit 1; }

[[ -d "$REPO/.git" && ! -L "$REPO" ]] || fail 'Initialize the dedicated repository first.'
for directory in "$REPO" "$RELEASES" "$STATE"; do
    [[ ! -L "$directory" ]] || fail "Refusing symlink directory: $directory"
    mkdir -p -- "$directory"
    [[ "$(realpath -- "$directory")" = "$directory" ]] || fail "Unexpected resolved directory: $directory"
done
[[ ! -e "$PUBLIC" || -L "$PUBLIC" ]] || fail 'The public path must be a deployment symlink, not a directory.'
if [[ -L "$PUBLIC" ]]; then
    [[ "$(readlink -- "$PUBLIC")" =~ ^$RELEASES/[0-9a-f]{40}$ ]] || fail 'The existing public symlink has an unexpected target.'
fi

exec 9>"$STATE/deploy.lock"
flock -n 9 || exit 0
build_dir=
next_link="$PUBLIC.next"
cleanup() {
    if [[ -n "$build_dir" && "$build_dir" == "$RELEASES"/.build.* && -d "$build_dir" ]]; then
        rm -rf -- "$build_dir"
    fi
    [[ ! -L "$next_link" ]] || rm -- "$next_link"
}
trap cleanup EXIT
trap 'log "ERROR: deployment failed at line $LINENO; inspect the public symlink and deployment log before retrying." >&2' ERR

[[ "$(git -C "$REPO" remote get-url upstream)" = "$UPSTREAM" ]] || fail 'Unexpected upstream URL.'
[[ "$(git -C "$REPO" symbolic-ref --short HEAD)" = main ]] || fail 'The dedicated checkout must be on main.'
[[ -z "$(git -C "$REPO" status --porcelain --untracked-files=normal)" ]] || fail 'The dedicated checkout has local changes.'
current=$(git -C "$REPO" rev-parse HEAD)
timeout 120 git -C "$REPO" fetch --no-tags upstream refs/heads/main:refs/remotes/upstream/main
target=$(git -C "$REPO" rev-parse refs/remotes/upstream/main)
[[ "$target" =~ ^[0-9a-f]{40}$ ]] || fail 'Invalid upstream commit.'
git -C "$REPO" merge-base --is-ancestor HEAD "$target" || fail 'Local and GitHub histories diverged; refusing overwrite.'
release="$RELEASES/$target"
if [[ -L "$PUBLIC" && "$(readlink -- "$PUBLIC")" = "$release" && -f "$release/index.html" ]]; then
    exit 0
fi

if [[ -d "$release" && ! -L "$release" ]]; then
    python3 - "$release" "$target" <<'PY'
import hashlib, json, pathlib, sys
root = pathlib.Path(sys.argv[1])
metadata = json.loads((root / 'release.json').read_text())
assert metadata['commit'] == sys.argv[2], 'Existing release commit mismatch'
assert metadata['index_sha256'] == hashlib.sha256((root / 'index.html').read_bytes()).hexdigest(), 'Existing release hash mismatch'
PY
    log "Reusing verified release $target"
else
    [[ ! -e "$release" && ! -L "$release" ]] || fail 'Unexpected existing release path.'
    log "Building GitHub main $target"
    build_dir=$(mktemp -d "$RELEASES/.build.XXXXXXXX")
    mkdir "$build_dir/source"
    git -C "$REPO" archive "$target" | tar -x -C "$build_dir/source"
    (
        cd "$build_dir/source"
        timeout 900 npm ci --no-audit --no-fund
        timeout 600 npm run build
    )
    [[ -s "$build_dir/source/dist/index.html" ]] || fail 'The build did not produce index.html.'
    python3 - "$build_dir/source/dist" "$target" <<'PY'
import hashlib, json, pathlib, sys
from datetime import datetime, timezone
root = pathlib.Path(sys.argv[1])
metadata = {
    'commit': sys.argv[2],
    'built_at': datetime.now(timezone.utc).isoformat(),
    'source': 'https://github.com/joeseaer/CSCA-website',
    'index_sha256': hashlib.sha256((root / 'index.html').read_bytes()).hexdigest(),
}
(root / 'release.json').write_text(json.dumps(metadata, indent=2) + '\n')
PY
    mv -- "$build_dir/source/dist" "$release"
fi
[[ "$(git -C "$REPO" rev-parse HEAD)" = "$current" ]] || fail 'Checkout changed during the build.'
[[ -z "$(git -C "$REPO" status --porcelain --untracked-files=normal)" ]] || fail 'Checkout was modified during the build.'
git -C "$REPO" merge --ff-only "$target"
ln -s -- "$release" "$next_link"
mv -Tf -- "$next_link" "$PUBLIC"
cp -- "$release/release.json" "$STATE/deployed.json.next"
mv -f -- "$STATE/deployed.json.next" "$STATE/deployed.json"
log "Published $target; index SHA-256 $(sha256sum "$PUBLIC/index.html" | cut -d ' ' -f 1)"

# Keep the current release and the two most recent previous releases.
python3 - "$RELEASES" "$release" <<'PY'
import pathlib, re, shutil, sys
root, current = map(pathlib.Path, sys.argv[1:])
previous = sorted(
    (p for p in root.iterdir() if p.is_dir() and not p.is_symlink()
     and re.fullmatch(r'[0-9a-f]{40}', p.name) and p != current),
    key=lambda p: p.stat().st_mtime, reverse=True,
)
for old in previous[2:]:
    if old.resolve().parent != root.resolve():
        raise SystemExit('Release cleanup escaped its directory')
    shutil.rmtree(old)
PY
