// ============================================
// PORTFOLIO JAVASCRIPT - Dr. Shikhar Bhardwaj
// ============================================

'use strict';

// GTM dataLayer initialization
window.dataLayer = window.dataLayer || [];

// Utility Functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

// Error Boundary
class ErrorBoundary {
  constructor() {
    this.errorContainer = $('#errorBoundary');
    this.errorMessage = $('#errorMessage');
    this.reloadButton = $('#errorReload');
    
    this.setupErrorHandlers();
  }
  
  setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.showError(event.error?.message || 'An unexpected error occurred');
      return true;
    });
    
    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled rejection:', event.reason);
      this.showError(event.reason?.message || 'An unexpected promise rejection occurred');
      event.preventDefault();
    });
    
    // Reload button
    if (this.reloadButton) {
      this.reloadButton.addEventListener('click', () => {
        window.location.reload();
      });
    }
  }
  
  showError(message) {
    if (this.errorContainer && this.errorMessage) {
      this.errorMessage.textContent = message;
      this.errorContainer.hidden = false;
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        this.hideError();
      }, 10000);
    }
  }
  
  hideError() {
    if (this.errorContainer) {
      this.errorContainer.hidden = true;
    }
  }
}

// Initialize error boundary
const errorBoundary = new ErrorBoundary();

// Cache Manager for GitHub API
class CacheManager {
  constructor() {
    this.storageKey = 'portfolio_cache';
    this.cacheExpiry = 3600000; // 1 hour in milliseconds
  }
  
  set(key, data) {
    try {
      const cacheData = this.getAll();
      cacheData[key] = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }
  
  get(key) {
    try {
      const cacheData = this.getAll();
      const item = cacheData[key];
      
      if (!item) return null;
      
      // Check if expired
      if (Date.now() - item.timestamp > this.cacheExpiry) {
        this.remove(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }
  
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    } catch (error) {
      return {};
    }
  }
  
  remove(key) {
    try {
      const cacheData = this.getAll();
      delete cacheData[key];
      localStorage.setItem(this.storageKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  }
  
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}

const cache = new CacheManager();

// Theme Manager
class ThemeManager {
  constructor() {
    this.root = document.documentElement;
    this.themeToggle = $('#themeToggle');
    this.themeIcon = $('#themeIcon');
    this.themeLabel = $('#themeLabel');
    
    this.init();
  }
  
  init() {
    // Load saved theme or detect preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    this.applyTheme(this.currentTheme);
    this.setupToggle();
    this.watchSystemPreference();
  }
  
  applyTheme(theme) {
    this.root.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    this.updateUI();
  }
  
  updateUI() {
    const isDark = this.currentTheme === 'dark';
    if (this.themeIcon) {
      this.themeIcon.textContent = isDark ? '🌙' : '☀️';
      this.themeIcon.setAttribute('aria-label', isDark ? 'Dark mode icon' : 'Light mode icon');
    }
    if (this.themeLabel) {
      this.themeLabel.textContent = isDark ? 'Dark' : 'Light';
    }
  }
  
  setupToggle() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        // GTM tracking
        window.dataLayer.push({
          event: 'theme_toggle',
          theme_mode: newTheme
        });
      });
    }
  }
  
