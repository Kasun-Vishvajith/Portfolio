document.addEventListener("DOMContentLoaded", () => {

    // 1. Intersection Observer for fade-in animations
    setupScrollAnimations();

    // 2. Accordion Logic (if present)
    setupAccordion();

    // 3. Back to Top Button (if present)
    setupBackToTop();

    // 4. Determine page and load dynamic content
    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid) {
        loadProjectsIntoGrid();
    }

    const projectMain = document.getElementById('project-main');
    if (projectMain) {
        loadCaseStudy();
    }
});

function setupScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach(section => {
        observer.observe(section);
    });

    window.globalObserver = observer;
}

function setupAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;

            // Close other items
            document.querySelectorAll('.accordion-item').forEach(other => {
                if (other !== item) other.classList.remove('active');
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

function setupBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ==========================================
// INDEX.HTML SPECIFIC LOGIC
// ==========================================

function loadProjectsIntoGrid() {
    const grid = document.getElementById('projects-grid');
    const loading = document.getElementById('projects-loading');

    // Cache-busting to ensure latest data
    fetch('projects.json?v=' + new Date().getTime())
        .then(res => {
            if (!res.ok) throw new Error("Could not load projects.json");
            return res.json();
        })
        .then(data => {
            if (loading) loading.remove();

            data.forEach((project, index) => {
                const delay = index * 100;
                const card = createProjectCard(project, delay);
                grid.appendChild(card);
                if (window.globalObserver) window.globalObserver.observe(card);
            });
        })
        .catch(err => {
            console.error(err);
            if (loading) {
                loading.innerHTML = '<p style="color: var(--accent); letter-spacing: 0.1em; text-transform: uppercase; font-size: 13px; font-weight: 500;">Failed to load projects</p>';
            }
        });
}

function createProjectCard(project, delay) {
    const card = document.createElement('div');
    const index = delay / 100;
    const isEven = index % 2 === 0;

    card.className = 'fade-in-section project-row' + (isEven ? '' : ' reverse');

    // Build links HTML
    let linksHtml = '';
    if (project.type === 'internal') {
        linksHtml = '<div class="project-links">' +
            '<a href="project.html?id=' + project.id + '" class="btn btn-small">View Case Study &rarr;</a>' +
            '</div>';
    } else {
        linksHtml = '<div class="project-links">';
        if (project.liveLink) {
            linksHtml += '<a href="' + project.liveLink + '" target="_blank" class="btn btn-small">Live Demo &#8599;</a>';
        }
        if (project.codeLink) {
            linksHtml += '<a href="' + project.codeLink + '" target="_blank" class="btn btn-small btn-muted">Source Code</a>';
        }
        linksHtml += '</div>';
    }

    const formattedId = (index + 1).toString().padStart(2, '0');
    const techLabel = project.tech && project.tech.length > 0 ? project.tech[0] : 'Project';

    const targetLink = project.type === 'internal' ? 'project.html?id=' + project.id : project.liveLink;
    const clickAction = project.type === 'internal'
        ? "location.href='" + targetLink + "'"
        : "window.open('" + targetLink + "', '_blank')";

    const fallbackHtml = '<div class="project-fallback"><span class="project-fallback-title">' + project.title + '</span></div>';

    let imageInner;
    if (project.image) {
        imageInner = '<img src="' + project.image + '" alt="' + project.title + '" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML=\'' + fallbackHtml.replace(/'/g, "\\'") + '\';">';
    } else {
        imageInner = fallbackHtml;
    }

    card.innerHTML =
        '<div class="project-info">' +
            '<span class="project-num">' + formattedId + ' / ' + techLabel + '</span>' +
            '<h2 class="project-title" onclick="' + clickAction + '">' + project.title + '</h2>' +
            '<p class="project-desc">' + project.description + '</p>' +
            linksHtml +
        '</div>' +
        '<div class="project-image-wrap">' +
            '<div class="project-image-frame" onclick="' + clickAction + '">' +
                imageInner +
            '</div>' +
        '</div>';

    return card;
}

// ==========================================
// PROJECT.HTML SPECIFIC LOGIC
// ==========================================

function loadCaseStudy() {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    const main = document.getElementById('project-main');

    if (!projectId) {
        show404(main);
        return;
    }

    fetch('caseStudies.json?v=' + new Date().getTime())
        .then(res => {
            if (!res.ok) throw new Error("Could not load caseStudies.json");
            return res.json();
        })
        .then(data => {
            const cleanId = projectId.trim();
            const project = data.find(p => p.id.trim() === cleanId);

            if (!project) {
                console.error('Project ID mismatch: Looking for "' + cleanId + '", but it was not found in caseStudies.json.');
                show404(main, 'Project "' + cleanId + '" not found.');
                return;
            }
            renderCaseStudy(main, project);
            setupImageModal();
        })
        .catch(err => {
            console.error(err);
            show404(main, "Failed to load project details.");
        });
}

function show404(container, msg) {
    msg = msg || "Project not found.";
    container.innerHTML =
        '<div class="container">' +
            '<div class="not-found fade-in-section">' +
                '<div class="not-found-code">404</div>' +
                '<h2 class="not-found-title">' + msg + '</h2>' +
                '<p class="not-found-desc">The case study you are looking for does not exist or has been moved.</p>' +
                '<a href="index.html#projects" class="btn">&larr; Return to Projects</a>' +
            '</div>' +
        '</div>';
    if (window.globalObserver) {
        container.querySelectorAll('.fade-in-section').forEach(el => window.globalObserver.observe(el));
    }
}

function renderCaseStudy(container, project) {

    // 1. Render Metrics
    let metricsHtml = '';
    if (project.impactMetrics && Object.keys(project.impactMetrics).length > 0) {
        const metricKeys = Object.keys(project.impactMetrics);

        const longKeyNames = ['BusinessImpact', 'impact', 'Business Impact', 'Outcome'];
        const standardMetrics = metricKeys.filter(k => !longKeyNames.some(lk => k.toLowerCase() === lk.toLowerCase()));
        const longMetrics = metricKeys.filter(k => longKeyNames.some(lk => k.toLowerCase() === lk.toLowerCase()));

        const renderCard = function (key, isFullWidth) {
            let label = key;
            if (key.length > 3) {
                label = key.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
            } else {
                label = key.toUpperCase();
            }
            const spanStyle = isFullWidth ? ' style="grid-column: 1 / -1;"' : '';
            return '<div class="metric-card"' + spanStyle + '>' +
                '<div class="metric-label">' + label + '</div>' +
                '<div class="metric-value">' + project.impactMetrics[key] + '</div>' +
                '</div>';
        };

        let colsClass = 'cols-4';
        if (standardMetrics.length === 3) colsClass = 'cols-3';
        else if (standardMetrics.length === 2) colsClass = 'cols-2';
        else if (standardMetrics.length === 1) colsClass = 'cols-1';

        metricsHtml = '<div class="metrics-grid ' + colsClass + ' fade-in-section">' +
            standardMetrics.map(function (key) { return renderCard(key, false); }).join('') +
            longMetrics.map(function (key) { return renderCard(key, true); }).join('') +
            '</div>';
    }

    // 2. Render Flexible Content Blocks
    let contentHtml = '';
    if (project.content && Array.isArray(project.content)) {
        contentHtml = project.content.map(function (block) {
            const type = block.type || 'text';
            const align = block.align || 'top';

            switch (type) {
                case 'heading':
                    const level = block.level || 1;
                    const headingClass = level === 1 ? 'case-heading-h2' : 'case-heading-h3';
                    const tag = level === 1 ? 'h2' : 'h3';
                    return '<div class="case-block fade-in-section">' +
                        '<div class="case-section-header">' +
                            '<span class="case-section-label">' + (block.label || 'Section') + '</span>' +
                            '<div class="case-section-line"></div>' +
                        '</div>' +
                        '<' + tag + ' class="' + headingClass + '">' + block.text + '</' + tag + '>' +
                        '</div>';

                case 'image':
                    const ratioI = block.aspectRatio && block.aspectRatio !== 'original' ? ' style="aspect-ratio: ' + block.aspectRatio + ';"' : '';
                    const fitI = block.aspectRatio && block.aspectRatio !== 'original' ? ' style="object-fit: cover; width: 100%; height: 100%;"' : '';
                    return '<div class="case-block fade-in-section">' +
                        '<div class="case-image-wrap"' + ratioI + '>' +
                            '<img src="' + (block.src || block.image) + '" class="image-zoom-trigger"' + fitI + ' loading="lazy" onerror="this.onerror=null; this.src=\'assets/images/placeholder.png\';">' +
                        '</div>' +
                        '</div>';

                case 'text':
                    const textP = '<p class="case-text">' + block.text + '</p>';
                    if (block.image) {
                        const ratioT = block.aspectRatio && block.aspectRatio !== 'original' ? ' style="aspect-ratio: ' + block.aspectRatio + ';"' : '';
                        const fitT = block.aspectRatio && block.aspectRatio !== 'original' ? ' style="object-fit: cover; width: 100%; height: 100%;"' : '';
                        const img = '<div class="case-image-wrap"' + ratioT + '>' +
                            '<img src="' + block.image + '" class="image-zoom-trigger"' + fitT + '>' +
                            '</div>';

                        if (align === 'left') {
                            return '<div class="case-block fade-in-section case-text-image-row align-left">' + img + '<div>' + textP + '</div></div>';
                        }
                        if (align === 'right') {
                            return '<div class="case-block fade-in-section case-text-image-row align-right">' + img + '<div>' + textP + '</div></div>';
                        }
                        if (align === 'bottom') {
                            return '<div class="case-block fade-in-section">' + textP + '<div style="margin-top: 24px;">' + img + '</div></div>';
                        }
                        // Default: top (image first)
                        return '<div class="case-block fade-in-section">' + img + '<div style="margin-top: 24px;">' + textP + '</div></div>';
                    }
                    return '<div class="case-block fade-in-section">' + textP + '</div>';

                case 'gallery':
                    const cols = block.columns || 2;
                    let galleryColsClass = 'cols-2';
                    if (cols === 3) galleryColsClass = 'cols-3';
                    else if (cols === 4) galleryColsClass = 'cols-4';

                    let galleryHeader = '';
                    if (block.label) {
                        galleryHeader = '<div class="case-section-header">' +
                            '<span class="case-section-label">' + block.label + '</span>' +
                            '<div class="case-section-line"></div>' +
                            '</div>';
                    }
                    let galleryTitle = '';
                    if (block.title) {
                        galleryTitle = '<h4 class="case-heading-h3" style="margin-bottom: 24px;">' + block.title + '</h4>';
                    }

                    return '<div class="case-block fade-in-section">' +
                        galleryHeader +
                        galleryTitle +
                        '<div class="case-gallery-grid ' + galleryColsClass + '">' +
                            block.images.map(function (img) {
                                return '<div class="case-gallery-item">' +
                                    '<img src="' + img + '" class="image-zoom-trigger" loading="lazy">' +
                                    '</div>';
                            }).join('') +
                        '</div>' +
                        '</div>';

                case 'divider':
                    return '<div class="case-divider fade-in-section"></div>';

                case 'spacer':
                    const h = block.size === 'lg' ? '120px' : (block.size === 'sm' ? '32px' : '64px');
                    return '<div class="fade-in-section" style="height: ' + h + ';"></div>';

                default:
                    return '';
            }
        }).join('');
    } else {
        // Fallback for older data format
        let fallbackParts = '';
        if (project.problem) {
            fallbackParts += '<div style="margin-bottom: 64px;">' +
                '<div class="case-section-header">' +
                    '<span class="case-section-label">Problem Statement</span>' +
                    '<div class="case-section-line"></div>' +
                '</div>' +
                '<h4 class="case-heading-h3" style="margin-bottom: 24px;">The Problem</h4>' +
                '<p class="case-text">' + project.problem + '</p>' +
                '</div>';
        }
        if (project.approach) {
            fallbackParts += '<div style="margin-bottom: 64px;">' +
                '<div class="case-section-header">' +
                    '<span class="case-section-label">Strategic Solution</span>' +
                    '<div class="case-section-line"></div>' +
                '</div>' +
                '<h4 class="case-heading-h3" style="margin-bottom: 24px;">The Approach</h4>' +
                '<p class="case-text">' + project.approach + '</p>' +
                '</div>';
        }
        if (project.results) {
            fallbackParts += '<div>' +
                '<div class="case-section-header">' +
                    '<span class="case-section-label">Key Outcome</span>' +
                    '<div class="case-section-line"></div>' +
                '</div>' +
                '<h4 class="case-heading-h3" style="margin-bottom: 24px;">The Results</h4>' +
                '<p class="case-text">' + project.results + '</p>' +
                '</div>';
        }
        contentHtml = '<div class="fade-in-section" style="margin-bottom: 80px;">' + fallbackParts + '</div>';
    }

    // 3. Legacy Gallery
    let galleryHtml = '';
    if (!project.content && project.images && project.images.length > 0) {
        galleryHtml = '<div class="fade-in-section" style="margin-bottom: 80px;">' +
            '<div class="section-header">' +
                '<span class="section-label">Project Media</span>' +
                '<h2 class="section-title">Gallery</h2>' +
            '</div>' +
            '<div class="case-gallery-grid cols-2">' +
                project.images.map(function (img) {
                    return '<div class="case-gallery-item">' +
                        '<img src="' + img + '" class="image-zoom-trigger">' +
                        '</div>';
                }).join('') +
            '</div>' +
            '</div>';
    }

    // 4. Assemble
    container.innerHTML =
        '<div class="container" style="position: relative; overflow: visible;">' +
            '<!-- Floating Background Squares (Desktop Only) -->' +
            '<div class="bg-decor-cluster cluster-hero-left" style="top: 140px;">' +
                '<div class="sq-outline" style="width: 60px; height: 60px; top: 0; left: 0;"></div>' +
                '<div class="sq-outline" style="width: 30px; height: 30px; top: 40px; left: 40px; border-color: var(--accent); opacity: 0.3;"></div>' +
                '<div class="sq-solid" style="width: 20px; height: 20px; top: 15px; left: 20px;"></div>' +
            '</div>' +
            '<div class="bg-decor-cluster cluster-projects-left" style="top: 500px;">' +
                '<div class="sq-outline" style="width: 100px; height: 100px; top: 0; left: -30px;"></div>' +
                '<div class="sq-solid" style="width: 40px; height: 40px; top: 40px; left: 20px; background: var(--accent); opacity: 0.08;"></div>' +
                '<div class="sq-outline" style="width: 50px; height: 50px; top: 80px; left: -60px;"></div>' +
            '</div>' +
            '<div class="bg-decor-cluster cluster-expertise-right" style="top: 1100px;">' +
                '<div class="sq-outline" style="width: 90px; height: 90px; top: 0; right: -30px;"></div>' +
                '<div class="sq-outline" style="width: 45px; height: 45px; top: 60px; right: 30px; border-color: var(--accent); opacity: 0.2;"></div>' +
                '<div class="sq-solid" style="width: 30px; height: 30px; top: 20px; right: 10px;"></div>' +
            '</div>' +
            '<header class="case-header fade-in-section">' +
                '<div class="case-header-bar"></div>' +
                '<h1 class="case-title">' + project.title + '</h1>' +
                '<p class="case-overview">' + project.overview + '</p>' +
            '</header>' +
            metricsHtml +
            contentHtml +
            galleryHtml +
            '<div class="case-back-cta fade-in-section">' +
                '<span class="case-back-label">Ready to explore more?</span>' +
                '<a href="index.html#projects" class="btn-back-large">' +
                    'Discover More Case Studies &rarr;' +
                '</a>' +
            '</div>' +
        '</div>';

    // Re-observe animations
    if (window.globalObserver) {
        container.querySelectorAll('.fade-in-section').forEach(el => window.globalObserver.observe(el));
    }
}

function setupImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const closeBtn = document.getElementById('close-modal');
    const triggers = document.querySelectorAll('.image-zoom-trigger');

    if (!modal || !modalImg || !closeBtn) return;

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            modalImg.src = trigger.src;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        setTimeout(() => { modalImg.src = ''; }, 300);
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}
