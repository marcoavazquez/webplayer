const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const MUSIC_DIR = path.join(__dirname, '..');

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
// Serve the music directory
// We need to map the URL correctly. The client will request /media/something.mp3
app.use('/media', express.static(MUSIC_DIR));

// Function to recursively find audio files
function getAudioFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    // Skip the player directory to avoid infinite loops or serving source code unnecessarily
    if (file === 'player' && dir === MUSIC_DIR) continue;

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAudioFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.mp3', '.wav', '.ogg', '.flac', '.m4a'].includes(ext)) {
        // Compute relative path for URL
        const relativePath = path.relative(MUSIC_DIR, filePath);
        fileList.push({
          name: file,
          path: relativePath.replace(/\\/g, '/'), // Use forward slashes for URLs
          folder: path.dirname(relativePath).replace(/\\/g, '/')
        });
      }
    }
  }
  return fileList;
}

app.get('/api/songs', (req, res) => {
  try {
    const songs = getAudioFiles(MUSIC_DIR);
    res.json(songs);
  } catch (error) {
    console.error('Error scanning for songs:', error);
    res.status(500).json({ error: 'Failed to load songs' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
