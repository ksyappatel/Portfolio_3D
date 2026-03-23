// ==== Theme Toggle (4-way: dark → light → Sunshine → Cosmic) ====
const themeToggleBtn = document.getElementById('theme-toggle');
// ⚠️ Use document.documentElement (<html>) NOT body — webkit scrollbars belong to html
const themeRoot = document.documentElement;
const body      = document.body; // still needed for other references
const themeIcon = themeToggleBtn.querySelector('i');

// Theme definitions
// 'label' = tooltip shown while ON this theme (tells user what next click will do)
const themes = [
    { value: null,     icon: 'fa-moon',          label: 'Switch to Light mode'    },  // on dark     → go light
    { value: 'light',  icon: 'fa-sun',           label: 'Switch to Sunshine mode' },  // on light    → go sunshine
    { value: 'orange', icon: 'fa-fire',          label: 'Switch to Cosmic mode'   },  // on sunshine → go cosmic
    { value: 'purple', icon: 'fa-shuttle-space', label: 'Switch to Dark mode'     },  // on cosmic   → go dark
];

function triggerHaptic(type) {
    if (!navigator.vibrate) return;
    if (type === 'theme-purple') {
        navigator.vibrate([100, 50, 100, 50, 150]); // Cosmic pulse
    } else if (type === 'theme-switch') {
        navigator.vibrate(50); // General feedback
    } else if (type === 'click') {
        navigator.vibrate(30); // Subtle click
    }
}

function applyTheme(themeValue, isInitial = false) {
    // Set on <html> so [data-theme="orange"]::-webkit-scrollbar-thumb works
    if (themeValue) {
        themeRoot.setAttribute('data-theme', themeValue);
    } else {
        themeRoot.removeAttribute('data-theme');
    }
    const current = themes.find(t => t.value === themeValue);
    themeIcon.className = 'fas ' + current.icon;
    themeToggleBtn.setAttribute('aria-label', current.label);
    themeToggleBtn.setAttribute('title', current.label);
    localStorage.setItem('portfolio-theme', themeValue || 'dark');

    // 3D AI Video Background Control for Cosmic Mode
    const cosmicVideo = document.getElementById('cosmic-video-bg');
    if (cosmicVideo) {
        cosmicVideo.playbackRate = 1.0; // Play at normal speed to prevent frame lagging

        // Custom Loop & Pause Logic
        if (!cosmicVideo.hasAttribute('data-loop-init')) {
            cosmicVideo.setAttribute('data-loop-init', 'true');
            cosmicVideo.dataset.playCount = '0';
            
            cosmicVideo.addEventListener('ended', () => {
                let count = parseInt(cosmicVideo.dataset.playCount || '0', 10);
                count++;
                cosmicVideo.dataset.playCount = count.toString();
                
                if (count < 2) {
                    cosmicVideo.currentTime = 0; // Restart for the 2nd loop
                    cosmicVideo.play().catch(() => {});
                } else {
                    // After playing twice, snap to the 2-second mark and freeze
                    cosmicVideo.currentTime = 2;
                    cosmicVideo.pause();
                }
            });

            // Safety mechanism to prevent accidental resuming after finishing 2 loops
            cosmicVideo.addEventListener('play', () => {
                let count = parseInt(cosmicVideo.dataset.playCount || '0', 10);
                if (count >= 2) {
                    cosmicVideo.pause();
                    cosmicVideo.currentTime = 2;
                }
            });
        }

        if (themeValue === 'purple') {
            let count = parseInt(cosmicVideo.dataset.playCount || '0', 10);
            if (count < 2) {
                cosmicVideo.play().catch(() => {});
            }
        } else {
            cosmicVideo.pause();
        }
    }

    // Haptics (don't trigger on initial load)
    if (!isInitial) {
        if (themeValue === 'purple') triggerHaptic('theme-purple');
        else triggerHaptic('theme-switch');
    }
}

// Restore saved theme on load
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light')       applyTheme('light', true);
else if (savedTheme === 'orange') applyTheme('orange', true);
else if (savedTheme === 'purple') applyTheme('purple', true);
else                              applyTheme(null, true);

