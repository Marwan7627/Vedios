/* script.js */

/**
 * YouTube Local Video Player - Comprehensive Client-Side Application
 * Vanilla JavaScript implementation with LocalStorage persistence.
 */

// Application State Store
const state = {
    videos: [],              // Array of video objects: { id, file, url, title, duration, views, date, thumbnail, subtitles }
    currentVideoIndex: -1,
    isPlaying: false,
    volume: 1.0,
    isMuted: false,
    playbackSpeed: 1.0,
    history: [],             // Watch history array of video IDs
    continueWatching: {},    // Map of videoId -> last timestamp position
    playlists: [],           // Array of playlist objects: { id, name, videoIds }
    comments: {},            // Map of videoId -> array of comment objects
    bookmarks: {},           // Map of videoId -> array of bookmark objects { id, time, title }
    subtitles: [],           // Parsed subtitle cues for active video
    activeSubtitleIndex: -1,
    abLoop: { active: false, a: null, b: null },
    filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0 },
    settings: {
        theme: 'dark',
        accent: 'red',
        autoplay: true,
        loop: false,
        rememberPos: true,
        subSize: 'medium',
        subBg: 'semi'
    }
};

// DOM Elements Reference Cache
const DOM = {};

document.addEventListener('DOMContentLoaded', () => {
    cacheDOM();
    loadStateFromLocalStorage();
    applySettingsToDOM();
    initEventListeners();
    renderPlaylists();
    renderHistory();
    renderQueue();
});

function cacheDOM() {
    DOM.video = document.getElementById('main-video');
    DOM.videoWrapper = document.getElementById('video-wrapper');
    DOM.playerContainer = document.getElementById('player-container');
    DOM.appLayout = document.querySelector('.app-layout');
    DOM.controlsOverlay = document.getElementById('controls-overlay');
    DOM.playPauseBtn = document.getElementById('play-pause-btn');
    DOM.nextBtn = document.getElementById('next-btn');
    DOM.muteBtn = document.getElementById('mute-btn');
    DOM.volumeSlider = document.getElementById('volume-slider');
    DOM.currentTime = document.getElementById('current-time');
    DOM.totalDuration = document.getElementById('total-duration');
    DOM.timelineContainer = document.getElementById('timeline-container');
    DOM.timeline = document.getElementById('timeline');
    DOM.playedProgress = document.getElementById('played-progress');
    DOM.bufferedProgress = document.getElementById('buffered-progress');
    DOM.timelineTooltip = document.getElementById('timeline-tooltip');
    DOM.tooltipTime = document.getElementById('tooltip-time');
    DOM.previewCanvas = document.getElementById('preview-canvas');
    DOM.thumbnailCanvas = document.getElementById('thumbnail-canvas');
    DOM.markersContainer = document.getElementById('markers-container');
    DOM.subtitleDisplay = document.getElementById('subtitle-display');
    DOM.filterOverlay = document.getElementById('filter-overlay');

    // Controls
    DOM.speedBtn = document.getElementById('speed-btn');
    DOM.speedMenu = document.getElementById('speed-menu');
    DOM.miniPlayerBtn = document.getElementById('mini-player-btn');
    DOM.theaterBtn = document.getElementById('theater-btn');
    DOM.pipBtn = document.getElementById('pip-btn');
    DOM.fullscreenBtn = document.getElementById('fullscreen-btn');
    DOM.abLoopBtn = document.getElementById('ab-loop-btn');
    DOM.filtersBtn = document.getElementById('filters-btn');
    DOM.bookmarkAddBtn = document.getElementById('bookmark-add-btn');
    DOM.subtitlesToggleBtn = document.getElementById('subtitles-toggle-btn');
    DOM.screenshotBtn = document.getElementById('screenshot-btn');

    // Metadata & Info
    DOM.videoTitleHeading = document.getElementById('video-title-heading');
    DOM.videoViews = document.getElementById('video-views');
    DOM.videoDate = document.getElementById('video-date');
    DOM.descBox = document.getElementById('desc-box');
    DOM.descContent = document.getElementById('desc-content');
    DOM.descToggleBtn = document.getElementById('desc-toggle-btn');
    DOM.likeBtn = document.getElementById('like-btn');
    DOM.dislikeBtn = document.getElementById('dislike-btn');
    DOM.likeCount = document.getElementById('like-count');
    DOM.shareBtn = document.getElementById('share-btn');
    DOM.downloadBtn = document.getElementById('download-btn');
    DOM.savePlaylistModalBtn = document.getElementById('save-playlist-modal-btn');

    // Import & Search
    DOM.importBtn = document.getElementById('import-btn');
    DOM.filePicker = document.getElementById('file-picker');
    DOM.folderPicker = document.getElementById('folder-picker');
    DOM.subtitlePicker = document.getElementById('subtitle-picker');
    DOM.searchInput = document.getElementById('search-input');
    DOM.dropzone = document.getElementById('dropzone');

    // Queue & Tabs
    DOM.videoQueueList = document.getElementById('video-queue-list');
    DOM.clearLibraryBtn = document.getElementById('clear-library-btn');
    DOM.tabBtns = document.querySelectorAll('.tab-btn');
    DOM.tabPanes = document.querySelectorAll('.tab-pane');
    DOM.playlistsContainer = document.getElementById('playlists-container');
    DOM.newPlaylistName = document.getElementById('new-playlist-name');
    DOM.createPlaylistBtn = document.getElementById('create-playlist-btn');
    DOM.continueWatchingList = document.getElementById('continue-watching-list');
    DOM.historyList = document.getElementById('history-list');
    DOM.clearHistoryBtn = document.getElementById('clear-history-btn');

    // Bookmarks & Comments
    DOM.bookmarksList = document.getElementById('bookmarks-list');
    DOM.commentsCount = document.getElementById('comments-count');
    DOM.commentInput = document.getElementById('comment-input');
    DOM.commentFormActions = document.getElementById('comment-form-actions');
    DOM.commentCancelBtn = document.getElementById('comment-cancel-btn');
    DOM.commentSubmitBtn = document.getElementById('comment-submit-btn');
    DOM.commentsList = document.getElementById('comments-list');
    DOM.sortCommentsSelect = document.getElementById('sort-comments-select');

    // Modals
    DOM.filtersModal = document.getElementById('filters-modal');
    DOM.closeFiltersModal = document.getElementById('close-filters-modal');
    DOM.applyFiltersBtn = document.getElementById('apply-filters-btn');
    DOM.resetFiltersBtn = document.getElementById('reset-filters-btn');
    DOM.playlistModal = document.getElementById('playlist-modal');
    DOM.closePlaylistModal = document.getElementById('close-playlist-modal');
    DOM.modalPlaylistsList = document.getElementById('modal-playlists-list');
    DOM.settingsToggle = document.getElementById('settings-toggle');
    DOM.settingsModal = document.getElementById('settings-modal');
    DOM.closeSettingsModal = document.getElementById('close-settings-modal');
    DOM.shortcutHelpBtn = document.getElementById('shortcut-help-btn');
    DOM.shortcutModal = document.getElementById('shortcut-modal');
    DOM.closeShortcutModal = document.getElementById('close-shortcut-modal');
    DOM.importSubtitleFileBtn = document.getElementById('import-subtitle-file-btn');

    // Settings inputs
    DOM.settingTheme = document.getElementById('setting-theme');
    DOM.settingAccent = document.getElementById('setting-accent');
    DOM.settingAutoplay = document.getElementById('setting-autoplay');
    DOM.settingLoop = document.getElementById('setting-loop');
    DOM.settingRememberPos = document.getElementById('setting-remember-pos');
    DOM.settingSubSize = document.getElementById('setting-sub-size');
    DOM.settingSubBg = document.getElementById('setting-sub-bg');
}

