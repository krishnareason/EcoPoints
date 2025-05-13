// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize common functionality
  utils.initCommonEvents();
  utils.initMobileNav();
  
  // Initialize dashboard navigation if on dashboard page
  if (document.querySelector('.dashboard-container')) {
    utils.initDashboardNav();
  }
  
  // Initialize router
  router.init();
});