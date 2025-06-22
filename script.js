// Keep your existing JavaScript code exactly as it is
// I'm only adding performance and accessibility enhancements

// ============= EXISTING CONFIGURATION (Keep as is) =============
const BLOG_CONFIG = {
    githubUsername: 'SoundarRajan-a',
    githubRepo: 'blog-content',
    postsPerPage: 3,
    maxPosts: 12,
    cacheTimeout: 300000 // 5 minutes
};

// ============= EXISTING STATE MANAGEMENT (Keep as is) =============
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

// ============= EXISTING DOM ELEMENTS (Keep as is) =============
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
    loadMoreContainer: document.getElementById('loadMoreContainer')
};

// EXISTING State management (Keep as is)
let isMobileMenuOpen = false;
let isScrolling = false;
let lastScrollY = 0;
let resizeTimeout;

// ============= KEEP ALL YOUR EXISTING FUNCTIONS =============
// (Your existing throttle, debounce, sanitizeHTML functions)
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

// Enhanced scroll handling with SEO improvements
const handleScroll = throttle(() => {
    if (isScrolling) return;
    
    requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        
        // Navbar scroll effect
        elements.navbar?.classList.toggle('scrolled', scrollY > 50);
        
        // Scroll to top button
        elements.scrollTopBtn?.classList.toggle('visible', scrollY > 100);
        
        updateActiveNavLinks();
        lastScrollY = scrollY;
    });
}, 16);

// Enhanced active nav links with SEO title updates
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
        
        // Update navigation
        elements.navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === targetHref;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
        
        elements.mobileNavLinks.forEach(link => {
            const isActive = link.getAttribute('href') === targetHref;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
        
        // SEO: Update page title dynamically
        updatePageTitle(current);
    }
};

// NEW: SEO title updates
const updatePageTitle = (section) => {
    const titles = {
        'home': 'Soundarrajan A | Web Developer & Computer Science Student',
        'about': 'About - Soundarrajan A | Creative Developer',
        'projects': 'Projects - Soundarrajan A | Featured Work',
        'blog': 'Blog - Soundarrajan A | Latest Articles',
        'education': 'Education - Soundarrajan A | Academic Journey',
        'skills': 'Skills - Soundarrajan A | Technical Expertise',
        'contact': 'Contact - Soundarrajan A | Let\'s Connect'
    };
    
    const newTitle = titles[section] || titles['home'];
    if (document.title !== newTitle) {
        document.title = newTitle;
    }
};

// KEEP ALL YOUR EXISTING FUNCTIONS EXACTLY AS THEY ARE:
// - smoothScrollTo
// - openMobileMenu, closeMobileMenu, toggleMobileMenu
// - scrollToTop
// - initializeProjects, toggleProjects
// - ALL BLOG FUNCTIONS (fetchBlogPosts, loadInitialBlogPosts, etc.)
// - All your existing event listeners and initialization

// Your existing smoothScrollTo function
const smoothScrollTo = (targetId) => {
    const target = document.querySelector(targetId);
    if (!target) return;
    
    isScrolling = true;
    const offsetTop = target.offsetTop - 80;
    
    window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
    });
    
    setTimeout(() => {
        isScrolling = false;
    }, 1000);
};

// Your existing mobile menu functions
const openMobileMenu = () => {
    isMobileMenuOpen = true;
    elements.mobileNavOverlay?.classList.add('active');
    if (elements.mobileMenuBtn) {
        elements.mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
        elements.mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
};

const closeMobileMenu = () => {
    isMobileMenuOpen = false;
    elements.mobileNavOverlay?.classList.remove('active');
    if (elements.mobileMenuBtn) {
        elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
};

const toggleMobileMenu = () => {
    isMobileMenuOpen ? closeMobileMenu() : openMobileMenu();
};

const scrollToTop = () => {
    isScrolling = true;
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    setTimeout(() => {
        isScrolling = false;
    }, 1000);
};

// Your existing projects functions
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

// KEEP ALL YOUR EXISTING BLOG FUNCTIONS EXACTLY AS THEY ARE
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
                    <i class="fas fa-retry"></i> Try Again
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

// Enhanced event listeners with accessibility improvements
const initializeEventListeners = () => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            smoothScrollTo(targetId);
            
            if (isMobileMenuOpen) {
                closeMobileMenu();
            }
        });
    });
    
    elements.mobileMenuBtn?.addEventListener('click', toggleMobileMenu);
    
    elements.mobileNavOverlay?.addEventListener('click', (e) => {
        if (e.target === elements.mobileNavOverlay) {
            closeMobileMenu();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (isMobileMenuOpen) {
                closeMobileMenu();
            }
        }
    });
    
    elements.seeMoreBtn?.addEventListener('click', toggleProjects);
    elements.loadMoreBtn?.addEventListener('click', loadMoreBlogPosts);
    elements.scrollTopBtn?.addEventListener('click', scrollToTop);
    
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768 && isMobileMenuOpen) {
            closeMobileMenu();
        }
    }, 250));
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isMobileMenuOpen) {
            closeMobileMenu();
        }
    });
};

// Enhanced intersection observer
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

// Enhanced initialization with performance monitoring
const initializeWebsite = async () => {
    try {
        // Mark start time for performance
        const startTime = performance.now();
        
        updateActiveNavLinks();
        
        if (window.scrollY > 50) {
            elements.navbar?.classList.add('scrolled');
        }
        
        if (window.scrollY > 100) {
            elements.scrollTopBtn?.classList.add('visible');
        }
        
        initializeProjects();
        initializeEventListeners();
        initializeIntersectionObserver();
        
        // Initialize blog asynchronously
        await loadInitialBlogPosts();
        
        // Log performance
        const endTime = performance.now();
        console.log(`✅ Portfolio initialized in ${Math.round(endTime - startTime)}ms`);
        
    } catch (error) {
        console.error('❌ Error initializing website:', error);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeWebsite);

// Expose functions globally for debugging
window.portfolioDebug = {
    blogState,
    projectsState,
    loadInitialBlogPosts,
    toggleProjects,
    scrollToTop
};
