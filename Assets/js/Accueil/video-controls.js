document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('corporateVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeIcon = document.getElementById('volumeIcon');
    const volumeSvg = document.getElementById('volumeSvg');
    const volumeSlider = document.getElementById('volumeSlider');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const progressBar = document.getElementById('progressBar');
    const progressHandle = document.getElementById('progressHandle');
    const progressContainer = document.getElementById('progressContainer');
    const timeDisplay = document.getElementById('timeDisplay');
    
    // Variable pour suivre si on est en train de glisser la barre de progression
    let isDragging = false;
    
    // Définir le volume initial
    video.volume = 0.7;
    
    // Mise à jour de la barre de progression
    video.addEventListener('timeupdate', function() {
        if (!isDragging) {
            const percent = (video.currentTime / video.duration) * 100;
            progressBar.style.width = percent + '%';
            
            // Mettre à jour l'affichage du temps
            const currentTime = formatTime(video.currentTime);
            const duration = formatTime(video.duration);
            timeDisplay.textContent = currentTime + ' / ' + duration;
        }
    });
    
    // Formatter le temps en minutes:secondes
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        
        const minutes = Math.floor(seconds / 60);
        const secondsRemainder = Math.floor(seconds % 60);
        return minutes + ':' + (secondsRemainder < 10 ? '0' : '') + secondsRemainder;
    }
    
    // Gestion du glissement (drag) sur la barre de progression
    progressContainer.addEventListener('mousedown', startDrag);
    progressHandle.addEventListener('mousedown', startDrag);
    
    // Pour le tactile
    progressContainer.addEventListener('touchstart', startDrag, { passive: false });
    progressHandle.addEventListener('touchstart', startDrag, { passive: false });
    
    function startDrag(e) {
        e.preventDefault(); // Empêcher le comportement par défaut
        isDragging = true;
        progressContainer.classList.add('dragging');
        
        // Mettre à jour immédiatement la position
        updateDragPosition(e);
        
        // Ajouter les écouteurs d'événements pour le mouvement et la fin du glissement
        document.addEventListener('mousemove', updateDragPosition);
        document.addEventListener('touchmove', updateDragPosition, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }
    
    function updateDragPosition(e) {
        if (!isDragging) return;
        
        // Empêcher le défilement sur mobile pendant le glissement
        if (e.type.includes('touch')) {
            e.preventDefault();
        }
        
        const rect = progressContainer.getBoundingClientRect();
        let clientX;
        
        // Gérer à la fois les événements de souris et de toucher
        if (e.type.includes('touch')) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }
        
        // Calculer la position relative (entre 0 et 1)
        let pos = (clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos)); // Limiter entre 0 et 1
        
        // Mettre à jour la barre de progression visuellement
        const percent = pos * 100;
        progressBar.style.width = percent + '%';
        
        // Mettre à jour le temps de la vidéo
        video.currentTime = pos * video.duration;
        
        // Mettre à jour l'affichage du temps
        timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
    }
    
    function endDrag() {
        if (isDragging) {
            isDragging = false;
            progressContainer.classList.remove('dragging');
            
            // Retirer les écouteurs d'événements
            document.removeEventListener('mousemove', updateDragPosition);
            document.removeEventListener('touchmove', updateDragPosition);
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener('touchend', endDrag);
        }
    }
    
    // Permettre de cliquer sur la barre pour se déplacer dans la vidéo
    progressContainer.addEventListener('click', function(e) {
        // Éviter le traitement si on est en train de glisser (pour éviter les comportements indésirables)
        if (isDragging) return;
        
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    });
    
    // Lecture/pause quand on clique sur la vidéo
    video.addEventListener('click', function() {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
        updatePlayPauseButton();
    });
    
    // Lecture/pause quand on clique sur le bouton
    playPauseBtn.addEventListener('click', function() {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
        updatePlayPauseButton();
    });
    
    // Mettre à jour le bouton de lecture/pause
    function updatePlayPauseButton() {
        if (video.paused) {
            playPauseBtn.textContent = '▶';
        } else {
            playPauseBtn.textContent = '⏸';
        }
    }
    
    // Mise à jour du bouton quand la vidéo joue ou s'arrête
    video.addEventListener('play', function() {
        playPauseBtn.textContent = '⏸';
    });
    
    video.addEventListener('pause', function() {
        playPauseBtn.textContent = '▶';
    });
    
    // Contrôle du volume
    volumeSlider.addEventListener('input', function() {
        video.volume = this.value;
        updateVolumeIcon();
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
    });
    
    // Mise à jour de l'icône de volume avec SVG
    function updateVolumeIcon() {
        if (video.muted || video.volume === 0) {
            // Volume muet - SVG pour volume muet
            volumeSvg.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
        } else if (video.volume < 0.5) {
            // Volume bas - SVG pour volume bas
            volumeSvg.innerHTML = '<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>';
        } else {
            // Volume élevé - SVG pour volume élevé
            volumeSvg.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        }
    }
    
    // Plein écran
    fullscreenBtn.addEventListener('click', function() {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) { /* Safari */
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) { /* IE11 */
            video.msRequestFullscreen();
        }
    });
    
    // Pour éviter les clics involontaires sur mobile
    document.querySelector('.video-controls-wrapper').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Empêcher le clic sur la barre de progression de propager à la vidéo
    progressContainer.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Initialiser l'interface
    updatePlayPauseButton();
    updateVolumeIcon();
    
    // Ajouter un gestionnaire d'événement 'loadedmetadata' pour initialiser l'affichage du temps
    video.addEventListener('loadedmetadata', function() {
        timeDisplay.textContent = '0:00 / ' + formatTime(video.duration);
    });
});