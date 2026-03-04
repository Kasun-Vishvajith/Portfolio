document.addEventListener("DOMContentLoaded", () => {

    // 1. Intersection Observer for fade-in animations
    setupScrollAnimations();

    // 2. Accordion Logic (index.html)
    setupAccordion();

    // 3. Back to Top Button
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
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const icon = header.querySelector('.accordion-icon');

            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const otherIcon = otherItem.querySelector('.accordion-icon');
                    if (otherIcon) otherIcon.classList.remove('rotate-180');

                    const otherTitle = otherItem.querySelector('span');
                    if (otherTitle) {
                        otherTitle.classList.remove('text-white');
                        otherTitle.classList.add('text-gray-400');
                    }
                }
            });

            item.classList.toggle('active');
            const title = header.querySelector('span');

            if (item.classList.contains('active')) {
                icon.classList.add('rotate-180', 'text-accent');
                icon.classList.remove('text-darkBorder');
                title.classList.add('text-white');
                title.classList.remove('text-gray-400');
            } else {
                icon.classList.remove('rotate-180', 'text-accent');
                icon.classList.add('text-darkBorder');
                title.classList.remove('text-white');
                title.classList.add('text-gray-400');
            }
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

    // Add cache-busting to ensure we always get the latest project data
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
                loading.innerHTML = `<p class="text-accent tracking-widest uppercase">Failed to load projects</p>`;
            }
        });
}

