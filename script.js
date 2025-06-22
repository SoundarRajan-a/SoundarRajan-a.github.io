// ============= CONFIGURATION =============
const BLOG_CONFIG = {
    githubUsername: 'SoundarRajan-a',
    githubRepo: 'blog-content',
    postsPerPage: 3,
    maxPosts: 12,
    cacheTimeout: 300000 // 5 minutes
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

// ============= DOM ELEMENTS =============
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
    page404: null // Will be created dynamically
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

// ============= 404 PAGE CREATION =============
const create404Page = () => {
    const page404HTML = `
        <div id="page-404" class="page-404 hidden" role="main" aria-labelledby="error-title">
            <div class="error-container">
                <div class="error-content">
                    <div class="error-animation">
                        <div class="error-number">404</div>
                        <div class="error-glitch">404</div>
                    </div>
                    
                    <h1 id="error-title" class="error-title">Page Not Found</h1>
                    <p class="error-description">
                        Oops! The page you're looking for seems to have wandered off into the digital void. 
                        Don't worry, even the best developers get lost sometimes!
                    </p>
                    
                    <div class="error-suggestions">
                        <h3>Here's what you can do:</h3>
                        <ul>
                            <li><i class="fas fa-home"></i> Go back to the <a href="#home" class="error-link">homepage</a></li>
                            <li><i class="fas fa-search"></i> Check if the URL is spelled correctly</li>
                            <li><i class="fas fa-envelope"></i> <a href="#contact" class="error-link">Contact me</a> if you think this is a mistake</li>
                            <li><i class="fas fa-project-diagram"></i> Browse my <a href="#projects" class="error-link">projects</a> instead</li>
                        </ul>
                    </div>
                    
                    <div class="error-buttons">
                        <button onclick="goHome()" class="btn btn-primary error-btn">
                            <i class="fas fa-home"></i>
                            Take Me Home
                        </button>
                        <button onclick="goBack()" class="btn btn-secondary error-btn">
                            <i class="fas fa-arrow-left"></i>
                            Go Back
                        </button>
                    </div>
                    
                    <div class="error-quote">
                        <p><i class="fas fa-quote-left"></i> 
                        "In the world of web development, 404 errors are just unexpected detours to discovery." 
                        <i class="fas fa-quote-right"></i></p>
                    </div>
                </div>
                
                <div class="error-decoration">
                    <div class="floating-code">
                        <span>&lt;/html&gt;</span>
                        <span>console.log('oops');</span>
                        <span>404.css</span>
                        <span>function notFound()</span>
                        <span>&lt;div&gt;</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add 404 CSS styles
    const css404 = `
        <style>
        .page-404 {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: var(--gradient-bg);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            overflow: hidden;
        }

        .page-404.hidden {
            display: none;
        }

        .error-container {
            max-width: 800px;
            width: 100%;
            text-align: center;
            position: relative;
            z-index: 10;
        }

        .error-content {
            background: var(--bg-card);
            border: 1px solid rgba(0, 245, 255, 0.2);
            border-radius: var(--radius-lg);
            padding: 3rem 2rem;
            backdrop-filter: blur(20px) saturate(180%);
            box-shadow: var(--shadow-glass);
            position: relative;
            overflow: hidden;
        }

        .error-content::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--gradient-primary);
        }

        .error-animation {
            position: relative;
            margin-bottom: 2rem;
        }

        .error-number {
            font-size: clamp(4rem, 15vw, 8rem);
            font-weight: 900;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1;
            position: relative;
            z-index: 2;
            animation: pulse-glow 2s ease-in-out infinite;
        }

        .error-glitch {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            font-size: clamp(4rem, 15vw, 8rem);
            font-weight: 900;
            color: var(--secondary);
            opacity: 0.7;
            z-index: 1;
            animation: glitch 3s infinite;
        }

        @keyframes pulse-glow {
            0%, 100% {
                filter: drop-shadow(0 0 10px rgba(0, 245, 255, 0.5));
                transform: scale(1);
            }
            50% {
                filter: drop-shadow(0 0 20px rgba(0, 245, 255, 0.8));
                transform: scale(1.05);
            }
        }

        @keyframes glitch {
            0%, 90%, 100% {
                transform: translateX(-50%) skew(0deg);
                opacity: 0;
            }
            10% {
                transform: translateX(-48%) skew(-2deg);
                opacity: 0.7;
            }
            20% {
                transform: translateX(-52%) skew(2deg);
                opacity: 0.5;
            }
            30% {
                transform: translateX(-50%) skew(0deg);
                opacity: 0;
            }
        }

        .error-title {
            font-size: clamp(1.8rem, 5vw, 2.5rem);
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1.5rem;
            animation: fade-in-up 0.8s ease-out 0.2s both;
        }

        .error-description {
            font-size: clamp(1rem, 2.5vw, 1.2rem);
            color: var(--text-secondary);
            margin-bottom: 2rem;
            line-height: 1.7;
            animation: fade-in-up 0.8s ease-out 0.4s both;
        }

        .error-suggestions {
            text-align: left;
            background: var(--bg-glass);
            border: 1px solid rgba(0, 245, 255, 0.1);
            border-radius: var(--radius-md);
            padding: 1.5rem;
            margin: 2rem 0;
            backdrop-filter: blur(10px);
            animation: fade-in-up 0.8s ease-out 0.6s both;
        }

        .error-suggestions h3 {
            color: var(--primary);
            font-size: 1.2rem;
            margin-bottom: 1rem;
            font-weight: 600;
        }

        .error-suggestions ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .error-suggestions li {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
            color: var(--text-secondary);
            font-size: 1rem;
            transition: var(--transition-smooth);
            padding: 0.5rem;
            border-radius: var(--radius-sm);
        }

        .error-suggestions li:hover {
            background: rgba(0, 245, 255, 0.05);
            transform: translateX(5px);
        }

        .error-suggestions li i {
            color: var(--primary);
            width: 16px;
            flex-shrink: 0;
        }

        .error-link {
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
            transition: var(--transition-smooth);
            position: relative;
        }

        .error-link::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--primary);
            transition: var(--transition-smooth);
        }

        .error-link:hover {
            color: var(--text-primary);
        }

        .error-link:hover::after {
            width: 100%;
        }

        .error-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin: 2rem 0;
            animation: fade-in-up 0.8s ease-out 0.8s both;
        }

        .error-btn {
            min-width: 160px;
            padding: 1rem 1.5rem;
            font-size: 1rem;
            border-radius: var(--radius-md);
            transition: var(--transition-smooth);
            position: relative;
            overflow: hidden;
        }

        .error-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: var(--transition-slow);
        }

        .error-btn:hover::before {
            transform: translateX(200%);
        }

        .error-quote {
            margin-top: 2rem;
            padding: 1.5rem;
            background: var(--bg-glass);
            border-left: 4px solid var(--primary);
            border-radius: var(--radius-sm);
            font-style: italic;
            color: var(--text-muted);
            animation: fade-in-up 0.8s ease-out 1s both;
        }

        .error-quote i {
            color: var(--primary);
            opacity: 0.7;
        }

        .error-decoration {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
        }

        .floating-code {
            position: absolute;
            width: 100%;
            height: 100%;
        }

        .floating-code span {
            position: absolute;
            color: var(--primary);
            font-family: 'Courier New', monospace;
            font-size: 0.8rem;
            opacity: 0.1;
            animation: float-code 20s linear infinite;
            white-space: nowrap;
        }

        .floating-code span:nth-child(1) {
            top: 10%;
            left: -10%;
            animation-delay: 0s;
            animation-duration: 25s;
        }

        .floating-code span:nth-child(2) {
            top: 30%;
            right: -15%;
            animation-delay: 5s;
            animation-duration: 30s;
        }

        .floating-code span:nth-child(3) {
            bottom: 20%;
            left: -20%;
            animation-delay: 10s;
            animation-duration: 35s;
        }

        .floating-code span:nth-child(4) {
            top: 60%;
            right: -10%;
            animation-delay: 15s;
            animation-duration: 28s;
        }

        .floating-code span:nth-child(5) {
            bottom: 40%;
            left: -5%;
            animation-delay: 20s;
            animation-duration: 32s;
        }

        @keyframes float-code {
            0% {
                transform: translateX(-50px) translateY(0) rotate(0deg);
                opacity: 0;
            }
            10%, 90% {
                opacity: 0.1;
            }
            50% {
                transform: translateX(calc(100vw + 50px)) translateY(-20px) rotate(5deg);
            }
            100% {
                transform: translateX(calc(100vw + 100px)) translateY(0) rotate(0deg);
                opacity: 0;
            }
        }

        @keyframes fade-in-up {
            0% {
                opacity: 0;
                transform: translateY(30px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .hidden {
            display: none !important;
        }

        @media (max-width: 768px) {
            .page-404 {
                padding: 1rem;
            }
            
            .error-content {
                padding: 2rem 1.5rem;
            }
            
            .error-suggestions {
                text-align: center;
                padding: 1rem;
            }
            
            .error-suggestions ul {
                text-align: left;
            }
            
            .error-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .error-btn {
                width: 100%;
                max-width: 280px;
            }
            
            .floating-code span {
                font-size: 0.6rem;
            }
        }
        </style>
    `;

    // Add CSS to head
    document.head.insertAdjacentHTML('beforeend', css404);
    
    // Add 404 page to body
    document.body.insertAdjacentHTML('beforeend', page404HTML);
    
    elements.page404 = document.getElementById('page-404');
};

// ============= 404 PAGE FUNCTIONALITY =============
const checkRoute = () => {
    const hash = window.location.hash;
    const validRoutes = ['#home', '#about', '#projects', '#blog', '#education', '#skills', '#contact', ''];
    
    clearTimeout(navigationState.current404Timeout);
    
    if (hash && !validRoutes.includes(hash)) {
        show404Page();
        return;
    }
    
    if (elements.page404 && !elements.page404.classList.contains('hidden')) {
        hide404Page();
    }
};

const show404Page = () => {
    if (!elements.page404) {
        create404Page();
    }
    
    elements.page404.classList.remove('hidden');
    document.title = '404 - Page Not Found | Soundarrajan A';
    
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
    
    console.log('404 Page displayed for route:', window.location.hash);
};

const hide404Page = () => {
    if (elements.page404) {
        elements.page404.classList.add('hidden');
    }
    
    document.title = 'Soundarrajan A';
    
    const noindexMeta = document.querySelector('meta[name="robots"][content*="noindex"]');
    if (noindexMeta) {
        noindexMeta.remove();
    }
};

const goHome = () => {
    window.location.hash = '#home';
    hide404Page();
    scrollToTop();
};

const goBack = () => {
    if (window.history.length > 1) {
        window.history.back();
        
        navigationState.current404Timeout = setTimeout(() => {
            const hash = window.location.hash;
            const validRoutes = ['#home', '#about', '#projects', '#blog', '#education', '#skills', '#contact', ''];
            if (hash && !validRoutes.includes(hash)) {
                goHome();
            }
        }, 500);
    } else {
        goHome();
    }
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
    if (elements.page404 && !elements.page404.classList.contains('hidden')) {
        hide404Page();
    }
    
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
    
    // Navigation events
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            smoothScrollTo(targetId);
            
            if (navigationState.isMobileMenuOpen) {
                closeMobileMenu();
            }
        });
    });
    
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
    
    // Hash change events for 404
    window.addEventListener('hashchange', checkRoute);
    
    // Handle direct URL access
    window.addEventListener('load', () => {
        setTimeout(checkRoute, 100);
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        setTimeout(checkRoute, 50);
    });
    
    // Handle 404 page links
    document.addEventListener('click', (e) => {
        if (e.target.matches('.error-link, .error-link *')) {
            const link = e.target.closest('.error-link');
            if (link) {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    window.location.hash = href;
                    hide404Page();
                    smoothScrollTo(href);
                }
            }
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
        
        // Check route for 404
        checkRoute();
        
        console.log('✅ Portfolio website initialized successfully');
        
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
window.test404 = () => {
    window.location.hash = '#nonexistent-page';
};

// Debug object
window.portfolioDebug = {
    blogState,
    projectsState,
    navigationState,
    loadInitialBlogPosts,
    toggleProjects,
    scrollToTop,
    show404Page,
    hide404Page,
    checkRoute,
    goHome,
    goBack
};

console.log('💡 Type window.test404() in console to test 404 page');
