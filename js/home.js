document.addEventListener('DOMContentLoaded', () => {
  // Testimonial Slider
  const initTestimonialSlider = () => {
    const testimonials = document.querySelectorAll('.testimonial');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentIndex = 0;
    
    // Hide all testimonials except the first one
    testimonials.forEach((testimonial, index) => {
      if (index !== currentIndex) {
        testimonial.style.display = 'none';
      }
    });
    
    // Function to show testimonial at specific index
    const showTestimonial = (index) => {
      testimonials.forEach(testimonial => {
        testimonial.style.display = 'none';
      });
      
      testimonials[index].style.display = 'block';
      
      // Add fade-in animation
      testimonials[index].style.opacity = '0';
      testimonials[index].style.transition = 'opacity 0.5s ease';
      
      setTimeout(() => {
        testimonials[index].style.opacity = '1';
      }, 50);
    };
    
    // Event listeners for navigation buttons
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        showTestimonial(currentIndex);
      });
      
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(currentIndex);
      });
    }
    
    // Auto-advance testimonials every 5 seconds
    setInterval(() => {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showTestimonial(currentIndex);
    }, 5000);
  };
  
  // Waste Type Card Animations
  const initWasteCardAnimations = () => {
    const wasteCards = document.querySelectorAll('.waste-card');
    
    wasteCards.forEach(card => {
      card.addEventListener('mouseover', () => {
        const icon = card.querySelector('.waste-icon i');
        
        // Add pulse animation
        icon.style.animation = 'pulse 1s infinite';
        
        // Modify icon styling
        icon.style.transform = 'scale(1.2)';
        icon.style.transition = 'transform 0.3s ease';
      });
      
      card.addEventListener('mouseout', () => {
        const icon = card.querySelector('.waste-icon i');
        
        // Remove animations
        icon.style.animation = '';
        icon.style.transform = 'scale(1)';
      });
    });
  };
  
  // Scroll Animations
  const initScrollAnimations = () => {
    const elements = [
      ...document.querySelectorAll('.step'),
      ...document.querySelectorAll('.waste-card'),
      ...document.querySelectorAll('.section-title'),
      ...document.querySelectorAll('.partner')
    ];
    
    const fadeInOnScroll = () => {
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const isVisible = (elementTop < window.innerHeight) && (elementBottom > 0);
        
        if (isVisible) {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      });
    };
    
    // Set initial state
    elements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Trigger on scroll
    window.addEventListener('scroll', fadeInOnScroll);
    
    // Trigger once on load
    fadeInOnScroll();
  };
  
  // Newsletter Form Submission
  const initNewsletterForm = () => {
    const form = document.querySelector('.newsletter-form');
    
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (email) {
          // Simulate API call
          utils.simulateApiCall({ success: true })
            .then(() => {
              utils.showToast('Thanks for subscribing to our newsletter!', 'success');
              emailInput.value = '';
            });
        }
      });
    }
  };
  
  // Initialize all home page functions
  initTestimonialSlider();
  initWasteCardAnimations();
  initScrollAnimations();
  initNewsletterForm();
  
  // Handle CTA button clicks
  const ctaButtons = document.querySelectorAll('.cta-section .btn, .hero-buttons .btn');
  ctaButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Add a subtle "click" effect
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 100);
    });
  });
  
  // Partner logo hover effect
  const partners = document.querySelectorAll('.partner');
  partners.forEach(partner => {
    partner.addEventListener('mouseenter', () => {
      const icon = partner.querySelector('i');
      icon.style.transform = 'scale(1.1) rotate(10deg)';
      icon.style.color = '#1F5D3A'; // Darker green on hover
    });
    
    partner.addEventListener('mouseleave', () => {
      const icon = partner.querySelector('i');
      icon.style.transform = 'scale(1) rotate(0)';
      icon.style.color = ''; // Reset to default
    });
  });
});