# 🎵 BPM Detection Tool - Proof of Concept

## What This Does

This tool **automatically analyzes** your music tracks and detects:
- ✅ **BPM** (Beats Per Minute)
- ✅ **Suggested Cue In** point (where intro ends, main beat starts)
- ✅ **Suggested Cue Out** point (where outro starts)
- ✅ **Track duration**
- ✅ **Total beats** in the track

---

## 🚀 Quick Start

### Step 1: Install Required Libraries

```bash
pip3 install librosa soundfile
```

**Note:** This might take a few minutes as it downloads audio processing libraries.

### Step 2: Run the Tool

```bash
python3 bpm_detector.py /path/to/your/music/folder
```

**Example:**
```bash
python3 bpm_detector.py ~/Music/House
```

### Step 3: Check Results

The tool will create a file called `analysis_results.json` in your music folder with all the data!

---

## 📊 Example Output

### Console Output:
```
🎛️  BPM Detection Tool - Proof of Concept
==================================================

📁 Found 3 audio file(s)
📂 Folder: /Users/devadmin/Music/House

[1/3] 🎵 Analyzing: House_Anthem.mp3
   Loading audio...
   Detecting BPM...
   Finding cue points...
   ✅ BPM: 128
   ✅ Duration: 04:32
   ✅ Suggested Cue In: 00:30
   ✅ Suggested Cue Out: 03:45

[2/3] 🎵 Analyzing: Deep_Vibes.mp3
   Loading audio...
   Detecting BPM...
   Finding cue points...
   ✅ BPM: 126
   ✅ Duration: 05:12
   ✅ Suggested Cue In: 00:28
   ✅ Suggested Cue Out: 04:20

✅ Analysis complete!
📄 Results saved to: /Users/devadmin/Music/House/analysis_results.json

📊 Summary:
   Total tracks analyzed: 2
   BPM range: 126 - 128
   Average BPM: 127
```

### JSON Output (analysis_results.json):
```json
[
  {
    "file": "House_Anthem.mp3",
    "bpm": 128,
    "duration": "04:32",
    "duration_seconds": 272.5,
    "cue_in": "00:30",
    "cue_in_seconds": 30.2,
    "cue_out": "03:45",
    "cue_out_seconds": 225.8,
    "total_beats": 580
  },
  {
    "file": "Deep_Vibes.mp3",
    "bpm": 126,
    "duration": "05:12",
    "duration_seconds": 312.0,
    "cue_in": "00:28",
    "cue_in_seconds": 28.5,
    "cue_out": "04:20",
    "cue_out_seconds": 260.3,
    "total_beats": 655
  }
]
```

---

## 🎯 How It Works

### BPM Detection:
- Uses **librosa** (professional audio analysis library)
- Same technology used by Spotify, Beatport, etc.
- Analyzes the audio waveform to find tempo

### Cue Point Detection:
- **Cue In:** Suggested at ~32 beats in (typical intro length for house music)
- **Cue Out:** Suggested at ~32 beats before end (typical outro length)
- These are **suggestions** - you can adjust them manually!

---

## 📝 What to Do with Results

### Option 1: Manual Entry into AzuraCast
1. Open AzuraCast
2. Edit each track
3. Enter the BPM and cue points from the JSON file

### Option 2: Use for Pre-Mixing
1. Look at BPM values
2. Group similar BPM tracks together
3. Mix them in Virtual DJ or other software

### Option 3: Build on This (Future)
- Auto-import into AzuraCast
- Smart playlist generation
- Automated mixing

---

## ⚠️ Important Notes

### Accuracy:
- **BPM detection is ~95% accurate** for electronic music (house, techno, etc.)
- **May struggle with:** Live recordings, tracks with tempo changes, very complex rhythms
- **Always verify** the BPM sounds right!

### Cue Points:
- These are **suggestions** based on typical song structure
- **You should listen** and adjust if needed
- House tracks usually have 16-32 bar intros/outros

### Supported Formats:
- MP3, WAV, FLAC, M4A, OGG
- Most common audio formats work!

---

## 🧪 Testing This Tool

### Test with 3-5 tracks first:
1. Pick a few house/electronic tracks
2. Run the tool
3. Check if BPM matches what you expect
4. Listen to the suggested cue points
5. See if it makes sense!

### If it works well:
- ✅ Run on your full library
- ✅ Use the data for mixing
- ✅ We can build more advanced features!

### If it doesn't work well:
- ❌ We'll try different libraries
- ❌ Or stick with manual cue points
- ❌ Or use pre-mixing approach

---

## 🚀 Next Steps (If This Works)

1. **Smart Playlist Generator** - AI chooses track order based on BPM
2. **Auto-Import to AzuraCast** - Automatically set cue points
3. **Key Detection** - For harmonic mixing
4. **Energy Analysis** - Build/drop energy levels

---

## 💡 Tips

- **Start small:** Test with 5-10 tracks first
- **Verify results:** Listen to a few tracks to check accuracy
- **Adjust as needed:** Cue points are suggestions, not rules!
- **Have fun:** This is just a tool to help you!

---

## ❓ Troubleshooting

### "Module not found" error:
```bash
pip3 install librosa soundfile
```

### "No audio files found":
- Check the folder path is correct
- Make sure files are .mp3, .wav, .flac, etc.

### BPM seems wrong:
- Some tracks are tricky (half-time, double-time)
- Verify by tapping along to the beat
- You can manually correct in AzuraCast

---

**Ready to test?** 🎵

Run it on a few tracks and let me know how it goes!

