#!/usr/bin/env bash

set -e

error() {
  echo -n "::error"
  if [[ -n "$2" && -n "$3" && -n "$4" ]]; then
    echo -n " file=$2,line=$3,col=$4"
  fi
  echo "::$1"
}

warn() {
  echo -n "::warning"
  if [[ -n "$2" && -n "$3" && -n "$4" ]]; then
    echo -n " file=$2,line=$3,col=$4"
  fi
  echo "::$1"
}

debug() {
  while read -r line; do
    echo "::debug::$line"
  done <<< "$1"
}

version="${1}"
files="${2}"
include="${3}"

if [[ -z "$version" ]]; then
  error "Input 'version' is missing."
  exit 1
fi

if [[ "$version" == "4" ]]; then
  executable="/metaeditor.exe"
elif [[ "$version" == "5" ]]; then
  executable="/metaeditor64.exe"
else
  error "Only MetaEditor versions 4 and 5 are supported."
  exit 1
fi

if [[ -z "$files" ]]; then
  error "Input 'files' is missing."
  exit 1
fi

readarray -t files <<< "$files"

expanded_files=()
for pattern in "${files[@]}"; do
  while read -r file; do
    expanded_files+=("$file")
  done < <(compgen -G "$pattern" || true)
done

args=("/log")
if [[ -n "$include" ]]; then
  args+=("/inc:$include")
fi

for f in "${expanded_files[@]}"; do
  log="${f%.*}.log"
  rm -rf "$log"
  output="${f%.*}.ex${f: -1}"
  rm -rf "$output"
  echo "[$f] Compiling..."
  wine "$executable" "${args[@]}" "/compile:$f" &> /dev/null || true
  if [[ ! -f $log ]]; then
    error "[$f] Log file does not exist."
    exit 1
  fi
  content=$(iconv -f utf-16le -t ascii -c "$log" | sed -r '/^[[:space:]]+$/d')
  debug "$content"
  while IFS='=' read -r message _file row column; do
    warn "$message" "$_file" "$row" "$column"
  done < <(echo "$content" | sed -rn 's/([[:alnum:]_/-\.]+)\(([[:digit:]]+),([[:digit:]]+)\) : warning [[:digit:]]+: (.*)$/\4=\1=\2=\3/p')
  while IFS='=' read -r message _file row column; do
    error "$message" "$_file" "$row" "$column"
  done < <(echo "$content" | sed -rn 's/([[:alnum:]_/-\.]+)\(([[:digit:]]+),([[:digit:]]+)\) : error [[:digit:]]+: (.*)$/\4=\1=\2=\3/p')
  IFS=' ' read -r errors warnings < <(echo "$content" | sed -rn 's/^[Rr]esult:? ([[:digit:]]+) errors, ([[:digit:]]+) warnings.*$/\1 \2/p')
  if [[ "$errors" -gt 0 ]]; then
    error "[$f] Compilation failed, $errors errors and $warnings warnings."
    exit 1
  else
    if [[ -f "$output" ]]; then
      echo "[$f] Compilation succeeded, $errors errors and $warnings warnings."
      echo "[$f] Binary available at $output."
    else
      error "[$f] Compilation succeeded but file is not available."
      exit 1
    fi
  fi
  rm -rf "$log"
done
