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

function formatCaseStudyText(text) {
    if (!text) return '';
    
    // Replace markdown bold **text** with <strong>text</strong>
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Split by double newlines into blocks (paragraphs or lists)
    const blocks = formattedText.split(/\n\s*\n/);
    
    return blocks.map(block => {
        block = block.trim();
        if (!block) return '';
        
        // Check if block represents a list (starts with • or - or *)
        if (block.startsWith('•') || block.startsWith('-') || block.startsWith('*')) {
            const items = block.split('\n').map(line => {
                const cleaned = line.replace(/^[•\-\*]\s*/, '').trim();
                return '<li>' + cleaned + '</li>';
            }).join('');
            return '<ul class="case-list">' + items + '</ul>';
        }
        
        // Regular paragraph, replace single newlines with <br>
        return '<p class="case-paragraph">' + block.replace(/\n/g, '<br>') + '</p>';
    }).join('');
}

function createDiamondIntelToolkitHtml() {
    return `
    <section class="case-block fade-in-section diamond-toolkit-section">
        <div class="case-section-header">
            <span class="case-section-label">Interactive Sandbox</span>
            <div class="case-section-line"></div>
        </div>
        <h2 class="case-heading-h2" style="margin-bottom: 24px;">Diamond Intel Interactive Toolkit</h2>
        <p class="case-paragraph" style="margin-bottom: 32px;">Explore the gemstone valuation engine in real-time. Toggle between the CatBoost machine learning prediction simulator and standalone diamond proportion tools.</p>
        
        <div class="dt-tabs">
            <button class="dt-tab-btn active" data-tab="simulator">Prediction Simulator (CatBoost ML)</button>
            <button class="dt-tab-btn" data-tab="calculators">Standalone Diamond Tools</button>
        </div>
        
        <!-- Tab Content: Simulator -->
        <div class="dt-tab-content active" id="tab-simulator">
            <div class="dt-simulator-grid">
                <!-- Inputs Column -->
                <div class="dt-inputs-card">
                    <h3 class="dt-card-title">Model Parameters</h3>
                    
                    <div class="dt-form-row">
                        <div class="dt-form-group">
                            <label for="ds-type">Gemstone Type</label>
                            <select id="ds-type" class="dt-input">
                                <option value="natural">Natural/Lab Diamond</option>
                                <option value="cz">Cubic Zirconia (CZ)</option>
                            </select>
                        </div>
                        <div class="dt-form-group">
                            <label for="ds-tier">Model Complexity</label>
                            <select id="ds-tier" class="dt-input">
                                <option value="advanced" selected>Advanced Model (10 Features)</option>
                                <option value="normal">Normal Model (7 Features)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="dt-form-group">
                        <div class="dt-label-row">
                            <label for="ds-carat">Weight (Carat)</label>
                            <span id="ds-carat-val" class="dt-slider-value">1.00 ct</span>
                        </div>
                        <input type="range" id="ds-carat" min="0.1" max="5.0" step="0.05" value="1.0" class="dt-slider">
                    </div>
                    
                    <div class="dt-form-row">
                        <div class="dt-form-group">
                            <label for="ds-color">Color Grade</label>
                            <select id="ds-color" class="dt-input">
                                <option value="D">D (Colorless - Premium)</option>
                                <option value="E" selected>E (Colorless)</option>
                                <option value="F">F (Colorless)</option>
                                <option value="G">G (Near Colorless)</option>
                                <option value="H">H (Near Colorless)</option>
                                <option value="I">I (Near Colorless)</option>
                                <option value="J">J (Near Colorless)</option>
                            </select>
                        </div>
                        <div class="dt-form-group">
                            <label for="ds-clarity">Clarity Grade</label>
                            <select id="ds-clarity" class="dt-input">
                                <option value="IF">IF (Internally Flawless)</option>
                                <option value="VVS1" selected>VVS1 (Very Very Slightly Included 1)</option>
                                <option value="VVS2">VVS2 (Very Very Slightly Included 2)</option>
                                <option value="VS1">VS1 (Very Slightly Included 1)</option>
                                <option value="VS2">VS2 (Very Slightly Included 2)</option>
                                <option value="SI1">SI1 (Slightly Included 1)</option>
                                <option value="SI2">SI2 (Slightly Included 2)</option>
                                <option value="I1">I1 (Inclusions 1 - Lowest)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="dt-adv-only" id="ds-adv-section">
                        <div class="dt-form-group">
                            <label for="ds-cut">Cut Grade</label>
                            <select id="ds-cut" class="dt-input">
                                <option value="Ideal" selected>Ideal (Excellent Polish/Sym)</option>
                                <option value="Premium">Premium</option>
                                <option value="Very Good">Very Good</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                            </select>
                        </div>
                        
                        <div class="dt-form-row">
                            <div class="dt-form-group">
                                <label for="ds-dim-x">Length X (mm)</label>
                                <input type="number" id="ds-dim-x" min="1.0" max="15.0" step="0.01" value="6.40" class="dt-input">
                            </div>
                            <div class="dt-form-group">
                                <label for="ds-dim-y">Width Y (mm)</label>
                                <input type="number" id="ds-dim-y" min="1.0" max="15.0" step="0.01" value="6.40" class="dt-input">
                            </div>
                            <div class="dt-form-group">
                                <label for="ds-dim-z">Depth Z (mm)</label>
                                <input type="number" id="ds-dim-z" min="0.5" max="10.0" step="0.01" value="3.95" class="dt-input">
                            </div>
                        </div>
                        
                        <div class="dt-form-row" style="margin-top: 8px;">
                            <div class="dt-form-group">
                                <label for="ds-table-w">Table Width (mm)</label>
                                <input type="number" id="ds-table-w" min="0.5" max="10.0" step="0.01" value="3.58" class="dt-input">
                            </div>
                            <div class="dt-readout-box">
                                <div>Depth: <strong id="ds-depth-pct">61.7%</strong></div>
                                <div>Table: <strong id="ds-table-pct">56.0%</strong></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dt-form-row" style="margin-top: 16px; border-top: 1px solid var(--border); padding-top: 16px;">
                        <div class="dt-form-group">
                            <label>Prediction Interval</label>
                            <div class="dt-toggle-group">
                                <button class="dt-toggle-btn active" data-val="90" id="ds-pi-90">90% Bounds</button>
                                <button class="dt-toggle-btn" data-val="95" id="ds-pi-95">95% Bounds</button>
                            </div>
                        </div>
                        <div class="dt-form-group">
                            <label>User Role</label>
                            <div class="dt-toggle-group">
                                <button class="dt-toggle-btn active" data-val="buyer" id="ds-role-buyer">Buyer</button>
                                <button class="dt-toggle-btn" data-val="seller" id="ds-role-seller">Seller</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Output Certificate Column -->
                <div class="dt-certificate-card">
                    <div class="dt-cert-inner">
                        <div class="dt-cert-header">
                            <div class="dt-cert-logo">DIAMOND INTEL</div>
                            <div class="dt-cert-serial" id="ds-serial-num">DI-849204-ML</div>
                        </div>
                        
                        <div class="dt-cert-body">
                            <h4 class="dt-cert-title">VALUATION ESTIMATE REPORT</h4>
                            
                            <div class="dt-cert-spec-summary" id="ds-summary-txt">
                                1.00 Carat | Color E | Clarity VVS1 | Ideal Cut
                            </div>
                            
                            <div class="dt-cert-price-box">
                                <span class="dt-cert-price-label" id="ds-price-lbl">ESTIMATED BUYING VALUE</span>
                                <div class="dt-cert-price-val" id="ds-price-estimate">$6,845</div>
                            </div>
                            
                            <div class="dt-cert-bounds-box">
                                <div class="dt-cert-bounds-title" id="ds-bounds-lbl">90% Confidence Pricing Bounds</div>
                                <div class="dt-cert-bounds-range" id="ds-price-range">$6,120 &ndash; $7,570</div>
                            </div>
                            
                            <div class="dt-spectrum-wrap">
                                <div class="dt-spectrum-bar">
                                    <div class="dt-spectrum-marker" id="ds-spectrum-marker" style="left: 45%;"></div>
                                </div>
                                <div class="dt-spectrum-labels">
                                    <span>Discount</span>
                                    <span style="font-weight: 500;" id="ds-spec-category">Premium Grade</span>
                                    <span>Premium</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="dt-cert-footer">
                            <div>CatBoost ML Engine v2.4 (Active)</div>
                            <div style="text-align: right;">Symmetric Log-Space Bounds</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Tab Content: Calculators -->
        <div class="dt-tab-content" id="tab-calculators">
            <div class="dt-calculators-grid">
                
                <!-- Card 1: Carat Grams -->
                <div class="dt-calc-card">
                    <div class="dt-calc-badge">Converter</div>
                    <h3 class="dt-calc-title">Carat &harr; Grams</h3>
                    <p class="dt-calc-desc">Gemstones are weighed in carats. Standard conversion factor: <strong>1 Carat = 0.2 Grams</strong>.</p>
                    
                    <div class="dt-calc-inputs">
                        <div class="dt-calc-input-group">
                            <label for="tc-carat">Carat (ct)</label>
                            <input type="number" id="tc-carat" min="0.01" step="0.01" value="1" class="dt-input">
                        </div>
                        <div class="dt-calc-input-group">
                            <label for="tc-grams">Grams (g)</label>
                            <input type="number" id="tc-grams" min="0.002" step="0.002" value="0.2" class="dt-input">
                        </div>
                    </div>
                </div>
                
                <!-- Card 2: Depth Calculator -->
                <div class="dt-calc-card">
                    <div class="dt-calc-badge">Proportion</div>
                    <h3 class="dt-calc-title">Depth % Calculator</h3>
                    <p class="dt-calc-desc">Calculated as Z / average diameter. Ideal range is <strong>59% to 62.5%</strong>.</p>
                    
                    <div class="dt-calc-inputs vertical">
                        <div class="dt-form-row">
                            <div class="dt-calc-input-group">
                                <label for="tc-depth-x">Length X (mm)</label>
                                <input type="number" id="tc-depth-x" value="6.4" class="dt-input">
                            </div>
                            <div class="dt-calc-input-group">
                                <label for="tc-depth-y">Width Y (mm)</label>
                                <input type="number" id="tc-depth-y" value="6.4" class="dt-input">
                            </div>
                            <div class="dt-calc-input-group">
                                <label for="tc-depth-z">Depth Z (mm)</label>
                                <input type="number" id="tc-depth-z" value="3.95" class="dt-input">
                            </div>
                        </div>
                        
                        <div class="dt-calc-result-box">
                            <div class="dt-result-label">Calculated Depth %</div>
                            <div class="dt-result-value" id="tc-depth-result">61.72%</div>
                            <div class="dt-result-badge badge-ideal" id="tc-depth-badge">Ideal Range</div>
                        </div>
                    </div>
                </div>
                
                <!-- Card 3: Table Calculator -->
                <div class="dt-calc-card">
                    <div class="dt-calc-badge">Proportion</div>
                    <h3 class="dt-calc-title">Table % Calculator</h3>
                    <p class="dt-calc-desc">Table width divided by diameter. Ideal range is <strong>54% to 57%</strong>.</p>
                    
                    <div class="dt-calc-inputs vertical">
                        <div class="dt-form-row">
                            <div class="dt-calc-input-group">
                                <label for="tc-table-x">Length X (mm)</label>
                                <input type="number" id="tc-table-x" value="6.4" class="dt-input">
                            </div>
                            <div class="dt-calc-input-group">
                                <label for="tc-table-y">Width Y (mm)</label>
                                <input type="number" id="tc-table-y" value="6.4" class="dt-input">
                            </div>
                            <div class="dt-calc-input-group">
                                <label for="tc-table-w">Table Width (mm)</label>
                                <input type="number" id="tc-table-w" value="3.58" class="dt-input">
                            </div>
                        </div>
                        
                        <div class="dt-calc-result-box">
                            <div class="dt-result-label">Calculated Table %</div>
                            <div class="dt-result-value" id="tc-table-result">55.94%</div>
                            <div class="dt-result-badge badge-ideal" id="tc-table-badge">Ideal Range</div>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    </section>
    `;
}

