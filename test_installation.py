#!/usr/bin/env python3
"""
Test if required libraries are installed
"""

import sys

print("🧪 Testing BPM Detector Installation")
print("=" * 50)

# Test Python version
print(f"\n✅ Python version: {sys.version.split()[0]}")

# Test librosa
try:
    import librosa
    print(f"✅ librosa installed (version {librosa.__version__})")
except ImportError:
    print("❌ librosa NOT installed")
    print("   Run: pip3 install librosa soundfile")
    sys.exit(1)

# Test numpy
try:
    import numpy as np
    print(f"✅ numpy installed (version {np.__version__})")
except ImportError:
    print("❌ numpy NOT installed")
    print("   Run: pip3 install numpy")
    sys.exit(1)

# Test soundfile
try:
    import soundfile
    print(f"✅ soundfile installed (version {soundfile.__version__})")
except ImportError:
    print("❌ soundfile NOT installed")
    print("   Run: pip3 install soundfile")
    sys.exit(1)

print("\n" + "=" * 50)
print("🎉 All required libraries are installed!")
print("✅ You're ready to use the BPM Detector!")
print("\nNext step:")
print("  python3 bpm_detector.py /path/to/your/music/folder")