/* ===========================
   Local Storage & Persistence
   =========================== */
function saveStateToLocalStorage() {
    try {
        localStorage.setItem('yt_local_history', JSON.stringify(state.history));
        localStorage.setItem('yt_local_continue', JSON.stringify(state.continueWatching));
        localStorage.setItem('yt_local_playlists', JSON.stringify(state.playlists));
        localStorage.setItem('yt_local_comments', JSON.stringify(state.comments));
        localStorage.setItem('yt_local_bookmarks', JSON.stringify(state.bookmarks));
        localStorage.setItem('yt_local_settings', JSON.stringify(state.settings));
        localStorage.setItem('yt_local_volume', state.volume);
        localStorage.setItem('yt_local_speed', state.playbackSpeed);
        if (state.currentVideoIndex >= 0 && state.videos[state.currentVideoIndex]) {
            localStorage.setItem('yt_local_last_video', state.videos[state.currentVideoIndex].id);
        }
    } catch (e) {
        console.error("LocalStorage persistence error:", e);
    }
}

function loadStateFromLocalStorage() {
    try {
        const history = localStorage.getItem('yt_local_history');
        if (history) state.history = JSON.parse(history);

        const cont = localStorage.getItem('yt_local_continue');
        if (cont) state.continueWatching = JSON.parse(cont);

        const pl = localStorage.getItem('yt_local_playlists');
        if (pl) state.playlists = JSON.parse(pl);
        else {
            state.playlists = [{ id: 'favs', name: 'Favorites', videoIds: [] }];
        }

        const comm = localStorage.getItem('yt_local_comments');
        if (comm) state.comments = JSON.parse(comm);

        const bm = localStorage.getItem('yt_local_bookmarks');
        if (bm) state.bookmarks = JSON.parse(bm);

        const sett = localStorage.getItem('yt_local_settings');
        if (sett) state.settings = { ...state.settings, ...JSON.parse(sett) };

        const vol = localStorage.getItem('yt_local_volume');
        if (vol !== null) {
            state.volume = parseFloat(vol);
            DOM.video.volume = state.volume;
            DOM.volumeSlider.value = state.volume;
        }

        const spd = localStorage.getItem('yt_local_speed');
        if (spd !== null) {
            state.playbackSpeed = parseFloat(spd);
            DOM.video.playbackRate = state.playbackSpeed;
            DOM.speedBtn.textContent = state.playbackSpeed + 'x';
        }
    } catch (e) {
        console.error("Error loading localStorage:", e);
    }
}

function applySettingsToDOM() {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    document.documentElement.setAttribute('data-accent', state.settings.accent);
    DOM.settingTheme.value = state.settings.theme;
    DOM.settingAccent.value = state.settings.accent;
    DOM.settingAutoplay.checked = state.settings.autoplay;
    DOM.settingLoop.checked = state.settings.loop;
    DOM.settingRememberPos.checked = state.settings.rememberPos;
    DOM.settingSubSize.value = state.settings.subSize;
    DOM.settingSubBg.value = state.settings.subBg;
}

/* ===========================
   Event Listeners Setup
   =========================== */