function initDiamondIntelToolkit() {
    // 1. Tab switching
    const tabs = document.querySelectorAll('.dt-tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const targetTab = tab.getAttribute('data-tab');
            document.querySelectorAll('.dt-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById('tab-' + targetTab).classList.add('active');
        });
    });
    
    // 2. Simulator Elements
    const caratInput = document.getElementById('ds-carat');
    const caratVal = document.getElementById('ds-carat-val');
    const typeInput = document.getElementById('ds-type');
    const tierInput = document.getElementById('ds-tier');
    const colorInput = document.getElementById('ds-color');
    const clarityInput = document.getElementById('ds-clarity');
    const cutInput = document.getElementById('ds-cut');
    
    const dimXInput = document.getElementById('ds-dim-x');
    const dimYInput = document.getElementById('ds-dim-y');
    const dimZInput = document.getElementById('ds-dim-z');
    const tableWInput = document.getElementById('ds-table-w');
    
    const depthPctVal = document.getElementById('ds-depth-pct');
    const tablePctVal = document.getElementById('ds-table-pct');
    const advSection = document.getElementById('ds-adv-section');
    
    const pi90 = document.getElementById('ds-pi-90');
    const pi95 = document.getElementById('ds-pi-95');
    const roleBuyer = document.getElementById('ds-role-buyer');
    const roleSeller = document.getElementById('ds-role-seller');
    
    const priceEstimate = document.getElementById('ds-price-estimate');
    const priceRange = document.getElementById('ds-price-range');
    const summaryTxt = document.getElementById('ds-summary-txt');
    const priceLbl = document.getElementById('ds-price-lbl');
    const boundsLbl = document.getElementById('ds-bounds-lbl');
    const spectrumMarker = document.getElementById('ds-spectrum-marker');
    const specCategory = document.getElementById('ds-spec-category');
    
    let selectedPI = 90;
    let selectedRole = 'buyer';
    
    // Toggle Groups Listeners
    pi90.addEventListener('click', () => {
        pi90.classList.add('active');
        pi95.classList.remove('active');
        selectedPI = 90;
        updateSimulation();
    });
    pi95.addEventListener('click', () => {
        pi95.classList.add('active');
        pi90.classList.remove('active');
        selectedPI = 95;
        updateSimulation();
    });
    roleBuyer.addEventListener('click', () => {
        roleBuyer.classList.add('active');
        roleSeller.classList.remove('active');
        selectedRole = 'buyer';
        priceLbl.textContent = 'ESTIMATED BUYING VALUE';
        updateSimulation();
    });
    roleSeller.addEventListener('click', () => {
        roleSeller.classList.add('active');
        roleBuyer.classList.remove('active');
        selectedRole = 'seller';
        priceLbl.textContent = 'ESTIMATED LIQUIDATION VALUE';
        updateSimulation();
    });
    
    // Handle Model Tier changes
    tierInput.addEventListener('change', () => {
        if (tierInput.value === 'normal') {
            advSection.style.opacity = '0.4';
            advSection.style.pointerEvents = 'none';
        } else {
            advSection.style.opacity = '1';
            advSection.style.pointerEvents = 'auto';
        }
        updateSimulation();
    });
    
    // Auto-update geometry dimensions when Carat changes
    caratInput.addEventListener('input', () => {
        const carat = parseFloat(caratInput.value);
        caratVal.textContent = carat.toFixed(2) + ' ct';
        
        // typical round brilliant dimensions
        const ratio = Math.cbrt(carat);
        const typX = (6.40 * ratio).toFixed(2);
        const typY = (6.40 * ratio).toFixed(2);
        const typZ = (3.95 * ratio).toFixed(2);
        const typTableW = (3.58 * ratio).toFixed(2);
        
        dimXInput.value = typX;
        dimYInput.value = typY;
        dimZInput.value = typZ;
        tableWInput.value = typTableW;
        
        updateSimulation();
    });
    
    // Event listeners for parameters
    [typeInput, colorInput, clarityInput, cutInput, dimXInput, dimYInput, dimZInput, tableWInput].forEach(el => {
        el.addEventListener('input', updateSimulation);
        el.addEventListener('change', updateSimulation);
    });
    
    function updateSimulation() {
        const carat = parseFloat(caratInput.value);
        const type = typeInput.value;
        const tier = tierInput.value;
        const color = colorInput.value;
        const clarity = clarityInput.value;
        const cut = cutInput.value;
        
        const x = parseFloat(dimXInput.value) || 1.0;
        const y = parseFloat(dimYInput.value) || 1.0;
        const z = parseFloat(dimZInput.value) || 0.5;
        const tableW = parseFloat(tableWInput.value) || 0.5;
        
        // Calculate Depth and Table %
        const avgDiameter = (x + y) / 2;
        const depthPct = (z / avgDiameter) * 100;
        const tablePct = (tableW / avgDiameter) * 100;
        
        depthPctVal.textContent = depthPct.toFixed(1) + '%';
        tablePctVal.textContent = tablePct.toFixed(1) + '%';
        
        // Penalties and base pricing logic matching the CatBoost ML models
        const colorPenalties = { 'D': 0, 'E': -0.06, 'F': -0.12, 'G': -0.20, 'H': -0.30, 'I': -0.42, 'J': -0.56 };
        const clarityPenalties = { 'IF': 0, 'VVS1': -0.10, 'VVS2': -0.18, 'VS1': -0.28, 'VS2': -0.38, 'SI1': -0.52, 'SI2': -0.68, 'I1': -0.95 };
        const cutPenalties = { 'Ideal': 0, 'Premium': -0.04, 'Very Good': -0.09, 'Good': -0.18, 'Fair': -0.30 };
        
        let logPrice = 0;
        let stdError = 0.08;
        
        if (type === 'cz') {
            logPrice = Math.log(18) + Math.log(carat) * 1.15;
            stdError = 0.18;
            
            colorInput.disabled = true;
            clarityInput.disabled = true;
            cutInput.disabled = true;
        } else {
            colorInput.disabled = false;
            clarityInput.disabled = false;
            cutInput.disabled = false;
            
            logPrice = Math.log(8000) + Math.log(carat) * 1.75;
            logPrice += colorPenalties[color] || 0;
            logPrice += clarityPenalties[clarity] || 0;
            
            if (tier === 'advanced') {
                logPrice += cutPenalties[cut] || 0;
                
                const depthDiff = Math.abs(depthPct - 60.7);
                if (depthDiff > 1.8) {
                    logPrice -= (depthDiff - 1.8) * 0.08;
                }
                const tableDiff = Math.abs(tablePct - 55.5);
                if (tableDiff > 1.5) {
                    logPrice -= (tableDiff - 1.5) * 0.10;
                }
                stdError = 0.07;
            } else {
                logPrice += -0.08;
                stdError = 0.13;
            }
        }
        
        let price = Math.exp(logPrice);
        
        const zScore = selectedPI === 95 ? 1.96 : 1.645;
        const logDelta = zScore * stdError;
        
        let lowPrice = Math.exp(logPrice - logDelta);
        let highPrice = Math.exp(logPrice + logDelta);
        
        if (selectedRole === 'buyer') {
            price *= 1.10;
            lowPrice *= 1.10;
            highPrice *= 1.10;
        } else {
            price *= 0.85;
            lowPrice *= 0.85;
            highPrice *= 0.85;
        }
        
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        });
        
        priceEstimate.textContent = formatter.format(price);
        priceRange.textContent = formatter.format(lowPrice) + ' - ' + formatter.format(highPrice);
        boundsLbl.textContent = selectedPI + '% Confidence Pricing Bounds';
        
        if (type === 'cz') {
            summaryTxt.textContent = carat.toFixed(2) + ' ct | Cubic Zirconia Simulant';
        } else {
            const cutVal = tier === 'advanced' ? ` | ${cut} Cut` : '';
            summaryTxt.textContent = `${carat.toFixed(2)} ct | Color ${color} | Clarity ${clarity}${cutVal}`;
        }
        
        let qualityScore = 50;
        if (type === 'cz') {
            qualityScore = 15;
            specCategory.textContent = 'Budget Simulant';
        } else {
            const colorScores = { 'D': 100, 'E': 90, 'F': 80, 'G': 70, 'H': 60, 'I': 45, 'J': 30 };
            const clarityScores = { 'IF': 100, 'VVS1': 92, 'VVS2': 84, 'VS1': 75, 'VS2': 66, 'SI1': 50, 'SI2': 35, 'I1': 15 };
            
            const colS = colorScores[color] || 50;
            const claS = clarityScores[clarity] || 50;
            let combined = (colS + claS) / 2;
            
            if (tier === 'advanced') {
                const cutScores = { 'Ideal': 100, 'Premium': 85, 'Very Good': 70, 'Good': 50, 'Fair': 30 };
                const cutS = cutScores[cut] || 70;
                combined = (combined * 2 + cutS) / 3;
            }
            
            qualityScore = combined;
            
            if (qualityScore > 85) specCategory.textContent = 'Investment Grade';
            else if (qualityScore > 65) specCategory.textContent = 'Premium Value';
            else if (qualityScore > 40) specCategory.textContent = 'Standard Grade';
            else specCategory.textContent = 'Commercial Grade';
        }
        
        const leftPercent = Math.max(5, Math.min(95, qualityScore));
        spectrumMarker.style.left = leftPercent + '%';
    }
    
    updateSimulation();
    
    // ==========================================
    // 3. Standalone Calculators Logic
    // ==========================================
    
    const calcCarat = document.getElementById('tc-carat');
    const calcGrams = document.getElementById('tc-grams');
    
    calcCarat.addEventListener('input', () => {
        const ct = parseFloat(calcCarat.value) || 0;
        calcGrams.value = (ct * 0.2).toFixed(4);
    });
    
    calcGrams.addEventListener('input', () => {
        const g = parseFloat(calcGrams.value) || 0;
        calcCarat.value = (g / 0.2).toFixed(2);
    });
    
    const depthX = document.getElementById('tc-depth-x');
    const depthY = document.getElementById('tc-depth-y');
    const depthZ = document.getElementById('tc-depth-z');
    const depthResult = document.getElementById('tc-depth-result');
    const depthBadge = document.getElementById('tc-depth-badge');
    
    function updateCalcDepth() {
        const x = parseFloat(depthX.value) || 0;
        const y = parseFloat(depthY.value) || 0;
        const z = parseFloat(depthZ.value) || 0;
        
        if (x <= 0 || y <= 0 || z <= 0) {
            depthResult.textContent = '0.00%';
            depthBadge.textContent = 'Invalid Input';
            depthBadge.className = 'dt-result-badge badge-warning';
            return;
        }
        
        const avgD = (x + y) / 2;
        const depthPct = (z / avgD) * 100;
        
        depthResult.textContent = depthPct.toFixed(2) + '%';
        
        if (depthPct >= 59.0 && depthPct <= 62.5) {
            depthBadge.textContent = 'Ideal Range';
            depthBadge.className = 'dt-result-badge badge-ideal';
        } else if (depthPct < 59.0) {
            depthBadge.textContent = 'Shallow / Light Leak';
            depthBadge.className = 'dt-result-badge badge-warning';
        } else {
            depthBadge.textContent = 'Deep / Dull Reflection';
            depthBadge.className = 'dt-result-badge badge-warning';
        }
    }
    
    [depthX, depthY, depthZ].forEach(el => el.addEventListener('input', updateCalcDepth));
    
    const tableX = document.getElementById('tc-table-x');
    const tableY = document.getElementById('tc-table-y');
    const tableW = document.getElementById('tc-table-w');
    const tableResult = document.getElementById('tc-table-result');
    const tableBadge = document.getElementById('tc-table-badge');
    
    function updateCalcTable() {
        const x = parseFloat(tableX.value) || 0;
        const y = parseFloat(tableY.value) || 0;
        const w = parseFloat(tableW.value) || 0;
        
        if (x <= 0 || y <= 0 || w <= 0) {
            tableResult.textContent = '0.00%';
            tableBadge.textContent = 'Invalid Input';
            tableBadge.className = 'dt-result-badge badge-warning';
            return;
        }
        
        const avgD = (x + y) / 2;
        const tablePct = (w / avgD) * 100;
        
        tableResult.textContent = tablePct.toFixed(2) + '%';
        
        if (tablePct >= 54.0 && tablePct <= 57.0) {
            tableBadge.textContent = 'Ideal Range';
            tableBadge.className = 'dt-result-badge badge-ideal';
        } else if (tablePct < 54.0) {
            tableBadge.textContent = 'Narrow Table';
            tableBadge.className = 'dt-result-badge badge-warning';
        } else {
            tableBadge.textContent = 'Wide Table';
            tableBadge.className = 'dt-result-badge badge-warning';
        }
    }
    
    [tableX, tableY, tableW].forEach(el => el.addEventListener('input', updateCalcTable));
    
    updateCalcDepth();
    updateCalcTable();
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
                    const textP = '<div class="case-text">' + formatCaseStudyText(block.text) + '</div>';
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
                '<div class="case-text">' + formatCaseStudyText(project.problem) + '</div>' +
                '</div>';
        }
        if (project.approach) {
            fallbackParts += '<div style="margin-bottom: 64px;">' +
                '<div class="case-section-header">' +
                    '<span class="section-label">Strategic Solution</span>' +
                    '<div class="case-section-line"></div>' +
                '</div>' +
                '<h4 class="case-heading-h3" style="margin-bottom: 24px;">The Approach</h4>' +
                '<div class="case-text">' + formatCaseStudyText(project.approach) + '</div>' +
                '</div>';
        }
        if (project.results) {
            fallbackParts += '<div>' +
                '<div class="case-section-header">' +
                    '<span class="case-section-label">Key Outcome</span>' +
                    '<div class="case-section-line"></div>' +
                '</div>' +
                '<h4 class="case-heading-h3" style="margin-bottom: 24px;">The Results</h4>' +
                '<div class="case-text">' + formatCaseStudyText(project.results) + '</div>' +
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

    // Custom Interactive Toolkit for Diamond Intel
    let toolkitHtml = '';
    if (project.id.trim() === 'diamond_intel') {
        toolkitHtml = createDiamondIntelToolkitHtml();
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
            toolkitHtml +
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

    // Initialize toolkit event listeners if present
    if (project.id.trim() === 'diamond_intel') {
        initDiamondIntelToolkit();
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
