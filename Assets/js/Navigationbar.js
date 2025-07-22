
        document.addEventListener('DOMContentLoaded', function() {
            // Éléments du DOM
            const burger = document.querySelector('.burger');
            const navLinks = document.querySelector('.nav-links');
            const backdrop = document.querySelector('.backdrop');
            const navItems = document.querySelectorAll('.nav-links a');
            
            // Toggle pour le menu
            burger.addEventListener('click', function() {
                navLinks.classList.toggle('active');
                burger.classList.toggle('toggle');
                backdrop.classList.toggle('active');
                document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
            });
            
            // Fermer le menu quand on clique sur l'overlay/backdrop
            backdrop.addEventListener('click', function() {
                navLinks.classList.remove('active');
                burger.classList.remove('toggle');
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
            });
            
            // Fermer le menu quand on clique sur un lien
            navItems.forEach(item => {
                item.addEventListener('click', function() {
                    navLinks.classList.remove('active');
                    burger.classList.remove('toggle');
                    backdrop.classList.remove('active');
                    document.body.style.overflow = '';
                    
                    // Activer le lien cliqué et désactiver les autres
                    navItems.forEach(link => link.classList.remove('active'));
                    this.classList.add('active');
                });
            });
            
            // Navigation active au défilement
            window.addEventListener('scroll', function() {
                const sections = document.querySelectorAll('section, header');
                const scrollPosition = window.scrollY + 200; // Offset pour tenir compte de la navbar
                
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    const sectionId = section.getAttribute('id');
                    
                    if (sectionId && scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        navItems.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === '#' + sectionId) {
                                link.classList.add('active');
                            }
                        });
                    }
                    
                    // Accueil est actif quand on est tout en haut
                    if (scrollPosition < sections[1].offsetTop) {
                        navItems.forEach(link => link.classList.remove('active'));
                        navItems[0].classList.add('active');
                    }
                });
            });
        });
