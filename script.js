// ============= CONFIGURATION =============
const BLOG_CONFIG = {
    githubUsername: 'SoundarRajan-a',
    githubRepo: 'blog-content',
    postsPerPage: 3,
    maxPosts: 12,
    cacheTimeout: 300000
};

// ============= STATE MANAGEMENT =============
let blogState = {
    currentPage: 1,
    allPosts: [],
    displayedPosts: [],
    hasMorePosts: true,
    isLoading: false,
    cache: new Map(),
    lastFetch: 0
};

let projectsState = {
    showingAll: false,
    totalProjects: 6,
    initialShow: 2
};

let navigationState = {
    isMobileMenuOpen: false,
    isScrolling: false,
    lastScrollY: 0,
    current404Timeout: null
};

// ============= ROUTING CONFIGURATION =============
const ROUTES = {
    '/': 'home',
    '/home': 'home',
    '/about': 'about',
    '/projects': 'projects',
    '/blog': 'blog',
    '/education': 'education',
    '/skills': 'skills',
    '/contact': 'contact'
};

// DOM elements
const elements = {
    navbar: document.getElementById('navbar'),
    scrollTopBtn: document.getElementById('scrollTop'),
    navLinks: document.querySelectorAll('.nav-link'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileNavOverlay: document.getElementById('mobileNavOverlay'),
    mobileNavLinks: document.querySelectorAll('.mobile-nav-overlay .nav-link'),
    projectsGrid: document.getElementById('projectsGrid'),
    seeMoreBtn: document.getElementById('seeMoreBtn'),
    seeMoreContainer: document.getElementById('seeMoreContainer'),
    blogContainer: document.getElementById('blogContainer'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    loadMoreContainer: document.getElementById('loadMoreContainer'),
    mainContent: document.querySelector('body'),
    page404: null
};

// ============= UTILITY FUNCTIONS =============
const throttle = (func, wait) => {
    let timeout;
    let lastExecTime = 0;
    
    return function executedFunction(...args) {
        const currentTime = Date.now();
        
        if (currentTime - lastExecTime >= wait) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else if (!timeout) {
            timeout = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
                timeout = null;
            }, wait - (currentTime - lastExecTime));
        }
    };
};

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const sanitizeHTML = (str) => {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

// ============= ROUTING SYSTEM =============
class Router {
    constructor() {
        this.currentRoute = '';
        this.init();
    }

    init() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            this.handleRoute();
        });

        // Handle page load
        window.addEventListener('load', () => {
            this.handleRoute();
        });

        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"], a[href^="/"]');
            if (link && this.isInternalLink(link)) {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.navigateTo(href);
            }
        });

        // Initial route check
        this.handleRoute();
    }

    isInternalLink(link) {
        const href = link.getAttribute('href');
        return href && (href.startsWith('#') || href.startsWith('/') || href.includes(window.location.hostname));
    }

    getCurrentPath() {
        // Get path from URL, fallback to hash
        let path = window.location.pathname;
        
        // If we're using hash routing
        if (window.location.hash) {
            path = window.location.hash.replace('#', '');
        }
        
        // Normalize path
        if (path === '' || path === '/') {
            path = '/';
        } else if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        return path.toLowerCase();
    }

    navigateTo(path) {
        // Convert hash to clean URL
        if (path.startsWith('#')) {
            path = path.replace('#', '');
        }
        
        // Normalize path
        if (path === '' || path === '/') {
            path = '/';
        } else if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        // Update URL without reloading page
        if (window.location.pathname !== path) {
            window.history.pushState({}, '', path);
        }
        
        this.handleRoute();
    }

    handleRoute() {
        const path = this.getCurrentPath();
        const section = ROUTES[path];
        
        clearTimeout(navigationState.current404Timeout);
        
        if (section) {
            this.showSection(section);
            this.currentRoute = path;
            
            // Update page title
            this.updatePageTitle(section);
            
            // Hide 404 page if showing
            this.hide404Page();
            
            // Close mobile menu if open
            if (navigationState.isMobileMenuOpen) {
                closeMobileMenu();
            }
            
            console.log(`Navigated to: ${path} -> ${section}`);
        } else {
            this.show404Page();
            console.log(`404: Invalid route ${path}`);
        }
    }

    showSection(sectionId) {
        // Show main content
        const mainSections = document.querySelectorAll('section[id], .hero, .footer');
        mainSections.forEach(section => {
            section.style.display = 'block';
        });
        
        // Scroll to specific section if not home
        if (sectionId !== 'home') {
            setTimeout(() => {
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        } else {
            // Scroll to top for home
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        
        // Update active nav links
        this.updateActiveNavLinks(sectionId);
    }

    updateActiveNavLinks(sectionId) {
        const targetHref = sectionId === 'home' ? '#home' : `#${sectionId}`;
        
        elements.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === targetHref);
        });
        
        elements.mobileNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === targetHref);
        });
    }

    updatePageTitle(section) {
        const titles = {
            home: 'Soundarrajan A | Web Developer',
            about: 'About - Soundarrajan A',
            projects: 'Projects - Soundarrajan A',
            blog: 'Blog - Soundarrajan A',
            education: 'Education - Soundarrajan A',
            skills: 'Skills - Soundarrajan A',
            contact: 'Contact - Soundarrajan A'
        };
        
        document.title = titles[section] || 'Soundarrajan A';
    }

    show404Page() {
        if (!elements.page404) {
            this.create404Page();
        }
        
        // Hide main content
        const mainSections = document.querySelectorAll('section[id], .hero, .footer');
        mainSections.forEach(section => {
            section.style.display = 'none';
        });
        
        elements.page404.style.display = 'flex';
        document.title = '404 - Page Not Found | Soundarrajan A';
        
        // Add noindex meta tag
        let noindexMeta = document.querySelector('meta[name="robots"][content*="noindex"]');
        if (!noindexMeta) {
            noindexMeta = document.createElement('meta');
            noindexMeta.name = 'robots';
            noindexMeta.content = 'noindex, nofollow';
            document.head.appendChild(noindexMeta);
        }
        
        if (navigationState.isMobileMenuOpen) {
            closeMobileMenu();
        }
    }

    hide404Page() {
        if (elements.page404) {
            elements.page404.style.display = 'none';
        }
        
        // Show main content
        const mainSections = document.querySelectorAll('section[id], .hero, .footer');
        mainSections.forEach(section => {
            section.style.display = 'block';
        });
        
        // Remove noindex meta tag
        const noindexMeta = document.querySelector('meta[name="robots"][content*="noindex"]');
        if (noindexMeta) {
            noindexMeta.remove();
        }
    }

    create404Page() {
        const page404HTML = `
            <div id="page-404" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: var(--gradient-bg);
                z-index: 9999;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 2rem;
                overflow: hidden;
            ">
                <div style="
                    max-width: 800px;
                    width: 100%;
                    text-align: center;
                    position: relative;
                    z-index: 10;
                ">
                    <div style="
                        background: var(--bg-card);
                        border: 1px solid rgba(0, 245, 255, 0.2);
                        border-radius: var(--radius-lg);
                        padding: 3rem 2rem;
                        backdrop-filter: blur(20px) saturate(180%);
                        box-shadow: var(--shadow-glass);
                        position: relative;
                        overflow: hidden;
                    ">
                        <div style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 3px;
                            background: var(--gradient-primary);
                        "></div>
                        
                        <div style="position: relative; margin-bottom: 2rem;">
                            <div style="
                                font-size: clamp(4rem, 15vw, 8rem);
                                font-weight: 900;
                                background: var(--gradient-primary);
                                -webkit-background-clip: text;
                                background-clip: text;
                                -webkit-text-fill-color: transparent;
                                line-height: 1;
                                position: relative;
                                z-index: 2;
                            ">404</div>
                        </div>
                        
                        <h1 style="
                            font-size: clamp(1.8rem, 5vw, 2.5rem);
                            font-weight: 700;
                            color: var(--text-primary);
                            margin-bottom: 1.5rem;
                        ">Page Not Found</h1>
                        
                        <p style="
                            font-size: clamp(1rem, 2.5vw, 1.2rem);
                            color: var(--text-secondary);
                            margin-bottom: 2rem;
                            line-height: 1.7;
                        ">
                            Oops! The page you're looking for seems to have wandered off into the digital void. 
                            Don't worry, even the best developers get lost sometimes!
                        </p>
                        
                        <div style="
                            text-align: left;
                            background: var(--bg-glass);
                            border: 1px solid rgba(0, 245, 255, 0.1);
                            border-radius: var(--radius-md);
                            padding: 1.5rem;
                            margin: 2rem 0;
                            backdrop-filter: blur(10px);
                        ">
                            <h3 style="
                                color: var(--primary);
                                font-size: 1.2rem;
                                margin-bottom: 1rem;
                                font-weight: 600;
                            ">Here's what you can do:</h3>
                            <ul style="list-style: none; padding: 0; margin: 0;">
                                <li style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.75rem;
                                    margin-bottom: 0.75rem;
                                    color: var(--text-secondary);
                                    font-size: 1rem;
                                    padding: 0.5rem;
                                    border-radius: var(--radius-sm);
                                ">
                                    <i class="fas fa-home" style="color: var(--primary); width: 16px;"></i>
                                    Go back to the <a href="/" onclick="goHome(); return false;" style="color: var(--primary); text-decoration: none; font-weight: 500;">homepage</a>
                                </li>
                                <li style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.75rem;
                                    margin-bottom: 0.75rem;
                                    color: var(--text-secondary);
                                    font-size: 1rem;
                                    padding: 0.5rem;
                                    border-radius: var(--radius-sm);
                                ">
                                    <i class="fas fa-search" style="color: var(--primary); width: 16px;"></i>
                                    Check if the URL is spelled correctly
                                </li>
                                <li style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.75rem;
                                    margin-bottom: 0.75rem;
                                    color: var(--text-secondary);
                                    font-size: 1rem;
                                    padding: 0.5rem;
                                    border-radius: var(--radius-sm);
                                ">
                                    <i class="fas fa-envelope" style="color: var(--primary); width: 16px;"></i>
                                    <a href="/contact" onclick="goToContact(); return false;" style="color: var(--primary); text-decoration: none; font-weight: 500;">Contact me</a> if you think this is a mistake
                                </li>
                                <li style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.75rem;
                                    margin-bottom: 0.75rem;
                                    color: var(--text-secondary);
                                    font-size: 1rem;
                                    padding: 0.5rem;
                                    border-radius: var(--radius-sm);
                                ">
                                    <i class="fas fa-project-diagram" style="color: var(--primary); width: 16px;"></i>
                                    Browse my <a href="/projects" onclick="goToProjects(); return false;" style="color: var(--primary); text-decoration: none; font-weight: 500;">projects</a> instead
                                </li>
                            </ul>
                        </div>
                        
                        <div style="
                            display: flex;
                            gap: 1rem;
                            justify-content: center;
                            flex-wrap: wrap;
                            margin: 2rem 0;
                        ">
                            <button onclick="goHome()" style="
                                min-width: 160px;
                                padding: 1rem 1.5rem;
                                font-size: 1rem;
                                border-radius: var(--radius-md);
                                position: relative;
                                overflow: hidden;
                                background: var(--gradient-primary);
                                color: var(--text-primary);
                                border: none;
                                cursor: pointer;
                                transition: var(--transition-smooth);
                                box-shadow: var(--shadow-neon);
                            ">
                                <i class="fas fa-home"></i>
                                Take Me Home
                            </button>
                            <button onclick="goBack()" style="
                                min-width: 160px;
                                padding: 1rem 1.5rem;
                                font-size: 1rem;
                                border-radius: var(--radius-md);
                                position: relative;
                                overflow: hidden;
                                background: var(--bg-glass);
                                color: var(--text-primary);
                                border: 1px solid rgba(0, 245, 255, 0.3);
                                cursor: pointer;
                                transition: var(--transition-smooth);
                                backdrop-filter: blur(10px);
                            ">
                                <i class="fas fa-arrow-left"></i>
                                Go Back
                            </button>
                        </div>
                        
                        <div style="
                            margin-top: 2rem;
                            padding: 1.5rem;
                            background: var(--bg-glass);
                            border-left: 4px solid var(--primary);
                            border-radius: var(--radius-sm);
                            font-style: italic;
                            color: var(--text-muted);
                        ">
                            <p><i class="fas fa-quote-left" style="color: var(--primary); opacity: 0.7;"></i> 
                            "In the world of web development, 404 errors are just unexpected detours to discovery." 
                            <i class="fas fa-quote-right" style="color: var(--primary); opacity: 0.7;"></i></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', page404HTML);
        elements.page404 = document.getElementById('page-404');
    }
}

// Initialize router
let router;

// 404 page navigation functions
const goHome = () => {
    router.navigateTo('/');
};

const goBack = () => {
    if (window.history.length > 1) {
        window.history.back();
        
        navigationState.current404Timeout = setTimeout(() => {
            const path = router.getCurrentPath();
            if (!ROUTES[path]) {
                goHome();
            }
        }, 500);
    } else {
        goHome();
    }
};

const goToContact = () => {
    router.navigateTo('/contact');
};

const goToProjects = () => {
    router.navigateTo('/projects');
};

// ============= NAVBAR FUNCTIONALITY =============
const handleScroll = throttle(() => {
    if (navigationState.isScrolling) return;
    
    requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        
        elements.navbar?.classList.toggle('scrolled', scrollY > 50);
        elements.scrollTopBtn?.classList.toggle('visible', scrollY > 100);
        
        updateActiveNavLinks();
        navigationState.lastScrollY = scrollY;
    });
}, 16);

const updateActiveNavLinks = () => {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    const scrollPosition = window.scrollY;
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const offsetTop = scrollPosition + rect.top - 100;
        const offsetBottom = offsetTop + section.offsetHeight;
        
        if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            current = section.getAttribute('id');
        }
    });
    
    if (current) {
        const targetHref = `#${current}`;
        
        elements.navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === targetHref);
        });
        
        elements.mobileNavLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === targetHref);
        });
    }
};