themeToggleBtn.addEventListener('click', () => {
    const current = themeRoot.getAttribute('data-theme') || null;
    const idx     = themes.findIndex(t => t.value === current);
    const next    = themes[(idx + 1) % themes.length];
    applyTheme(next.value);
});




// ==== Custom Cursor Glow (iPad Style) ====
const cursorGlow = document.querySelector('.cursor-glow');
if (cursorGlow) {
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, span, li, a');
    
    let hideTimer;
    let isMagnetic = false;
    let currentMagneticEl = null;

    const activateMagnetic = (el) => {
        isMagnetic = true;
        currentMagneticEl = el;
        cursorGlow.classList.add('magnet-active');
        cursorGlow.classList.remove('text-hover');
        
        const rect = el.getBoundingClientRect();
        let rx = window.getComputedStyle(el).borderRadius;
        if (rx === '0px') rx = '8px';
        
        const padding = el.classList.contains('project-card') ? 16 : 12;
        cursorGlow.style.width = `${rect.width + padding}px`;
        cursorGlow.style.height = `${rect.height + padding}px`;
        cursorGlow.style.borderRadius = rx;
        
        if (!el.classList.contains('project-card')) {
            el.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
        }
        el.style.transition = 'transform 0.1s ease-out, box-shadow 0.2s ease-out';
        el.style.zIndex = '100';
    };

    const resetMagnetic = (el) => {
        isMagnetic = false;
        currentMagneticEl = null;
        cursorGlow.classList.remove('magnet-active');
        
        cursorGlow.style.width = '';
        cursorGlow.style.height = '';
        cursorGlow.style.borderRadius = '';
        cursorGlow.style.background = '';
        
        el.style.transform = '';
        el.style.boxShadow = '';
        el.style.zIndex = '';
        
        setTimeout(() => {
            if(el) el.style.transition = '';
        }, 100);
    };

    let currentMouseX = 0;
    let currentMouseY = 0;

    const updateCursorPosition = () => {
        if (isMagnetic && currentMagneticEl) {
            const rect = currentMagneticEl.getBoundingClientRect();
            // Calculate absolute center accounting for scroll
            const absoluteCenterX = rect.left + rect.width / 2;
            const absoluteCenterY = rect.top + rect.height / 2;
            
            // Allow cursor to move slightly within the element (15% pull)
            const distanceX = currentMouseX - absoluteCenterX;
            const distanceY = currentMouseY - absoluteCenterY;
            
            // Parallax shift based on whether it is a huge card or a small button
            const isCard = currentMagneticEl.classList.contains('project-card');
            const pullFactor = isCard ? 0.05 : 0.15;
            const liftFactor = isCard ? 0.02 : 0.1;
            
            cursorGlow.style.left = `${absoluteCenterX + (distanceX * pullFactor)}px`;
            cursorGlow.style.top = `${absoluteCenterY + (distanceY * pullFactor)}px`;
            
            currentMagneticEl.style.transform = `translate(${distanceX * liftFactor}px, ${distanceY * liftFactor}px)`;
            if (currentMagneticEl.classList.contains('clicking')) {
                 currentMagneticEl.style.transform += ' scale(0.98)';
            }
        } else {
            cursorGlow.style.left = `${currentMouseX}px`;
            cursorGlow.style.top = `${currentMouseY}px`;
        }
        
        // Use requestAnimationFrame for smooth 60fps locking
        requestAnimationFrame(updateCursorPosition);
    };
    
    // Start animation loop
    requestAnimationFrame(updateCursorPosition);

    document.addEventListener('mousemove', (e) => {
        currentMouseX = e.clientX;
        currentMouseY = e.clientY;
        
        cursorGlow.classList.remove('hidden');
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => cursorGlow.classList.add('hidden'), 2500); // hide after 2.5s

        const target = e.target;
        
        // Track Magnetic Elements Dynamically
        const magSelector = '.btn, button, .social-icon, .icon-btn, .nav-links a, .modal-close, .logo, .project-card, .btn-primary, .contact-item-hover, .clickable-header';
        const magEl = (target && target.closest) ? target.closest(magSelector) : null;
        
        if (magEl) {
            if (currentMagneticEl !== magEl) {
                if (currentMagneticEl) resetMagnetic(currentMagneticEl);
                activateMagnetic(magEl);
            }
        } else if (currentMagneticEl) {
            resetMagnetic(currentMagneticEl);
        }

        // Track Text Hover
        const textEl = (target && target.closest) ? target.closest('p, h1, h2, h3, h4, span, li, a') : null;
        if (textEl && !magEl) {
            cursorGlow.classList.add('text-hover');
        } else {
            cursorGlow.classList.remove('text-hover');
        }
    });

    // Update coordinates immediately on scroll to prevent the cursor detaching from the magnet
    window.addEventListener('scroll', () => {
        if(isMagnetic && currentMagneticEl) {
            cursorGlow.classList.remove('hidden');
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => cursorGlow.classList.add('hidden'), 2500);
        }
    }, { passive: true });

    document.addEventListener('mousedown', () => {
        cursorGlow.classList.add('clicking');
        if (currentMagneticEl) currentMagneticEl.classList.add('clicking');
    });
    
    document.addEventListener('mouseup', () => {
        cursorGlow.classList.remove('clicking');
        if (currentMagneticEl) currentMagneticEl.classList.remove('clicking');
    });
}