function initEventListeners() {
    // Video native events
    DOM.video.addEventListener('play', onVideoPlay);
    DOM.video.addEventListener('pause', onVideoPause);
    DOM.video.addEventListener('timeupdate', onVideoTimeUpdate);
    DOM.video.addEventListener('progress', onVideoProgress);
    DOM.video.addEventListener('loadedmetadata', onVideoLoadedMetadata);
    DOM.video.addEventListener('ended', onVideoEnded);

    // Control bar buttons
    DOM.playPauseBtn.addEventListener('click', togglePlay);
    DOM.video.addEventListener('click', togglePlay);
    DOM.nextBtn.addEventListener('click', playNextVideo);
    DOM.muteBtn.addEventListener('click', toggleMute);
    DOM.volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));
    
    // Timeline scrubbing & hover
    DOM.timelineContainer.addEventListener('click', seekVideo);
    DOM.timelineContainer.addEventListener('mousemove', handleTimelineHover);
    DOM.timelineContainer.addEventListener('mouseleave', () => { DOM.timelineTooltip.style.display = 'none'; });

    // Player Toggles
    DOM.speedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = DOM.speedBtn.getBoundingClientRect();
        DOM.speedMenu.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
        DOM.speedMenu.style.left = rect.left + 'px';
        DOM.speedMenu.style.display = DOM.speedMenu.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', () => { DOM.speedMenu.style.display = 'none'; });
    DOM.speedMenu.querySelectorAll('[data-speed]').forEach(item => {
        item.addEventListener('click', (e) => {
            setPlaybackSpeed(parseFloat(e.target.getAttribute('data-speed')));
        });
    });

    DOM.miniPlayerBtn.addEventListener('click', toggleMiniPlayer);
    DOM.theaterBtn.addEventListener('click', toggleTheaterMode);
    DOM.pipBtn.addEventListener('click', togglePiP);
    DOM.fullscreenBtn.addEventListener('click', toggleFullscreen);
    DOM.abLoopBtn.addEventListener('click', toggleABLoopMarker);
    DOM.filtersBtn.addEventListener('click', () => { DOM.filtersModal.style.display = 'flex'; });
    DOM.bookmarkAddBtn.addEventListener('click', addBookmark);
    DOM.subtitlesToggleBtn.addEventListener('click', toggleSubtitlesDisplay);
    DOM.screenshotBtn.addEventListener('click', takeScreenshot);

    // Auto-hide controls
    let hideTimeout;
    DOM.videoWrapper.addEventListener('mousemove', () => {
        DOM.videoWrapper.classList.remove('hide-controls');
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            if (state.isPlaying) DOM.videoWrapper.classList.add('hide-controls');
        }, 2500);
    });

    // Mouse wheel volume over player
    DOM.videoWrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        let newVol = state.volume + (e.deltaY < 0 ? 0.05 : -0.05);
        setVolume(Math.max(0, Math.min(1, newVol)));
        DOM.volumeSlider.value = state.volume;
    }, { passive: false });

    // Double click fullscreen
    DOM.videoWrapper.addEventListener('dblclick', toggleFullscreen);

    // Import Buttons
    DOM.importBtn.addEventListener('click', () => DOM.filePicker.click());
    DOM.filePicker.addEventListener('change', (e) => handleFilesImport(e.target.files));
    DOM.folderPicker.addEventListener('change', (e) => handleFilesImport(e.target.files));

    // Drag and drop zone
    DOM.dropzone.addEventListener('dragover', (e) => { e.preventDefault(); DOM.dropzone.style.borderColor = 'var(--accent-color)'; });
    DOM.dropzone.addEventListener('dragleave', () => { DOM.dropzone.style.borderColor = 'var(--border-color)'; });
    DOM.dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        DOM.dropzone.style.borderColor = 'var(--border-color)';
        if (e.dataTransfer.files) handleFilesImport(e.dataTransfer.files);
    });

    // Search
    DOM.searchInput.addEventListener('input', (e) => filterQueue(e.target.value));

    // Tabs switching
    DOM.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.tabBtns.forEach(b => b.classList.remove('active'));
            DOM.tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.getAttribute('data-tab')).classList.add('active');
        });
    });

    // Description expand
    DOM.descToggleBtn.addEventListener('click', () => {
        DOM.descBox.classList.toggle('expanded');
        DOM.descToggleBtn.textContent = DOM.descBox.classList.contains('expanded') ? 'Show less' : 'Show more';
    });

    // Action buttons simulation
    DOM.likeBtn.addEventListener('click', () => {
        DOM.likeBtn.classList.toggle('liked');
        let count = parseInt(DOM.likeCount.textContent);
        DOM.likeCount.textContent = DOM.likeBtn.classList.contains('liked') ? count + 1 : count - 1;
    });
    DOM.shareBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Video link copied to clipboard!');
    });
    DOM.downloadBtn.addEventListener('click', () => {
        if (state.currentVideoIndex >= 0) {
            const v = state.videos[state.currentVideoIndex];
            const a = document.createElement('a');
            a.href = v.url;
            a.download = v.title;
            a.click();
        }
    });

    // Playlists Tab
    DOM.createPlaylistBtn.addEventListener('click', () => {
        const name = DOM.newPlaylistName.value.trim();
        if (name) {
            state.playlists.push({ id: 'pl_' + Date.now(), name, videoIds: [] });
            DOM.newPlaylistName.value = '';
            renderPlaylists();
            saveStateToLocalStorage();
        }
    });

    // Save to Playlist Modal
    DOM.savePlaylistModalBtn.addEventListener('click', () => {
        if (state.currentVideoIndex < 0) return alert('Select a video first!');
        renderModalPlaylists();
        DOM.playlistModal.style.display = 'flex';
    });
    DOM.closePlaylistModal.addEventListener('click', () => DOM.playlistModal.style.display = 'none');

    // Comments System
    DOM.commentInput.addEventListener('focus', () => DOM.commentFormActions.style.display = 'flex');
    DOM.commentInput.addEventListener('input', (e) => {
        DOM.commentSubmitBtn.disabled = e.target.value.trim().length === 0;
    });
    DOM.commentCancelBtn.addEventListener('click', () => {
        DOM.commentInput.value = '';
        DOM.commentFormActions.style.display = 'none';
        DOM.commentSubmitBtn.disabled = true;
    });
    DOM.commentSubmitBtn.addEventListener('click', addComment);
    DOM.sortCommentsSelect.addEventListener('change', renderComments);

    // Filters Modal
    DOM.closeFiltersModal.addEventListener('click', () => DOM.filtersModal.style.display = 'none');
    ['brightness', 'contrast', 'saturation', 'blur'].forEach(f => {
        const slider = document.getElementById('filter-' + f);
        slider.addEventListener('input', (e) => {
            state.filters[f] = e.target.value;
            document.getElementById('val-' + f).textContent = e.target.value;
            applyVideoFilters();
        });
    });
    DOM.resetFiltersBtn.addEventListener('click', resetFilters);
    DOM.applyFiltersBtn.addEventListener('click', () => DOM.filtersModal.style.display = 'none');

    // Settings Modal
    DOM.settingsToggle.addEventListener('click', () => DOM.settingsModal.style.display = 'flex');
    DOM.closeSettingsModal.addEventListener('click', () => DOM.settingsModal.style.display = 'none');
    DOM.settingTheme.addEventListener('change', (e) => { state.settings.theme = e.target.value; applySettingsToDOM(); saveStateToLocalStorage(); });
    DOM.settingAccent.addEventListener('change', (e) => { state.settings.accent = e.target.value; applySettingsToDOM(); saveStateToLocalStorage(); });
    DOM.settingAutoplay.addEventListener('change', (e) => { state.settings.autoplay = e.target.checked; saveStateToLocalStorage(); });
    DOM.settingLoop.addEventListener('change', (e) => { state.settings.loop = e.target.checked; DOM.video.loop = e.target.checked; saveStateToLocalStorage(); });
    DOM.settingRememberPos.addEventListener('change', (e) => { state.settings.rememberPos = e.target.checked; saveStateToLocalStorage(); });
    DOM.settingSubSize.addEventListener('change', (e) => { state.settings.subSize = e.target.value; saveStateToLocalStorage(); });
    DOM.settingSubBg.addEventListener('change', (e) => { state.settings.subBg = e.target.value; saveStateToLocalStorage(); });

    // Subtitle import
    DOM.importSubtitleFileBtn.addEventListener('click', () => DOM.subtitlePicker.click());
    DOM.subtitlePicker.addEventListener('change', (e) => handleSubtitleImport(e.target.files[0]));

    // Keyboard Shortcuts Modal
    DOM.shortcutHelpBtn.addEventListener('click', () => DOM.shortcutModal.style.display = 'flex');
    DOM.closeShortcutModal.addEventListener('click', () => DOM.shortcutModal.style.display = 'none');

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    DOM.clearLibraryBtn.addEventListener('click', clearLibrary);
    DOM.clearHistoryBtn.addEventListener('click', clearHistory);
}

