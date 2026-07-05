#!/usr/bin/env python3
"""将 PaperGrid SQLite 备份迁移为 astro-koharu Markdown 内容。"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sqlite3
import sys
from dataclasses import dataclass
from datetime import UTC, datetime, timezone, timedelta
from pathlib import Path
from typing import Any


try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DB_PATH = Path(r"F:\Boke\beifen\db-backup-20260509_043000.sqlite")
DEFAULT_OLD_ROOT = Path(r"F:\Boke\PaperGrid-D1")
CONTENT_ROOT = PROJECT_ROOT / "src" / "content" / "blog"
MEDIA_TARGET_ROOT = PROJECT_ROOT / "public" / "img" / "legacy-media"
SITE_YAML = PROJECT_ROOT / "config" / "site.yaml"
PLACEHOLDER_NAME = "_missing-image.svg"
SITE_TZ = timezone(timedelta(hours=8))

CATEGORY_SLUGS = {
    "旧博客": "legacy",
    "技术分享": "technology-sharing",
    "知识科普": "knowledge-popularization",
    "未分类": "uncategorized",
}

CATEGORY_DIRS = {
    "技术分享": "technology-sharing",
    "知识科普": "knowledge-popularization",
    "未分类": "uncategorized",
}

SAFE_SLUG_RE = re.compile(r"[^a-zA-Z0-9._-]+")
API_FILE_RE = re.compile(r"/api/files/([A-Za-z0-9_-]+)")
UPLOAD_RE = re.compile(r"/uploads/([^\s)\"'>]+)")
DIRECT_STORAGE_RE = re.compile(r"(?<![\w/])/?(20\d{2}/\d{2}/\d{2}/[A-Za-z0-9._-]+\.(?:png|jpe?g|webp|avif))", re.I)


@dataclass(frozen=True)
class MediaFile:
    id: str
    original_name: str
    storage_path: str
    mime_type: str


@dataclass
class MigrationStats:
    posts_total: int = 0
    posts_written: int = 0
    posts_skipped_existing: int = 0
    media_records: int = 0
    media_copied: int = 0
    media_missing: int = 0
    references_rewritten: int = 0
    references_placeholder: int = 0
    site_yaml_added: list[str] | None = None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="迁移 PaperGrid 旧博客备份")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH, help="旧 SQLite 备份路径")
    parser.add_argument("--old-root", type=Path, default=DEFAULT_OLD_ROOT, help="旧项目根目录")
    parser.add_argument("--dry-run", action="store_true", help="只预览不写入；默认就是预览模式")
    parser.add_argument("--apply", action="store_true", help="执行写入；默认只预览")
    parser.add_argument("--force", action="store_true", help="覆盖已存在的迁移文章")
    return parser.parse_args()


def connect_db(path: Path) -> sqlite3.Connection:
    if not path.exists():
        raise FileNotFoundError(f"找不到 SQLite 备份：{path}")
    con = sqlite3.connect(path)
    con.row_factory = sqlite3.Row
    return con


def fetch_media(con: sqlite3.Connection) -> dict[str, MediaFile]:
    rows = con.execute(
        """
        select id, originalName, storagePath, mimeType
        from MediaFile
        order by createdAt
        """
    ).fetchall()
    return {
        row["id"]: MediaFile(
            id=row["id"],
            original_name=row["originalName"],
            storage_path=normalize_storage_path(row["storagePath"]),
            mime_type=row["mimeType"],
        )
        for row in rows
    }


def fetch_posts(con: sqlite3.Connection) -> list[sqlite3.Row]:
    return con.execute(
        """
        select
          p.id,
          p.title,
          p.slug,
          p.content,
          p.excerpt,
          p.coverImage,
          p.status,
          p.locale,
          p.publishedAt,
          p.createdAt,
          p.updatedAt,
          p.isProtected,
          c.name as categoryName
        from Post p
        left join Category c on c.id = p.categoryId
        order by coalesce(p.publishedAt, p.createdAt), p.createdAt
        """
    ).fetchall()


def fetch_tags(con: sqlite3.Connection, post_id: str) -> list[str]:
    rows = con.execute(
        """
        select t.name
        from PostTag pt
        join Tag t on t.id = pt.tagId
        where pt.postId = ?
        order by lower(t.name)
        """,
        (post_id,),
    ).fetchall()
    tags: list[str] = []
    for row in rows:
        name = str(row["name"]).strip()
        if name and name not in tags:
            tags.append(name)
    return tags


def normalize_storage_path(value: str) -> str:
    return value.replace("\\", "/").lstrip("/")


def sanitize_slug(value: str | None, fallback: str) -> str:
    base = (value or "").strip().replace("\\", "/").split("/")[-1]
    base = base.rsplit(".", 1)[0] if "." in base else base
    slug = SAFE_SLUG_RE.sub("-", base).strip(".-").lower()
    return slug or fallback


def date_from_ms(value: Any) -> str:
    if value is None:
        return datetime.now(SITE_TZ).strftime("%Y-%m-%d %H:%M:%S")
    try:
        number = float(value)
    except (TypeError, ValueError):
        return str(value)
    if number > 10_000_000_000:
        dt = datetime.fromtimestamp(number / 1000, UTC)
    else:
        dt = datetime.fromtimestamp(number, UTC)
    return dt.astimezone(SITE_TZ).strftime("%Y-%m-%d %H:%M:%S")


def yaml_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def find_media_source(old_root: Path, db_path: Path, storage_path: str) -> Path | None:
    rel = Path(*normalize_storage_path(storage_path).split("/"))
    candidates = [
        old_root / "public" / "uploads" / rel,
        old_root / "public" / rel,
        old_root / "uploads" / rel,
        old_root / rel,
        db_path.parent / "uploads" / rel,
        db_path.parent / "media" / rel,
        db_path.parent / rel,
    ]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return None


def copy_media_if_available(
    media: MediaFile,
    old_root: Path,
    db_path: Path,
    apply: bool,
    copied: set[str],
) -> tuple[str, bool]:
    target_url = f"/img/legacy-media/{media.storage_path}"
    if media.storage_path in copied:
        return target_url, True

    source = find_media_source(old_root, db_path, media.storage_path)
    if not source:
        return target_url, False

    if apply:
        target = MEDIA_TARGET_ROOT / Path(*media.storage_path.split("/"))
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    copied.add(media.storage_path)
    return target_url, True


def rewrite_media_refs(
    content: str,
    media_by_id: dict[str, MediaFile],
    media_by_storage: dict[str, MediaFile],
    old_root: Path,
    db_path: Path,
    apply: bool,
    copied: set[str],
) -> tuple[str, list[str], int, int]:
    missing: list[str] = []
    rewritten = 0
    placeholders = 0

    def replace_media(media: MediaFile, original: str) -> str:
        nonlocal rewritten, placeholders
        target_url, exists = copy_media_if_available(media, old_root, db_path, apply, copied)
        rewritten += 1
        if exists:
            return target_url
        placeholders += 1
        missing.append(f"{original} -> {media.storage_path}")
        return f"/img/legacy-media/{PLACEHOLDER_NAME}"

    def api_repl(match: re.Match[str]) -> str:
        media_id = match.group(1)
        media = media_by_id.get(media_id)
        if not media:
            missing.append(match.group(0))
            return f"/img/legacy-media/{PLACEHOLDER_NAME}"
        return replace_media(media, match.group(0))

    def upload_repl(match: re.Match[str]) -> str:
        storage_path = normalize_storage_path(match.group(1))
        media = media_by_storage.get(storage_path)
        if not media:
            missing.append(match.group(0))
            return f"/img/legacy-media/{PLACEHOLDER_NAME}"
        return replace_media(media, match.group(0))

    rewritten_content = API_FILE_RE.sub(api_repl, content)
    rewritten_content = UPLOAD_RE.sub(upload_repl, rewritten_content)
    rewritten_content = DIRECT_STORAGE_RE.sub(upload_repl, rewritten_content)
    return rewritten_content, missing, rewritten, placeholders


def build_frontmatter(row: sqlite3.Row, tags: list[str], category: str, body: str, cover: str | None) -> str:
    lines = [
        "---",
        f"title: {yaml_string(str(row['title']).strip())}",
        f"date: {date_from_ms(row['publishedAt'] or row['createdAt'])}",
        f"updated: {date_from_ms(row['updatedAt'])}",
    ]
    excerpt = str(row["excerpt"] or "").strip()
    if excerpt:
        lines.append(f"description: {yaml_string(excerpt)}")
    if cover:
        lines.append(f"cover: {yaml_string(cover)}")

    lines.extend(
        [
            "categories:",
            f"  - [{yaml_string('旧博客')}, {yaml_string(category)}]",
        ]
    )

    if tags:
        lines.append("tags:")
        for tag in tags:
            lines.append(f"  - {yaml_string(tag)}")

    is_draft = str(row["status"]).upper() != "PUBLISHED" or bool(row["isProtected"])
    lines.append(f"draft: {str(is_draft).lower()}")
    lines.append("catalog: true")
    lines.append("---")

    return "\n".join(lines) + "\n\n" + body.rstrip() + "\n"


def build_post_path(row: sqlite3.Row, category: str) -> Path:
    category_dir = CATEGORY_DIRS.get(category, sanitize_slug(category, "uncategorized"))
    slug = sanitize_slug(row["slug"], f"post-{row['id']}")
    return CONTENT_ROOT / "legacy" / category_dir / f"{slug}.md"


def add_missing_media_note(body: str, missing: list[str]) -> str:
    if not missing:
        return body
    lines = [
        "<!--",
        "迁移提示：旧站备份未包含以下图片实体，当前已替换为占位图。",
        "如果后续拿到旧 R2 或 uploads 文件，把对应文件放到 public/img/legacy-media/ 后可重新替换。",
    ]
    for item in missing:
        lines.append(f"- {item}")
    lines.append("-->")
    return "\n".join(lines) + "\n\n" + body


def update_site_yaml(apply: bool) -> list[str]:
    if not SITE_YAML.exists():
        raise FileNotFoundError(f"找不到站点配置：{SITE_YAML}")

    text = SITE_YAML.read_text(encoding="utf-8")
    additions: list[str] = []
    for name, slug in CATEGORY_SLUGS.items():
        if re.search(rf"^\s*{re.escape(name)}\s*:", text, re.M):
            continue
        additions.append(f"  {name}: {slug}")

    if additions and apply:
        marker = "featuredCategories:"
        if marker not in text:
            raise ValueError("site.yaml 中找不到 featuredCategories:，无法插入 categoryMap")
        text = text.replace(marker, "\n".join(additions) + "\n" + marker, 1)
        SITE_YAML.write_text(text, encoding="utf-8", newline="\n")

    return additions


def write_placeholder(apply: bool) -> None:
    if not apply:
        return
    MEDIA_TARGET_ROOT.mkdir(parents=True, exist_ok=True)
    placeholder = MEDIA_TARGET_ROOT / PLACEHOLDER_NAME
    if placeholder.exists():
        return
    placeholder.write_text(
        """<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="旧博客图片缺失">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#f4efe7"/>
      <stop offset="1" stop-color="#d7e2d2"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect x="90" y="85" width="1020" height="505" rx="36" fill="none" stroke="#8a6f55" stroke-width="8" stroke-dasharray="22 18"/>
  <text x="600" y="305" text-anchor="middle" font-family="serif" font-size="64" fill="#5f4b38">旧博客图片缺失</text>
  <text x="600" y="385" text-anchor="middle" font-family="serif" font-size="34" fill="#75624d">备份中没有找到原始图片文件</text>
