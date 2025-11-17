import os
import shutil

def clear_pycache(path):
    for root, dirs, files in os.walk(path):
        if '__pycache__' in dirs:
            shutil.rmtree(os.path.join(root, '__pycache__'))
            print(f"Removed: {os.path.join(root, '__pycache__')}")
        for file in files:
            if file.endswith('.pyc'):
                os.remove(os.path.join(root, file))
                print(f"Removed: {os.path.join(root, file)}")

if __name__ == "__main__":
    clear_pycache('.') # Clears pycache in the current directory and its subdirectories