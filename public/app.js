document.addEventListener('DOMContentLoaded', () => {
    const audioElement = document.getElementById('audio-element');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const volumeSlider = document.getElementById('volume');
    const playlistElement = document.getElementById('playlist');
    const nowPlayingElement = document.getElementById('now-playing');
    const timeDisplay = document.getElementById('time-display');
    const playlistInfo = document.getElementById('playlist-info');
    const visualizerCanvas = document.getElementById('visualizer');
    const canvasCtx = visualizerCanvas.getContext('2d');
    const eqBands = document.querySelectorAll('.eq-band');

    let songs = [];
    let currentIndex = 0;
    
    // Web Audio API context
    let audioCtx;
    let analyser;
    let source;
    let filters = [];
    let isContextInitialized = false;

    // Fetch songs from server
    fetch('/api/songs')
        .then(response => response.json())
        .then(data => {
            songs = data;
            renderPlaylist();
            updatePlaylistInfo();
        })
        .catch(err => {
            playlistElement.innerHTML = '<li>Error loading playlist!</li>';
            console.error('Fetch error:', err);
        });

    function renderPlaylist() {
        playlistElement.innerHTML = '';
        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${song.name}`;
            if (index === currentIndex) {
                li.classList.add('active');
            }
            li.addEventListener('dblclick', () => {
                playSong(index);
            });
            playlistElement.appendChild(li);
        });
    }

    function updatePlaylistInfo() {
        playlistInfo.textContent = `${songs.length} tracks`;
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Initialize Web Audio API
    function initAudioContext() {
        if (isContextInitialized) return;
        
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        
        source = audioCtx.createMediaElementSource(audioElement);
        
        // Setup Equalizer
        const frequencies = [30, 60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
        filters = frequencies.map((freq, i) => {
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = eqBands[i].value;
            return filter;
        });

        // Connect nodes: source -> filter1 -> ... -> filterN -> analyser -> destination
        source.connect(filters[0]);
        for (let i = 0; i < filters.length - 1; i++) {
            filters[i].connect(filters[i + 1]);
        }
        filters[filters.length - 1].connect(analyser);
        analyser.connect(audioCtx.destination);
        
        isContextInitialized = true;
        drawVisualizer();
    }

    function drawVisualizer() {
        if (!isContextInitialized) return;
        
        requestAnimationFrame(drawVisualizer);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        analyser.getByteFrequencyData(dataArray);
        
        canvasCtx.fillStyle = '#000';
        canvasCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
        
        const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            
            // Retro green bars
            canvasCtx.fillStyle = `rgb(0, ${barHeight + 100}, 0)`;
            canvasCtx.fillRect(x, visualizerCanvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }

    // Playback functions
    function playSong(index) {
        if (songs.length === 0) return;
        if (index < 0) index = songs.length - 1;
        if (index >= songs.length) index = 0;
        
        currentIndex = index;
        const song = songs[currentIndex];
        
        audioElement.src = `/media/${song.path}`;
        audioElement.volume = volumeSlider.value;
        
        initAudioContext();
        
        audioElement.play().then(() => {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }).catch(err => console.error("Playback prevented:", err));

        nowPlayingElement.textContent = `${index + 1}. ${song.name}`;
        
        // Update playlist UI
        document.querySelectorAll('#playlist li').forEach((li, i) => {
            if (i === currentIndex) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });
    }

    // Event Listeners
    playBtn.addEventListener('click', () => {
        initAudioContext();
        if (audioElement.src) {
            audioElement.play();
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        } else if (songs.length > 0) {
            playSong(currentIndex);
        }
    });

    pauseBtn.addEventListener('click', () => {
        audioElement.pause();
    });

    stopBtn.addEventListener('click', () => {
        audioElement.pause();
        audioElement.currentTime = 0;
    });

    prevBtn.addEventListener('click', () => {
        playSong(currentIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
        playSong(currentIndex + 1);
    });

    audioElement.addEventListener('ended', () => {
        playSong(currentIndex + 1);
    });

    audioElement.addEventListener('timeupdate', () => {
        timeDisplay.textContent = formatTime(audioElement.currentTime);
    });

    volumeSlider.addEventListener('input', (e) => {
        audioElement.volume = e.target.value;
    });

    // Equalizer sliders
    eqBands.forEach((band, index) => {
        band.addEventListener('input', (e) => {
            if (filters[index]) {
                filters[index].gain.value = parseFloat(e.target.value);
            }
        });
    });
});
