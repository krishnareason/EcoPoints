document.addEventListener('DOMContentLoaded', () => {
  // Initialize authentication functionality
  const authHandler = {
    // Check if passwords match
    checkPasswordStrength: (password) => {
      const strengthMeter = document.getElementById('strength-meter-fill');
      if (!strengthMeter) return;
      
      // Check password strength
      let strength = 0;
      
      // Length check
      if (password.length >= 8) strength += 25;
      
      // Character variety checks
      if (/[A-Z]/.test(password)) strength += 25; // Uppercase
      if (/[a-z]/.test(password)) strength += 15; // Lowercase
      if (/[0-9]/.test(password)) strength += 15; // Numbers
      if (/[^A-Za-z0-9]/.test(password)) strength += 20; // Special characters
      
      // Update the strength meter
      strengthMeter.style.width = `${strength}%`;
      
      // Set color based on strength
      if (strength < 33) {
        strengthMeter.className = 'strength-meter-fill weak';
      } else if (strength < 66) {
        strengthMeter.className = 'strength-meter-fill medium';
      } else {
        strengthMeter.className = 'strength-meter-fill strong';
      }
      
      return strength;
    },
    
    // Toggle password visibility
    togglePasswordVisibility: () => {
      const toggleButtons = document.querySelectorAll('.toggle-password');
      
      toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
          const passwordInput = button.previousElementSibling;
          
          if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            button.classList.remove('fa-eye-slash');
            button.classList.add('fa-eye');
          } else {
            passwordInput.type = 'password';
            button.classList.remove('fa-eye');
            button.classList.add('fa-eye-slash');
          }
        });
      });
    },
    
    // Get existing users from localStorage
    getUsers: () => {
      const users = utils.getData('users') || [];
      
      // Always ensure demo users exist
      if (!users.some(user => user.email === 'customer@example.com')) {
        const demoCustomer = {
          id: 'demo-customer',
          name: 'John Doe',
          email: 'customer@example.com',
          password: authHandler.hashPassword('password123'),
          type: 'customer',
          created: new Date().toISOString(),
          points: 245,
          uploads: [
            {
              id: 'demo-upload-1',
              type: 'plastic',
              points: 10,
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              imageUrl: 'https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg?auto=compress&cs=tinysrgb&w=300',
              status: 'completed',
              notes: 'Plastic bottles and containers'
            }
          ],
          redemptions: []
        };
        users.push(demoCustomer);
      }
      
      if (!users.some(user => user.email === 'buyer@example.com')) {
        const demoBuyer = {
          id: 'demo-buyer',
          name: 'GreenMart',
          businessName: 'GreenMart Eco Store',
          email: 'buyer@example.com',
          password: authHandler.hashPassword('password123'),
          type: 'buyer',
          created: new Date().toISOString(),
          requests: [],
          customers: []
        };
        users.push(demoBuyer);
      }
      
      // Update localStorage with demo users
      utils.storeData('users', users);
      
      return users;
    },
    
    // Add new user to localStorage
    addUser: (user) => {
      const users = authHandler.getUsers();
      users.push(user);
      utils.storeData('users', users);
    },
    
    // Set current user in localStorage
    setCurrentUser: (user) => {
      utils.storeData('currentUser', user);
    },
    
    // Hash password (simulated)
    hashPassword: (password) => {
      // In a real application, use a proper password hashing function
      // This is a simple simulation
      return btoa(password); // Base64 encode for demo purposes
    },
    
    // Verify password (simulated)
    verifyPassword: (password, hashedPassword) => {
      return authHandler.hashPassword(password) === hashedPassword;
    },
    
    // Handle sign up form submission
    handleSignUp: () => {
      const form = document.getElementById('signup-form');
      if (!form) return;
      
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!utils.validateForm(form)) {
          utils.showToast('Please fill in all required fields', 'error');
          return;
        }
        
        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Get account type
        const accountType = document.querySelector('input[name="account-type"]:checked').value;
        
        // Check if user already exists
        const existingUsers = authHandler.getUsers();
        const userExists = existingUsers.some(user => user.email === email);
        
        if (userExists) {
          utils.showToast('An account with this email already exists', 'error');
          return;
        }
        
        // Create user object
        const newUser = {
          id: utils.generateId(),
          name: fullname,
          email,
          password: authHandler.hashPassword(password),
          type: accountType,
          created: new Date().toISOString(),
          points: 0 // Initial points
        };
        
        // Initialize user data based on account type
        if (accountType === 'customer') {
          // Initialize customer-specific data
          newUser.uploads = [];
          newUser.redemptions = [];
        } else if (accountType === 'buyer') {
          // Initialize buyer-specific data
          newUser.businessName = fullname;
          newUser.requests = [];
          newUser.customers = [];
        }
        
        // Add user to localStorage
        authHandler.addUser(newUser);
        
        // Set as current user
        authHandler.setCurrentUser(newUser);
        
        // Show success message
        utils.showToast('Account created successfully!', 'success');
        
        // Redirect to appropriate dashboard
        setTimeout(() => {
          if (accountType === 'customer') {
            window.location.href = 'dashboard_customer.html';
          } else {
            window.location.href = 'dashboard_buyer.html';
          }
        }, 1000);
      });
    },
    
    // Handle login form submission
    handleLogin: () => {
      const form = document.getElementById('login-form');
      if (!form) return;
      
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!utils.validateForm(form)) {
          utils.showToast('Please fill in all required fields', 'error');
          return;
        }
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me')?.checked;
        
        // Get users from localStorage
        const users = authHandler.getUsers();
        
        // Find user by email
        const user = users.find(user => user.email === email);
        
        if (!user) {
          utils.showToast('No account found with this email', 'error');
          return;
        }
        
        // Verify password
        if (!authHandler.verifyPassword(password, user.password)) {
          utils.showToast('Invalid password', 'error');
          return;
        }
        
        // Set current user in localStorage
        authHandler.setCurrentUser(user);
        
        // Set session expiry if "Remember me" is not checked
        if (!rememberMe) {
          // Set expiry to 1 day
          const expiry = new Date().getTime() + (24 * 60 * 60 * 1000);
          utils.storeData('sessionExpiry', expiry);
        }
        
        // Show success message
        utils.showToast('Login successful!', 'success');
        
        // Redirect to appropriate dashboard
        setTimeout(() => {
          if (user.type === 'customer') {
            window.location.href = 'dashboard_customer.html';
          } else {
            window.location.href = 'dashboard_buyer.html';
          }
        }, 1000);
      });
    },
    
    // Handle logout
    handleLogout: () => {
      const logoutBtn = document.getElementById('logout-btn');
      if (!logoutBtn) return;
      
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove current user from localStorage
        localStorage.removeItem('currentUser');
        
        // Show logout message
        utils.showToast('You have been logged out', 'info');
        
        // Redirect to login page
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000);
      });
    },
    
    // Initialize authentication functionality
    init: () => {
      // Initialize demo users
      authHandler.getUsers();
      
      // Listen for password input changes
      const passwordInput = document.getElementById('password');
      if (passwordInput) {
        passwordInput.addEventListener('input', () => {
          authHandler.checkPasswordStrength(passwordInput.value);
        });
      }
      
      // Initialize password visibility toggle
      authHandler.togglePasswordVisibility();
      
      // Initialize sign up handler
      authHandler.handleSignUp();
      
      // Initialize login handler
      authHandler.handleLogin();
      
      // Initialize logout handler
      authHandler.handleLogout();
      
      // Handle account type selection
      const accountTypes = document.querySelectorAll('.account-type input');
      accountTypes.forEach(radio => {
        radio.addEventListener('change', () => {
          // Update UI based on selected account type
          const selectedType = radio.value;
          document.querySelectorAll('.account-type').forEach(type => {
            type.classList.remove('selected');
          });
          radio.closest('.account-type').classList.add('selected');
        });
      });
    }
  };
  
  // Initialize authentication functionality
  authHandler.init();
});