  watchSystemPreference() {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

// Tab Manager
class TabManager {
  constructor() {
    this.tabs = $$('[role="tab"]');
    this.panels = $$('[role="tabpanel"]');
    this.tabNames = {
      'panel-home': 'Home',
      'panel-about': 'About',
      'panel-aiml': 'AI/ML/GenAI',
      'panel-devops': 'DevOps Engineer',
      'panel-projects': 'Projects',
      'panel-blog': 'Blog',
      'panel-resume': 'Resume',
      'panel-pubs': 'Publications',
      'panel-contact': 'Contact',
      'panel-knfl': 'Fun'
    };
    
    this.init();
  }
  
  init() {
    this.setupTabListeners();
    this.setupHashChange();
    this.initFromHash();
    this.setupKeyboardNavigation();
  }
  
  setupTabListeners() {
    const tabContainer = $('.tabs');
    if (tabContainer) {
      tabContainer.addEventListener('click', (e) => {
        const tab = e.target.closest('[role="tab"]');
        if (tab) {
          this.activateTab(tab);
        }
      });
    }
  }
  
  activateTab(tab) {
    if (!tab) return;
    
    // Show loading state
    const mainCard = $('#mainCard');
    if (mainCard) {
      mainCard.classList.add('loading');
    }
    
    // Update ARIA attributes
    this.tabs.forEach(t => {
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });
    
    this.panels.forEach(p => {
      p.hidden = true;
    });
    
    // Activate selected tab
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    
    const panelId = tab.dataset.target;
    const panel = $(`#${panelId}`);
    
    if (panel) {
      panel.hidden = false;
      
      // Set focus to panel for screen readers
      setTimeout(() => {
        panel.focus();
        if (mainCard) {
          mainCard.classList.remove('loading');
        }
      }, 100);
      
      // Update URL
      window.location.hash = panelId;
      
      // Update page title
      this.updateTitle(panelId);
      
      // GTM tracking
      window.dataLayer.push({
        event: 'tab_view',
        tab_name: panelId
      });
      
      // Load content based on panel
      this.loadPanelContent(panelId);
    }
  }
  
  updateTitle(panelId) {
    const tabName = this.tabNames[panelId] || 'Home';
    document.title = `${tabName} – Dr. Shikhar Bhardwaj (Ph.D.)`;
  }
  
  loadPanelContent(panelId) {
    switch(panelId) {
      case 'panel-resume':
        resumeManager.load();
        break;
      case 'panel-pubs':
        publicationsManager.load();
        break;
      case 'panel-blog':
        blogManager.load();
        break;
    }
  }
  
  setupHashChange() {
    window.addEventListener('hashchange', () => {
      this.initFromHash();
    });
  }
  
  initFromHash() {
    const hash = window.location.hash.slice(1);
    const tab = $(`[data-target="${hash}"]`);
    
    if (tab) {
      this.activateTab(tab);
    } else {
      // Default to first tab
      const defaultTab = $('.tab[aria-selected="true"]') || this.tabs[0];
      if (defaultTab) {
        this.activateTab(defaultTab);
      }
    }
  }
  
  setupKeyboardNavigation() {
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('keydown', (e) => {
        let targetTab = null;
        
        switch(e.key) {
          case 'ArrowRight':
            targetTab = this.tabs[index + 1] || this.tabs[0];
            break;
          case 'ArrowLeft':
            targetTab = this.tabs[index - 1] || this.tabs[this.tabs.length - 1];
            break;
          case 'Home':
            targetTab = this.tabs[0];
            break;
          case 'End':
            targetTab = this.tabs[this.tabs.length - 1];
            break;
        }
        
        if (targetTab) {
          e.preventDefault();
          targetTab.focus();
          this.activateTab(targetTab);
        }
      });
    });
  }
}

// Publications Manager
class PublicationsManager {
  constructor() {
    this.container = $('#pubs-list');
    this.isLoaded = false;
  }
  
  async load() {
    if (this.isLoaded || !this.container) return;
    
    // Show loading state
    this.container.innerHTML = `
      <div class="loader"></div>
      <p class="muted">Loading publications...</p>
    `;
    
    try {
      // Try to load from cache first
      let publications = cache.get('publications');
      
      if (!publications) {
        const response = await fetch('publications.json');
        if (!response.ok) {
          throw new Error('Failed to load publications');
        }
        publications = await response.json();
        cache.set('publications', publications);
      }
      
      this.render(publications);
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading publications:', error);
      this.container.innerHTML = `
        <p class="muted" style="color: var(--error);">
          Unable to load publications. Please try again later.
        </p>
      `;
    }
  }
  