const smoothScrollTo = (targetId) => {
    const target = document.querySelector(targetId);
    if (!target) return;
    
    navigationState.isScrolling = true;
    const offsetTop = target.offsetTop - 80;
    
    window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
    });
    
    setTimeout(() => {
        navigationState.isScrolling = false;
    }, 1000);
};

const openMobileMenu = () => {
    navigationState.isMobileMenuOpen = true;
    elements.mobileNavOverlay?.classList.add('active');
    if (elements.mobileMenuBtn) {
        elements.mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
        elements.mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
};

const closeMobileMenu = () => {
    navigationState.isMobileMenuOpen = false;
    elements.mobileNavOverlay?.classList.remove('active');
    if (elements.mobileMenuBtn) {
        elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
};

const toggleMobileMenu = () => {
    navigationState.isMobileMenuOpen ? closeMobileMenu() : openMobileMenu();
};

const scrollToTop = () => {
    navigationState.isScrolling = true;
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    setTimeout(() => {
        navigationState.isScrolling = false;
    }, 1000);
};

// ============= PROJECTS FUNCTIONALITY =============
const initializeProjects = () => {
    const allProjectItems = document.querySelectorAll('.project-item');
    
    allProjectItems.forEach((item, index) => {
        item.classList.toggle('hidden', index >= projectsState.initialShow);
    });
    
    if (elements.seeMoreContainer) {
        elements.seeMoreContainer.style.display = 
            allProjectItems.length > projectsState.initialShow ? 'block' : 'none';
    }
};

const toggleProjects = () => {
    const hiddenProjects = document.querySelectorAll('.project-item.hidden');
    const allProjects = document.querySelectorAll('.project-item');
    
    if (!projectsState.showingAll) {
        hiddenProjects.forEach((project, index) => {
            setTimeout(() => {
                project.classList.remove('hidden');
                project.classList.add('show-animation');
            }, index * 100);
        });
        
        if (elements.seeMoreBtn) {
            elements.seeMoreBtn.innerHTML = '<i class="fas fa-minus"></i> Show Less';
        }
        projectsState.showingAll = true;
    } else {
        allProjects.forEach((project, index) => {
            if (index >= projectsState.initialShow) {
                project.classList.add('hidden');
                project.classList.remove('show-animation');
            }
        });
        
        if (elements.seeMoreBtn) {
            elements.seeMoreBtn.innerHTML = '<i class="fas fa-plus"></i> See More Projects';
        }
        projectsState.showingAll = false;
        
        smoothScrollTo('#projects');
    }
};

// ============= BLOG FUNCTIONALITY =============
const fetchBlogPosts = async (page = 1) => {
    const cacheKey = `blog-page-${page}`;
    const now = Date.now();
    
    if (blogState.cache.has(cacheKey) && 
        (now - blogState.lastFetch) < BLOG_CONFIG.cacheTimeout) {
        return blogState.cache.get(cacheKey);
    }
    
    try {
        blogState.isLoading = true;
        updateLoadMoreButton(true);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(
            `https://api.github.com/repos/${BLOG_CONFIG.githubUsername}/${BLOG_CONFIG.githubRepo}/issues?labels=blog&state=open&sort=created&direction=desc&page=${page}&per_page=${BLOG_CONFIG.postsPerPage}`,
            { 
                signal: controller.signal,
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const issues = await response.json();
        
        blogState.cache.set(cacheKey, issues);
        blogState.lastFetch = now;
        
        return issues;
        
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - please check your connection');
        }
        
        throw error;
    } finally {
        blogState.isLoading = false;
        updateLoadMoreButton(false);
    }
};

const loadInitialBlogPosts = async () => {
    if (!elements.blogContainer) return;
    
    try {
        const issues = await fetchBlogPosts(1);
        
        if (issues.length === 0) {
            elements.blogContainer.innerHTML = `
                <div class="blog-empty">
                    <i class="fas fa-pen-alt" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No blog posts yet</h3>
                    <p>Create an issue with the label "blog" in your GitHub repository to add blog posts!</p>
                </div>
            `;
            return;
        }
        
        blogState.allPosts = issues;
        blogState.displayedPosts = issues;
        blogState.currentPage = 1;
        
        blogState.hasMorePosts = issues.length === BLOG_CONFIG.postsPerPage;
        
        if (elements.loadMoreContainer) {
            elements.loadMoreContainer.style.display = 
                blogState.hasMorePosts ? 'block' : 'none';
        }
        
        renderBlogPosts(issues, true);
        
    } catch (error) {
        console.error('Error loading initial blog posts:', error);
        elements.blogContainer.innerHTML = `
            <div class="blog-empty">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--secondary);"></i>
                <h3>Unable to load blog posts</h3>
                <p>Error: ${error.message}</p>
                <button onclick="loadInitialBlogPosts()" class="btn btn-secondary" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
};

const loadMoreBlogPosts = async () => {
    if (blogState.isLoading || !blogState.hasMorePosts) return;
    
    try {
        const nextPage = blogState.currentPage + 1;
        const newPosts = await fetchBlogPosts(nextPage);
        
        if (newPosts.length > 0) {
            blogState.currentPage = nextPage;
            blogState.allPosts = [...blogState.allPosts, ...newPosts];
            blogState.displayedPosts = [...blogState.displayedPosts, ...newPosts];
            
            renderBlogPosts(newPosts, false);
            
            blogState.hasMorePosts = newPosts.length === BLOG_CONFIG.postsPerPage;
            
            if (!blogState.hasMorePosts && elements.loadMoreContainer) {
                elements.loadMoreContainer.style.display = 'none';
            }
        } else {
            blogState.hasMorePosts = false;
            if (elements.loadMoreContainer) {
                elements.loadMoreContainer.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading more blog posts:', error);
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'blog-error';
        errorMsg.innerHTML = `
            <p style="color: var(--secondary); text-align: center; margin: 1rem 0;">
                Failed to load more posts: ${error.message}
            </p>
        `;
        elements.loadMoreContainer?.parentNode.insertBefore(errorMsg, elements.loadMoreContainer);
        
        setTimeout(() => errorMsg.remove(), 5000);
    }
};

const renderBlogPosts = (posts, isInitial = false) => {
    if (!elements.blogContainer) return;
    
    if (isInitial) {
        const blogHTML = `
            <div class="blog-grid" id="blogGrid">
                ${posts.map(post => createBlogCard(post)).join('')}
            </div>
        `;
        elements.blogContainer.innerHTML = blogHTML;
    } else {
        const blogGrid = document.getElementById('blogGrid');
        if (blogGrid) {
            posts.forEach(post => {
                const cardHTML = createBlogCard(post);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cardHTML;
                const card = tempDiv.firstElementChild;
                card.classList.add('loading-animation');
                blogGrid.appendChild(card);
            });
        }
    }
    
    setTimeout(() => {
        const newCards = document.querySelectorAll('.blog-card:not(.visible)');
        newCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in', 'visible');
            }, index * 200);
        });
    }, 100);
};

const processMarkdown = (text) => {
    if (!text) return 'No content available.';
    
    return text
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/## (.*)/g, '<h2>$1</h2>')
        .replace(/# (.*)/g, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/``````/g, '<pre><code>$1</code></pre>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/^\> (.*)/gm, '<blockquote>$1</blockquote>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
};

const createBlogCard = (issue) => {
    const date = new Date(issue.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let fullContent = processMarkdown(issue.body || '');
    
    if (!fullContent.startsWith('<')) {
        fullContent = '<p>' + fullContent + '</p>';
    }
    
    const labelsHTML = issue.labels
        .filter(label => label.name !== 'blog')
        .map(label => `<span class="blog-label" style="background-color: #${label.color};">${sanitizeHTML(label.name)}</span>`)
        .join('');
    
    return `
        <div class="blog-card fade-in">
            <div class="blog-content">
                <div class="blog-meta">
                    <div class="blog-date">
                        <i class="fas fa-calendar-alt"></i>
                        ${date}
                    </div>
                    ${labelsHTML ? `<div class="blog-labels">${labelsHTML}</div>` : ''}
                </div>
                <h3 class="blog-title">${sanitizeHTML(issue.title)}</h3>
                <div class="blog-full-content">${fullContent}</div>
            </div>
        </div>
    `;
};

const updateLoadMoreButton = (isLoading) => {
    if (!elements.loadMoreBtn) return;
    
    elements.loadMoreBtn.classList.toggle('loading', isLoading);
    elements.loadMoreBtn.disabled = isLoading;
};

// ============= EVENT LISTENERS =============
const initializeEventListeners = () => {
    // Scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Mobile menu events
    elements.mobileMenuBtn?.addEventListener('click', toggleMobileMenu);
    
    elements.mobileNavOverlay?.addEventListener('click', (e) => {
        if (e.target === elements.mobileNavOverlay) {
            closeMobileMenu();
        }
    });
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (navigationState.isMobileMenuOpen) {
                closeMobileMenu();
            }
        }
    });
    
    // Projects events
    elements.seeMoreBtn?.addEventListener('click', toggleProjects);
    
    // Blog events
    elements.loadMoreBtn?.addEventListener('click', loadMoreBlogPosts);
    
    // Scroll to top event
    elements.scrollTopBtn?.addEventListener('click', scrollToTop);
    
    // Resize handler
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768 && navigationState.isMobileMenuOpen) {
            closeMobileMenu();
        }
    }, 250));
    
    // Page visibility change handler
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && navigationState.isMobileMenuOpen) {
            closeMobileMenu();
        }
    });
};

// ============= INTERSECTION OBSERVER =============
const initializeIntersectionObserver = () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
    
    return observer;
};

// ============= INITIALIZATION =============
const initializeWebsite = async () => {
    try {
        // Initialize router first
        router = new Router();
        
        // Initialize navbar state
        updateActiveNavLinks();
        
        if (window.scrollY > 50) {
            elements.navbar?.classList.add('scrolled');
        }
        
        if (window.scrollY > 100) {
            elements.scrollTopBtn?.classList.add('visible');
        }
        
        // Initialize projects
        initializeProjects();
        
        // Initialize event listeners
        initializeEventListeners();
        
        // Initialize intersection observer
        initializeIntersectionObserver();
        
        // Initialize blog (async)
        await loadInitialBlogPosts();
        
        console.log('✅ Portfolio website initialized successfully with routing');
        
    } catch (error) {
        console.error('❌ Error initializing website:', error);
    }
};

// ============= STARTUP =============
document.addEventListener('DOMContentLoaded', initializeWebsite);

// ============= GLOBAL FUNCTIONS =============
window.scrollToTop = scrollToTop;
window.loadInitialBlogPosts = loadInitialBlogPosts;
window.goHome = goHome;
window.goBack = goBack;
window.goToContact = goToContact;
window.goToProjects = goToProjects;

// Test function
window.test404 = () => {
    router.navigateTo('/nonexistent-page');
};

// Debug object
window.portfolioDebug = {
    blogState,
    projectsState,
    navigationState,
    router,
    ROUTES,
    loadInitialBlogPosts,
    toggleProjects,
    scrollToTop
};

console.log('💡 Type window.test404() in console to test 404 page');