</svg>
""",
        encoding="utf-8",
        newline="\n",
    )


def migrate(args: argparse.Namespace) -> MigrationStats:
    con = connect_db(args.db)
    media_by_id = fetch_media(con)
    media_by_storage = {media.storage_path: media for media in media_by_id.values()}
    posts = fetch_posts(con)
    copied_media: set[str] = set()
    stats = MigrationStats(posts_total=len(posts), media_records=len(media_by_id), site_yaml_added=[])
    any_missing_media = False

    for row in posts:
        category = str(row["categoryName"] or "未分类").strip() or "未分类"
        target_path = build_post_path(row, category)
        if target_path.exists() and not args.force:
            stats.posts_skipped_existing += 1
            continue

        tags = fetch_tags(con, row["id"])
        body, missing, rewritten, placeholders = rewrite_media_refs(
            str(row["content"] or ""),
            media_by_id,
            media_by_storage,
            args.old_root,
            args.db,
            args.apply,
            copied_media,
        )
        cover = None
        cover_image = str(row["coverImage"] or "").strip()
        if cover_image:
            cover_body, cover_missing, cover_rewritten, cover_placeholders = rewrite_media_refs(
                cover_image,
                media_by_id,
                media_by_storage,
                args.old_root,
                args.db,
                args.apply,
                copied_media,
            )
            cover = None if cover_placeholders else cover_body
            missing.extend(cover_missing)
            rewritten += cover_rewritten
            placeholders += cover_placeholders

        if missing:
            any_missing_media = True
            body = add_missing_media_note(body, missing)

        markdown = build_frontmatter(row, tags, category, body, cover)

        if args.apply:
            target_path.parent.mkdir(parents=True, exist_ok=True)
            target_path.write_text(markdown, encoding="utf-8", newline="\n")

        stats.posts_written += 1
        stats.references_rewritten += rewritten
        stats.references_placeholder += placeholders
        stats.media_missing += len(missing)

    stats.media_copied = len(copied_media)
    stats.site_yaml_added = update_site_yaml(args.apply)
    if any_missing_media:
        write_placeholder(args.apply)
    con.close()
    return stats


def main() -> int:
    args = parse_args()
    stats = migrate(args)
    mode = "apply" if args.apply else "dry-run"
    print(
        json.dumps(
            {
                "mode": mode,
                "posts_total": stats.posts_total,
                "posts_written_or_would_write": stats.posts_written,
                "posts_skipped_existing": stats.posts_skipped_existing,
                "media_records": stats.media_records,
                "media_copied_or_would_copy": stats.media_copied,
                "media_missing_references": stats.media_missing,
                "references_rewritten": stats.references_rewritten,
                "references_using_placeholder": stats.references_placeholder,
                "site_yaml_categoryMap_added_or_would_add": stats.site_yaml_added,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