/* ===========================
   Video Playback & Core Logic
   =========================== */
function handleFilesImport(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name)) {
            const videoObj = {
                id: 'vid_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
                file: file,
                url: URL.createObjectURL(file),
                title: file.name.replace(/\.[^/.]+$/, ""),
                duration: 0,
                views: Math.floor(Math.random() * 5000) + 120,
                date: new Date().toLocaleDateString(),
                thumbnail: '',
                subtitles: []
            };

            // Generate thumbnail & duration
            generateThumbnail(videoObj, (thumbUrl, duration) => {
                videoObj.thumbnail = thumbUrl;
                videoObj.duration = duration;
                renderQueue();
            });

            state.videos.push(videoObj);
        }
    });

    renderQueue();
    if (state.currentVideoIndex === -1 && state.videos.length > 0) {
        loadVideo(0);
    }
}

function generateThumbnail(videoObj, callback) {
    const tempVid = document.createElement('video');
    tempVid.src = videoObj.url;
    tempVid.crossOrigin = 'anonymous';
    tempVid.muted = true;
    tempVid.currentTime = 2; // Grab frame at 2 seconds

    tempVid.addEventListener('loadeddata', () => {
        tempVid.currentTime = Math.min(2, tempVid.duration / 2);
    });

    tempVid.addEventListener('seeked', () => {
        const canvas = DOM.thumbnailCanvas;
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(tempVid, 0, 0, canvas.width, canvas.height);
        const thumbUrl = canvas.toDataURL('image/jpeg');
        callback(thumbUrl, tempVid.duration);
    });

    tempVid.addEventListener('error', () => {
        callback('', 0);
    });
}

function loadVideo(index) {
    if (index < 0 || index >= state.videos.length) return;
    state.currentVideoIndex = index;
    const v = state.videos[index];

    DOM.video.src = v.url;
    DOM.videoTitleHeading.textContent = v.title;
    DOM.videoViews.textContent = `${v.views.toLocaleString()} views`;
    DOM.videoDate.textContent = `Imported on ${v.date}`;
    DOM.subtitles = v.subtitles || [];

    // Check continue watching
    if (state.settings.rememberPos && state.continueWatching[v.id]) {
        DOM.video.currentTime = state.continueWatching[v.id];
    }

    DOM.video.play().catch(() => {});

    // Update History
    state.history = state.history.filter(id => id !== v.id);
    state.history.unshift(v.id);

    renderQueue();
    renderHistory();
    renderBookmarks();
    renderComments();
    saveStateToLocalStorage();
}