// ==== Mobile Menu ====
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

function openMobileMenu() {
    navLinks.classList.add('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    mobileMenuBtn.querySelector('i').classList.replace('fa-bars', 'fa-times');
}

function closeMobileMenu() {
    navLinks.classList.remove('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
}

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
});

// Close button inside the nav menu (✕ Close)
const mobileMenuCloseBtn = document.querySelector('.mobile-menu-close-btn');
if (mobileMenuCloseBtn) {
    mobileMenuCloseBtn.addEventListener('click', closeMobileMenu);
}

// Close menu when a nav link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Close menu when pressing Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMobileMenu();
    }
});


// ==== Scroll Effects (Navbar Shadow & Active Links) ====
const navbar = document.querySelector('.navbar');
const sections = document.querySelectorAll('.section');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    // Navbar Shadow
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.5)';
    } else {
        navbar.style.boxShadow = 'none';
    }

    // Active Nav Links
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});


// ==== Smooth Scroll ====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || !targetId.startsWith('#')) return;
        
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const offset = 80;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});


// ==== Scroll Reveal & Stats Counters ====
const revealElements = document.querySelectorAll('.reveal');
const statNumbers = document.querySelectorAll('.stat-number');
let statsAnimated = false;

const animateValue = (obj, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Easing out function
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        let current = start + easeOutProgress * (end - start);
        
        // Handle decimals vs integers
        if (end % 1 !== 0) {
            obj.innerHTML = current.toFixed(1);
        } else {
            obj.innerHTML = Math.floor(current);
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end; // Ensure final exact value
        }
    };
    window.requestAnimationFrame(step);
};

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            
            // Check if it's the about section to trigger stats
            if (entry.target.id === 'about' && !statsAnimated) {
                statsAnimated = true;
                statNumbers.forEach(stat => {
                    const target = parseFloat(stat.getAttribute('data-target'));
                    animateValue(stat, 0, target, 2000); // 2 second animation
                });
            }
            
            observer.unobserve(entry.target);
        }
    });
};

const revealObserver = new IntersectionObserver(revealCallback, {
    root: null, threshold: 0.15, rootMargin: "0px 0px -50px 0px"
});

revealElements.forEach(el => revealObserver.observe(el));


// ==== Interactive Terminal ====
const terminalInput = document.getElementById('terminal-input');
const terminalBody = document.getElementById('terminal-body');

const terminalCommands = {
    'help': 'Available commands: <br> - <span class="term-highlight">whoami</span>: Displays introduction <br> - <span class="term-highlight">methodology</span>: Lists core research approaches <br> - <span class="term-highlight">experience</span>: Shows current role <br> - <span class="term-highlight">clear</span>: Clears terminal',
    'whoami': 'Kashyap Patel - Research-Driven Problem Solver focusing on AI adoption and process orchestration.',
    'methodology': 'Identifying bottlenecks -> Researching tools (AI/Automation) -> Rapid Prototyping -> Orchestrating solutions.',
    'experience': 'Digital Transformation Analyst @ S&P Global. Optimizing workflows through continuous tool discovery.',
    'sudo': '<span class="term-error">Error: Kashyap has disabled root privileges for guests. Nice try!</span>'
};

