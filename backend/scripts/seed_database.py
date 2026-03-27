from pathlib import Path
import sys

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR.parent))

from backend.db import seed_all  # noqa: E402
from backend.app import bootstrap_admin  # noqa: E402

if __name__ == '__main__':
    seed_all()
    bootstrap_admin()
    print('Database seeded successfully.')