function onVideoPlay() {
    state.isPlaying = true;
    DOM.playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
}

function onVideoPause() {
    state.isPlaying = false;
    DOM.playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
}

function togglePlay() {
    if (DOM.video.paused) {
        DOM.video.play();
    } else {
        DOM.video.pause();
    }
}

function playNextVideo() {
    if (state.videos.length === 0) return;
    const nextIdx = (state.currentVideoIndex + 1) % state.videos.length;
    loadVideo(nextIdx);
}

function toggleMute() {
    DOM.video.muted = !DOM.video.muted;
    if (DOM.video.muted) {
        DOM.muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        DOM.volumeSlider.value = 0;
    } else {
        DOM.muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        DOM.volumeSlider.value = state.volume;
    }
}

function setVolume(val) {
    state.volume = parseFloat(val);
    DOM.video.volume = state.volume;
    DOM.video.muted = state.volume === 0;
    DOM.muteBtn.innerHTML = state.volume === 0 ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
    saveStateToLocalStorage();
}

function setPlaybackSpeed(speed) {
    state.playbackSpeed = speed;
    DOM.video.playbackRate = speed;
    DOM.speedBtn.textContent = speed + 'x';
    DOM.speedMenu.querySelectorAll('[data-speed]').forEach(el => {
        el.classList.toggle('selected', parseFloat(el.getAttribute('data-speed')) === speed);
    });
    saveStateToLocalStorage();
}

function onVideoLoadedMetadata() {
    DOM.totalDuration.textContent = formatTime(DOM.video.duration);
}

function onVideoTimeUpdate() {
    const current = DOM.video.currentTime;
    const duration = DOM.video.duration;
    DOM.currentTime.textContent = formatTime(current);
    
    if (duration > 0) {
        const percent = (current / duration) * 100;
        DOM.playedProgress.style.width = percent + '%';
    }

    // Save continue watching
    if (state.currentVideoIndex >= 0 && state.videos[state.currentVideoIndex]) {
        const vId = state.videos[state.currentVideoIndex].id;
        if (current > 5 && current < duration - 5) {
            state.continueWatching[vId] = current;
            saveStateToLocalStorage();
        }
    }

    // A-B Loop Check
    if (state.abLoop.active && state.abLoop.a !== null && state.abLoop.b !== null) {
        if (current >= state.abLoop.b || current < state.abLoop.a) {
            DOM.video.currentTime = state.abLoop.a;
        }
    }

    // Subtitles update
    updateSubtitles(current);
}

function onVideoProgress() {
    if (DOM.video.buffered.length > 0 && DOM.video.duration > 0) {
        const bufferedEnd = DOM.video.buffered.end(DOM.video.buffered.length - 1);
        const percent = (bufferedEnd / DOM.video.duration) * 100;
        DOM.bufferedProgress.style.width = percent + '%';
    }
}

function onVideoEnded() {
    if (state.settings.loop) {
        DOM.video.play();
        return;
    }
    if (state.settings.autoplay) {
        playNextVideo();
    }
}

function seekVideo(e) {
    const rect = DOM.timeline.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    DOM.video.currentTime = pos * DOM.video.duration;
}

function handleTimelineHover(e) {
    const rect = DOM.timeline.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const hoverTime = pos * DOM.video.duration;

    DOM.tooltipTime.textContent = formatTime(hoverTime);
    DOM.timelineTooltip.style.display = 'flex';
    DOM.timelineTooltip.style.left = (e.clientX - rect.left) + 'px';

    // Render preview frame on tooltip canvas
    if (state.currentVideoIndex >= 0) {
        const tempVid = document.createElement('video');
        tempVid.src = state.videos[state.currentVideoIndex].url;
        tempVid.currentTime = hoverTime;
        tempVid.addEventListener('seeked', () => {
            const ctx = DOM.previewCanvas.getContext('2d');
            ctx.drawImage(tempVid, 0, 0, DOM.previewCanvas.width, DOM.previewCanvas.height);
        }, { once: true });
    }
}

/* ===========================
   Player Features (Toggles)
   =========================== */
function toggleTheaterMode() {
    DOM.appLayout.classList.toggle('theater-mode');
}

function toggleMiniPlayer() {
    document.body.classList.toggle('mini-player-mode');
}

async function togglePiP() {
    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
            await DOM.video.requestPictureInPicture();
        }
    } catch (e) {
        console.error("PiP error:", e);
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        DOM.playerContainer.requestFullscreen().catch(err => alert(err.message));
        DOM.fullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
    } else {
        document.exitFullscreen();
        DOM.fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
    }
}

function toggleABLoopMarker() {
    const current = DOM.video.currentTime;
    if (!state.abLoop.active || (state.abLoop.a !== null && state.abLoop.b !== null)) {
        state.abLoop = { active: true, a: current, b: null };
        DOM.abLoopBtn.style.color = 'var(--accent-color)';
        alert(`A-B Loop Point A set at ${formatTime(current)}. Click again to set Point B.`);
    } else {
        if (current <= state.abLoop.a) {
            alert('Point B must be after Point A!');
            return;
        }
        state.abLoop.b = current;
        DOM.abLoopBtn.style.color = '#00e676';
        alert(`A-B Loop Active from ${formatTime(state.abLoop.a)} to ${formatTime(state.abLoop.b)}`);
        renderMarkers();
    }
}

