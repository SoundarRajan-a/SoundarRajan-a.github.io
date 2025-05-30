document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const API_URL = 'https://api.github.com/repos/SoundarRajan-a/blog-content/issues?labels=published';
    const blogContainer = document.getElementById('blog-posts');
    const modal = document.getElementById('blog-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalComments = document.getElementById('modal-comments');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close-modal');

    // Fetch and display blog posts
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch posts');
            return response.json();
        })
        .then(posts => {
            blogContainer.innerHTML = '';
            
            if (posts.length === 0) {
                blogContainer.innerHTML = `
                    <div class="blog-card" style="grid-column:1/-1;text-align:center;">
                        <p>No blog posts yet. Check back soon!</p>
                    </div>
                `;
                return;
            }

            posts.forEach(post => {
                const postDate = extractPostDate(post);
                const excerpt = extractExcerpt(post.body);
                
                const card = document.createElement('div');
                card.className = 'blog-card';
                card.innerHTML = `
                    <h3>${post.title}</h3>
                    <div class="blog-meta">
                        <span><i class="far fa-calendar-alt"></i> ${postDate}</span>
                        <span><i class="far fa-comment"></i> ${post.comments} comments</span>
                    </div>
                    <div class="blog-excerpt">${excerpt}</div>
                `;
                
                card.addEventListener('click', () => showPostModal(post));
                blogContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error loading blog posts:', error);
            blogContainer.innerHTML = `
                <div class="blog-card" style="grid-column:1/-1;text-align:center;">
                    <p>Failed to load blog posts. Please try again later.</p>
                </div>
            `;
        });

    // Show post in modal
    function showPostModal(post) {
        modalTitle.textContent = post.title;
        modalDate.innerHTML = `<i class="far fa-calendar-alt"></i> ${extractPostDate(post)}`;
        modalComments.innerHTML = `<i class="far fa-comment"></i> ${post.comments} comments`;
        
        // Process markdown content
        let content = post.body;
        // Remove YAML front matter if exists
        if (content.startsWith('---')) {
            content = content.split('---').slice(2).join('---').trim();
        }
        
        // Render markdown
        modalBody.innerHTML = marked.parse(content);
        
        // Open modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Close modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Helper functions
    function extractPostDate(post) {
        // Try to extract from YAML front matter
        const dateMatch = post.body.match(/date:\s*(.+)/);
        if (dateMatch) return dateMatch[1];
        
        // Fallback to GitHub created_at date
        return new Date(post.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function extractExcerpt(content) {
        // Remove YAML front matter
        let text = content;
        if (text.startsWith('---')) {
            text = text.split('---').slice(2).join('---');
        }
        
        // Get first paragraph
        const firstParagraph = text.split('\n\n')[0];
        return firstParagraph.length > 150 
            ? `${firstParagraph.substring(0, 150)}...` 
            : firstParagraph;
    }
});
