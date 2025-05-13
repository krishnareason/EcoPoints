// Utility functions
const utils = {
  // DOM manipulation
  select: (selector) => document.querySelector(selector),
  selectAll: (selector) => document.querySelectorAll(selector),
  create: (tag) => document.createElement(tag),
  
  // Event handlers
  on: (element, event, handler) => {
    if (element) {
      element.addEventListener(event, handler);
    }
  },
  
  // Toast notifications
  showToast: (message, type = 'info', duration = 3000) => {
    const toastContainer = utils.select('#toast-container');
    if (!toastContainer) return;
    
    const toast = utils.create('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    if (type === 'error') iconClass = 'fa-times-circle';
    
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas ${iconClass}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Add click event for close button
    const closeBtn = toast.querySelector('.toast-close');
    utils.on(closeBtn, 'click', () => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    });
    
    // Auto remove after duration
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  },
  
  // Modal functions
  openModal: (modalId) => {
    const modal = utils.select(`#${modalId}`);
    if (modal) {
      modal.classList.add('active');
      
      // Add event listener for close buttons
      const closeButtons = modal.querySelectorAll('.close-modal');
      closeButtons.forEach(btn => {
        utils.on(btn, 'click', () => utils.closeModal(modalId));
      });
      
      // Close when clicking outside
      utils.on(modal, 'click', (e) => {
        if (e.target === modal) {
          utils.closeModal(modalId);
        }
      });
    }
  },
  
  closeModal: (modalId) => {
    const modal = utils.select(`#${modalId}`);
    if (modal) {
      modal.classList.remove('active');
    }
  },
  
  // Navigation
  scrollToSection: (sectionId) => {
    const section = utils.select(`#${sectionId}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  },
  
  // Responsive navigation
  initMobileNav: () => {
    const navToggle = utils.select('.nav-toggle');
    const navLinks = utils.select('.nav-links');
    
    utils.on(navToggle, 'click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  },
  
  // Dashboard navigation
  initDashboardNav: () => {
    const menuToggle = utils.select('.menu-toggle');
    const sidebar = utils.select('.sidebar');
    const closeSidebar = utils.select('.close-sidebar');
    const navLinks = utils.selectAll('.sidebar-nav a');
    
    utils.on(menuToggle, 'click', () => {
      sidebar.classList.add('active');
    });
    
    utils.on(closeSidebar, 'click', () => {
      sidebar.classList.remove('active');
    });
    
    navLinks.forEach(link => {
      utils.on(link, 'click', (e) => {
        // If on mobile, close the sidebar
        if (window.innerWidth < 768) {
          sidebar.classList.remove('active');
        }
        
        // If link has a hash, show the corresponding section
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          e.preventDefault();
          
          // Hide all content
          const contents = utils.selectAll('.dashboard-content');
          contents.forEach(content => content.classList.add('hidden'));
          
          // Show the target content
          const targetContent = utils.select(href);
          if (targetContent) {
            targetContent.classList.remove('hidden');
          }
          
          // Update active class
          navLinks.forEach(navLink => navLink.parentElement.classList.remove('active'));
          link.parentElement.classList.add('active');
        }
      });
    });
  },
  
  // Format date
  formatDate: (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },
  
  // Format time
  formatTime: (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  // Format datetime
  formatDateTime: (date) => {
    return `${utils.formatDate(date)} at ${utils.formatTime(date)}`;
  },
  
  // Generate random ID
  generateId: () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },
  
  // Store data in localStorage
  storeData: (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  },
  
  // Get data from localStorage
  getData: (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
  
  // Update specific item in a collection
  updateItem: (collection, id, updates) => {
    return collection.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });
  },
  
  // Remove item from collection
  removeItem: (collection, id) => {
    return collection.filter(item => item.id !== id);
  },
  
  // Simple form validation
  validateForm: (form) => {
    let isValid = true;
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      if (input.required && !input.value.trim()) {
        isValid = false;
        input.classList.add('error');
        
        // Add error message if it doesn't exist
        let errorMessage = input.nextElementSibling;
        if (!errorMessage || !errorMessage.classList.contains('error-message')) {
          errorMessage = utils.create('div');
          errorMessage.className = 'error-message';
          errorMessage.textContent = 'This field is required';
          input.parentNode.insertBefore(errorMessage, input.nextSibling);
        }
      } else {
        input.classList.remove('error');
        
        // Remove error message if it exists
        const errorMessage = input.nextElementSibling;
        if (errorMessage && errorMessage.classList.contains('error-message')) {
          errorMessage.remove();
        }
      }
    });
    
    return isValid;
  },
  
  // Debounce function
  debounce: (func, delay) => {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  },

  // Simulate an API call with delay
  simulateApiCall: (data, delay = 800) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  },
  
  // Initialize common event listeners
  initCommonEvents: () => {
    // Navbar scroll effect
    const navbar = utils.select('.navbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      });
    }
    
    // Smooth scroll for anchor links
    const anchorLinks = utils.selectAll('a[href^="#"]:not([href="#"])');
    anchorLinks.forEach(link => {
      utils.on(link, 'click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        utils.scrollToSection(targetId);
      });
    });
  }
};

// Route handling function
const router = {
  // Check if user is logged in
  isLoggedIn: () => {
    const currentUser = utils.getData('currentUser');
    return !!currentUser;
  },
  
  // Get current user information
  getCurrentUser: () => {
    return utils.getData('currentUser');
  },
  
  // Protect routes that require authentication
  protectRoute: () => {
    if (!router.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },
  
  // Redirect based on user type
  redirectBasedOnUserType: () => {
    const currentUser = router.getCurrentUser();
    if (!currentUser) return;
    
    if (currentUser.type === 'customer') {
      window.location.href = 'dashboard_customer.html';
    } else if (currentUser.type === 'buyer') {
      window.location.href = 'dashboard_buyer.html';
    }
  },
  
  // Initialize route protection
  init: () => {
    const path = window.location.pathname;
    
    // Pages that require authentication
    const protectedPages = [
      '/dashboard_customer.html',
      '/dashboard_buyer.html'
    ];
    
    // Check if the current page is a protected page
    if (protectedPages.some(page => path.endsWith(page))) {
      if (!router.protectRoute()) {
        return; // Stop execution if redirect occurs
      }
      
      // Check if user is accessing the right dashboard type
      const currentUser = router.getCurrentUser();
      const isCustomerAccessingBuyerDashboard = currentUser.type === 'customer' && path.endsWith('/dashboard_buyer.html');
      const isBuyerAccessingCustomerDashboard = currentUser.type === 'buyer' && path.endsWith('/dashboard_customer.html');
      
      if (isCustomerAccessingBuyerDashboard || isBuyerAccessingCustomerDashboard) {
        router.redirectBasedOnUserType();
        return;
      }
    }
    
    // Redirect logged in users from auth pages to dashboard
    const authPages = ['/login.html', '/signup.html'];
    if (authPages.some(page => path.endsWith(page)) && router.isLoggedIn()) {
      router.redirectBasedOnUserType();
    }
  }
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  utils.initCommonEvents();
  utils.initMobileNav();
  
  // Initialize dashboard navigation if on dashboard page
  if (document.querySelector('.dashboard-container')) {
    utils.initDashboardNav();
  }
  
  // Initialize router
  router.init();
});