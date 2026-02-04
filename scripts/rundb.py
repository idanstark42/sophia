import subprocess
import sys
import os

def main():
  """
  Run MongoDB manually via mongod in development.
  Assumes default installation on Windows.
  """
  # Default paths - change if your install is different
  mongo_bin = r"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
  data_dir  = r"C:\data\db"
  log_file  = r"C:\data\log\mongod.log"

  # Ensure directories exist
  os.makedirs(data_dir, exist_ok=True)
  os.makedirs(os.path.dirname(log_file), exist_ok=True)

  # Check if binary exists
  if not os.path.exists(mongo_bin):
    print(f"ERROR: mongod.exe not found at {mongo_bin}")
    sys.exit(1)

  print("Starting MongoDB manually...")
  try:
    # Run mongod in a blocking process (you can run it in background if you prefer)
    subprocess.run([mongo_bin, "--dbpath", data_dir, "--logpath", log_file, "--logappend"], check=True)
  except subprocess.CalledProcessError as e:
    print(f"mongod exited with error: {e}")
    sys.exit(1)