// ==== Project Modals ====
const modalData = {
    'forms-automation': {
        title: 'Documentation & Forms Automation',
        meta: 'S&P Global | Python, PyPDF2',
        img: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        desc: `
            <div class="modal-section project-overview">
                <h4><i class="fas fa-bullseye text-accent"></i> The Challenge</h4>
                <p>Producing over 200 structured regulatory PDF manuals annually across 50+ insurance carriers was a highly manual, error-prone, and time-consuming process. The team was bottlenecked by repetitive document assembly tasks that drained strategic bandwidth.</p>
            </div>
            
            <div class="modal-section project-research">
                <h4><i class="fas fa-search text-accent"></i> My Research Process</h4>
                <p>I engaged in deep workflow analysis to map every click and decision point in the manual process. I researched Python capabilities for document manipulation and data handling, specifically investigating how the <code>pandas</code> library could process complex conditional logic faster than native Excel, and how <code>PyPDF2</code> could handle automated document generation.</p>
            </div>

            <div class="modal-section project-solution">
                <h4><i class="fas fa-lightbulb text-accent"></i> The Solution & Impact</h4>
                <p>I orchestrated a comprehensive automation solution using an Excel-driven indexing system acting as the 'brain', processed rapidly by a bespoke Python script. This intelligent pipeline automatically assembled, formatted, and validated the documentation.</p>
                <ul class="duties mt-3" style="padding-left: 20px;">
                    <li>Delivered <strong>2.5 FTE operational savings</strong>, freeing up team members for higher-value analytical work.</li>
                    <li>Reduced processing turnaround times by over 60%.</li>
                    <li>Standardised output structures, essentially eliminating manual assembly errors.</li>
                </ul>
            </div>
        `,
        tech: ['AI-Assisted Python', 'pandas', 'PyPDF2 (via AI)', 'Workflow Architecture'],
        link: 'https://github.com/ksyappatel/Forms-Automation'
    },
    'pdf-workflow': {
        title: 'PDF Workflow Optimisation',
        meta: 'S&P Global | Adobe Acrobat DC',
        img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        desc: `
            <div class="modal-section project-overview">
                <h4><i class="fas fa-bullseye text-accent"></i> The Challenge</h4>
                <p>Upon reviewing the daily operations of a 15-person team, I observed massive inefficiencies in how they interacted with PDF documents. Routine checks, validations, and minor edits required excessive manual navigation and repetitive clicking.</p>
            </div>
            
            <div class="modal-section project-research">
                <h4><i class="fas fa-search text-accent"></i> My Research Process</h4>
                <p>I quantified the inefficiency, discovering that over 10,000 manual clicks were being wasted annually. I then researched the often-underutilized Action Wizard and internal JavaScript API capabilities within Adobe Acrobat Pro DC to find a programmatic solution that could run locally without breaching data security policies.</p>
            </div>

            <div class="modal-section project-solution">
                <h4><i class="fas fa-lightbulb text-accent"></i> The Solution & Impact</h4>
                <p>I engineered custom JavaScript action scripts that plugged directly into Adobe Acrobat. These scripts automated the repetitive navigation, validation checks, and data extraction tasks.</p>
                <ul class="duties mt-3" style="padding-left: 20px;">
                    <li>Eliminated <strong>10,000+ repetitive manual clicks</strong> annually across the team.</li>
                    <li>Drastically reduced human error fatigue during document reviews.</li>
                    <li>Created a unified standard operating procedure (SOP) driven by the script rather than human memory.</li>
                </ul>
            </div>
        `,
        tech: ['Adobe Acrobat APIs', 'AI-Generated JavaScript', 'Workflow Analysis'],
        link: 'https://github.com/ksyappatel/ADOBE-JS'
    },
    'data-quality': {
        title: 'Data Quality Monitoring Alerts',
        meta: 'S&P Global | Power Platform',
        img: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        desc: `
            <div class="modal-section project-overview">
                <h4><i class="fas fa-bullseye text-accent"></i> The Challenge</h4>
                <p>Data anomalies and failed automation robots were only being caught during reactive, manual daily checks. This reactive posture led to SLA breaches and accumulated technical debt as issues sat unnoticed until the next manual sweep.</p>
            </div>
            
            <div class="modal-section project-research">
                <h4><i class="fas fa-search text-accent"></i> My Research Process</h4>
                <p>I analyzed the existing SQL Server architecture and the company's Microsoft 365 ecosystem. I researched the trigger mechanisms within Microsoft Power Automate and evaluated how they could interface securely with our SQL databases to transition the team from a 'pull' (manual check) to a 'push' (automated alert) model.</p>
            </div>

            <div class="modal-section project-solution">
                <h4><i class="fas fa-lightbulb text-accent"></i> The Solution & Impact</h4>
                <p>I developed a real-time monitoring ecosystem. I wrote dynamic SQL scripts to identify exceptions and integrated them into Power Automate flows that instantly pinged the relevant stakeholders via Microsoft Teams the moment an anomaly occurred.</p>
                <ul class="duties mt-3" style="padding-left: 20px;">
                    <li>Replaced a fully manual monitoring process with an intelligent, 24/7 proactive alerting system.</li>
                    <li>Built dynamic SQL-driven Excel dashboards providing a holistic historical view of recurring failures.</li>
                    <li>Significantly improved SLA adherence and reduced the time-to-resolution for data pipeline breakages.</li>
                </ul>
            </div>
        `,
        tech: ['Power Automate', 'SQL Server', 'Microsoft Teams', 'Excel Dynamic Dashboards'],
        link: '#'
    },
    'file-download': {
        title: 'Agentic Workflow Investigation',
        meta: 'Personal Project | Copilot Studio',
        img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        desc: `
            <div class="modal-section project-overview">
                <h4><i class="fas fa-bullseye text-accent"></i> The Challenge</h4>
                <p>As part of my continuous learning initiative, I recognized that static automations (RPA) are becoming obsolete compared to dynamic, AI-driven agentic workflows, especially when dealing with unstructured data or changing UI interfaces on complex portals.</p>
            </div>
            
            <div class="modal-section project-research">
                <h4><i class="fas fa-search text-accent"></i> My Research Process</h4>
                <p>I dedicated time to studying the capabilities of Microsoft Copilot Studio. I experimented heavily with Prompt Engineering and Context Engineering to understand how an LLM agent could be directed to autonomously navigate portals, extract specific data sets, and handle unpredictable corner cases without explicitly programmed step-by-step logic.</p>
            </div>

            <div class="modal-section project-solution">
                <h4><i class="fas fa-lightbulb text-accent"></i> The Solution & Impact</h4>
                <p>I successfully prototyped an agent capable of extracting structured data from unstructured portal environments. A key learning was implementing responsible interaction delays ('humanizing' the bot) to prevent overwhelming target servers.</p>
                <ul class="duties mt-3" style="padding-left: 20px;">
                    <li>Developed core competencies in orchestrating Agentic Workflows.</li>
                    <li>Created an internal knowledge base on effective Prompt Engineering techniques for data extraction.</li>
                    <li>Demonstrated the viability of transitioning legacy procedural RPA scripts into adaptable AI agents.</li>
                </ul>
            </div>
        `,
        tech: ['Python', 'VS Code', 'Copilot Studio', 'Agentic Workflows'],
        link: '#'
    }
};