function resetABLoop() {
    state.abLoop = { active: false, a: null, b: null };
    DOM.abLoopBtn.style.color = '#fff';
    renderMarkers();
}

function applyVideoFilters() {
    const f = state.filters;
    DOM.video.style.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px)`;
}

function resetFilters() {
    state.filters = { brightness: 100, contrast: 100, saturation: 100, blur: 0 };
    ['brightness', 'contrast', 'saturation', 'blur'].forEach(f => {
        document.getElementById('filter-' + f).value = state.filters[f];
        document.getElementById('val-' + f).textContent = state.filters[f];
    });
    applyVideoFilters();
}

function takeScreenshot() {
    if (state.currentVideoIndex < 0) return;
    const canvas = DOM.thumbnailCanvas;
    canvas.width = DOM.video.videoWidth || 1280;
    canvas.height = DOM.video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(DOM.video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${state.videos[state.currentVideoIndex].title}_screenshot.png`;
    a.click();
}

/* ===========================
   Subtitles Support
   =========================== */
function handleSubtitleImport(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const cues = parseSRTOrVTT(text);
        if (state.currentVideoIndex >= 0) {
            state.videos[state.currentVideoIndex].subtitles = cues;
            state.subtitles = cues;
            alert('Subtitles loaded successfully!');
        }
    };
    reader.readAsText(file);
}

function parseSRTOrVTT(data) {
    const cues = [];
    const lines = data.split(/\r?\n/);
    let currentCue = null;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.includes('-->')) {
            const parts = line.split('-->');
            currentCue = {
                start: parseTimestamp(parts[0].trim()),
                end: parseTimestamp(parts[1].trim()),
                text: ''
            };
            i++;
            while (i < lines.length && lines[i].trim() !== '') {
                currentCue.text += (currentCue.text ? '<br>' : '') + lines[i].trim();
                i++;
            }
            cues.push(currentCue);
        }
    }
    return cues;
}

function parseTimestamp(tStr) {
    const parts = tStr.split(':');
    let seconds = 0;
    if (parts.length === 3) {
        seconds += parseInt(parts[0]) * 3600;
        seconds += parseInt(parts[1]) * 60;
        seconds += parseFloat(parts[2].replace(',', '.'));
    } else if (parts.length === 2) {
        seconds += parseInt(parts[0]) * 60;
        seconds += parseFloat(parts[1].replace(',', '.'));
    }
    return seconds;
}

function updateSubtitles(currentTime) {
    if (!state.subtitles || state.subtitles.length === 0) {
        DOM.subtitleDisplay.style.display = 'none';
        return;
    }
    const cue = state.subtitles.find(c => currentTime >= c.start && currentTime <= c.end);
    if (cue) {
        DOM.subtitleDisplay.innerHTML = cue.text;
        DOM.subtitleDisplay.style.display = 'block';
        applySubtitleStyles();
    } else {
        DOM.subtitleDisplay.style.display = 'none';
    }
}

function toggleSubtitlesDisplay() {
    if (DOM.subtitleDisplay.style.display === 'none' && state.subtitles.length > 0) {
        DOM.subtitleDisplay.style.display = 'block';
    } else {
        DOM.subtitleDisplay.style.display = 'none';
    }
}

function applySubtitleStyles() {
    const size = state.settings.subSize;
    const bg = state.settings.subBg;

    DOM.subtitleDisplay.style.fontSize = size === 'small' ? '0.9rem' : size === 'large' ? '1.5rem' : '1.2rem';
    DOM.subtitleDisplay.style.background = bg === 'solid' ? '#000' : bg === 'transparent' ? 'transparent' : 'rgba(0, 0, 0, 0.7)';
}

/* ===========================
   Bookmarks & Comments
   =========================== */
function addBookmark() {
    if (state.currentVideoIndex < 0) return;
    const vId = state.videos[state.currentVideoIndex].id;
    const time = DOM.video.currentTime;
    const title = prompt('Enter bookmark label/note:', `Bookmark at ${formatTime(time)}`);
    if (title === null) return;

    if (!state.bookmarks[vId]) state.bookmarks[vId] = [];
    state.bookmarks[vId].push({ id: 'bm_' + Date.now(), time, title });
    state.bookmarks[vId].sort((a, b) => a.time - b.time);

    renderBookmarks();
    renderMarkers();
    saveStateToLocalStorage();
}

