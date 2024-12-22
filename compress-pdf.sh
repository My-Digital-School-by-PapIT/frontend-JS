#!/usr/bin/bash
# Check Ghostscript is installed
if ! [ -x "$(command -v gs)" ]; then
  echo 'Error: Ghostscript is not installed.' >&2
  exit 1
fi
# Compress PDF with lossless default parameter
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/default -dNOPAUSE -dQUIET -dBATCH -sOutputFile=out/linux-readable.pdf out/linux.pdf