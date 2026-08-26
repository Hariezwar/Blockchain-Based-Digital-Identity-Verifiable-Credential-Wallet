/**
 * CredTrust Premium UI Utilities
 * Handles Toasts, Modals, and other global UI interactions.
 */

class UIManager {
    constructor() {
        this.toastContainer = document.getElementById('toast-container');
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toast-container';
            document.body.appendChild(this.toastContainer);
        }

        this.modalContainer = document.getElementById('modal-container');
        if (!this.modalContainer) {
            this.modalContainer = document.createElement('div');
            this.modalContainer.id = 'modal-container';
            document.body.appendChild(this.modalContainer);
        }
    }

    /**
     * Show a premium toast notification
     * @param {string} title 
     * @param {string} message 
     * @param {'success'|'error'|'info'|'warning'} type 
     * @param {number} duration 
     */
    showToast(title, message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'ph-check-circle',
            error: 'ph-x-circle',
            warning: 'ph-warning-circle',
            info: 'ph-info'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="ph-fill ${icons[type] || icons.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="modal-close" style="font-size: 1.2rem; padding: 0.2rem;" onclick="this.parentElement.remove()">
                <i class="ph ph-x"></i>
            </button>
        `;

        this.toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
        });

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Show a custom modal
     * @param {Object} options 
     */
    showModal({ title, body, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, type = 'default' }) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        const confirmBtnClass = type === 'danger' ? 'btn-primary' : 'btn-primary'; // TODO: add btn-danger
        
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close"><i class="ph ph-x"></i></button>
                </div>
                <div class="modal-body">
                    ${body}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline modal-cancel-btn">${cancelText}</button>
                    <button class="btn ${confirmBtnClass} modal-confirm-btn">${confirmText}</button>
                </div>
            </div>
        `;

        this.modalContainer.appendChild(overlay);

        const closeBtn = overlay.querySelector('.modal-close');
        const cancelBtn = overlay.querySelector('.modal-cancel-btn');
        const confirmBtn = overlay.querySelector('.modal-confirm-btn');

        const closeModal = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        };

        closeBtn.addEventListener('click', () => {
            if (onCancel) onCancel();
            closeModal();
        });

        cancelBtn.addEventListener('click', () => {
            if (onCancel) onCancel();
            closeModal();
        });

        confirmBtn.addEventListener('click', () => {
            if (onConfirm) onConfirm();
            closeModal();
        });

        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
    }

    /**
     * Initialize Global Search / Command Palette
     */
    initCommandPalette() {
        const overlay = document.getElementById('command-palette-overlay');
        const input = document.getElementById('command-palette-input');
        const results = document.getElementById('command-palette-results');
        
        if (!overlay || !input) return;

        const openPalette = () => {
            overlay.classList.add('active');
            input.focus();
            input.value = '';
            this.renderCommandResults('');
        };

        const closePalette = () => {
            overlay.classList.remove('active');
        };

        // Ctrl + K shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (overlay.classList.contains('active')) {
                    closePalette();
                } else {
                    openPalette();
                }
            }
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closePalette();
            }
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePalette();
        });

        // Search filtering
        input.addEventListener('input', (e) => {
            this.renderCommandResults(e.target.value);
        });
    }

    renderCommandResults(query) {
        const resultsContainer = document.getElementById('command-palette-results');
        const q = query.toLowerCase();
        
        // Mock commands based on the prompt
        const commands = [
            { icon: 'ph-magnifying-glass', label: 'Search credentials', action: () => window.location.hash = '#/dashboard' },
            { icon: 'ph-wallet', label: 'Open wallet', action: () => window.location.hash = '#/dashboard' },
            { icon: 'ph-lock', label: 'Lock wallet', action: () => { if(window.walletService) window.walletService.lockWallet(); } },
            { icon: 'ph-identification-card', label: 'View DID', action: () => window.location.hash = '#/dashboard' },
            { icon: 'ph-shield-check', label: 'Verify credential', action: () => window.location.hash = '#/dashboard' },
            { icon: 'ph-bell', label: 'Open notifications', action: () => this.showToast('Notifications', 'Notification center opening...', 'info') },
            { icon: 'ph-shield-warning', label: 'Open security centre', action: () => this.showToast('Security', 'Navigating to Security Centre', 'info') },
            { icon: 'ph-moon', label: 'Toggle theme', action: () => document.getElementById('theme-toggle').click() },
            { icon: 'ph-sign-out', label: 'Logout', action: () => { if(window.authService) window.authService.logout(); } }
        ];

        const filtered = commands.filter(c => c.label.toLowerCase().includes(q));
        
        if (filtered.length === 0) {
            resultsContainer.innerHTML = `<div style="padding: 1rem; text-align: center; color: var(--color-text-muted);">No commands found</div>`;
            return;
        }

        resultsContainer.innerHTML = filtered.map((cmd, index) => `
            <div class="cmd-item" style="padding: 0.75rem 1rem; border-radius: var(--radius-md); cursor: pointer; display: flex; align-items: center; gap: 0.75rem; color: var(--color-text-primary); transition: background var(--transition-fast);" onmouseover="this.style.background='var(--color-surface-hover)'" onmouseout="this.style.background='transparent'" data-index="${index}">
                <i class="ph ${cmd.icon}" style="font-size: 1.25rem; color: var(--color-primary);"></i>
                ${cmd.label}
            </div>
        `).join('');

        const items = resultsContainer.querySelectorAll('.cmd-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const cmd = filtered[parseInt(item.getAttribute('data-index'))];
                cmd.action();
                document.getElementById('command-palette-overlay').classList.remove('active');
            });
        });
    }

    /**
     * Initialize Quick Actions FAB
     */
    initQuickActions() {
        const fab = document.getElementById('quick-actions');
        const toggle = document.getElementById('qa-toggle');
        const menu = document.getElementById('qa-menu');

        if (!fab || !toggle || !menu) return;

        // Only show FAB if logged in
        if (window.authService && window.authService.isAuthenticated()) {
            fab.style.display = 'block';
            
            toggle.addEventListener('click', () => {
                const isHidden = menu.style.display === 'none';
                menu.style.display = isHidden ? 'flex' : 'none';
                toggle.innerHTML = isHidden ? '<i class="ph-bold ph-x" style="font-size: 1.5rem;"></i>' : '<i class="ph-bold ph-plus" style="font-size: 1.5rem;"></i>';
                
                if (isHidden) {
                    this.populateQuickActions(menu);
                }
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!fab.contains(e.target) && menu.style.display === 'flex') {
                    menu.style.display = 'none';
                    toggle.innerHTML = '<i class="ph-bold ph-plus" style="font-size: 1.5rem;"></i>';
                }
            });
        } else {
            fab.style.display = 'none';
        }
    }

    populateQuickActions(menu) {
        const user = window.authService.user;
        let actions = [];

        if (user.role === 'HOLDER' || user.role_id === 1) {
            actions = [
                { icon: 'ph-qr-code', label: 'Share Credential', action: () => alert('Opening Presentation UI...') },
                { icon: 'ph-lock', label: 'Lock Wallet', action: () => window.walletService.lockWallet() }
            ];
        } else if (user.role === 'VERIFIER' || user.role_id === 3) {
            actions = [
                { icon: 'ph-shield-check', label: 'Verify Credential', action: () => window.location.hash = '#/dashboard' }
            ];
        } else if (user.role === 'ISSUER' || user.role_id === 2) {
            actions = [
                { icon: 'ph-plus-circle', label: 'Issue Credential', action: () => alert('Opening Issuance Wizard...') }
            ];
        }

        menu.innerHTML = actions.map(act => `
            <button class="btn btn-outline" style="border: none; justify-content: flex-start; padding: 0.5rem 1rem; text-align: left; background: transparent;" onclick="(${act.action.toString()})()">
                <i class="ph ${act.icon}" style="font-size: 1.25rem;"></i> ${act.label}
            </button>
        `).join('');
    }
}

// Global instance
window.UI = new UIManager();

// Init on load
document.addEventListener('DOMContentLoaded', () => {
    window.UI.initCommandPalette();
    window.UI.initQuickActions();
});
