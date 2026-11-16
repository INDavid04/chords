////////////////////////////////////
/// Youtube player in background ///
////////////////////////////////////

let ytPlayer = null;
let currentPlayingTitle = null;
let isAPIReady = false;

/// Adauga script in html -> https://developers.google.com/youtube/iframe_api_reference
(function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

/// Seteaza variabila isAPIReady dupa descarcarea API-ului
window.onYouTubeIframeAPIReady = function() {
    isAPIReady = true;
};

/// Creeaza containerul si initializeaza playerul
function initializePlayer(videoId, callback) {
    let container = document.getElementById('youtube-player-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'youtube-player-container';
        /// Ascuns doar vizual
        container.style.position = 'fixed';
        container.style.width = '200px';
        container.style.height = '200px';
        container.style.left = '-500px';
        container.style.top = '-500px';
        container.style.opacity = '0.01';
        document.body.appendChild(container);
    }

    /// Div ce va fi transformat in iframe de catre api
    const playerDiv = document.createElement('div');
    playerDiv.id = 'yt-placeholder';
    container.appendChild(playerDiv);

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

/// Extrage id din youtube link
function getYouTubeId(url) {
    if (!url || url === 'LINK') return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/// Play/Pause
function playYouTubeVideo(titleElement, youtubeUrl) {
    /// Verifica api
    if (!isAPIReady) {
        console.log("YouTube API se încarcă încă... mai încearcă o dată.");
        return;
    }

    /// Verifica youtube id
    const videoId = getYouTubeId(youtubeUrl);
    if (!videoId) {
        alert('Link-ul de YouTube adăugat nu este valid!');
        return;
    }

    /// Daca dam click pe o piesa care ruleaza
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

    /// Daca era o alta piesa pornita anterior
    if (currentPlayingTitle) {
        currentPlayingTitle.classList.remove('playing');
    }

    /// La prima rulare
    if (!ytPlayer) {
        initializePlayer(videoId, () => {
            titleElement.classList.add('playing');
            currentPlayingTitle = titleElement;
        });
    } else {
        ytPlayer.loadVideoById(videoId);
        ytPlayer.playVideo();
        titleElement.classList.add('playing');
        currentPlayingTitle = titleElement;
    }
}

///////////////////////////////////
/// Move the section to the top ///
///////////////////////////////////

function totop(target) {
    const element = target.currentTarget ? target.currentTarget : target;
    const section = element.closest('section');
    if (section) {
        const parentContainer = section.parentElement;
        parentContainer.prepend(section);
    }
}

/////////////////////
/// Search a song ///
/////////////////////

function searchText() {
    const searchInput = document.getElementById('searchInput');
    const searchText = searchInput.value.trim().toLowerCase();
    const h2Elements = document.querySelectorAll('section h2');
    
    if (searchText === '') {
        return;
    }
    
    let found = false;
    h2Elements.forEach(function(h2) {
        const text = h2.textContent.trim().toLowerCase();
        if (text.includes(searchText)) {
            found = true;
            const section = h2.closest('section');
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
    });
}

function playTheSong(event) {
    if (event.key === 'Enter') {
        const searchInput = document.getElementById('searchInput');
        const searchInputLower = searchInput.value.trim().toLowerCase();

        if (searchInputLower === '') {
            return;
        }

        const songTitles = document.querySelectorAll('h2[data-youtube]');
        let matchedTitle = null;

        songTitles.forEach(function(title) {
            const text = title.textContent.trim().toLowerCase();
            if (text.includes(searchInputLower) && !matchedTitle) {
                matchedTitle = title;
            }
        });

        if (matchedTitle) {
            const youtubeurl = matchedTitle.getAttribute('data-youtube');

            totop(matchedTitle);

            const section = matchedTitle.closest('section');
            if (section) {
                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }

            if (youtubeurl) {
                playYouTubeVideo(matchedTitle, youtubeurl);
            }
        }

        searchInput.value = '';
    }
}

///////////
/// DOM ///
///////////

document.addEventListener('DOMContentLoaded', function() {
    const toTopButtons = document.querySelectorAll('.add input[type="checkbox"]');
    toTopButtons.forEach(function(checkbox) {
        checkbox.addEventListener('change', totop);
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keydown', playTheSong);
    }

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