  render(publications) {
    this.container.innerHTML = '';
    
    publications.forEach((pub, index) => {
      const details = document.createElement('details');
      details.id = `pub-${index}`;
      
      const summary = document.createElement('summary');
      summary.setAttribute('role', 'button');
      summary.setAttribute('aria-expanded', 'false');
      summary.innerHTML = `
        <div class="pub-title">${this.escapeHtml(pub.title)}</div>
        <div class="pub-authors">${this.escapeHtml(pub.authors)} (${pub.year})</div>
      `;
      
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="pub-venue">${this.escapeHtml(pub.venue)}</div>
        <a href="${this.escapeHtml(pub.url)}" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="pub-link"
           data-gtm-event="publication_click"
           data-gtm-label="${this.escapeHtml(pub.title)}">
          View publication →
        </a>
      `;
      
      details.appendChild(summary);
      details.appendChild(content);
      
      // Track open/close
      details.addEventListener('toggle', () => {
        summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
        
        if (details.open) {
          window.dataLayer.push({
            event: 'publication_expand',
            publication_title: pub.title
          });
        }
      });
      
      this.container.appendChild(details);
    });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Blog Manager (GitHub Discussions)
class BlogManager {
  constructor() {
    this.container = $('#blog-posts-container');
    this.fallback = $('.blog-fallback');
    this.isLoaded = false;
  }
  
  async load() {
    if (this.isLoaded || !this.container) return;
    
    try {
      // Try to load from cache first
      let discussions = cache.get('blog_posts');
      
      if (!discussions) {
        // Check if we're on localhost to avoid API rate limits
        const isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
        
        if (isLocalhost) {
          throw new Error('Skipping GitHub API on localhost');
        }
        
        const response = await fetch(
          'https://api.github.com/repos/winshikhar/winshikhar.github.io/discussions',
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('GitHub API request failed');
        }
        
        discussions = await response.json();
        cache.set('blog_posts', discussions);
      }
      
      this.render(discussions);
      this.isLoaded = true;
    } catch (error) {
      console.warn('Using fallback blog posts:', error);
      this.useFallback();
    }
  }
  
  render(discussions) {
    if (!discussions || discussions.length === 0) {
      this.useFallback();
      return;
    }
    
    this.container.innerHTML = '';
    
    discussions.slice(0, 5).forEach(discussion => {
      const post = document.createElement('div');
      post.className = 'blog-post';
      
      const date = new Date(discussion.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
      
      post.innerHTML = `
        <div class="blog-title">${this.escapeHtml(discussion.title)}</div>
        <div class="blog-meta">Published: ${date}</div>
        <p>${this.escapeHtml(this.truncate(discussion.body || '', 200))}</p>
        <a href="${discussion.html_url}" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="btn-secondary"
           data-gtm-event="blog_click"
           data-gtm-label="${this.escapeHtml(discussion.title)}">
          Read more →
        </a>
      `;
      
      this.container.appendChild(post);
    });
  }
  
  useFallback() {
    if (this.container) {
      this.container.style.display = 'none';
    }
    if (this.fallback) {
      this.fallback.style.display = 'block';
    }
  }
  
  truncate(text, length) {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Resume Manager
class ResumeManager {
  constructor() {
    this.container = $('#resumeContainer');
    this.isLoaded = false;
  }
  
  load() {
    if (this.isLoaded || !this.container) return;
    
    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      this.showMobileFallback();
    } else {
      this.loadPDF();
    }
    
    this.isLoaded = true;
  }
  
  showMobileFallback() {
    this.container.innerHTML = `
      <div style="text-align:center; padding:40px;">
        <p class="muted" style="margin-bottom:20px;">
          PDF preview is not available on mobile devices.
        </p>
        <a href="resume.pdf" 
           download 
           class="btn-primary" 
           data-gtm-event="resume_download"
           data-gtm-label="mobile_fallback">
          📥 Download Resume (PDF)
        </a>
        <p class="muted" style="margin-top:16px; font-size:0.9rem;">
          Or view on <a href="https://linkedin.com/in/b-shikhar/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        data-gtm-event="outbound_click"
                        data-gtm-label="linkedin_resume_mobile">LinkedIn</a>
        </p>
      </div>
    `;
  }
  
  loadPDF() {
    // Show loading state
    this.container.innerHTML = `
      <div class="loader"></div>
      <div class="pdf-loading">Loading resume...</div>
    `;
    
    setTimeout(() => {
      const iframe = document.createElement('iframe');
      iframe.src = 'resume.pdf';
      iframe.setAttribute('aria-label', 'Resume PDF document');
      iframe.style.width = '100%';
      iframe.style.height = '70vh';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      
      // Handle load errors
      iframe.onerror = () => {
        this.container.innerHTML = `
          <p class="muted" style="text-align:center; padding:40px;">
            Unable to display PDF. Please 
            <a href="resume.pdf" 
               download 
               style="color:var(--accent)"
               data-gtm-event="resume_download"
               data-gtm-label="error_fallback">
              download the PDF
            </a> instead.
          </p>
        `;
      };
      
      this.container.innerHTML = '';
      this.container.appendChild(iframe);
      
      // GTM tracking
      window.dataLayer.push({
        event: 'resume_view',
        view_type: 'inline_pdf'
      });
    }, 300);
  }
}

// KNFL Game Manager
class KNFLGame {
  constructor() {
    this.rollBtn = $('#knfl-roll');
    this.diceContainer = $('#knfl-dice');
    this.scoreDisplay = $('#knfl-score');
    
    if (this.rollBtn) {
      this.init();
    }
  }
  
  init() {
    this.rollBtn.addEventListener('click', () => this.roll());
    
    // Keyboard support
    this.rollBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.roll();
      }
    });
  }
  
  roll() {
    // Generate dice
    const dice = Array(5).fill().map(() => Math.floor(Math.random() * 6) + 1);
    
    // Display dice
    this.diceContainer.innerHTML = dice.map(n => `
      <div class="dice" role="img" aria-label="Die showing ${n}">${n}</div>
    `).join('');
    
    // Calculate score
    const result = this.calculateScore(dice);
    
    // Display score
    this.scoreDisplay.textContent = `${result.name} — ${result.points} pts`;
    this.scoreDisplay.setAttribute('aria-label', `Result: ${result.name}, ${result.points} points`);
    
    // GTM tracking
    window.dataLayer.push({
      event: 'knfl_roll',
      result: result.name,
      points: result.points
    });
  }
  
  calculateScore(dice) {
    const sorted = [...dice].sort();
    const unique = [...new Set(sorted)];
    
    // KNFL (all same)
    if (sorted.every(x => x === sorted[0])) {
      return { name: 'KNFL', points: 500 };
    }
    
    // Check for street (consecutive numbers)
    let maxSeq = 1, curSeq = 1;
    for (let i = 1; i < unique.length; i++) {
      if (unique[i] === unique[i-1] + 1) {
        curSeq++;
        maxSeq = Math.max(maxSeq, curSeq);
      } else {
        curSeq = 1;
      }
    }
    
    if (maxSeq >= 5) {
      return { name: 'Big Street', points: 40 };
    }
    if (maxSeq >= 4) {
      return { name: "Lil' Street", points: 30 };
    }
    
    // Count frequencies
    const counts = {};
    sorted.forEach(x => counts[x] = (counts[x] || 0) + 1);
    const freqs = Object.values(counts).sort((a,b) => b - a);
    
    // Full House
    if (freqs.length === 2 && freqs[0] === 3 && freqs[1] === 2) {
      return { name: 'Full House', points: 25 };
    }
    
    // Stack (best matching set)
    const bestVal = Object.keys(counts).reduce((a,b) => 
      counts[a] > counts[b] ? a : b
    );
    const bestCount = counts[bestVal];
    const points = bestVal * bestCount;
    
    return {
      name: `Stack (${bestCount}) of ${bestVal}`,
      points: points
    };
  }
}

// Cookie Consent Manager
class CookieConsentManager {
  constructor() {
    this.banner = $('#cookieConsent');
    this.acceptBtn = $('#cookieAccept');
    this.declineBtn = $('#cookieDecline');
    
    this.init();
  }
  
  init() {
    // Check if consent was already given
    const consent = localStorage.getItem('cookie_consent');
    
    if (!consent && this.banner) {
      // Show banner after a short delay
      setTimeout(() => {
        this.banner.hidden = false;
      }, 2000);
    }
    
    // Setup event listeners
    if (this.acceptBtn) {
      this.acceptBtn.addEventListener('click', () => this.accept());
    }
    
    if (this.declineBtn) {
      this.declineBtn.addEventListener('click', () => this.decline());
    }
  }
  
  accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    this.hideBanner();
    
    // Enable analytics (already loaded, just tracking acceptance)
    window.dataLayer.push({
      event: 'cookie_accept',
      consent_given: true
    });
  }
  
  decline() {
    localStorage.setItem('cookie_consent', 'declined');
    this.hideBanner();
    
    // Disable GTM (optional - depends on your requirements)
    window.dataLayer.push({
      event: 'cookie_decline',
      consent_given: false
    });
  }
  
  hideBanner() {
    if (this.banner) {
      this.banner.style.animation = 'slideDown 0.3s ease';
      setTimeout(() => {
        this.banner.hidden = true;
      }, 300);
    }
  }
}

// Outbound Link Tracking
function setupOutboundTracking() {
  document.addEventListener('click', (e) => {
    const element = e.target.closest('[data-gtm-event]');
    if (element) {
      const event = element.dataset.gtmEvent;
      const label = element.dataset.gtmLabel || element.href || element.textContent;
      
      window.dataLayer.push({
        event: event,
        link_label: label,
        link_url: element.href || ''
      });
    }
  });
}

// Service Worker Registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Only register in production
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available, show update notification
                showUpdateNotification();
              }
            });
          });
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }
}

function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <div style="background: var(--card); padding: 16px; border-radius: 8px; box-shadow: var(--shadow-lg); position: fixed; bottom: 80px; right: 20px; z-index: 10000; max-width: 300px;">
      <p style="margin: 0 0 12px 0;"><strong>Update Available</strong></p>
      <p style="margin: 0 0 12px 0; font-size: 0.9rem; color: var(--muted);">
        A new version of the site is available.
      </p>
      <button onclick="window.location.reload()" class="btn-primary" style="width: 100%;">
        Reload Page
      </button>
    </div>
  `;
  document.body.appendChild(notification);
}

// Lazy Loading for Images
function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    $$('[data-src]').forEach(img => imageObserver.observe(img));
  }
}

// Analytics Helper
function trackAnalytics(eventName, params = {}) {
  window.dataLayer.push({
    event: eventName,
    ...params,
    timestamp: new Date().toISOString()
  });
}

// Initialize Managers
const themeManager = new ThemeManager();
const tabManager = new TabManager();
const publicationsManager = new PublicationsManager();
const blogManager = new BlogManager();
const resumeManager = new ResumeManager();
const knflGame = new KNFLGame();
const cookieConsent = new CookieConsentManager();

// Setup global features
setupOutboundTracking();
registerServiceWorker();
setupLazyLoading();

// Track page view
trackAnalytics('page_view', {
  page_title: document.title,
  page_location: window.location.href
});

// Performance monitoring
window.addEventListener('load', () => {
  if ('performance' in window) {
    const perfData = performance.timing;
    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
    
    trackAnalytics('performance', {
      load_time: loadTime,
      dom_ready: perfData.domContentLoadedEventEnd - perfData.navigationStart
    });
  }
});

// Visibility change tracking (for engagement metrics)
document.addEventListener('visibilitychange', () => {
  trackAnalytics('visibility_change', {
    is_visible: !document.hidden
  });
});

// Console easter egg
console.log('%c👋 Hello, curious developer!', 'font-size: 20px; color: #7c3aed; font-weight: bold;');
console.log('%cInterested in the code? Check out the GitHub repo:', 'font-size: 14px; color: #94a3b8;');
console.log('%chttps://github.com/winshikhar/winshikhar.github.io', 'font-size: 14px; color: #06b6d4;');

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ThemeManager,
    TabManager,
    PublicationsManager,
    BlogManager,
    ResumeManager,
    KNFLGame,
    CacheManager,
    ErrorBoundary
  };
}
