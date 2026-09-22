# Patch pre-login map: drop frozen PREDS blob, load trained predictions dynamically.
from pathlib import Path
import re

path = Path(r"C:\Users\Lenovo\Desktop\FRP\public\index.html")
text = path.read_text(encoding="utf-8")

text2, n = re.subn(
    r"const PREDS = \{.*?\};",
    "let PREDS = {};",
    text,
    count=1,
    flags=re.S,
)
if n != 1:
    raise SystemExit(f"PREDS replacement failed, matches={n}")
path.write_text(text2, encoding="utf-8")
print("Replaced hardcoded PREDS blob")
