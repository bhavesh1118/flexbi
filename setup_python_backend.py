#!/usr/bin/env python3
"""
Setup script for FlexBI Python Backend
This script sets up the Python environment and installs all required dependencies.
"""

import os
import sys
import subprocess
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"📦 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during {description}:")
        print(f"   Command: {command}")
        print(f"   Exit code: {e.returncode}")
        print(f"   Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major == 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} is not compatible")
        print("   Please install Python 3.8 or higher")
        return False

def main():
    print("🚀 FlexBI Python Backend Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Determine the correct pip command
    pip_command = "pip"
    if platform.system() == "Windows":
        pip_command = "python -m pip"
    
    # Install/upgrade pip
    if not run_command(f"{pip_command} install --upgrade pip", "Upgrading pip"):
        print("⚠️  Warning: Failed to upgrade pip, continuing anyway...")
    
    # Install required packages
    packages = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0", 
        "pydantic==2.5.0",
        "pandas==2.1.4",
        "numpy==1.25.2",
        "python-multipart==0.0.6"
    ]
    
    # Try to install Prophet, fall back to statsmodels if it fails
    print("📦 Installing core dependencies...")
    for package in packages:
        if not run_command(f"{pip_command} install {package}", f"Installing {package}"):
            print(f"❌ Failed to install {package}")
            sys.exit(1)
    
    # Try to install Prophet (optional, with fallback)
    print("📦 Attempting to install Prophet for advanced forecasting...")
    if run_command(f"{pip_command} install prophet==1.1.5", "Installing Prophet"):
        print("✅ Prophet installed successfully - advanced forecasting available")
    else:
        print("⚠️  Prophet installation failed, installing statsmodels as fallback...")
        if run_command(f"{pip_command} install statsmodels==0.14.0", "Installing statsmodels"):
            print("✅ Statsmodels installed - basic forecasting available")
        else:
            print("❌ Failed to install forecasting dependencies")
            sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Run 'python server.py' to start the backend server")
    print("2. Or run 'uvicorn server:app --reload' for development mode")
    print("3. The server will be available at http://localhost:3001")
    print("\nAPI Documentation will be available at http://localhost:3001/docs")

if __name__ == "__main__":
    main()
