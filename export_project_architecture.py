#!/usr/bin/env python3
"""Exporta inventário JSON e ZIP do projeto. Execute na raiz com python3 export_project_architecture.py."""
from pathlib import Path
import hashlib, json, zipfile
from datetime import datetime, timezone

ROOT = Path.cwd()
JSON_OUT = ROOT / "engetech-architecture.json"
ZIP_OUT = ROOT / "engetech-source-bundle.zip"
EXCLUDED_DIRS = {".git", "node_modules", ".next", "out", "dist", "build", "coverage", ".turbo", ".vercel", ".cache", "__pycache__", ".pytest_cache", ".mypy_cache", "venv", ".venv"}
EXCLUDED_NAMES = {".env", ".env.local", ".env.development.local", ".env.test.local", ".env.production.local", "id_rsa", "id_ed25519", "credentials.json", "service-account.json"}
EXCLUDED_SUFFIXES = {".pem", ".key", ".p12", ".pfx", ".sqlite", ".sqlite3", ".db", ".dump", ".bak"}
TEXT_SUFFIXES = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".css", ".scss", ".sass", ".html", ".md", ".mdx", ".txt", ".yml", ".yaml", ".toml", ".prisma", ".sql", ".sh", ".py", ".java", ".go", ".rs", ".xml", ".svg"}
SPECIAL_TEXT_NAMES = {"Dockerfile", "Makefile", "Procfile", ".gitignore", ".env.example", ".env.sample"}
MAX_INLINE_BYTES = 200_000

def excluded(p):
    parts = p.relative_to(ROOT).parts
    if any(x in EXCLUDED_DIRS for x in parts): return True
    if p.name in EXCLUDED_NAMES: return True
    if p.name.startswith(".env.") and p.name not in {".env.example", ".env.sample"}: return True
    if p.suffix.lower() in EXCLUDED_SUFFIXES: return True
    if p.name in {".DS_Store", "Thumbs.db"} or p.name.endswith((".log", ".tmp", ".swp")): return True
    return False

def digest(p):
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""): h.update(chunk)
    return h.hexdigest()

files, zip_files = [], []
for p in sorted(ROOT.rglob("*")):
    if not p.is_file() or excluded(p) or p.name in {JSON_OUT.name, ZIP_OUT.name}: continue
    rel = p.relative_to(ROOT).as_posix()
    try:
        size = p.stat().st_size
        item = {"path": rel, "sizeBytes": size, "extension": p.suffix.lower(), "sha256": digest(p)}
        if p.suffix.lower() in TEXT_SUFFIXES or p.name in SPECIAL_TEXT_NAMES:
            if size <= MAX_INLINE_BYTES:
                try: item["content"] = p.read_text(encoding="utf-8")
                except (UnicodeDecodeError, OSError): item["contentOmittedReason"] = "Não foi possível ler como UTF-8."
            else: item["contentOmittedReason"] = f"Maior que {MAX_INLINE_BYTES} bytes; consulte o ZIP."
        else: item["contentOmittedReason"] = "Binário ou tipo não incluído inline; consulte o ZIP se necessário."
        files.append(item); zip_files.append((p, rel))
    except OSError as e: files.append({"path": rel, "error": str(e)})

pkg_meta = {}
pkg = ROOT / "package.json"
if pkg.exists() and not excluded(pkg):
    try:
        data = json.loads(pkg.read_text(encoding="utf-8"))
        pkg_meta = {k: data.get(k) for k in ("name", "version", "scripts", "dependencies", "devDependencies")}
    except Exception as e: pkg_meta = {"parseError": str(e)}

out = {
    "schemaVersion": "1.0.0",
    "generatedAt": datetime.now(timezone.utc).isoformat(),
    "projectRootName": ROOT.name,
    "purpose": "Inventário da arquitetura e snapshot de arquivos textuais para análise.",
    "security": {
        "secretsExcluded": True,
        "warning": "Revise JSON e ZIP antes de compartilhar. Arquivos .env com segredos, chaves privadas, bancos locais e pastas geradas são excluídos."
    },
    "summary": {
        "fileCount": len(files),
        "filesWithInlineContent": sum("content" in f for f in files),
        "filesWithOmittedContent": sum("contentOmittedReason" in f for f in files)
    },
    "packageJson": pkg_meta,
    "files": files
}
JSON_OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
with zipfile.ZipFile(ZIP_OUT, "w", zipfile.ZIP_DEFLATED) as z:
    for p, rel in zip_files:
        try: z.write(p, rel)
        except OSError: pass
print(f"JSON criado: {JSON_OUT}")
print(f"ZIP criado: {ZIP_OUT}")
print(f"Arquivos inventariados: {len(files)}")
print("Revise os arquivos antes de compartilhar. Segredos conhecidos são excluídos por segurança.")
