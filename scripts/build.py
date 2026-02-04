import shutil
import subprocess
from pathlib import Path

def main():
    source = Path(__file__).resolve().parents[1] / "dashboard"

    subprocess.run(["yarn", "install"], cwd=source, check=True, shell=True)
    subprocess.run(["yarn", "run", "build"], cwd=source, check=True, shell=True)

    print("Dashboard built → static/")