function renderBookmarks() {
    if (state.currentVideoIndex < 0) {
        DOM.bookmarksList.innerHTML = '<p class="empty-state-text">No video selected.</p>';
        return;
    }
    const vId = state.videos[state.currentVideoIndex].id;
    const bms = state.bookmarks[vId] || [];

    if (bms.length === 0) {
        DOM.bookmarksList.innerHTML = '<p class="empty-state-text">No bookmarks added yet.</p>';
        return;
    }

    DOM.bookmarksList.innerHTML = bms.map(bm => `
        <div class="bookmark-item" onclick="jumpToTime(${bm.time})">
            <div class="bookmark-info">
                <span class="bookmark-time">${formatTime(bm.time)}</span>
                <span>${bm.title}</span>
            </div>
            <button class="icon-btn" onclick="event.stopPropagation(); deleteBookmark('${bm.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
}

function deleteBookmark(bmId) {
    if (state.currentVideoIndex < 0) return;
    const vId = state.videos[state.currentVideoIndex].id;
    state.bookmarks[vId] = state.bookmarks[vId].filter(b => b.id !== bmId);
    renderBookmarks();
    renderMarkers();
    saveStateToLocalStorage();
}

function jumpToTime(time) {
    DOM.video.currentTime = time;
}

function renderMarkers() {
    DOM.markersContainer.innerHTML = '';
    if (state.currentVideoIndex < 0) return;
    const vId = state.videos[state.currentVideoIndex].id;
    const bms = state.bookmarks[vId] || [];
    const duration = DOM.video.duration || 1;

    bms.forEach(bm => {
        const percent = (bm.time / duration) * 100;
        const marker = document.createElement('div');
        marker.className = 'timeline-marker';
        marker.style.left = percent + '%';
        DOM.markersContainer.appendChild(marker);
    });

    if (state.abLoop.active && state.abLoop.a !== null) {
        const left = (state.abLoop.a / duration) * 100;
        const right = state.abLoop.b !== null ? (state.abLoop.b / duration) * 100 : left;
        const range = document.createElement('div');
        range.className = 'ab-loop-range';
        range.style.left = left + '%';
        range.style.width = (right - left) + '%';
        DOM.markersContainer.appendChild(range);
    }
}

function addComment() {
    if (state.currentVideoIndex < 0) return;
    const text = DOM.commentInput.value.trim();
    if (!text) return;

    const vId = state.videos[state.currentVideoIndex].id;
    if (!state.comments[vId]) state.comments[vId] = [];

    state.comments[vId].unshift({
        id: 'comm_' + Date.now(),
        author: 'You (Local User)',
        text: text,
        likes: 0,
        date: 'Just now',
        replies: []
    });

    DOM.commentInput.value = '';
    DOM.commentFormActions.style.display = 'none';
    DOM.commentSubmitBtn.disabled = true;
    renderComments();
    saveStateToLocalStorage();
}

function renderComments() {
    if (state.currentVideoIndex < 0) {
        DOM.commentsList.innerHTML = '';
        DOM.commentsCount.textContent = 0;
        return;
    }
    const vId = state.videos[state.currentVideoIndex].id;
    const comms = [...(state.comments[vId] || [])];
    DOM.commentsCount.textContent = comms.length;

    const sortType = DOM.sortCommentsSelect.value;
    if (sortType === 'top') {
        comms.sort((a, b) => b.likes - a.likes);
    }

    DOM.commentsList.innerHTML = comms.map(c => `
        <div class="comment-card">
            <div class="user-avatar-placeholder"><i class="fa-solid fa-user"></i></div>
            <div class="comment-body">
                <span class="comment-author">${c.author} • <span style="color:var(--text-secondary)">${c.date}</span></span>
                <span class="comment-text">${c.text}</span>
                <div class="comment-footer-actions">
                    <button onclick="likeComment('${c.id}')"><i class="fa-solid fa-thumbs-up"></i> ${c.likes}</button>
                    <button><i class="fa-solid fa-thumbs-down"></i></button>
                    <button onclick="deleteComment('${c.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function likeComment(cId) {
    const vId = state.videos[state.currentVideoIndex].id;
    const c = state.comments[vId].find(item => item.id === cId);
    if (c) {
        c.likes++;
        renderComments();
        saveStateToLocalStorage();
    }
}

function deleteComment(cId) {
    const vId = state.videos[state.currentVideoIndex].id;
    state.comments[vId] = state.comments[vId].filter(item => item.id !== cId);
    renderComments();
    saveStateToLocalStorage();
}

/* ===========================
   Playlists, History & Queue UI
   =========================== */
function renderQueue(filteredVideos = null) {
    const list = filteredVideos || state.videos;
    if (list.length === 0) {
        DOM.videoQueueList.innerHTML = '<p class="empty-state-text" style="padding:16px; text-align:center;">No videos in library. Import files or folders above.</p>';
        return;
    }

    DOM.videoQueueList.innerHTML = list.map((v) => {
        const originalIndex = state.videos.findIndex(item => item.id === v.id);
        const isActive = originalIndex === state.currentVideoIndex;
        return `
            <div class="video-queue-item ${isActive ? 'active' : ''}" onclick="loadVideo(${originalIndex})">
                <img src="${v.thumbnail || 'https://via.placeholder.com/160x90?text=No+Thumbnail'}" alt="Thumb">
                <div class="video-queue-details">
                    <span class="video-queue-title" title="${v.title}">${v.title}</span>
                    <span class="video-queue-duration">${formatTime(v.duration)}</span>
                </div>
                <button class="icon-btn" onclick="event.stopPropagation(); removeVideo(${originalIndex})" title="Remove"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;
    }).join('');
}

function filterQuery(query) {
    const q = query.toLowerCase();
    const filtered = state.videos.filter(v => v.title.toLowerCase().includes(q));
    renderQueue(filtered);
}

function removeVideo(index) {
    state.videos.splice(index, 1);
    if (state.currentVideoIndex === index) {
        state.currentVideoIndex = -1;
        DOM.video.src = '';
        DOM.videoTitleHeading.textContent = 'No Video Selected';
    } else if (state.currentVideoIndex > index) {
        state.currentVideoIndex--;
    }
    renderQueue();
}

function clearLibrary() {
    if (confirm('Clear entire video library?')) {
        state.videos = [];
        state.currentVideoIndex = -1;
        DOM.video.src = '';
        DOM.videoTitleHeading.textContent = 'No Video Selected';
        renderQueue();
    }
}

function renderPlaylists() {
    DOM.playlistsContainer.innerHTML = state.playlists.map(pl => `
        <div class="playlist-card">
            <div class="playlist-card-header">
                <span class="playlist-card-title"><i class="fa-solid fa-list"></i> ${pl.name} (${pl.videoIds.length})</span>
                <div>
                    <button class="icon-btn" onclick="renamePlaylist('${pl.id}')" title="Rename"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn" onclick="deletePlaylist('${pl.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="mini-video-list">
                ${pl.videoIds.map(vId => {
                    const v = state.videos.find(item => item.id === vId);
                    if (!v) return '';
                    return `
                        <div class="video-queue-item" onclick="loadVideo(${state.videos.findIndex(i => i.id === vId)})">
                            <img src="${v.thumbnail}" alt="Thumb">
                            <div class="video-queue-details">
                                <span class="video-queue-title">${v.title}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `).join('');
}

function renamePlaylist(plId) {
    const pl = state.playlists.find(p => p.id === plId);
    if (!pl) return;
    const newName = prompt('Enter new playlist name:', pl.name);
    if (newName) {
        pl.name = newName;
        renderPlaylists();
        saveStateToLocalStorage();
    }
}

function deletePlaylist(plId) {
    if (confirm('Delete this playlist?')) {
        state.playlists = state.playlists.filter(p => p.id !== plId);
        renderPlaylists();
        saveStateToLocalStorage();
    }
}

function renderModalPlaylists() {
    DOM.modalPlaylistsList.innerHTML = state.playlists.map(pl => {
        const vId = state.videos[state.currentVideoIndex]?.id;
        const isChecked = pl.videoIds.includes(vId);
        return `
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:0.95rem;">
                <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleVideoInPlaylist('${pl.id}', this.checked)">
                ${pl.name}
            </label>
        `;
    }).join('');
}

function toggleVideoInPlaylist(plId, add) {
    if (state.currentVideoIndex < 0) return;
    const vId = state.videos[state.currentVideoIndex].id;
    const pl = state.playlists.find(p => p.id === plId);
    if (!pl) return;

    if (add) {
        if (!pl.videoIds.includes(vId)) pl.videoIds.push(vId);
    } else {
        pl.videoIds = pl.videoIds.filter(id => id !== vId);
    }
    renderPlaylists();
    saveStateToLocalStorage();
}

function renderHistory() {
    // Continue Watching
    const continueEntries = Object.entries(state.continueWatching);
    DOM.continueWatchingList.innerHTML = continueEntries.map(([vId, time]) => {
        const v = state.videos.find(item => item.id === vId);
        if (!v) return '';
        const idx = state.videos.findIndex(item => item.id === vId);
        return `
            <div class="video-queue-item" onclick="loadVideo(${idx})">
                <img src="${v.thumbnail}" alt="Thumb">
                <div class="video-queue-details">
                    <span class="video-queue-title">${v.title}</span>
                    <span class="video-queue-duration">Resuming at ${formatTime(time)}</span>
                </div>
            </div>
        `;
    }).join('');

    // History List
    DOM.historyList.innerHTML = state.history.map(vId => {
        const v = state.videos.find(item => item.id === vId);
        if (!v) return '';
        const idx = state.videos.findIndex(item => item.id === vId);
        return `
            <div class="video-queue-item" onclick="loadVideo(${idx})">
                <img src="${v.thumbnail}" alt="Thumb">
                <div class="video-queue-details">
                    <span class="video-queue-title">${v.title}</span>
                </div>
            </div>
        `;
    }).join('');
}

function clearHistory() {
    state.history = [];
    state.continueWatching = {};
    renderHistory();
    saveStateToLocalStorage();
}

/* ===========================
   Keyboard Shortcuts Handler
   =========================== */
function handleKeyboardShortcuts(e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    switch (e.code) {
        case 'Space':
        case 'KeyK':
            e.preventDefault();
            togglePlay();
            break;
        case 'KeyJ':
        case 'ArrowLeft':
            e.preventDefault();
            DOM.video.currentTime = Math.max(0, DOM.video.currentTime - 10);
            break;
        case 'KeyL':
        case 'ArrowRight':
            e.preventDefault();
            DOM.video.currentTime = Math.min(DOM.video.duration, DOM.video.currentTime + 10);
            break;
        case 'ArrowUp':
            e.preventDefault();
            setVolume(Math.min(1, state.volume + 0.05));
            DOM.volumeSlider.value = state.volume;
            break;
        case 'ArrowDown':
            e.preventDefault();
            setVolume(Math.max(0, state.volume - 0.05));
            DOM.volumeSlider.value = state.volume;
            break;
        case 'KeyM':
            e.preventDefault();
            toggleMute();
            break;
        case 'KeyF':
            e.preventDefault();
            toggleFullscreen();
            break;
        case 'KeyT':
            e.preventDefault();
            toggleTheaterMode();
            break;
        case 'KeyI':
            e.preventDefault();
            toggleMiniPlayer();
            break;
        case 'KeyC':
            e.preventDefault();
            toggleSubtitlesDisplay();
            break;
        case 'Slash':
            if (e.shiftKey) {
                e.preventDefault();
                DOM.shortcutModal.style.display = 'flex';
            }
            break;
        case 'Escape':
            DOM.shortcutModal.style.display = 'none';
            DOM.settingsModal.style.display = 'none';
            DOM.filtersModal.style.display = 'none';
            DOM.playlistModal.style.display = 'none';
            break;
    }
}

/* ===========================
   Utility Helpers
   =========================== */
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}