function createProjectCard(project, delay) {
    const card = document.createElement('div');
    const index = delay / 100;
    const isEven = index % 2 === 0;

    // Cycle through vibrant accent colors for variety
    const colors = ['orange', 'emerald', 'violet', 'secondary'];
    const accentColor = colors[index % colors.length];

    card.className = `fade-in-section flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 lg:gap-16 group mb-20`;

    let linksHtml = '';
    if (project.type === 'internal') {
        linksHtml = `<div class="mt-8">
            <a href="project.html?id=${project.id}" class="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-white text-sm font-bold hover:bg-${accentColor} hover:border-${accentColor} hover:text-white transition-all transform hover:scale-105 group/btn">
                View Case Study
                <span class="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
            </a>
        </div>`;
    } else {
        linksHtml = `<div class="flex flex-wrap gap-4 mt-8">`;
        if (project.liveLink) {
            linksHtml += `<a href="${project.liveLink}" target="_blank" class="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-white text-sm font-bold hover:bg-${accentColor} hover:border-${accentColor} hover:text-white transition-all transform hover:scale-105 group/btn">
                Live Demo 
                <span class="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">open_in_new</span>
            </a>`;
        }
        if (project.codeLink) {
            linksHtml += `<a href="${project.codeLink}" target="_blank" class="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[#94a3b8] hover:text-white text-sm font-bold hover:bg-white/10 hover:border-white/20 transition-all transform hover:scale-105">
                <span class="material-symbols-outlined text-sm">code</span>
                Source Code
            </a>`;
        }
        linksHtml += `</div>`;
    }

    const formattedId = (index + 1).toString().padStart(2, '0');
    const fallbackSvg = `<div class='w-full h-full flex flex-col items-center justify-center text-${accentColor}/30 group-hover:text-${accentColor} transition-colors bg-[#0f1115] min-h-[300px]'><span class='material-symbols-outlined text-5xl mb-2'>image</span><span class='text-xs uppercase tracking-widest text-[#94a3b8] font-semibold'>${project.title}</span></div>`;

    const targetLink = project.type === 'internal' ? `project.html?id=${project.id}` : project.liveLink;
    const clickAction = project.type === 'internal'
        ? `location.href='${targetLink}'`
        : `window.open('${targetLink}', '_blank')`;

    card.innerHTML = `
        <div class="w-full md:w-1/2 flex flex-col items-start ${isEven ? 'order-2 md:order-1' : ''}">
            <span class="text-${accentColor} font-mono text-xs mb-4 block uppercase tracking-[0.2em]">${formattedId} / ${project.tech && project.tech.length > 0 ? project.tech[0] : 'Project'}</span>
            <h2 class="text-[#f8fafc] text-3xl font-bold tracking-tight mb-4 group-hover:text-white transition-colors cursor-pointer" onclick="${clickAction}">${project.title}</h2>
            <p class="text-base md:text-lg leading-relaxed text-[#94a3b8]">
                ${project.description}
            </p>
            ${linksHtml}
        </div>
        <div class="w-full md:w-1/2 ${isEven ? 'order-1 md:order-2' : ''}">
            <div onclick="${clickAction}" 
                 class="aspect-[4/3] rounded-2xl overflow-hidden glass-card p-1 group-hover:border-${accentColor}/40 transition-all duration-500 cursor-pointer hover:scale-[1.01] active:scale-[0.98] relative">
                ${project.image ?
            `<img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover rounded-[14px] grayscale hover:grayscale-0 transition-all duration-700" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='${fallbackSvg.replace(/'/g, "\\'")}';">`
            :
            fallbackSvg
        }
            </div>
        </div>
    `;

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

    // Add cache-busting to ensure we always get the latest case study data
    fetch('caseStudies.json?v=' + new Date().getTime())
        .then(res => {
            if (!res.ok) throw new Error("Could not load caseStudies.json");
            return res.json();
        })
        .then(data => {
            // Trim the search ID and data IDs to handle accidental spaces
            const cleanId = projectId.trim();
            const project = data.find(p => p.id.trim() === cleanId);

            if (!project) {
                console.error(`Project ID mismatch: Looking for "${cleanId}", but it was not found in caseStudies.json.`);
                show404(main, `Project "${cleanId}" not found in our case study database.`);
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

function show404(container, msg = "Project not found.") {
    container.innerHTML = `
        <div class="max-w-2xl mx-auto text-center py-40 fade-in-section">
            <h1 class="text-8xl font-bold text-white/5 mb-6 tracking-tightest">404</h1>
            <h2 class="text-2xl font-bold text-white mb-4 uppercase tracking-widest">${msg}</h2>
            <p class="text-[#94a3b8] mb-12">The case study you are looking for does not exist or has been moved.</p>
            <a href="index.html#projects" class="inline-flex items-center px-8 py-3 bg-white/5 border border-white/10 text-white hover:bg-violet hover:border-violet transition-all rounded-full text-sm font-semibold">
                <span class="material-symbols-outlined mr-2">arrow_back</span>
                Return to Projects
            </a>
        </div>
    `;
    if (window.globalObserver) {
        container.querySelectorAll('.fade-in-section').forEach(el => window.globalObserver.observe(el));
    }
}

function renderCaseStudy(container, project) {
    // 1. Render Metrics section (if data exists)
    let metricsHtml = '';
    if (project.impactMetrics && Object.keys(project.impactMetrics).length > 0) {
        const metricKeys = Object.keys(project.impactMetrics);
        const colors = ['violet', 'emerald', 'orange', 'secondary', 'rose'];

        const longKeyNames = ['BusinessImpact', 'impact', 'Business Impact', 'Outcome'];
        const standardMetrics = metricKeys.filter(k => !longKeyNames.some(lk => k.toLowerCase() === lk.toLowerCase()));
        const longMetrics = metricKeys.filter(k => longKeyNames.some(lk => k.toLowerCase() === lk.toLowerCase()));

        const renderCard = (key, i, isFullWidth = false) => {
            let label = key;
            if (key.length > 3) {
                label = key.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
            } else {
                label = key.toUpperCase();
            }
            const color = colors[i % colors.length];
            let spanClass = isFullWidth ? 'col-span-full' : 'col-span-1';

            if (!isFullWidth) {
                const count = standardMetrics.length;
                if (count === 1) spanClass = 'col-span-full';
                else if (count === 2) spanClass = 'col-span-1 md:col-span-2';
                else if (count === 3) spanClass = 'col-span-1 md:col-span-1 lg:col-span-1';
            }

            return `
                <div class="${spanClass} glass-card p-8 rounded-2xl text-center transform transition-all hover:border-${color}/40 hover:bg-white/[0.04] group h-full flex flex-col justify-center items-center">
                    <div class="text-[10px] font-mono font-bold text-${color} uppercase tracking-[0.4em] mb-4">${label}</div>
                    <div class="${isFullWidth ? 'text-xl' : 'text-3xl md:text-4xl'} font-black text-white tracking-widest leading-snug">${project.impactMetrics[key]}</div>
                </div>
            `;
        };

        let gridCols = 'grid-cols-2 md:grid-cols-4';
        if (standardMetrics.length === 3) gridCols = 'grid-cols-1 md:grid-cols-3';
        else if (standardMetrics.length === 2) gridCols = 'grid-cols-1 md:grid-cols-2';
        else if (standardMetrics.length === 1) gridCols = 'grid-cols-1';

        metricsHtml = `
            <div class="grid ${gridCols} gap-4 md:gap-6 mb-32 fade-in-section">
                ${standardMetrics.map((key, i) => renderCard(key, i)).join('')}
                ${longMetrics.map((key, i) => renderCard(key, i + standardMetrics.length, true)).join('')}
            </div>
        `;
    }

    // 2. Render Flexible Content Blocks
    let contentHtml = '';
    if (project.content && Array.isArray(project.content)) {
        contentHtml = project.content.map(block => {
            const type = block.type || 'text';
            const align = block.align || 'top';
            const baseClass = "mb-24 fade-in-section";

            switch (type) {
                case 'heading':
                    const level = block.level || 1;
                    const tag = level === 1 ? 'h2' : 'h3';
                    const sizeClass = level === 1 ? 'text-4xl md:text-5xl font-black' : 'text-2xl md:text-3xl font-bold';
                    const color = block.color || 'violet';
                    return `
                        <div class="${baseClass} group">
                            <div class="flex items-center gap-4 mb-8">
                                <h3 class="text-${color} font-mono text-[10px] uppercase tracking-[0.4em] shrink-0">${block.label || 'Project Section'}</h3>
                                <div class="h-px bg-white/5 flex-grow"></div>
                            </div>
                            <${tag} class="${sizeClass} text-white tracking-tight">${block.text}</${tag}>
                        </div>`;

                case 'image':
                    const ratio = block.aspectRatio && block.aspectRatio !== 'original' ? `style="aspect-ratio: ${block.aspectRatio};"` : '';
                    const fitClass = block.aspectRatio && block.aspectRatio !== 'original' ? 'object-cover' : 'w-full h-auto';
                    return `
                        <div class="${baseClass} overflow-hidden border border-white/5 rounded-2xl bg-white/[0.02] w-full flex items-center justify-center" ${ratio}>
                            <img src="${block.src || block.image}" class="${fitClass}" loading="lazy" onerror="this.onerror=null; this.src='assets/images/placeholder.png';">
                        </div>`;

                case 'text':
                    const textP = `<p class="text-[#f8fafc] text-xl md:text-2xl leading-relaxed font-light opacity-80 group-hover:opacity-100 transition-all whitespace-pre-line">${block.text}</p>`;
                    if (block.image) {
                        const ratioT = block.aspectRatio && block.aspectRatio !== 'original' ? `style="aspect-ratio: ${block.aspectRatio};"` : '';
                        const fitClassT = block.aspectRatio && block.aspectRatio !== 'original' ? 'object-cover w-full h-full' : 'w-full h-auto';
                        const img = `
                            <div class="overflow-hidden border border-white/5 rounded-2xl bg-white/[0.02] w-full flex items-center justify-center" ${ratioT}>
                                <img src="${block.image}" class="${fitClassT}">
                            </div>`;

                        if (align === 'left') return `<div class="${baseClass} flex flex-col md:flex-row gap-12 items-center"><div class="w-full md:w-1/2">${img}</div><div class="w-full md:w-1/2">${textP}</div></div>`;
                        if (align === 'right') return `<div class="${baseClass} flex flex-col md:flex-row-reverse gap-12 items-center"><div class="w-full md:w-1/2">${img}</div><div class="w-full md:w-1/2">${textP}</div></div>`;
                        if (align === 'bottom') return `<div class="${baseClass} space-y-10 group">${textP}${img}</div>`;
                        return `<div class="${baseClass} space-y-10 group">${img}${textP}</div>`;
                    }
                    return `<div class="${baseClass} group">${textP}</div>`;

                case 'divider':
                    return `<div class="h-px bg-white/10 my-32 fade-in-section"></div>`;

                case 'spacer':
                    const h = block.size === 'lg' ? 'h-40' : (block.size === 'sm' ? 'h-12' : 'h-24');
                    return `<div class="${h} fade-in-section"></div>`;

                default: return '';
            }
        }).join('');
    } else {
        // Fallback for older data format
        contentHtml = `
            <div class="space-y-32 mb-40 fade-in-section">
                ${project.problem ? `<div class="group">
                    <div class="flex items-center gap-4 mb-10">
                        <h3 class="text-orange font-mono text-[10px] uppercase tracking-[0.4em] shrink-0">Problem Statement</h3>
                        <div class="h-px bg-white/5 flex-grow"></div>
                    </div>
                    <h4 class="text-3xl md:text-4xl font-bold text-white tracking-tight mb-8">The Problem</h4>
                    <p class="text-[#f8fafc] text-xl md:text-2xl leading-relaxed font-light max-w-5xl opacity-80 group-hover:opacity-100 transition-all">${project.problem}</p>
                </div>` : ''}
                ${project.approach ? `<div class="group">
                    <div class="flex items-center gap-4 mb-10">
                        <h3 class="text-violet font-mono text-[10px] uppercase tracking-[0.4em] shrink-0">Strategic Solution</h3>
                        <div class="h-px bg-white/5 flex-grow"></div>
                    </div>
                    <h4 class="text-3xl md:text-4xl font-bold text-white tracking-tight mb-8">The Approach</h4>
                    <p class="text-[#f8fafc] text-xl md:text-2xl leading-relaxed font-light max-w-5xl opacity-80 group-hover:opacity-100 transition-all">${project.approach}</p>
                </div>` : ''}
                ${project.results ? `<div class="group">
                    <div class="flex items-center gap-4 mb-10">
                        <h3 class="text-emerald font-mono text-[10px] uppercase tracking-[0.4em] shrink-0">Key Outcome</h3>
                        <div class="h-px bg-white/5 flex-grow"></div>
                    </div>
                    <h4 class="text-3xl md:text-4xl font-bold text-white tracking-tight mb-8">The Results</h4>
                    <p class="text-[#f8fafc] text-xl md:text-2xl leading-relaxed font-light max-w-5xl opacity-80 group-hover:opacity-100 transition-all">${project.results}</p>
                </div>` : ''}
            </div>
        `;
    }

    // 3. Render Legacy Gallery (only if content blocks don't exist)
    let galleryHtml = '';
    if (!project.content && project.images && project.images.length > 0) {
        galleryHtml = `
            <div class="mb-32 fade-in-section">
                <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div class="line-accented">
                        <span class="text-secondary font-mono text-[10px] uppercase tracking-[0.4em] block mb-2">Project Media</span>
                        <h2 class="text-[#f8fafc] text-4xl font-black tracking-tighter">Gallery</h2>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    ${project.images.map(img => `
                        <div class="overflow-hidden border border-white/5 rounded-2xl flex items-center justify-center bg-white/[0.02] relative group aspect-video">
                            <img src="${img}" class="w-full h-full object-cover grayscale opacity-70 image-zoom-trigger transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100">
                        </div>
                    `).join('')}
                </div>
            </div>`;
    }

    container.innerHTML = `
        <div class="max-w-6xl mx-auto px-4 md:px-0">
            <header class="mb-32 pt-24 fade-in-section">
                <div class="w-20 h-1.5 bg-violet mb-10 rounded-full"></div>
                <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-10 tracking-tightest leading-[1]">${project.title}</h1>
                <p class="text-xl md:text-2xl text-[#94a3b8] max-w-4xl leading-relaxed font-light">${project.overview}</p>
            </header>

            ${metricsHtml}
            ${contentHtml}
            ${galleryHtml}

            <div class="flex flex-col items-center justify-center py-40 border-t border-white/5 mt-40 fade-in-section">
                <h3 class="text-white/40 font-mono text-xs uppercase tracking-[0.4em] mb-12 text-center">Ready to explore more?</h3>
                <a href="index.html#projects" class="inline-flex items-center gap-4 px-12 py-5 bg-white text-black rounded-full text-lg font-black hover:scale-105 active:scale-95 transition-all">
                    Discover More Case Studies
                    <span class="material-symbols-outlined font-black">arrow_forward</span>
                </a>
            </div>
        </div>`;

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
