// Global state pentru YouTube Player API
let ytPlayer = null;
let currentPlayingTitle = null;
let isAPIReady = false;

// 1. Încărcăm asincron scriptul oficial YouTube API
(function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

// Funcție specială cerută de YouTube care se execută când API-ul e gata
window.onYouTubeIframeAPIReady = function() {
    isAPIReady = true;
};

// Creează containerul ascuns și inițializează playerul global
function initializePlayer(videoId, callback) {
    let container = document.getElementById('youtube-player-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'youtube-player-container';
        // Îl ascundem vizual, dar îl lăsăm în DOM ca să poată rula
        container.style.position = 'fixed';
        container.style.width = '200px'; // Unele browsere blochează la 1px
        container.style.height = '200px';
        container.style.left = '-500px';
        container.style.top = '-500px';
        container.style.opacity = '0.01'; // 0 absolut poate declanșa blocaje de vizibilitate
        document.body.appendChild(container);
    }

    // Creăm un div gol în interior pe care API-ul îl va transforma în iframe
    const playerDiv = document.createElement('div');
    playerDiv.id = 'yt-placeholder';
    container.appendChild(playerDiv);

    // Inițializăm obiectul YT.Player
    ytPlayer = new YT.Player('yt-placeholder', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'rel': 0
        },
        events: {
            'onReady': (event) => {
                event.target.playVideo();
                if (callback) callback();
            }
        }
    });
}

// Extragere ID YouTube
function getYouTubeId(url) {
    if (!url || url === 'LINK') return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Funcția principală de Play/Pause
function playYouTubeVideo(titleElement, youtubeUrl) {
    if (!isAPIReady) {
        console.log("YouTube API se încarcă încă... mai încearcă o dată.");
        return;
    }

    const videoId = getYouTubeId(youtubeUrl);
    if (!videoId) {
        alert('Link-ul de YouTube adăugat nu este valid!');
        return;
    }

    // Toggle: Dacă dăm click pe aceeași piesă care cântă deja
    if (currentPlayingTitle === titleElement) {
        if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
            const state = ytPlayer.getPlayerState();
            if (state === YT.PlayerState.PLAYING) {
                ytPlayer.pauseVideo();
                titleElement.classList.remove('playing');
            } else {
                ytPlayer.playVideo();
                titleElement.classList.add('playing');
            }
        }
        return;
    }

    // Schimbăm piesa curentă
    if (currentPlayingTitle) {
        currentPlayingTitle.classList.remove('playing');
    }

    if (!ytPlayer) {
        // Prima rulare: inițializăm playerul complet
        initializePlayer(videoId, () => {
            titleElement.classList.add('playing');
            currentPlayingTitle = titleElement;
        });
    } else {
        // Playerul există deja, doar încărcăm noul video în el
        ytPlayer.loadVideoById(videoId);
        ytPlayer.playVideo();
        titleElement.classList.add('playing');
        currentPlayingTitle = titleElement;
    }
}

// Funcția To Top
function totop(event) {
    const label = event.currentTarget;
    const section = label.closest('section');
    if (section) {
        const parentContainer = section.parentElement;
        parentContainer.prepend(section);
    }
}

// Evenimentele DOM
document.addEventListener('DOMContentLoaded', function() {
    const addButtons = document.querySelectorAll('.add input[type="checkbox"]');
    addButtons.forEach(checkbox => checkbox.addEventListener('change', totop));

    const songTitles = document.querySelectorAll('h2[data-youtube]');
    songTitles.forEach(title => {
        title.addEventListener('click', function() {
            const youtubeUrl = this.getAttribute('data-youtube');
            if (youtubeUrl) {
                playYouTubeVideo(this, youtubeUrl);
            }
        });
    });
});
