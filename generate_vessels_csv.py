"""
One-time helper to bootstrap data and export all vessel records to core/data/vessels.csv.

Usage (from project root):
  python generate_vessels_csv.py
"""
from pathlib import Path
import subprocess
import sys
import os


def main() -> int:
    repo_root = Path(__file__).resolve().parent
    core_dir = repo_root / "core"
    output_csv = core_dir / "data" / "vessels.csv"

    commands = [
        ["manage.py", "import_ports"],
        [
            "manage.py",
            "sync_vessels",
            "--mode",
            "import",
            "--file",
            "data/vessels.csv",
            "--enrich",
            "--enrich-limit",
            "10000",
        ],
        ["manage.py", "sync_vessels", "--mode", "export", "--all", "--file", "data/vessels.csv"],
    ]

    print("Running one-time data pipeline:")
    print("1) import ports from core/data/ports.csv")
    print("2) import + enrich vessels and update flags from core/data/vessels.csv (if present)")
    print("3) export all vessels to core/data/vessels.csv")
    print("")

    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"

    for raw_cmd in commands:
        cmd = [sys.executable, *raw_cmd]
        print(f"-> {' '.join(raw_cmd)}")
        code = subprocess.call(cmd, cwd=str(core_dir), env=env)
        if code != 0:
            return code

    print(f"\nDone. Vessel CSV is available at: {output_csv}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
