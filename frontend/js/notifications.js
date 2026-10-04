// Notifications Module
class Notifications {
  constructor() {
    this.container = document.getElementById('toast-container');
    this.count = 0;
  }

  show(type, message, duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'alert-circle';
    if (type === 'warning') icon = 'alert-triangle';
    if (type === 'danger') icon = 'alert-triangle';
    
    toast.innerHTML = `
      <i data-lucide="${icon}"></i>
      <span>${message}</span>
      <button class="navbar-icon-btn" onclick="this.parentElement.remove()">
        <i data-lucide="x"></i>
      </button>
    `;
    
    this.container.appendChild(toast);
    lucide.createIcons();
    
    // Auto remove
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
    
    this.count++;
  }

  success(message, duration) {
    this.show('success', message, duration);
  }

  error(message, duration) {
    this.show('error', message, duration);
  }

  warning(message, duration) {
    this.show('warning', message, duration);
  }

  danger(message, duration) {
    this.show('danger', message, duration);
  }

  info(message, duration) {
    this.show('info', message, duration);
  }

  clear() {
    this.container.innerHTML = '';
    this.count = 0;
  }
}

const notifications = new Notifications();
