import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        signup: 'signup.html',
        dashboard_customer: 'dashboard_customer.html',
        dashboard_buyer: 'dashboard_buyer.html'
      }
    }
  }
});