// ============= CONFIGURATION =============
const BLOG_CONFIG = {
    githubUsername: 'SoundarRajan-a',
    githubRepo: 'blog-content',
    postsPerPage: 3,
    maxPosts: 12,
    cacheTimeout: 300000 // 5 minutes
};

const SEO_CONFIG = {
    siteName: 'Soundarrajan A Portfolio',
    baseUrl: 'https://soundarrajan.me',
    author: 'Soundarrajan A',
    defaultTitle: 'Soundarrajan A | Web Developer Portfolio',
    defaultDescription: 'Portfolio of Soundarrajan A, Web developer and Computer Science student specializing in modern web technologies',
    keywords: ['Soundarrajan A', 'web developer', 'portfolio', 'JavaScript', 'HTML', 'CSS']
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
    loadMoreContainer: document.getElementById('loadMoreContainer')
};

// State management
let isMobileMenuOpen = false;
let isScrolling = false;
let lastScrollY = 0;
let scrollDirection = 'up';

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

// ============= SEO MANAGER =============
class SEOManager {
    constructor() {
        this.currentPage = 'home';
        this.initialize();
    }

    initialize() {
        this.setupMetaTagManagement();
        this.setupStructuredData();
        this.optimizeImages();
    }

    setupMetaTagManagement() {
        const sectionTitles = {
            home: {
                title: 'Soundarrajan A | Web Developer Portfolio',
                description: 'Portfolio showcasing modern web development projects, skills, and experience of Soundarrajan A, Computer Science student.',
                keywords: 'Soundarrajan A, web developer, portfolio, projects'
            },
            about: {
                title: 'About Soundarrajan A | Web Developer & CS Student',
                description: 'Learn about Soundarrajan A, a passionate web developer and Computer Science student at ES Arts and Science College, Villupuram.',
                keywords: 'about soundarrajan, computer science student, web developer profile'
            },
            projects: {
                title: 'Projects by Soundarrajan A | Web Development Portfolio',
                description: 'Explore innovative web development projects including Grammar Checker and Magic 8-Ball applications built with modern technologies.',
                keywords: 'web development projects, grammar checker, magic 8-ball, JavaScript projects'
            },
            blog: {
                title: 'Blog | Soundarrajan A - Web Developer Insights',
                description: 'Read latest articles, tutorials, and insights about web development, programming, and technology by Soundarrajan A.',
                keywords: 'web development blog, programming tutorials, technology insights'
            },
            education: {
                title: 'Education | Soundarrajan A - Academic Journey',
                description: 'Academic background of Soundarrajan A including Computer Science studies at ES Arts and Science College.',
                keywords: 'computer science education, ES arts science college, academic background'
            },
            skills: {
                title: 'Skills & Technologies | Soundarrajan A Web Developer',
                description: 'Technical skills and expertise in HTML, CSS, JavaScript, UI/UX Design, and modern web development technologies.',
                keywords: 'web development skills, HTML, CSS, JavaScript, UI/UX design'
            },
            contact: {
                title: 'Contact Soundarrajan A | Web Developer',
                description: 'Get in touch with Soundarrajan A for web development projects, collaborations, or opportunities.',
                keywords: 'contact web developer, hire developer, collaboration'
            }
        };

        this.metaTags = sectionTitles;
    }

    updateMetaTags(section = 'home') {
        if (!this.metaTags[section]) return;
        
        const meta = this.metaTags[section];
        
        // Update title
        document.title = meta.title;
        this.updateMetaTag('title', meta.title);
        
        // Update description
        this.updateMetaTag('description', meta.description);
        
        // Update keywords
        this.updateMetaTag('keywords', meta.keywords);
        
        // Update Open Graph tags
        this.updateMetaTag('og:title', meta.title, 'property');
        this.updateMetaTag('og:description', meta.description, 'property');
        this.updateMetaTag('og:url', `${SEO_CONFIG.baseUrl}#${section}`, 'property');
        
        // Update Twitter tags
        this.updateMetaTag('twitter:title', meta.title);
        this.updateMetaTag('twitter:description', meta.description);
        
        this.currentPage = section;
    }

