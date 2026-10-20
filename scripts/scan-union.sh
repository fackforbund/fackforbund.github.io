#!/usr/bin/env bash
# Scan every kollektivavtal-YYYY PDF on disk and emit the ones whose first page
# names the given union (its parties block). Output is TSV: <year>\t<pdf filename>.
#
# Usage: scripts/scan-union.sh <word> > scripts/matches-<slug>.tsv
# Example: scripts/scan-union.sh unionen > scripts/matches-unionen.tsv

set -euo pipefail

word="${1:-unionen}"
pages="${2:-1}"
siblings="$(cd "$(dirname "$0")/../.." && pwd)"

scan_pdf() {
  local word="$1" pages="$2" year="$3" file="$4"
  if gs -q -dNOPAUSE -dBATCH -sDEVICE=txtwrite -dFirstPage=1 -dLastPage="$pages" \
      -sOutputFile=- "$file" 2>/dev/null | grep -iqw "$word"; then
    printf '%s\t%s\n' "$year" "$(basename "$file")"
  fi
}
export -f scan_pdf

for dir in "$siblings"/kollektivavtal-20*; do
  [ -d "$dir" ] || continue
  year="$(basename "$dir" | sed 's/kollektivavtal-//')"
  find "$dir" -maxdepth 1 -name '*.pdf' -print0 \
    | xargs -0 -P 6 -I {} bash -c 'scan_pdf "$0" "$1" "$2" "$3"' "$word" "$pages" "$year" {}
done
