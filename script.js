 // ============= CONFIGURATION =============
    const BLOG_CONFIG = {
        githubUsername: 'SoundarRajan-a',
        githubRepo: 'blog-content',
        postsPerPage: 3,
        maxPosts: 12
    };

    // ============= STATE MANAGEMENT =============
    let blogState = {
        currentPage: 1,
        allPosts: [],
        displayedPosts: [],
        hasMorePosts: true,
        isLoading: false
    };

    let projectsState = {
        showingAll: false,
        totalProjects: 6,
        initialShow: 3
    };

    // ============= DOM ELEMENTS =============
    const navbar = document.getElementById('navbar');
    const scrollTopBtn = document.getElementById('scrollTop');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-overlay .nav-link');
    
    // Projects elements
    const projectsGrid = document.getElementById('projectsGrid');
    const seeMoreBtn = document.getElementById('seeMoreBtn');
    const seeMoreContainer = document.getElementById('seeMoreContainer');
    
    // Blog elements
    const blogContainer = document.getElementById('blogContainer');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    
    // State management
    let isMobileMenuOpen = false;
    let isScrolling = false;
    let lastScrollY = 0;
    
    // ============= UTILITY FUNCTIONS =============
    function throttle(func, wait) {
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
    }
    
    // ============= NAVBAR FUNCTIONALITY =============
    const handleScroll = throttle(() => {
        if (isScrolling) return;
        
        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            
            // Navbar scroll effect
            if (scrollY > 50) {
                if (!navbar.classList.contains('scrolled')) {
                    navbar.classList.add('scrolled');
                }
            } else {
                if (navbar.classList.contains('scrolled')) {
                    navbar.classList.remove('scrolled');
                }
            }
            
            // Scroll to top button
            if (scrollY > 100) {
                if (!scrollTopBtn.classList.contains('visible')) {
                    scrollTopBtn.classList.add('visible');
                }
            } else {
                if (scrollTopBtn.classList.contains('visible')) {
                    scrollTopBtn.classList.remove('visible');
                }
            }
            
            updateActiveNavLinks();
            lastScrollY = scrollY;
        });
    }, 16);
    
    function updateActiveNavLinks() {
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
            
            navLinks.forEach(link => {
                const isActive = link.getAttribute('href') === targetHref;
                link.classList.toggle('active', isActive);
            });
            
            mobileNavLinks.forEach(link => {
                const isActive = link.getAttribute('href') === targetHref;
                link.classList.toggle('active', isActive);
            });
        }
    }
    
    function smoothScrollTo(targetId) {
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
    }
    
    // Mobile menu functions
    function openMobileMenu() {
        isMobileMenuOpen = true;
        mobileNavOverlay.classList.add('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
        document.body.style.overflow = 'hidden';
    }
    
    function closeMobileMenu() {
        isMobileMenuOpen = false;
        mobileNavOverlay.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.style.overflow = '';
    }
    
    function toggleMobileMenu() {
        if (isMobileMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }
    
    function scrollToTop() {
        isScrolling = true;
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        setTimeout(() => {
            isScrolling = false;
        }, 1000);
    }

    // ============= PROJECTS FUNCTIONALITY =============
    function initializeProjects() {
        const allProjectItems = document.querySelectorAll('.project-item');
        
        // Show only first 3 projects initially
        allProjectItems.forEach((item, index) => {
            if (index >= projectsState.initialShow) {
                item.classList.add('hidden');
            }
        });
        
        // Show "See More" button if there are more than 3 projects
        if (allProjectItems.length > projectsState.initialShow) {
            seeMoreContainer.style.display = 'block';
        } else {
            seeMoreContainer.style.display = 'none';
        }
    }
    
    function toggleProjects() {
        const hiddenProjects = document.querySelectorAll('.project-item.hidden');
        const visibleProjects = document.querySelectorAll('.project-item:not(.hidden)');
        
        if (!projectsState.showingAll) {
            // Show more projects
            hiddenProjects.forEach((project, index) => {
                setTimeout(() => {
                    project.classList.remove('hidden');
                    project.classList.add('show-animation');
                }, index * 100);
            });
            
            seeMoreBtn.innerHTML = '<i class="fas fa-minus"></i> Show Less';
            projectsState.showingAll = true;
        } else {
            // Hide extra projects
            const allProjects = document.querySelectorAll('.project-item');
            allProjects.forEach((project, index) => {
                if (index >= projectsState.initialShow) {
                    project.classList.add('hidden');
                    project.classList.remove('show-animation');
                }
            });
            
            seeMoreBtn.innerHTML = '<i class="fas fa-plus"></i> See More Projects';
            projectsState.showingAll = false;
            
            // Scroll to projects section
            smoothScrollTo('#projects');
        }
    }

    // ============= BLOG FUNCTIONALITY =============
    async function fetchBlogPosts(page = 1) {
        try {
            blogState.isLoading = true;
            updateLoadMoreButton(true);
            
            const response = await fetch(
                `https://api.github.com/repos/${BLOG_CONFIG.githubUsername}/${BLOG_CONFIG.githubRepo}/issues?labels=blog&state=open&sort=created&direction=desc&page=${page}&per_page=${BLOG_CONFIG.postsPerPage}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch blog posts');
            }
            
            const issues = await response.json();
            return issues;
            
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            return [];
        } finally {
            blogState.isLoading = false;
            updateLoadMoreButton(false);
        }
    }
    
    async function loadInitialBlogPosts() {
        const container = document.getElementById('blogContainer');
        
        try {
            const issues = await fetchBlogPosts(1);
            
            if (issues.length === 0) {
                container.innerHTML = `
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
            
            // Check if there are more posts
            if (issues.length === BLOG_CONFIG.postsPerPage) {
                blogState.hasMorePosts = true;
                loadMoreContainer.style.display = 'block';
            } else {
                blogState.hasMorePosts = false;
                loadMoreContainer.style.display = 'none';
            }
            
            renderBlogPosts(issues, true);
            
        } catch (error) {
            console.error('Error loading initial blog posts:', error);
            container.innerHTML = `
                <div class="blog-empty">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--secondary);"></i>
                    <h3>Unable to load blog posts</h3>
                    <p>Please check your GitHub repository configuration.</p>
                </div>
            `;
        }
    }
    
    async function loadMoreBlogPosts() {
        if (blogState.isLoading || !blogState.hasMorePosts) return;
        
        const nextPage = blogState.currentPage + 1;
        const newPosts = await fetchBlogPosts(nextPage);
        
        if (newPosts.length > 0) {
            blogState.currentPage = nextPage;
            blogState.allPosts = [...blogState.allPosts, ...newPosts];
            blogState.displayedPosts = [...blogState.displayedPosts, ...newPosts];
            
            renderBlogPosts(newPosts, false);
            
            // Check if there are more posts
            if (newPosts.length < BLOG_CONFIG.postsPerPage) {
                blogState.hasMorePosts = false;
                loadMoreContainer.style.display = 'none';
            }
        } else {
            blogState.hasMorePosts = false;
            loadMoreContainer.style.display = 'none';
        }
    }
    
    function renderBlogPosts(posts, isInitial = false) {
        const container = document.getElementById('blogContainer');
        
        if (isInitial) {
            const blogHTML = `
                <div class="blog-grid" id="blogGrid">
                    ${posts.map(post => createBlogCard(post)).join('')}
                </div>
            `;
            container.innerHTML = blogHTML;
        } else {
            const blogGrid = document.getElementById('blogGrid');
            posts.forEach(post => {
                const cardHTML = createBlogCard(post);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cardHTML;
                const card = tempDiv.firstElementChild;
                card.classList.add('loading-animation');
                blogGrid.appendChild(card);
            });
        }
        
        // Trigger fade-in animations for new cards
        setTimeout(() => {
            const newCards = document.querySelectorAll('.blog-card:not(.visible)');
            newCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('fade-in', 'visible');
                }, index * 200);
            });
        }, 100);
    }
    
    function createBlogCard(issue) {
        const date = new Date(issue.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        let fullContent = issue.body || 'No content available.';
        
        // Basic markdown processing
        fullContent = fullContent
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
        
        if (!fullContent.startsWith('<')) {
            fullContent = '<p>' + fullContent + '</p>';
        }
        
        const labelsHTML = issue.labels
            .filter(label => label.name !== 'blog')
            .map(label => `<span class="blog-label" style="background-color: #${label.color};">${label.name}</span>`)
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
                    <h3 class="blog-title">${issue.title}</h3>
                    <div class="blog-full-content">${fullContent}</div>
                </div>
            </div>
        `;
    }
    
    function updateLoadMoreButton(isLoading) {
        if (isLoading) {
            loadMoreBtn.classList.add('loading');
            loadMoreBtn.disabled = true;
        } else {
            loadMoreBtn.classList.remove('loading');
            loadMoreBtn.disabled = false;
        }
    }

    // ============= EVENT LISTENERS =============
    
    // Scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Navigation events
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
    
    // Mobile menu events
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    mobileNavOverlay.addEventListener('click', (e) => {
        if (e.target === mobileNavOverlay) {
            closeMobileMenu();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMobileMenuOpen) {
            closeMobileMenu();
        }
    });
    
    // Projects events
    seeMoreBtn.addEventListener('click', toggleProjects);
    
    // Blog events
    loadMoreBtn.addEventListener('click', loadMoreBlogPosts);
    
    // Scroll to top event
    scrollTopBtn.addEventListener('click', scrollToTop);
    
    // Resize handler
    window.addEventListener('resize', throttle(() => {
        if (window.innerWidth > 768 && isMobileMenuOpen) {
            closeMobileMenu();
        }
    }, 250));
    
    // ============= INTERSECTION OBSERVER =============
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
    
    // ============= INITIALIZATION =============
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize navbar state
        updateActiveNavLinks();
        
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        }
        
        if (window.scrollY > 100) {
            scrollTopBtn.classList.add('visible');
        }
        
        // Initialize projects
        initializeProjects();
        
        // Initialize blog
        loadInitialBlogPosts();
        
        // Observe fade-in elements
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
        
        console.log('Website initialized with See More projects and Load More blog functionality');
    });
    
    // Page visibility change handler
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isMobileMenuOpen) {
            closeMobileMenu();
        }
    });
    