const modal = document.getElementById('project-modal');
const modalBody = document.getElementById('modal-body');
const modalCloseBtn = document.getElementById('modal-close');

window.openModal = function(projectId) {
    const data = modalData[projectId];
    if (!data) return;
    
    // Generate Tech Tags
    const techTags = data.tech.map(t => `<span class="tag">${t}</span>`).join('');
    
    // Generate GitHub Link if exists
    const linkHtml = data.link !== '#' 
        ? `<a href="${data.link}" target="_blank" class="btn btn-primary" style="padding: 8px 15px; font-size: 0.9rem;"><i class="fab fa-github"></i> View Source</a>` 
        : '';
        
    modalBody.innerHTML = `
        <div class="modal-content-wrapper" style="padding: 10px;">
            <h2 class="project-title">${data.title}</h2>
            <div class="modal-meta" style="margin-bottom: 15px;">${data.meta}</div>
            
            <div class="modal-meta-row" style="margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                <div class="modal-tech" style="display: flex; flex-wrap: wrap; gap: 8px; flex: 1;">${techTags}</div>
                <div class="modal-link-btn" style="flex-shrink: 0; min-width: max-content;">${linkHtml}</div>
            </div>
            
            <div class="modal-desc">${data.desc}</div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
};

const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
};

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
if (modal) {
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    // Escape key support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
}

// ==== Section Full-Page Modals ====
const sectionModal = document.getElementById('section-modal');
const sectionModalBody = document.getElementById('section-modal-body');
const sectionModalTitle = document.getElementById('section-modal-title');
const sectionModalCloseBtn = document.getElementById('section-modal-close');

window.openSectionModal = function(sectionId, title) {
    const sectionEl = document.getElementById(sectionId);
    if (!sectionEl) return;
    
    sectionModalTitle.innerText = title;
    
    // Determine which container to clone based on the section
    if (sectionId === 'experience') {
        const contentToClone = sectionEl.querySelector('.timeline');
        if (contentToClone) {
            const clonedContent = contentToClone.cloneNode(true);
            sectionModalBody.innerHTML = '';
            sectionModalBody.appendChild(clonedContent);
        }
    } else if (sectionId === 'projects') {
        // Instead of cloning the grid, build a full text-heavy expanded view of all projects
        let fullProjectsHTML = '<div class="projects-full-view" style="display: flex; flex-direction: column; gap: 40px;">';
        
        for (const [id, data] of Object.entries(modalData)) {
            const techTags = data.tech.map(t => `<span class="tag">${t}</span>`).join('');
            const linkHtml = data.link !== '#' ? `<a href="${data.link}" target="_blank" class="btn btn-primary" style="margin-top: 15px;"><i class="fab fa-github"></i> View Source</a>` : '';
            
            fullProjectsHTML += `
                <div class="project-full-item glass-card" style="padding: 40px; border-radius: 16px;">
                    <h2 class="project-title" style="font-size: 1.8rem; margin-bottom: 10px; color: var(--accent);">${data.title}</h2>
                    <div class="modal-meta" style="margin-bottom: 25px; font-weight: 500;">${data.meta}</div>
                    
                    <div class="modal-desc" style="font-size: 1.05rem;">
                        ${data.desc}
                    </div>
                    
                    <div class="modal-tech" style="margin-top: 30px; display: flex; flex-wrap: wrap; gap: 10px;">
                        ${techTags}
                    </div>
                    
                    <div style="margin-top: 20px;">
                        ${linkHtml}
                    </div>
                </div>
            `;
        }
        fullProjectsHTML += '</div>';
        
        sectionModalBody.innerHTML = fullProjectsHTML;
    }
    
    sectionModal.classList.add('active');
    document.body.style.overflow = 'hidden'; 
};

const closeSectionModal = () => {
    if(!sectionModal) return;
    sectionModal.classList.remove('active');
    // Only restore scroll if the main project modal isn't also open
    if(!document.getElementById('project-modal').classList.contains('active')){
         document.body.style.overflow = '';
    }
    setTimeout(() => { sectionModalBody.innerHTML = ''; }, 300);
};

if (sectionModalCloseBtn) sectionModalCloseBtn.addEventListener('click', closeSectionModal);
if (sectionModal) {
    sectionModal.querySelector('.modal-overlay').addEventListener('click', closeSectionModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sectionModal.classList.contains('active')) closeSectionModal();
    });
}

// ==== 3-second Auto-Open Hover Effect ====
const projectCards = document.querySelectorAll('.project-card');
let hoverTimer;

// Toggle reference
const autoOpenToggle = document.getElementById('auto-open-toggle');

// Function to update the hint text based on toggle state
const updateCardHints = () => {
    const isEnabled = autoOpenToggle && autoOpenToggle.checked;
    document.querySelectorAll('.view-more-hint').forEach(hint => {
        hint.innerHTML = isEnabled 
            ? 'Hover for 3s or click to view deep-dive <i class="fas fa-arrow-right"></i>'
            : 'Click to view deep-dive <i class="fas fa-arrow-right"></i>';
    });
};

// Initial update
if (autoOpenToggle) {
    updateCardHints();
    autoOpenToggle.addEventListener('change', updateCardHints);
}

projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        if (autoOpenToggle && !autoOpenToggle.checked) return;

        card.classList.add('hovering');
        const projectId = card.getAttribute('data-project');
        
        // Ensure progress bar fills
        const progressBar = card.querySelector('.hover-progress-bar');
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.transition = 'width 3s linear';
        }

        hoverTimer = setTimeout(() => {
            if(projectId) {
                window.openModal(projectId);
                card.classList.remove('hovering');
                if (progressBar) progressBar.style.width = '0%';
            }
        }, 3000); 
    });

    card.addEventListener('mouseleave', () => {
        card.classList.remove('hovering');
        const progressBar = card.querySelector('.hover-progress-bar');
        if (progressBar) {
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
        }


        clearTimeout(hoverTimer);
    });
});


// ==== Contact form JS removed ====

// ==== Global Contact Interaction Utilities ====
function copyToClipboard(text, element) {
    const showTooltip = () => {
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.textContent = 'Copied!';
        tooltip.style.position = 'absolute';
        tooltip.style.background = 'var(--accent)';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '4px 8px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        tooltip.style.transform = 'translateY(10px)';
        tooltip.style.zIndex = '1000';
        
        // Position relative to the clicked element
        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.top + window.scrollY - 30}px`;
        tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2)}px`;
        tooltip.style.transform = `translateX(-50%) translateY(0)`;
        
        document.body.appendChild(tooltip);
        
        // Animate in
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
        });
        
        // Remove after 2 seconds
        setTimeout(() => {
            tooltip.style.opacity = '0';
            tooltip.style.transform = `translateX(-50%) translateY(-10px)`;
            setTimeout(() => tooltip.remove(), 200);
        }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showTooltip).catch(err => {
            console.error('Failed to copy contact info: ', err);
            fallbackCopyTextToClipboard(text, showTooltip);
        });
    } else {
        fallbackCopyTextToClipboard(text, showTooltip);
    }
}

function fallbackCopyTextToClipboard(text, successCallback) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        var successful = document.execCommand('copy');
        if (successful) successCallback();
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
}

function openAhmedabadMap() {
    window.open('https://www.google.com/maps/place/Ahmedabad,+Gujarat,+India', '_blank');
}

// Haptics for all primary interactions in Cosmic Purple Mode
document.addEventListener('click', (e) => {
    if (document.documentElement.getAttribute('data-theme') !== 'purple') return;
    
    // Trigger on buttons, links, or specific interactive cards
    if (e.target.closest('a, button, .project-card, .edu-card, .hero-stat-box')) {
        triggerHaptic('click');
    }
});

// ==== Dark Mode Scroll Reveal for Contact Video ====
window.addEventListener('scroll', () => {
    // Only apply this effect in default Dark Mode (when no data-theme is set)
    if (document.documentElement.hasAttribute('data-theme')) {
        // Reset transform just in case User changed themes midway
        const darkBg = document.querySelector('.dark-bg');
        if(darkBg) darkBg.style.transform = 'translateY(0)';
        return;
    }

    const contactSection = document.getElementById('contact');
    const darkBg = document.querySelector('.dark-bg');
    
    if (contactSection && darkBg) {
        const rect = contactSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // If the contact section is entering the viewport from the bottom
        if (rect.top < windowHeight) {
            const visibleAmount = windowHeight - rect.top;
            // Translate the fixed dark bg UP by exactly the visible amount
            // This perfectly aligns the bottom edge of the image with the top edge of the contact section
            darkBg.style.transform = `translateY(-${visibleAmount}px)`;
        } else {
            darkBg.style.transform = 'translateY(0)';
        }
    }
}, { passive: true });
