document.addEventListener('DOMContentLoaded', () => {
  // Ensure user is logged in
  if (!router.protectRoute()) return;
  
  // Get current user
  const currentUser = router.getCurrentUser();
  
  // Make sure user is a customer
  if (currentUser.type !== 'customer') {
    window.location.href = 'dashboard_buyer.html';
    return;
  }
  
  // Customer Dashboard Controller
  const customerDashboard = {
    // User data
    user: currentUser,
    
    // Waste types and their points
    wasteTypes: {
      'plastic': { points: 10, color: 'var(--color-plastic)', description: 'Plastic waste includes bottles, containers, and packaging materials.' },
      'metal': { points: 20, color: 'var(--color-metal)', description: 'Metal waste includes cans, foil, and bottle caps.' },
      'organic': { points: 5, color: 'var(--color-organic)', description: 'Organic waste includes food waste and plant material.' },
      'e-waste': { points: 25, color: 'var(--color-ewaste)', description: 'E-waste includes electronics, batteries, and gadgets.' }
    },
    
    // Initialize dashboard
    init: () => {
      // Update user info
      customerDashboard.updateUserInfo();
      
      // Load and display uploads history
      customerDashboard.loadUploads();
      
      // Load and display recent activity
      customerDashboard.loadRecentActivity();
      
      // Update redemption history
      customerDashboard.loadRedemptionHistory();
      
      // Initialize upload functionality
      customerDashboard.initUploadFunctionality();
      
      // Initialize redeem functionality
      customerDashboard.initRedeemFunctionality();
      
      // Initialize edit and delete functionality
      customerDashboard.initEditDeleteFunctionality();
      
      // Initialize leaderboard
      customerDashboard.initLeaderboard();
      
      // Initialize filters
      customerDashboard.initFilters();
    },
    
    // Update user information in the UI
    updateUserInfo: () => {
      // Update user name
      document.querySelectorAll('#user-name, #header-username').forEach(el => {
        if (el) el.textContent = customerDashboard.user.name;
      });
      
      // Update points
      const pointsElements = document.querySelectorAll('#total-points, #available-points');
      pointsElements.forEach(el => {
        if (el) el.textContent = customerDashboard.user.points;
      });
      
      // Update upload count
      const uploadsElement = document.getElementById('total-uploads');
      if (uploadsElement) {
        uploadsElement.textContent = customerDashboard.user.uploads.length;
      }
      
      // Calculate and update redeemed value
      const redeemedValue = document.getElementById('redeemed-value');
      if (redeemedValue) {
        const totalRedeemed = customerDashboard.user.redemptions.reduce((total, redemption) => {
          // Extract dollar amount from reward description if it exists
          const match = redemption.reward.match(/\$(\d+)/);
          return total + (match ? parseInt(match[1]) : 0);
        }, 0);
        
        redeemedValue.textContent = `$${totalRedeemed.toFixed(2)}`;
      }
      
      // Update user rank (simulated)
      const rankElement = document.getElementById('user-rank');
      if (rankElement) {
        // For demo purposes, just set a random rank
        rankElement.textContent = '14th';
      }
    },
    
    // Load and display uploads history
    loadUploads: () => {
      const tableBody = document.getElementById('history-table-body');
      if (!tableBody) return;
      
      // Clear existing rows
      tableBody.innerHTML = '';
      
      // Sort uploads by date (most recent first)
      const sortedUploads = [...customerDashboard.user.uploads].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      if (sortedUploads.length === 0) {
        // Display message if no uploads
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
          <td colspan="6" class="text-center">No waste uploads yet. Start earning points by uploading waste photos!</td>
        `;
        tableBody.appendChild(emptyRow);
        return;
      }
      
      // Add each upload to the table
      sortedUploads.forEach(upload => {
        const row = document.createElement('tr');
        row.dataset.id = upload.id;
        
        row.innerHTML = `
          <td>${utils.formatDate(upload.date)}</td>
          <td>
            <div class="waste-type-tag" style="background-color: ${customerDashboard.wasteTypes[upload.type].color}20; color: ${customerDashboard.wasteTypes[upload.type].color};">
              <i class="fas fa-circle"></i>
              ${upload.type.charAt(0).toUpperCase() + upload.type.slice(1)}
            </div>
          </td>
          <td>
            <img src="${upload.imageUrl}" alt="${upload.type}" class="table-image">
          </td>
          <td>${upload.points} pts</td>
          <td>
            <span class="status-tag ${upload.status}">${upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}</span>
          </td>
          <td>
            <div class="table-actions">
              <button class="edit-upload" title="Edit"><i class="fas fa-edit"></i></button>
              <button class="delete-upload" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>
          </td>
        `;
        
        tableBody.appendChild(row);
      });
      
      // Add event listeners to edit and delete buttons
      tableBody.querySelectorAll('.edit-upload').forEach(button => {
        button.addEventListener('click', (e) => {
          const uploadId = e.target.closest('tr').dataset.id;
          customerDashboard.openEditModal(uploadId);
        });
      });
      
      tableBody.querySelectorAll('.delete-upload').forEach(button => {
        button.addEventListener('click', (e) => {
          const uploadId = e.target.closest('tr').dataset.id;
          customerDashboard.openDeleteModal(uploadId);
        });
      });
    },
    
    // Load and display recent activity
    loadRecentActivity: () => {
      const activityList = document.getElementById('recent-activities');
      if (!activityList) return;
      
      // Clear existing activity
      activityList.innerHTML = '';
      
      // Combine uploads and redemptions for activity feed
      const activities = [
        ...customerDashboard.user.uploads.map(upload => ({
          type: 'upload',
          date: upload.date,
          data: upload
        })),
        ...customerDashboard.user.redemptions.map(redemption => ({
          type: 'redemption',
          date: redemption.date,
          data: redemption
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
            <p>No activities yet. Start by uploading waste photos!</p>
          </div>
        `;
        activityList.appendChild(emptyActivity);
        return;
      }
      
      // Add each activity to the list
      recentActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        if (activity.type === 'upload') {
          activityItem.innerHTML = `
            <div class="activity-icon upload">
              <i class="fas fa-upload"></i>
            </div>
            <div class="activity-details">
              <p>You uploaded <span>${activity.data.type}</span> waste</p>
              <p class="activity-meta">${utils.formatDateTime(activity.data.date)}</p>
            </div>
            <div class="activity-points">+${activity.data.points} pts</div>
          `;
        } else {
          activityItem.innerHTML = `
            <div class="activity-icon redeem">
              <i class="fas fa-gift"></i>
            </div>
            <div class="activity-details">
              <p>You redeemed <span>${activity.data.reward}</span> at ${activity.data.partner}</p>
              <p class="activity-meta">${utils.formatDateTime(activity.data.date)}</p>
            </div>
            <div class="activity-points">-${activity.data.points} pts</div>
          `;
        }
        
        activityList.appendChild(activityItem);
      });
    },
    
    // Load redemption history
    loadRedemptionHistory: () => {
      const tableBody = document.getElementById('redemption-table-body');
      if (!tableBody) return;
      
      // Clear existing rows
      tableBody.innerHTML = '';
      
      // Sort redemptions by date (most recent first)
      const sortedRedemptions = [...customerDashboard.user.redemptions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      if (sortedRedemptions.length === 0) {
        // Display message if no redemptions
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
          <td colspan="5" class="text-center">No redemptions yet. Use your points to get rewards!</td>
        `;
        tableBody.appendChild(emptyRow);
        return;
      }
      
      // Add each redemption to the table
      sortedRedemptions.forEach(redemption => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${utils.formatDate(redemption.date)}</td>
          <td>${redemption.partner}</td>
          <td>${redemption.reward}</td>
          <td>${redemption.points} pts</td>
          <td>
            <span class="status-tag ${redemption.status}">${redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}</span>
          </td>
        `;
        
        tableBody.appendChild(row);
      });
    },
    
    // Initialize upload functionality
    initUploadFunctionality: () => {
      const uploadArea = document.getElementById('upload-area');
      const wastePhoto = document.getElementById('waste-photo');
      const uploadPreview = document.getElementById('upload-preview');
      const previewImage = document.getElementById('preview-image');
      const wasteInfo = document.getElementById('waste-info');
      const wasteIcon = document.getElementById('waste-icon');
      const wasteType = document.getElementById('waste-type');
      const wastePoints = document.getElementById('waste-points');
      const wasteDescription = document.getElementById('waste-description');
      const changePhotoBtn = document.getElementById('change-photo');
      const cancelUploadBtn = document.getElementById('cancel-upload');
      const confirmUploadBtn = document.getElementById('confirm-upload');
      
      if (!uploadArea || !wastePhoto) return;
      
      // Handle file selection
      wastePhoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Display preview
        const reader = new FileReader();
        reader.onload = (event) => {
          previewImage.src = event.target.result;
          document.querySelector('.upload-placeholder').classList.add('hidden');
          uploadPreview.classList.remove('hidden');
          
          // Simulate AI classification after a short delay
          setTimeout(() => {
            customerDashboard.classifyWaste();
          }, 1500);
        };
        reader.readAsDataURL(file);
      });
      
      // Handle change photo button
      if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', () => {
          wastePhoto.value = '';
          uploadPreview.classList.add('hidden');
          wasteInfo.classList.add('hidden');
          document.querySelector('.upload-placeholder').classList.remove('hidden');
        });
      }
      
      // Handle cancel button
      if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', () => {
          wastePhoto.value = '';
          uploadPreview.classList.add('hidden');
          wasteInfo.classList.add('hidden');
          document.querySelector('.upload-placeholder').classList.remove('hidden');
        });
      }
      
      // Handle confirm button
      if (confirmUploadBtn) {
        confirmUploadBtn.addEventListener('click', () => {
          const currentType = wasteType.textContent.toLowerCase();
          const points = parseInt(wastePoints.textContent);
          const notes = document.getElementById('waste-notes').value;
          
          // Create new upload
          const newUpload = {
            id: utils.generateId(),
            type: currentType,
            points,
            date: new Date().toISOString(),
            imageUrl: previewImage.src,
            status: 'completed',
            notes
          };
          
          // Add to user's uploads
          customerDashboard.user.uploads.push(newUpload);
          
          // Update user's points
          customerDashboard.user.points += points;
          
          // Update localStorage
          utils.storeData('currentUser', customerDashboard.user);
          const users = utils.getData('users');
          const updatedUsers = users.map(user => {
            if (user.id === customerDashboard.user.id) {
              return customerDashboard.user;
            }
            return user;
          });
          utils.storeData('users', updatedUsers);
          
          // Show success message
          utils.showToast(`Successfully uploaded ${currentType} waste and earned ${points} points!`, 'success');
          
          // Reset form
          wastePhoto.value = '';
          document.getElementById('waste-notes').value = '';
          uploadPreview.classList.add('hidden');
          wasteInfo.classList.add('hidden');
          document.querySelector('.upload-placeholder').classList.remove('hidden');
          
          // Update dashboard
          customerDashboard.updateUserInfo();
          customerDashboard.loadUploads();
          customerDashboard.loadRecentActivity();
        });
      }
      
      // Simulated AI classification
      customerDashboard.classifyWaste = () => {
        // Show waste info container
        wasteInfo.classList.remove('hidden');
        
        // Simulate AI by randomly selecting a waste type
        const wasteTypes = Object.keys(customerDashboard.wasteTypes);
        const randomType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
        
        // Update waste info
        wasteType.textContent = randomType.charAt(0).toUpperCase() + randomType.slice(1);
        wastePoints.textContent = customerDashboard.wasteTypes[randomType].points;
        wasteDescription.textContent = customerDashboard.wasteTypes[randomType].description;
        
        // Update icon color
        wasteIcon.style.backgroundColor = customerDashboard.wasteTypes[randomType].color;
        
        // Set different icon based on waste type
        let iconClass = 'fa-wine-bottle'; // default for plastic
        
        if (randomType === 'metal') {
          iconClass = 'fa-utensils';
        } else if (randomType === 'organic') {
          iconClass = 'fa-apple-alt';
        } else if (randomType === 'e-waste') {
          iconClass = 'fa-laptop';
        }
        
        wasteIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
        
        // Add animation effects
        wasteIcon.style.animation = 'pulse 1s';
        wastePoints.style.animation = 'fadeIn 1s';
        
        // Show classification result with a loading effect
        utils.showToast('Waste classified successfully!', 'success');
      };
    },
    
    // Initialize redemption functionality
    initRedeemFunctionality: () => {
      const redeemBtns = document.querySelectorAll('.redeem-btn');
      
      if (!redeemBtns.length) return;
      
      // Handle redeem button clicks
      redeemBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const points = parseInt(btn.dataset.points);
          const partner = btn.dataset.partner;
          const reward = btn.dataset.reward;
          
          // Check if user has enough points
          if (customerDashboard.user.points < points) {
            utils.showToast(`You don't have enough points for this reward`, 'error');
            return;
          }
          
          // Update modal content
          const modal = document.getElementById('redeem-modal');
          modal.querySelector('#redemption-points').textContent = points;
          modal.querySelector('#redemption-title').textContent = reward;
          modal.querySelector('#redemption-description').textContent = `Redeemable at ${partner}`;
          
          // Handle redemption method selection
          const redemptionMethod = modal.querySelector('#redemption-method');
          const upiField = modal.querySelector('.upi-field');
          
          redemptionMethod.addEventListener('change', () => {
            if (redemptionMethod.value === 'upi') {
              upiField.classList.remove('hidden');
            } else {
              upiField.classList.add('hidden');
            }
          });
          
          // Handle confirm redemption button
          const confirmRedeemBtn = modal.querySelector('#confirm-redeem');
          confirmRedeemBtn.addEventListener('click', () => {
            // Create new redemption
            const newRedemption = {
              id: utils.generateId(),
              partner,
              reward,
              points,
              date: new Date().toISOString(),
              status: 'pending',
              method: redemptionMethod.value
            };
            
            // Add UPI details if UPI method selected
            if (redemptionMethod.value === 'upi') {
              const upiId = modal.querySelector('#upi-id').value;
              if (!upiId) {
                utils.showToast('Please enter your UPI ID', 'error');
                return;
              }
              newRedemption.upiId = upiId;
            }
            
            // Add to user's redemptions
            customerDashboard.user.redemptions.push(newRedemption);
            
            // Update user's points
            customerDashboard.user.points -= points;
            
            // Update localStorage
            utils.storeData('currentUser', customerDashboard.user);
            const users = utils.getData('users');
            const updatedUsers = users.map(user => {
              if (user.id === customerDashboard.user.id) {
                return customerDashboard.user;
              }
              return user;
            });
            utils.storeData('users', updatedUsers);
            
            // Close modal
            utils.closeModal('redeem-modal');
            
            // Show appropriate success message and next steps
            if (redemptionMethod.value === 'qr') {
              // Open QR code modal
              utils.openModal('qr-modal');
              
              // Update QR modal content
              const qrModal = document.getElementById('qr-modal');
              qrModal.querySelector('#qr-partner').textContent = partner;
              qrModal.querySelector('#qr-reward').textContent = reward;
              
              // Add event listener to download button
              const downloadBtn = qrModal.querySelector('#download-qr');
              downloadBtn.addEventListener('click', () => {
                utils.showToast('QR code downloaded successfully!', 'success');
              });
            } else {
              // Show UPI success message
              utils.showToast(`Redemption request sent! You will receive your reward soon.`, 'success');
            }
            
            // Update dashboard
            customerDashboard.updateUserInfo();
            customerDashboard.loadRedemptionHistory();
            customerDashboard.loadRecentActivity();
          });
          
          // Open redemption modal
          utils.openModal('redeem-modal');
        });
      });
      
      // Initialize category tabs
      const categoryTabs = document.querySelectorAll('.category-tab');
      const redeemCards = document.querySelectorAll('.redeem-card');
      
      categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          // Remove active class from all tabs
          categoryTabs.forEach(t => t.classList.remove('active'));
          
          // Add active class to clicked tab
          tab.classList.add('active');
          
          // Filter cards by category
          const category = tab.dataset.category;
          
          redeemCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
    },
    
    // Initialize edit and delete functionality
    initEditDeleteFunctionality: () => {
      // Edit modal
      const editModal = document.getElementById('edit-modal');
      if (editModal) {
        const saveEditBtn = editModal.querySelector('#save-edit');
        const cancelEditBtn = editModal.querySelector('#cancel-edit');
        
        // Handle save edit button
        saveEditBtn.addEventListener('click', () => {
          const uploadId = editModal.dataset.uploadId;
          const newType = editModal.querySelector('#edit-waste-type').value;
          const newNotes = editModal.querySelector('#edit-waste-notes').value;
          
          // Find the upload to edit
          const uploadIndex = customerDashboard.user.uploads.findIndex(upload => upload.id === uploadId);
          
          if (uploadIndex !== -1) {
            const oldUpload = customerDashboard.user.uploads[uploadIndex];
            const oldPoints = oldUpload.points;
            const newPoints = customerDashboard.wasteTypes[newType].points;
            
            // Update upload
            customerDashboard.user.uploads[uploadIndex].type = newType;
            customerDashboard.user.uploads[uploadIndex].points = newPoints;
            customerDashboard.user.uploads[uploadIndex].notes = newNotes;
            
            // Update user points
            customerDashboard.user.points = customerDashboard.user.points - oldPoints + newPoints;
            
            // Update localStorage
            utils.storeData('currentUser', customerDashboard.user);
            const users = utils.getData('users');
            const updatedUsers = users.map(user => {
              if (user.id === customerDashboard.user.id) {
                return customerDashboard.user;
              }
              return user;
            });
            utils.storeData('users', updatedUsers);
            
            // Close modal
            utils.closeModal('edit-modal');
            
            // Show success message
            utils.showToast('Upload updated successfully!', 'success');
            
            // Update dashboard
            customerDashboard.updateUserInfo();
            customerDashboard.loadUploads();
            customerDashboard.loadRecentActivity();
          }
        });
        
        // Handle cancel edit button
        cancelEditBtn.addEventListener('click', () => {
          utils.closeModal('edit-modal');
        });
      }
      
      // Delete modal
      const deleteModal = document.getElementById('delete-modal');
      if (deleteModal) {
        const confirmDeleteBtn = deleteModal.querySelector('#confirm-delete');
        const cancelDeleteBtn = deleteModal.querySelector('#cancel-delete');
        
        // Handle confirm delete button
        confirmDeleteBtn.addEventListener('click', () => {
          const uploadId = deleteModal.dataset.uploadId;
          
          // Find the upload to delete
          const uploadIndex = customerDashboard.user.uploads.findIndex(upload => upload.id === uploadId);
          
          if (uploadIndex !== -1) {
            const points = customerDashboard.user.uploads[uploadIndex].points;
            
            // Remove upload
            customerDashboard.user.uploads.splice(uploadIndex, 1);
            
            // Update user points
            customerDashboard.user.points -= points;
            
            // Update localStorage
            utils.storeData('currentUser', customerDashboard.user);
            const users = utils.getData('users');
            const updatedUsers = users.map(user => {
              if (user.id === customerDashboard.user.id) {
                return customerDashboard.user;
              }
              return user;
            });
            utils.storeData('users', updatedUsers);
            
            // Close modal
            utils.closeModal('delete-modal');
            
            // Show success message
            utils.showToast('Upload deleted successfully!', 'success');
            
            // Update dashboard
            customerDashboard.updateUserInfo();
            customerDashboard.loadUploads();
            customerDashboard.loadRecentActivity();
          }
        });
        
        // Handle cancel delete button
        cancelDeleteBtn.addEventListener('click', () => {
          utils.closeModal('delete-modal');
        });
      }
    },
    
    // Open edit modal
    openEditModal: (uploadId) => {
      const modal = document.getElementById('edit-modal');
      const upload = customerDashboard.user.uploads.find(u => u.id === uploadId);
      
      if (!modal || !upload) return;
      
      // Set upload ID in modal dataset
      modal.dataset.uploadId = uploadId;
      
      // Set form values
      const typeSelect = modal.querySelector('#edit-waste-type');
      const notesInput = modal.querySelector('#edit-waste-notes');
      
      typeSelect.value = upload.type;
      notesInput.value = upload.notes || '';
      
      // Open modal
      utils.openModal('edit-modal');
    },
    
    // Open delete modal
    openDeleteModal: (uploadId) => {
      const modal = document.getElementById('delete-modal');
      const upload = customerDashboard.user.uploads.find(u => u.id === uploadId);
      
      if (!modal || !upload) return;
      
      // Set upload ID in modal dataset
      modal.dataset.uploadId = uploadId;
      
      // Set points in delete warning
      const pointsSpan = modal.querySelector('#delete-points');
      pointsSpan.textContent = upload.points;
      
      // Open modal
      utils.openModal('delete-modal');
    },
    
    // Initialize leaderboard
    initLeaderboard: () => {
      const leaderboardTable = document.getElementById('leaderboard-table-body');
      if (!leaderboardTable) return;
      
      // Clear existing rows
      leaderboardTable.innerHTML = '';
      
      // Generate random leaderboard data for demo purposes
      const leaderboardData = [
        { rank: 1, name: 'Michael T.', uploads: 52, points: 672 },
        { rank: 2, name: 'Emma S.', uploads: 48, points: 583 },
        { rank: 3, name: 'Sarah J.', uploads: 41, points: 471 },
        { rank: 4, name: 'David K.', uploads: 39, points: 412 },
        { rank: 5, name: 'Lisa R.', uploads: 35, points: 387 },
        { rank: 6, name: 'Robert W.', uploads: 33, points: 362 },
        { rank: 7, name: 'Mark Z.', uploads: 31, points: 341 },
        { rank: 8, name: 'Olivia P.', uploads: 30, points: 325 },
        { rank: 9, name: 'Noah C.', uploads: 28, points: 307 },
        { rank: 10, name: 'Sophia G.', uploads: 25, points: 285 },
        { rank: 11, name: 'Ethan H.', uploads: 24, points: 275 },
        { rank: 12, name: 'Isabella F.', uploads: 22, points: 265 },
        { rank: 13, name: 'James B.', uploads: 21, points: 254 },
        { rank: 14, name: customerDashboard.user.name, uploads: customerDashboard.user.uploads.length, points: customerDashboard.user.points }
      ];
      
      // Add each entry to the table
      leaderboardData.forEach(entry => {
        const row = document.createElement('tr');
        
        // Highlight current user
        if (entry.name === customerDashboard.user.name) {
          row.className = 'current-user';
        }
        
        row.innerHTML = `
          <td>${entry.rank}</td>
          <td>
            <div class="user-entry">
              <div class="user-avatar small">
                <i class="fas fa-user"></i>
              </div>
              <span>${entry.name}</span>
            </div>
          </td>
          <td>${entry.uploads}</td>
          <td><strong>${entry.points} pts</strong></td>
        `;
        
        leaderboardTable.appendChild(row);
      });
    },
    
    // Initialize filters
    initFilters: () => {
      // History filters
      const historySearch = document.getElementById('history-search');
      const dateFilter = document.getElementById('date-filter');
      const typeFilter = document.getElementById('type-filter');
      
      const applyHistoryFilters = () => {
        const searchTerm = historySearch.value.toLowerCase();
        const dateValue = dateFilter.value;
        const typeValue = typeFilter.value;
        
        const filteredUploads = customerDashboard.user.uploads.filter(upload => {
          const matchesSearch = upload.type.toLowerCase().includes(searchTerm);
          
          let matchesDate = true;
          const uploadDate = new Date(upload.date);
          const now = new Date();
          
          if (dateValue === 'week') {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - 7);
            matchesDate = uploadDate >= weekStart;
          } else if (dateValue === 'month') {
            const monthStart = new Date(now);
            monthStart.setMonth(now.getMonth() - 1);
            matchesDate = uploadDate >= monthStart;
          } else if (dateValue === 'year') {
            const yearStart = new Date(now);
            yearStart.setFullYear(now.getFullYear() - 1);
            matchesDate = uploadDate >= yearStart;
          }
          
          const matchesType = typeValue === 'all' || upload.type === typeValue;
          
          return matchesSearch && matchesDate && matchesType;
        });
        
        // Update table with filtered uploads
        const tableBody = document.getElementById('history-table-body');
        if (tableBody) {
          // Clear existing rows
          tableBody.innerHTML = '';
          
          if (filteredUploads.length === 0) {
            // Display message if no uploads match filters
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
              <td colspan="6" class="text-center">No matching uploads found</td>
            `;
            tableBody.appendChild(emptyRow);
            return;
          }
          
          // Sort uploads by date (most recent first)
          const sortedUploads = [...filteredUploads].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
          });
          
          // Add each upload to the table
          sortedUploads.forEach(upload => {
            const row = document.createElement('tr');
            row.dataset.id = upload.id;
            
            row.innerHTML = `
              <td>${utils.formatDate(upload.date)}</td>
              <td>
                <div class="waste-type-tag" style="background-color: ${customerDashboard.wasteTypes[upload.type].color}20; color: ${customerDashboard.wasteTypes[upload.type].color};">
                  <i class="fas fa-circle"></i>
                  ${upload.type.charAt(0).toUpperCase() + upload.type.slice(1)}
                </div>
              </td>
              <td>
                <img src="${upload.imageUrl}" alt="${upload.type}" class="table-image">
              </td>
              <td>${upload.points} pts</td>
              <td>
                <span class="status-tag ${upload.status}">${upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}</span>
              </td>
              <td>
                <div class="table-actions">
                  <button class="edit-upload" title="Edit"><i class="fas fa-edit"></i></button>
                  <button class="delete-upload" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            `;
            
            tableBody.appendChild(row);
          });
          
          // Re-add event listeners
          tableBody.querySelectorAll('.edit-upload').forEach(button => {
            button.addEventListener('click', (e) => {
              const uploadId = e.target.closest('tr').dataset.id;
              customerDashboard.openEditModal(uploadId);
            });
          });
          
          tableBody.querySelectorAll('.delete-upload').forEach(button => {
            button.addEventListener('click', (e) => {
              const uploadId = e.target.closest('tr').dataset.id;
              customerDashboard.openDeleteModal(uploadId);
            });
          });
        }
      };
      
      // Add event listeners to filters
      if (historySearch) {
        historySearch.addEventListener('input', utils.debounce(applyHistoryFilters, 300));
      }
      
      if (dateFilter) {
        dateFilter.addEventListener('change', applyHistoryFilters);
      }
      
      if (typeFilter) {
        typeFilter.addEventListener('change', applyHistoryFilters);
      }
    }
  };
  
  // Initialize dashboard
  customerDashboard.init();
});