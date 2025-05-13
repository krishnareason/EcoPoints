document.addEventListener('DOMContentLoaded', () => {
  // Ensure user is logged in
  if (!router.protectRoute()) return;
  
  // Get current user
  const currentUser = router.getCurrentUser();
  
  // Make sure user is a buyer
  if (currentUser.type !== 'buyer') {
    window.location.href = 'dashboard_customer.html';
    return;
  }
  
  // Buyer Dashboard Controller
  const buyerDashboard = {
    // User data
    user: currentUser,
    
    // Waste types and their colors
    wasteTypes: {
      'plastic': { color: 'var(--color-plastic)' },
      'metal': { color: 'var(--color-metal)' },
      'organic': { color: 'var(--color-organic)' },
      'e-waste': { color: 'var(--color-ewaste)' }
    },
    
    // Initialize dashboard
    init: () => {
      // Update user info
      buyerDashboard.updateUserInfo();
      
      // Load and display redemption requests
      buyerDashboard.loadRedemptionRequests();
      
      // Load and display pending redemptions
      buyerDashboard.loadPendingRedemptions();
      
      // Load and display recent activity
      buyerDashboard.loadRecentActivity();
      
      // Initialize nearby customers
      buyerDashboard.loadNearbyCustomers();
      
      // Initialize analytics charts
      buyerDashboard.initCharts();
      
      // Initialize redemption modal functionality
      buyerDashboard.initRedemptionModal();
      
      // Initialize QR scanner functionality
      buyerDashboard.initQrScanner();
      
      // Initialize filters
      buyerDashboard.initFilters();
    },
    
    // Update user information in the UI
    updateUserInfo: () => {
      // Update user name
      document.querySelectorAll('#user-name, #header-username').forEach(el => {
        if (el) el.textContent = buyerDashboard.user.businessName || buyerDashboard.user.name;
      });
      
      // Update statistics
      const newRedemptions = document.getElementById('new-redemptions');
      if (newRedemptions) {
        const pendingRequests = buyerDashboard.user.requests.filter(req => req.status === 'pending');
        newRedemptions.textContent = pendingRequests.length;
      }
      
      const activeCustomers = document.getElementById('active-customers');
      if (activeCustomers) {
        activeCustomers.textContent = buyerDashboard.user.customers ? buyerDashboard.user.customers.length : 0;
      }
      
      // Simulated data for other stats
      const totalRedeemed = document.getElementById('total-redeemed');
      if (totalRedeemed) {
        totalRedeemed.textContent = '$1,245';
      }
      
      const conversionRate = document.getElementById('conversion-rate');
      if (conversionRate) {
        conversionRate.textContent = '78%';
      }
    },
    
    // Load and display redemption requests
    loadRedemptionRequests: () => {
      const tableBody = document.getElementById('redemption-requests-body');
      if (!tableBody) return;
      
      // Clear existing rows
      tableBody.innerHTML = '';
      
      // Get requests
      const requests = buyerDashboard.user.requests || [];
      
      if (requests.length === 0) {
        // Display message if no requests
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
          <td colspan="6" class="text-center">No redemption requests yet</td>
        `;
        tableBody.appendChild(emptyRow);
        return;
      }
      
      // Sort requests by date (most recent first)
      const sortedRequests = [...requests].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      // Add each request to the table
      sortedRequests.forEach(request => {
        const row = document.createElement('tr');
        row.dataset.id = request.id;
        
        row.innerHTML = `
          <td>
            <div class="user-entry">
              <div class="user-avatar small">
                <i class="fas fa-user"></i>
              </div>
              <span>${request.customerName}</span>
            </div>
          </td>
          <td>${request.reward}</td>
          <td>${request.points} pts</td>
          <td>${utils.formatDate(request.date)}</td>
          <td>
            <span class="status-tag ${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
          </td>
          <td>
            <div class="table-actions">
              ${request.status === 'pending' ? `
                <button class="accept-request" title="Accept"><i class="fas fa-check"></i></button>
                <button class="reject-request" title="Reject"><i class="fas fa-times"></i></button>
                <button class="view-request" title="View Details"><i class="fas fa-eye"></i></button>
              ` : `
                <button class="view-request" title="View Details"><i class="fas fa-eye"></i></button>
              `}
            </div>
          </td>
        `;
        
        tableBody.appendChild(row);
      });
      
      // Add event listeners to action buttons
      tableBody.querySelectorAll('.view-request').forEach(button => {
        button.addEventListener('click', (e) => {
          const requestId = e.target.closest('tr').dataset.id;
          buyerDashboard.openRequestModal(requestId);
        });
      });
      
      tableBody.querySelectorAll('.accept-request').forEach(button => {
        button.addEventListener('click', (e) => {
          const requestId = e.target.closest('tr').dataset.id;
          buyerDashboard.acceptRequest(requestId);
        });
      });
      
      tableBody.querySelectorAll('.reject-request').forEach(button => {
        button.addEventListener('click', (e) => {
          const requestId = e.target.closest('tr').dataset.id;
          buyerDashboard.rejectRequest(requestId);
        });
      });
    },
    
    // Load and display pending redemptions
    loadPendingRedemptions: () => {
      const pendingList = document.getElementById('pending-redemptions-list');
      if (!pendingList) return;
      
      // Clear existing items
      pendingList.innerHTML = '';
      
      // Get pending requests
      const pendingRequests = (buyerDashboard.user.requests || []).filter(req => req.status === 'pending');
      
      if (pendingRequests.length === 0) {
        // Display message if no pending requests
        const emptyItem = document.createElement('div');
        emptyItem.className = 'empty-list';
        emptyItem.textContent = 'No pending redemption requests';
        pendingList.appendChild(emptyItem);
        return;
      }
      
      // Sort by date (most recent first)
      const sortedRequests = [...pendingRequests].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      // Take the 5 most recent
      const recentPendingRequests = sortedRequests.slice(0, 5);
      
      // Add each request to the list
      recentPendingRequests.forEach(request => {
        const item = document.createElement('div');
        item.className = 'pending-item';
        item.dataset.id = request.id;
        
        item.innerHTML = `
          <div class="pending-user">
            <div class="pending-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="pending-details">
              <h3>${request.customerName}</h3>
              <p>${request.reward}</p>
            </div>
          </div>
          <div class="pending-points">${request.points} pts</div>
          <div class="pending-actions">
            <button class="accept" title="Accept"><i class="fas fa-check"></i></button>
            <button class="reject" title="Reject"><i class="fas fa-times"></i></button>
          </div>
        `;
        
        pendingList.appendChild(item);
      });
      
      // Add event listeners to action buttons
      pendingList.querySelectorAll('.accept').forEach(button => {
        button.addEventListener('click', (e) => {
          const requestId = e.target.closest('.pending-item').dataset.id;
          buyerDashboard.acceptRequest(requestId);
        });
      });
      
      pendingList.querySelectorAll('.reject').forEach(button => {
        button.addEventListener('click', (e) => {
          const requestId = e.target.closest('.pending-item').dataset.id;
          buyerDashboard.rejectRequest(requestId);
        });
      });
    },
    
    // Load and display recent activity
    loadRecentActivity: () => {
      const activityList = document.getElementById('recent-activities');
      if (!activityList) return;
      
      // Clear existing activity
      activityList.innerHTML = '';
      
      // Combine all requests for activity feed
      const activities = [
        ...(buyerDashboard.user.requests || []).map(req => ({
          type: 'request',
          date: req.date,
          data: req
        }))
      ];
      
      // Sort by date (most recent first)
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Take the 5 most recent activities
      const recentActivities = activities.slice(0, 5);
      
      if (recentActivities.length === 0) {
        // Display message if no activities
        const emptyActivity = document.createElement('div');
        emptyActivity.className = 'activity-item';
        emptyActivity.innerHTML = `
          <div class="activity-details">
            <p>No activities yet</p>
          </div>
        `;
        activityList.appendChild(emptyActivity);
        return;
      }
      
      // Add each activity to the list
      recentActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        if (activity.type === 'request') {
          let statusIcon = 'fa-clock';
          let statusClass = 'pending';
          
          if (activity.data.status === 'accepted') {
            statusIcon = 'fa-check-circle';
            statusClass = 'accepted';
          } else if (activity.data.status === 'rejected') {
            statusIcon = 'fa-times-circle';
            statusClass = 'rejected';
          }
          
          activityItem.innerHTML = `
            <div class="activity-icon ${statusClass}">
              <i class="fas ${statusIcon}"></i>
            </div>
            <div class="activity-details">
              <p>${activity.data.customerName} requested <span>${activity.data.reward}</span></p>
              <p class="activity-meta">${utils.formatDateTime(activity.data.date)}</p>
            </div>
            <div class="activity-points">${activity.data.points} pts</div>
          `;
        }
        
        activityList.appendChild(activityItem);
      });
    },
    
    // Load nearby customers
    loadNearbyCustomers: () => {
      const customerCards = document.getElementById('customer-cards');
      if (!customerCards) return;
      
      // Clear existing cards
      customerCards.innerHTML = '';
      
      // Get customers
      const customers = buyerDashboard.user.customers || [];
      
      if (customers.length === 0) {
        // Display message if no customers
        const emptyCard = document.createElement('div');
        emptyCard.className = 'empty-list';
        emptyCard.textContent = 'No nearby customers found';
        customerCards.appendChild(emptyCard);
        return;
      }
      
      // Add each customer to the list
      customers.forEach(customer => {
        const card = document.createElement('div');
        card.className = 'customer-card';
        
        // Generate random distance for demo
        const distance = (Math.random() * 10).toFixed(1);
        
        card.innerHTML = `
          <div class="customer-header">
            <div class="customer-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="customer-info">
              <h3>${customer.name}</h3>
              <p><i class="fas fa-map-marker-alt"></i> ${distance} km away</p>
            </div>
          </div>
          <div class="customer-body">
            <div class="customer-stats">
              <div class="customer-stat">
                <h4>Points Balance</h4>
                <p>${customer.pointsBalance} pts</p>
              </div>
              <div class="customer-stat">
                <h4>Redemptions</h4>
                <p>${customer.totalRedemptions}</p>
              </div>
            </div>
            <p class="last-visit">Last visited: ${utils.formatDate(customer.lastVisit)}</p>
          </div>
          <div class="customer-footer">
            <button class="btn secondary view-customer">View Profile</button>
            <button class="btn primary contact-customer">Contact</button>
          </div>
        `;
        
        customerCards.appendChild(card);
      });
      
      // Add event listeners to buttons
      customerCards.querySelectorAll('.view-customer').forEach(button => {
        button.addEventListener('click', () => {
          utils.showToast('Customer profile view is coming soon!', 'info');
        });
      });
      
      customerCards.querySelectorAll('.contact-customer').forEach(button => {
        button.addEventListener('click', () => {
          utils.showToast('Contact feature is coming soon!', 'info');
        });
      });
    },
    
    // Initialize charts and analytics
    initCharts: () => {
      // Simulated data for charts
      
      // Redemption trend chart (already in HTML)
      
      // Waste distribution chart (already set in HTML)
      
      // Refresh map button
      const refreshMapBtn = document.getElementById('refresh-map');
      if (refreshMapBtn) {
        refreshMapBtn.addEventListener('click', () => {
          utils.showToast('Map refreshed successfully!', 'success');
        });
      }
      
      // Analytics period selector
      const analyticsSelector = document.getElementById('analytics-period');
      if (analyticsSelector) {
        analyticsSelector.addEventListener('change', () => {
          utils.showToast(`Analytics updated for ${analyticsSelector.options[analyticsSelector.selectedIndex].text}`, 'info');
        });
      }
      
      // Export report buttons
      const exportButtons = document.querySelectorAll('.export-actions button');
      exportButtons.forEach(button => {
        button.addEventListener('click', () => {
          utils.showToast('Report export initiated!', 'success');
        });
      });
    },
    
    // Initialize redemption modal functionality
    initRedemptionModal: () => {
      const modal = document.getElementById('redemption-modal');
      if (!modal) return;
      
      const acceptBtn = modal.querySelector('#accept-redemption');
      const rejectBtn = modal.querySelector('#reject-redemption');
      
      // Handle accept button
      acceptBtn.addEventListener('click', () => {
        const requestId = modal.dataset.requestId;
        buyerDashboard.acceptRequest(requestId);
        utils.closeModal('redemption-modal');
      });
      
      // Handle reject button
      rejectBtn.addEventListener('click', () => {
        const requestId = modal.dataset.requestId;
        buyerDashboard.rejectRequest(requestId);
        utils.closeModal('redemption-modal');
      });
    },
    
    // Open request details modal
    openRequestModal: (requestId) => {
      const modal = document.getElementById('redemption-modal');
      const request = (buyerDashboard.user.requests || []).find(r => r.id === requestId);
      const customer = (buyerDashboard.user.customers || []).find(c => c.id === request.customerId);
      
      if (!modal || !request) return;
      
      // Set request ID in modal dataset
      modal.dataset.requestId = requestId;
      
      // Update modal content
      modal.querySelector('#modal-customer-name').textContent = request.customerName;
      modal.querySelector('#modal-customer-id').textContent = `Customer ID: #${request.customerId.substring(0, 5)}`;
      modal.querySelector('#modal-reward').textContent = request.reward;
      modal.querySelector('#modal-points').textContent = `${request.points} points`;
      modal.querySelector('#modal-date').textContent = utils.formatDateTime(request.date);
      modal.querySelector('#modal-method').textContent = request.method === 'qr' ? 'QR Code' : 'UPI Transfer';
      
      // Update customer history (if available)
      if (customer) {
        modal.querySelector('#modal-total-redemptions').textContent = customer.totalRedemptions;
        modal.querySelector('#modal-points-balance').textContent = `${customer.pointsBalance} points`;
        modal.querySelector('#modal-previous-visit').textContent = utils.formatDate(customer.lastVisit);
      } else {
        modal.querySelector('#modal-total-redemptions').textContent = 'N/A';
        modal.querySelector('#modal-points-balance').textContent = 'N/A';
        modal.querySelector('#modal-previous-visit').textContent = 'N/A';
      }
      
      // Update button visibility based on status
      if (request.status === 'pending') {
        modal.querySelector('#accept-redemption').style.display = 'block';
        modal.querySelector('#reject-redemption').style.display = 'block';
      } else {
        modal.querySelector('#accept-redemption').style.display = 'none';
        modal.querySelector('#reject-redemption').style.display = 'none';
      }
      
      // Open modal
      utils.openModal('redemption-modal');
    },
    
    // Accept redemption request
    acceptRequest: (requestId) => {
      // Find the request
      const requestIndex = (buyerDashboard.user.requests || []).findIndex(r => r.id === requestId);
      
      if (requestIndex === -1) return;
      
      // Update request status
      buyerDashboard.user.requests[requestIndex].status = 'accepted';
      
      // Update localStorage
      utils.storeData('currentUser', buyerDashboard.user);
      const users = utils.getData('users');
      const updatedUsers = users.map(user => {
        if (user.id === buyerDashboard.user.id) {
          return buyerDashboard.user;
        }
        return user;
      });
      utils.storeData('users', updatedUsers);
      
      // Show success message
      utils.showToast('Redemption request accepted successfully!', 'success');
      
      // Update UI
      buyerDashboard.loadRedemptionRequests();
      buyerDashboard.loadPendingRedemptions();
      buyerDashboard.loadRecentActivity();
    },
    
    // Reject redemption request
    rejectRequest: (requestId) => {
      // Find the request
      const requestIndex = (buyerDashboard.user.requests || []).findIndex(r => r.id === requestId);
      
      if (requestIndex === -1) return;
      
      // Update request status
      buyerDashboard.user.requests[requestIndex].status = 'rejected';
      
      // Update localStorage
      utils.storeData('currentUser', buyerDashboard.user);
      const users = utils.getData('users');
      const updatedUsers = users.map(user => {
        if (user.id === buyerDashboard.user.id) {
          return buyerDashboard.user;
        }
        return user;
      });
      utils.storeData('users', updatedUsers);
      
      // Show success message
      utils.showToast('Redemption request rejected', 'info');
      
      // Update UI
      buyerDashboard.loadRedemptionRequests();
      buyerDashboard.loadPendingRedemptions();
      buyerDashboard.loadRecentActivity();
    },
    
    // Initialize QR scanner functionality
    initQrScanner: () => {
      const scannerModal = document.getElementById('qr-scanner-modal');
      if (!scannerModal) return;
      
      // Handle manual entry button
      const manualEntryBtn = scannerModal.querySelector('#manual-entry');
      if (manualEntryBtn) {
        manualEntryBtn.addEventListener('click', () => {
          utils.closeModal('qr-scanner-modal');
          
          // Show toast message
          utils.showToast('Manual entry feature coming soon!', 'info');
        });
      }
      
      // Add scan animation
      const scannerLine = scannerModal.querySelector('.scanner-line');
      if (scannerLine) {
        // Animation already set in CSS
      }
    },
    
    // Initialize filters
    initFilters: () => {
      // Redemption request filters
      const redemptionSearch = document.getElementById('redemption-search');
      const statusFilter = document.getElementById('redemption-status-filter');
      const dateFilter = document.getElementById('redemption-date-filter');
      
      const applyRedemptionFilters = () => {
        const searchTerm = (redemptionSearch?.value || '').toLowerCase();
        const statusValue = statusFilter?.value || 'all';
        const dateValue = dateFilter?.value || 'all';
        
        // Get requests
        const requests = buyerDashboard.user.requests || [];
        
        const filteredRequests = requests.filter(request => {
          const matchesSearch = request.customerName.toLowerCase().includes(searchTerm);
          
          let matchesStatus = true;
          if (statusValue !== 'all') {
            matchesStatus = request.status === statusValue;
          }
          
          let matchesDate = true;
          const requestDate = new Date(request.date);
          const now = new Date();
          
          if (dateValue === 'today') {
            const today = new Date(now.setHours(0, 0, 0, 0));
            matchesDate = requestDate >= today;
          } else if (dateValue === 'week') {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - 7);
            matchesDate = requestDate >= weekStart;
          } else if (dateValue === 'month') {
            const monthStart = new Date(now);
            monthStart.setMonth(now.getMonth() - 1);
            matchesDate = requestDate >= monthStart;
          }
          
          return matchesSearch && matchesStatus && matchesDate;
        });
        
        // Update table with filtered requests
        const tableBody = document.getElementById('redemption-requests-body');
        if (!tableBody) return;
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        if (filteredRequests.length === 0) {
          // Display message if no requests match filters
          const emptyRow = document.createElement('tr');
          emptyRow.innerHTML = `
            <td colspan="6" class="text-center">No matching redemption requests found</td>
          `;
          tableBody.appendChild(emptyRow);
          return;
        }
        
        // Sort requests by date (most recent first)
        const sortedRequests = [...filteredRequests].sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        // Add each request to the table
        sortedRequests.forEach(request => {
          const row = document.createElement('tr');
          row.dataset.id = request.id;
          
          row.innerHTML = `
            <td>
              <div class="user-entry">
                <div class="user-avatar small">
                  <i class="fas fa-user"></i>
                </div>
                <span>${request.customerName}</span>
              </div>
            </td>
            <td>${request.reward}</td>
            <td>${request.points} pts</td>
            <td>${utils.formatDate(request.date)}</td>
            <td>
              <span class="status-tag ${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
            </td>
            <td>
              <div class="table-actions">
                ${request.status === 'pending' ? `
                  <button class="accept-request" title="Accept"><i class="fas fa-check"></i></button>
                  <button class="reject-request" title="Reject"><i class="fas fa-times"></i></button>
                  <button class="view-request" title="View Details"><i class="fas fa-eye"></i></button>
                ` : `
                  <button class="view-request" title="View Details"><i class="fas fa-eye"></i></button>
                `}
              </div>
            </td>
          `;
          
          tableBody.appendChild(row);
        });
        
        // Re-add event listeners
        tableBody.querySelectorAll('.view-request').forEach(button => {
          button.addEventListener('click', (e) => {
            const requestId = e.target.closest('tr').dataset.id;
            buyerDashboard.openRequestModal(requestId);
          });
        });
        
        tableBody.querySelectorAll('.accept-request').forEach(button => {
          button.addEventListener('click', (e) => {
            const requestId = e.target.closest('tr').dataset.id;
            buyerDashboard.acceptRequest(requestId);
          });
        });
        
        tableBody.querySelectorAll('.reject-request').forEach(button => {
          button.addEventListener('click', (e) => {
            const requestId = e.target.closest('tr').dataset.id;
            buyerDashboard.rejectRequest(requestId);
          });
        });
      };
      
      // Add event listeners to filters
      if (redemptionSearch) {
        redemptionSearch.addEventListener('input', utils.debounce(applyRedemptionFilters, 300));
      }
      
      if (statusFilter) {
        statusFilter.addEventListener('change', applyRedemptionFilters);
      }
      
      if (dateFilter) {
        dateFilter.addEventListener('change', applyRedemptionFilters);
      }
      
      // Customer filters
      const customerSearch = document.getElementById('customer-search');
      const pointsFilter = document.getElementById('points-filter');
      const distanceFilter = document.getElementById('distance-filter');
      
      const applyCustomerFilters = () => {
        // Implementation similar to redemption filters
        utils.showToast('Customer filtering applied', 'info');
      };
      
      // Add event listeners to customer filters
      if (customerSearch) {
        customerSearch.addEventListener('input', utils.debounce(applyCustomerFilters, 300));
      }
      
      if (pointsFilter) {
        pointsFilter.addEventListener('change', applyCustomerFilters);
      }
      
      if (distanceFilter) {
        distanceFilter.addEventListener('change', applyCustomerFilters);
      }
    }
  };
  
  // Initialize dashboard
  buyerDashboard.init();
});