document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('corporateVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseSvg = document.getElementById('playPauseSvg');
    const volumeIcon = document.getElementById('volumeIcon');
    const volumeSvg = document.getElementById('volumeSvg');
    const volumeSlider = document.getElementById('volumeSlider');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const fullscreenSvg = document.getElementById('fullscreenSvg');
    const videoContainer = document.querySelector('.video-container');
    const progressContainer = document.getElementById('progressContainer');
    const progressFilled = document.getElementById('progressFilled');
    const progressBuffered = document.getElementById('progressBuffered');
    const timeDisplay = document.getElementById('timeDisplay');
    const controlsWrapper = document.querySelector('.video-controls-wrapper');
    
    // Vérifier si les éléments existent avant d'ajouter les événements
    if (!video || !playPauseBtn || !playPauseSvg || !volumeIcon || !volumeSvg || 
        !volumeSlider || !fullscreenBtn || !videoContainer || !progressContainer || 
        !progressFilled || !timeDisplay || !controlsWrapper) {
        console.warn('Certains éléments vidéo sont manquants');
        return;
    }
    
    // Variables pour la gestion des contrôles
    let isFullscreen = false;
    let isDragging = false;
    let hideControlsTimeout;
    let isMobile = window.innerWidth <= 768;
    let lastInteraction = Date.now();
    
    // Définir le volume initial
    video.volume = 0.7;
    
    // Fonction pour détecter si on est sur mobile
    function detectMobile() {
        isMobile = window.innerWidth <= 768;
    }
    
    // Fonction pour formater le temps
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
    
    // Fonction pour mettre à jour la barre de progression
    function updateProgress() {
        if (video.duration && !isDragging) {
            const progress = (video.currentTime / video.duration) * 100;
            progressFilled.style.width = progress + '%';
            
            // Mettre à jour l'affichage du temps
            timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
        }
    }
    
    // Fonction pour mettre à jour le buffer
    function updateBuffer() {
        if (video.buffered.length > 0 && video.duration) {
            const buffered = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
            progressBuffered.style.width = buffered + '%';
        }
    }
    
    // Fonction pour afficher les contrôles
    function showControls() {
        lastInteraction = Date.now();
        if (isMobile) {
            controlsWrapper.classList.remove('auto-hide');
            controlsWrapper.classList.add('show');
            controlsWrapper.style.opacity = '1';
        } else {
            controlsWrapper.style.opacity = '1';
        }
        clearTimeout(hideControlsTimeout);
        startHideTimer();
    }
    
    // Fonction pour cacher les contrôles (desktop et mobile)
    function hideControls() {
        if (!isFullscreen && !video.paused) {
            const timeSinceLastInteraction = Date.now() - lastInteraction;
            if (timeSinceLastInteraction >= 4000) { // 4 secondes
                if (isMobile) {
                    controlsWrapper.classList.add('auto-hide');
                    controlsWrapper.classList.remove('show');
                }
                controlsWrapper.style.opacity = '0';
            }
        }
    }
    
    // Fonction pour démarrer le timer de masquage
    function startHideTimer() {
        clearTimeout(hideControlsTimeout);
        if (!video.paused) {
            hideControlsTimeout = setTimeout(hideControls, 4000); // 4 secondes
        }
    }
    
    // Fonction pour réinitialiser le timer
    function resetHideTimer() {
        showControls();
    }
    
    // Lecture/pause quand on clique sur la vidéo
    video.addEventListener('click', function() {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
        updatePlayPauseIcon(true);
    });

    // Lecture/pause
    playPauseBtn.addEventListener('click', function() {
        try {
            if (video.paused) {
                video.play().catch(function(error) {
                    console.warn('Erreur lors de la lecture:', error);
                });
                updatePlayPauseIcon(false);
                startHideTimer();
            } else {
                video.pause();
                updatePlayPauseIcon(true);
                showControls(); // Garder les contrôles visibles en pause
            }
        } catch (error) {
            console.warn('Erreur contrôle lecture:', error);
        }
        resetHideTimer();
    });
    
    // Mise à jour du bouton quand la vidéo joue ou s'arrête
    video.addEventListener('play', function() {
        updatePlayPauseIcon(false);
        startHideTimer();
    });
    
    video.addEventListener('pause', function() {
        updatePlayPauseIcon(true);
        showControls(); // Toujours montrer les contrôles en pause
        clearTimeout(hideControlsTimeout);
    });
    
    // Événements de progression
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('progress', updateBuffer);
    video.addEventListener('loadedmetadata', function() {
        timeDisplay.textContent = '0:00 / ' + formatTime(video.duration);
    });
    
    // Gestion du clic sur la barre de progression
    progressContainer.addEventListener('mousedown', function(e) {
        isDragging = true;
        seekVideo(e);
        resetHideTimer();
    });
    
    progressContainer.addEventListener('mousemove', function(e) {
        if (isDragging) {
            seekVideo(e);
        }
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    // Gestion tactile pour mobile
    progressContainer.addEventListener('touchstart', function(e) {
        isDragging = true;
        seekVideo(e.touches[0]);
        resetHideTimer();
    });
    
    progressContainer.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (isDragging) {
            seekVideo(e.touches[0]);
        }
    });
    
    progressContainer.addEventListener('touchend', function() {
        isDragging = false;
    });
    
    // Fonction pour naviguer dans la vidéo
    function seekVideo(e) {
        const rect = progressContainer.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const seekTime = percent * video.duration;
        
        if (seekTime >= 0 && seekTime <= video.duration) {
            video.currentTime = seekTime;
            const progress = (seekTime / video.duration) * 100;
            progressFilled.style.width = progress + '%';
            timeDisplay.textContent = formatTime(seekTime) + ' / ' + formatTime(video.duration);
        }
    }
    
    // Fonction pour mettre à jour l'icône play/pause
    function updatePlayPauseIcon(isPaused) {
        if (isPaused) {
            playPauseSvg.innerHTML = '<path d="M8 5v14l11-7z"/>';
        } else {
            playPauseSvg.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        }
    }
    
    // Fonction pour mettre à jour l'icône plein écran
    function updateFullscreenIcon(isFullscreen) {
        if (isFullscreen) {
            fullscreenSvg.innerHTML = '<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>';
        } else {
            fullscreenSvg.innerHTML = '<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>';
        }
    }
    
    // Contrôle du volume
    volumeSlider.addEventListener('input', function() {
        video.volume = this.value;
        updateVolumeIcon();
        resetHideTimer();
    });
    
    // Icône de volume
    volumeIcon.addEventListener('click', function() {
        if (video.muted) {
            video.muted = false;
            volumeSlider.value = video.volume;
        } else {
            video.muted = true;
            volumeSlider.value = 0;
        }
        updateVolumeIcon();
        resetHideTimer();
    });
    
    // Mise à jour de l'icône de volume avec SVG
    function updateVolumeIcon() {
        if (video.muted || video.volume === 0) {
            volumeSvg.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
        } else if (video.volume < 0.5) {
            volumeSvg.innerHTML = '<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>';
        } else {
            volumeSvg.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        }
    }
    
    // Plein écran avec gestion d'erreurs - Appliqué au conteneur
    fullscreenBtn.addEventListener('click', function() {
        try {
            if (!isFullscreen) {
                // Entrer en mode plein écran
                if (videoContainer.requestFullscreen) {
                    videoContainer.requestFullscreen();
                } else if (videoContainer.webkitRequestFullscreen) {
                    videoContainer.webkitRequestFullscreen();
                } else if (videoContainer.msRequestFullscreen) {
                    videoContainer.msRequestFullscreen();
                } else if (videoContainer.mozRequestFullScreen) {
                    videoContainer.mozRequestFullScreen();
                }
            } else {
                // Sortir du mode plein écran
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                }
            }
        } catch (error) {
            console.warn('Plein écran non supporté:', error);
        }
        resetHideTimer();
    });
    
    // Écouter les changements d'état du plein écran
    function handleFullscreenChange() {
        isFullscreen = !!(document.fullscreenElement || 
                         document.webkitFullscreenElement || 
                         document.msFullscreenElement || 
                         document.mozFullScreenElement);
        updateFullscreenIcon(isFullscreen);
        
        if (isFullscreen) {
            showControls();
            clearTimeout(hideControlsTimeout);
        } else {
            showControls();
            if (!video.paused) {
                startHideTimer();
            }
        }
    }
    
    // Ajouter les événements de changement de plein écran
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    
    // Événements d'interaction pour réinitialiser le timer
    videoContainer.addEventListener('click', resetHideTimer);
    videoContainer.addEventListener('touchstart', resetHideTimer);
    videoContainer.addEventListener('mousemove', function() {
        if (!isMobile) {
            resetHideTimer();
        }
    });
    
    // Événement pour détecter les changements de taille d'écran
    window.addEventListener('resize', function() {
        detectMobile();
        if (!isMobile) {
            // Sur desktop, toujours montrer les contrôles au hover
            controlsWrapper.classList.remove('auto-hide');
            controlsWrapper.classList.remove('show');
            controlsWrapper.style.opacity = '';
            clearTimeout(hideControlsTimeout);
        } else if (!video.paused && !isFullscreen) {
            // Sur mobile, redémarrer le système de masquage
            startHideTimer();
        }
    });
    
    // Pour éviter les clics involontaires sur mobile
    if (controlsWrapper) {
        controlsWrapper.addEventListener('click', function(e) {
            e.stopPropagation();
            resetHideTimer();
        });
        
        controlsWrapper.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            resetHideTimer();
        });
    }
    
    // Initialiser les icônes et le système de contrôles
    updateVolumeIcon();
    updatePlayPauseIcon(true);
    updateFullscreenIcon(false);
    detectMobile();
    
    // Afficher les contrôles au début
    showControls();
});