    updateMetaTag(name, content, attribute = 'name') {
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, name);
            document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
    }

    setupStructuredData() {
        this.addProjectsStructuredData();
        this.addBlogStructuredData();
    }

    addProjectsStructuredData() {
        const projects = [
            {
                "@type": "SoftwareApplication",
                "name": "Grammar Checker",
                "description": "A web application that helps users improve their writing by checking grammar, punctuation, and style.",
                "url": "https://grammar.soundarrajan.me",
                "author": {
                    "@type": "Person",
                    "name": "Soundarrajan A"
                },
                "programmingLanguage": ["HTML", "JavaScript", "CSS"],
                "applicationCategory": "WebApplication"
            },
            {
                "@type": "SoftwareApplication", 
                "name": "Magic 8-Ball",
                "description": "A fun web application that simulates the classic Magic 8-Ball toy, providing random answers to user questions.",
                "url": "https://game.soundarrajan.me",
                "author": {
                    "@type": "Person",
                    "name": "Soundarrajan A"
                },
                "programmingLanguage": ["HTML", "JavaScript", "CSS"],
                "applicationCategory": "GameApplication"
            }
        ];

        this.addStructuredDataToPage('projects-schema', {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Web Development Projects by Soundarrajan A",
            "description": "Collection of web development projects showcasing modern technologies and programming skills",
            "itemListElement": projects.map((project, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": project
            }))
        });
    }

    addBlogStructuredData() {
        this.addStructuredDataToPage('blog-schema', {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Soundarrajan A Development Blog",
            "description": "Insights, tutorials, and thoughts on web development and programming",
            "url": `${SEO_CONFIG.baseUrl}#blog`,
            "author": {
                "@type": "Person",
                "name": "Soundarrajan A"
            }
        });
    }

    addStructuredDataToPage(id, data) {
        const existing = document.getElementById(id);
        if (existing) {
            existing.remove();
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = id;
        script.textContent = JSON.stringify(data, null, 2);
        document.head.appendChild(script);
    }

    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            if (!img.getAttribute('alt')) {
                const src = img.getAttribute('src');
                if (src.includes('aakash')) {
                    img.setAttribute('alt', 'Soundarrajan A - Web Developer Profile Photo');
                } else {
                    img.setAttribute('alt', 'Portfolio image');
                }
            }
        });
    }
}

// ============= ENHANCED NAVBAR FUNCTIONALITY =============
const handleScroll = throttle(() => {
    if (isScrolling) return;
    
    requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const currentScrollDirection = scrollY > lastScrollY ? 'down' : 'up';
        
        // Enhanced navbar visibility logic
        if (scrollY > 50) {
            elements.navbar?.classList.add('scrolled');
        } else {
            elements.navbar?.classList.remove('scrolled');
        }
        
        // Show navbar when scrolling up or at top, hide when scrolling down
        if (scrollY <= 100) {
            elements.navbar?.classList.remove('hidden');
        } else if (currentScrollDirection === 'up' && scrollDirection === 'down') {
            elements.navbar?.classList.remove('hidden');
        } else if (currentScrollDirection === 'down' && scrollY > lastScrollY + 10) {
            elements.navbar?.classList.add('hidden');
        }
        
        // Scroll to top button
        elements.scrollTopBtn?.classList.toggle('visible', scrollY > 100);
        
        // Update active nav links
        updateActiveNavLinks();
        
        scrollDirection = currentScrollDirection;
        lastScrollY = scrollY;
    });
}, 16);

const updateActiveNavLinks = () => {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    const scrollPosition = window.scrollY;
    const viewportHeight = window.innerHeight;
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const offsetTop = scrollPosition + rect.top - 100;
        const offsetBottom = offsetTop + section.offsetHeight;
        
        if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            current = section.getAttribute('id');
        }
        
        if (!current && rect.top <= viewportHeight / 2 && rect.bottom >= viewportHeight / 2) {
            current = section.getAttribute('id');
        }
    });
    
    if (current && current !== seoManager.currentPage) {
        seoManager.updateMetaTags(current);
        
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
    
    isScrolling = true;
    elements.navbar?.classList.remove('hidden');
    
    const offsetTop = target.offsetTop - 80;
    
    window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
    });
    
    setTimeout(() => {
        isScrolling = false;
    }, 1000);
};

// Mobile menu functions
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
    elements.navbar?.classList.remove('hidden');
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    setTimeout(() => {
        isScrolling = false;
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
        
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'h':
                    e.preventDefault();
                    smoothScrollTo('#home');
                    break;
                case 'p':
                    e.preventDefault();
                    smoothScrollTo('#projects');
                    break;
                case 'b':
                    e.preventDefault();
                    smoothScrollTo('#blog');
                    break;
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
        
        if (elements.navbar) {
            elements.navbar.classList.remove('hidden');
        }
    }, 250));
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isMobileMenuOpen) {
            closeMobileMenu();
        }
    });
    
    document.addEventListener('focusin', (e) => {
        if (e.target.matches('.nav-link')) {
            elements.navbar?.classList.remove('hidden');
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
                
                const animationDelay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                entry.target.style.transitionDelay = `${animationDelay}ms`;
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
    
    return observer;
};

// ============= INITIALIZATION =============
let seoManager;

const initializeWebsite = async () => {
    try {
        console.log('🚀 Initializing Soundarrajan Portfolio...');
        
        seoManager = new SEOManager();
        
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
        
        await loadInitialBlogPosts();
        
        document.body.classList.add('website-loaded');
        
        console.log('✅ Portfolio website initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing website:', error);
    }
};

// ============= STARTUP =============
document.addEventListener('DOMContentLoaded', initializeWebsite);

// Expose functions globally for debugging
window.portfolioDebug = {
    blogState,
    projectsState,
    loadInitialBlogPosts,
    toggleProjects,
    scrollToTop,
    smoothScrollTo,
    updateActiveNavLinks,
    seoManager
};
