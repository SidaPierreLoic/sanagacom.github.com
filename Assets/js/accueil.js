document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleButton');
    const expandableContent = document.getElementById('expandableContent');
    
    toggleButton.addEventListener('click', function() {
        expandableContent.classList.toggle('expanded');
        toggleButton.classList.toggle('active');
        
        if (expandableContent.classList.contains('expanded')) {
            toggleButton.textContent = 'Voir moins';
        } else {
            toggleButton.textContent = 'En savoir plus';
        }
    });
});