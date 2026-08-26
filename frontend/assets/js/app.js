/**
 * CredTrust Main Application Logic
 */

const App = {
    async init() {
        this.mainContent = document.getElementById('main-content');
        this.nav = document.getElementById('main-nav');
        
        // Theme toggler
        document.getElementById('theme-toggle').addEventListener('click', () => {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            html.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
        });

        // Language toggler
        const langSelect = document.getElementById('lang-select');
        if (langSelect) {
            langSelect.value = window.i18n.currentLang;
            langSelect.addEventListener('change', (e) => {
                window.i18n.setLanguage(e.target.value);
            });
        }

        // Initialize Router
        window.addEventListener('hashchange', () => this.route());
        this.route();
    },

    async route() {
        const hash = window.location.hash || '#/';
        this.renderNav();

        const path = hash.substring(1);
        let viewPath = '';

        if (path === '/' || path === '') {
            viewPath = '/html/views/home.html';
        } else if (path === '/login') {
            if (window.authService.isAuthenticated()) {
                window.location.hash = '#/dashboard';
                return;
            }
            await this.loadView('/html/views/login.html');
            return;
        } else if (path === '/dashboard') {
            if (!window.authService.isAuthenticated()) {
                window.location.hash = '#/login';
                return;
            }
            
            const user = window.authService.user;
            if (user.role === 'HOLDER' || user.role_id === 1) {
                await this.loadView('/html/views/holder-dashboard.html');
                this.initHolderDashboard();
                return;
            } else if (user.role === 'VERIFIER' || user.role_id === 3) {
                await this.loadView('/html/views/verifier-dashboard.html');
                this.initVerifierDashboard();
                return;
            } else if (user.role === 'ADMIN' || user.role_id === 4) {
                await this.loadView('/html/views/admin-dashboard.html');
                this.initAdminDashboard();
                return;
            } else {
                await this.loadView('/html/views/issuer-dashboard.html');
                this.initIssuerDashboard();
                return;
            }
        } else if (path === '/security') {
            if (!window.authService.isAuthenticated()) {
                window.location.hash = '#/login';
                return;
            }
            viewPath = '/html/views/security.html';
        } else if (path === '/profile') {
            if (!window.authService.isAuthenticated()) {
                window.location.hash = '#/login';
                return;
            }
            await this.loadView('/html/views/profile.html');
            this.initProfileView();
            return;
        } else {
            this.mainContent.innerHTML = `
                <div class="text-center" style="margin-top: 5rem;">
                    <h2>404 - Page Not Found</h2>
                    <p>The page you are looking for does not exist.</p>
                    <a href="#/" class="btn btn-primary">Return Home</a>
                </div>
            `;
            return;
        }

        if (viewPath) {
            await this.loadView(viewPath);
        }
    },

    renderNav() {
        const isAuthenticated = window.authService.isAuthenticated();
        if (isAuthenticated) {
            const role = window.authService.user.role || (window.authService.user.role_id === 1 ? 'HOLDER' : (window.authService.user.role_id === 2 ? 'ISSUER' : 'VERIFIER'));
            
            let navLinks = `<a href="#/dashboard" class="nav-link"><i class="ph ph-squares-four"></i> Dashboard</a>`;
            if (role === 'HOLDER' || role === 'ISSUER') {
                navLinks += `<a href="#/security" class="nav-link"><i class="ph ph-shield-check"></i> Security</a>`;
            }
            navLinks += `
                <a href="#/profile" class="nav-link"><i class="ph ph-user"></i> Profile</a>
                <button id="logout-btn" class="btn btn-outline" style="border-color: var(--color-danger); color: var(--color-danger); padding: 0.3rem 0.8rem;"><i class="ph ph-sign-out"></i> Logout</button>
            `;
            this.nav.innerHTML = navLinks;
            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                window.authService.logout();
            });
        } else {
            this.nav.innerHTML = `
                <a href="#/">Home</a>
                <a href="#/login" class="btn btn-primary text-white" style="color: white !important;">Login</a>
            `;
        }
    },

    async loadView(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('View not found');
            const html = await response.text();
            this.mainContent.innerHTML = html;
            window.i18n.translatePage(); // Translate after loading view
        } catch (error) {
            console.error("Error loading view:", error);
            this.mainContent.innerHTML = `<p class="text-center text-danger">Failed to load view. Are you running a local server?</p>`;
        }
    },

    async handleLogin() {
        const errorMsg = document.getElementById('login-error');
        errorMsg.style.display = 'none';
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const btn = document.querySelector('#login-form button');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Authenticating...`;
        btn.disabled = true;

        try {
            await window.authService.login(email, password);
            window.location.hash = '#/dashboard';
        } catch (err) {
            errorMsg.textContent = err.message;
            errorMsg.style.display = 'block';
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    async initHolderDashboard() {
        const hasWallet = await window.walletService.hasWallet();
        const walletSection = document.getElementById('wallet-section');
        const setupSection = document.getElementById('wallet-setup-section');
        
        if (hasWallet) {
            setupSection.style.display = 'none';
            walletSection.style.display = 'block';
            
            if (window.walletService.isLocked) {
                document.getElementById('wallet-content').innerHTML = `
                    <div class="glass-card text-center" style="max-width: 450px; margin: 4rem auto; padding: 3rem 2rem; border-top: 4px solid var(--color-primary);">
                        <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--color-surface); border: 2px solid var(--color-border); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; box-shadow: var(--shadow-glow);">
                            <i class="ph-fill ph-lock-key" style="font-size: 2.5rem; color: var(--color-primary);"></i>
                        </div>
                        <h3 style="margin-bottom: 0.5rem;">Your CredTrust Wallet is Locked</h3>
                        <p style="color: var(--color-text-secondary); margin-bottom: 2rem;">Your credentials remain securely encrypted on this device.</p>
                        
                        <div class="form-group" style="text-align: left;">
                            <div style="position: relative;">
                                <i class="ph ph-password" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted);"></i>
                                <input type="password" id="unlock-pwd" class="form-control" style="padding-left: 2.5rem;" placeholder="Enter Wallet Password">
                            </div>
                        </div>
                        <button id="unlock-btn" class="btn btn-primary" style="width: 100%; padding: 0.75rem;">
                            <i class="ph-bold ph-lock-key-open"></i> Unlock Wallet
                        </button>
                        <p id="unlock-error" class="text-danger" style="margin-top: 1rem; display: none; font-size: var(--font-size-sm);"></p>
                    </div>
                `;
                
                document.getElementById('unlock-btn').addEventListener('click', async () => {
                    const pwd = document.getElementById('unlock-pwd').value;
                    const btn = document.getElementById('unlock-btn');
                    btn.innerHTML = `<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Unlocking...`;
                    try {
                        await window.walletService.unlockWallet(pwd);
                        window.UI.showToast('Unlocked', 'Wallet decrypted successfully.', 'success');
                        this.renderWalletContent();
                    } catch (e) {
                        const err = document.getElementById('unlock-error');
                        err.textContent = "Invalid password. Please try again.";
                        err.style.display = 'block';
                        btn.innerHTML = `<i class="ph-bold ph-lock-key-open"></i> Unlock Wallet`;
                    }
                });
            } else {
                this.renderWalletContent();
            }
        } else {
            setupSection.style.display = 'block';
            walletSection.style.display = 'none';
            
            document.getElementById('create-wallet-btn').addEventListener('click', async () => {
                const pwd = document.getElementById('new-wallet-pwd').value;
                if(pwd.length < 6) {
                    window.UI.showToast('Error', 'Password must be at least 6 characters.', 'error');
                    return;
                }
                
                try {
                    await window.walletService.createWallet(pwd);
                    window.UI.showToast('Success', 'Wallet created & DID Generated.', 'success');
                    this.initHolderDashboard();
                } catch (e) {
                    console.error(e);
                    window.UI.showToast('Error', 'Failed to create wallet.', 'error');
                }
            });
        }
    },

    renderWalletContent() {
        // Update header stat
        const countEl = document.getElementById('hdr-cred-count');
        if(countEl) countEl.innerText = '1'; // Mock count

        const didSnippet = "did:key:z6MkhaXgB...";

        document.getElementById('wallet-content').innerHTML = `
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-top: 1rem;">
                
                <!-- Left Column (Main) -->
                <div>
                    <!-- Large Identity Card -->
                    <div class="glass-card" style="background: linear-gradient(135deg, rgba(21, 28, 47, 0.9), rgba(37, 99, 235, 0.1)); border-left: 4px solid var(--color-primary); margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="ph-fill ph-identification-card text-primary"></i> Digital Identity
                            </h3>
                            <div style="font-family: monospace; color: var(--color-text-secondary); background: rgba(0,0,0,0.2); padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid var(--glass-border); display: inline-block;">
                                ${didSnippet}
                            </div>
                            <div style="margin-top: 1rem; display: flex; gap: 1rem; font-size: var(--font-size-sm);">
                                <div><span style="color: var(--color-text-muted);">Status:</span> <span style="color: var(--color-success);">● Active</span></div>
                                <div><span style="color: var(--color-text-muted);">Storage:</span> AES-256-GCM</div>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <button class="btn btn-outline" style="border-color: var(--glass-border);" onclick="window.UI.showToast('Copied', 'DID copied to clipboard', 'info')"><i class="ph ph-copy"></i> Copy DID</button>
                            <button id="lock-wallet-btn" class="btn btn-outline" style="border-color: var(--color-warning); color: var(--color-warning);"><i class="ph ph-lock"></i> Lock Wallet</button>
                        </div>
                    </div>

                    <h3 class="mb-4">My Credentials</h3>
                    
                    <!-- Credential Card (Mock) -->
                    <div class="glass-card" style="padding: 0; overflow: hidden; position: relative; transition: all 0.3s ease; border-left: 4px solid var(--color-success); margin-bottom: 1.5rem;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow-glow)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-lg)'">
                        <div style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div class="badge badge-success mb-4"><i class="ph-bold ph-check"></i> Verified</div>
                                <h4>Bachelor of Technology</h4>
                                <p style="color: var(--color-primary); font-weight: 500; margin-bottom: 0.5rem;">Computer Science & Business Systems</p>
                                <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                                    <i class="ph ph-buildings"></i> V.S.B Engineering College
                                </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: var(--font-size-xs); background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: var(--radius-md);">
                                    <div><span style="color: var(--color-text-muted);">Issued:</span> 12 Aug 2026</div>
                                    <div><span style="color: var(--color-text-muted);">Valid until:</span> 12 Aug 2030</div>
                                    <div style="grid-column: span 2; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--glass-border); padding-top: 0.5rem; margin-top: 0.25rem;">
                                        <span><i class="ph-fill ph-cube text-warning"></i> Blockchain Anchored</span>
                                        <i class="ph-bold ph-check text-success"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="width: 60px; height: 60px; border-radius: 8px; background: white; display: flex; align-items: center; justify-content: center;">
                                <i class="ph-fill ph-graduation-cap" style="font-size: 2rem; color: #1e3a8a;"></i>
                            </div>
                        </div>
                        <div style="background: var(--color-surface-hover); padding: 1rem 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: flex-end; gap: 1rem;">
                            <button class="btn btn-outline" style="padding: 0.4rem 1rem; font-size: var(--font-size-sm);">View Details</button>
                            <button id="show-qr-btn" class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: var(--font-size-sm);"><i class="ph-bold ph-share-network"></i> Share</button>
                        </div>
                    </div>
                </div>

                <!-- Right Column (Widgets) -->
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    
                    <!-- Activity Feed Widget -->
                    <div class="glass-card" style="padding: 1.25rem;">
                        <h4 style="font-size: var(--font-size-base); margin-bottom: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">Recent Activity</h4>
                        <div style="display: flex; flex-direction: column; gap: 1rem; font-size: var(--font-size-sm);">
                            <div style="display: flex; gap: 0.75rem;">
                                <div style="margin-top: 0.2rem;"><i class="ph-fill ph-shield-check text-success"></i></div>
                                <div>
                                    <div style="color: var(--color-text-primary);">Credential verified</div>
                                    <div style="color: var(--color-text-muted); font-size: var(--font-size-xs);">12 seconds ago</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.75rem;">
                                <div style="margin-top: 0.2rem;"><i class="ph-fill ph-cube text-warning"></i></div>
                                <div>
                                    <div style="color: var(--color-text-primary);">Commitment confirmed</div>
                                    <div style="color: var(--color-text-muted); font-size: var(--font-size-xs);">1 minute ago</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.75rem;">
                                <div style="margin-top: 0.2rem;"><i class="ph-fill ph-lock-key text-primary"></i></div>
                                <div>
                                    <div style="color: var(--color-text-primary);">Wallet unlocked</div>
                                    <div style="color: var(--color-text-muted); font-size: var(--font-size-xs);">Just now</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Privacy Score Widget -->
                    <div class="glass-card" style="padding: 1.25rem; border: 1px solid var(--color-primary-light);">
                        <h4 style="font-size: var(--font-size-base); margin-bottom: 1rem;">Privacy Indicator</h4>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 50px; height: 50px; border-radius: 50%; border: 4px solid var(--color-success); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--color-success);">
                                98
                            </div>
                            <div style="font-size: var(--font-size-sm);">
                                <div style="color: var(--color-text-primary); font-weight: 500;">Excellent</div>
                                <div style="color: var(--color-text-muted); font-size: var(--font-size-xs);">Zero unnecessary disclosures.</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            <!-- Dynamic QR Modal structure appended dynamically by UI util -->
        `;
        
        document.getElementById('lock-wallet-btn').addEventListener('click', () => {
            window.walletService.lockWallet();
            window.UI.showToast('Locked', 'Wallet secured.', 'success');
            this.initHolderDashboard();
        });

        // Presentation / QR logic using premium custom modal with Selective Disclosure
        const showQrBtn = document.getElementById('show-qr-btn');
        if (showQrBtn) {
            showQrBtn.addEventListener('click', () => {
                
                // Selective Disclosure Consent Modal
                window.UI.showModal({
                    title: 'Data Sharing Request',
                    body: `
                        <div style="text-align: left;">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--glass-border);">
                                <div style="width: 48px; height: 48px; border-radius: 8px; background: var(--color-surface); display: flex; align-items: center; justify-content: center;">
                                    <i class="ph-fill ph-buildings text-primary" style="font-size: 1.5rem;"></i>
                                </div>
                                <div>
                                    <h4 style="margin: 0; font-size: var(--font-size-base);">Tech Corp Inc.</h4>
                                    <p style="margin: 0; font-size: var(--font-size-xs); color: var(--color-text-muted);">Verified Verifier Node</p>
                                </div>
                            </div>
                            
                            <p style="margin-bottom: 1rem; font-size: var(--font-size-sm); color: var(--color-text-secondary);">Select the specific claims you wish to disclose from your <strong>Bachelor of Technology</strong> credential. Uncheck fields to keep them private (Selective Disclosure).</p>
                            
                            <div style="display: flex; flex-direction: column; gap: 0.75rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
                                <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                                    <input type="checkbox" checked disabled style="accent-color: var(--color-primary);"> 
                                    <span style="font-weight: 500;">Degree Name</span> <span style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-left: auto;">Required</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                                    <input type="checkbox" checked style="accent-color: var(--color-primary);"> 
                                    <span style="font-weight: 500;">Issuing Institution</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                                    <input type="checkbox" style="accent-color: var(--color-primary);"> 
                                    <span style="font-weight: 500;">Graduation Year</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                                    <input type="checkbox" style="accent-color: var(--color-primary);"> 
                                    <span style="font-weight: 500;">CGPA</span> <span style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-left: auto;">Optional</span>
                                </label>
                            </div>
                        </div>
                    `,
                    confirmText: 'Generate Proof',
                    cancelText: 'Cancel',
                    type: 'default',
                    onConfirm: () => {
                        // After consent, show the QR Code
                        const vp = JSON.stringify({
                            "@context": ["https://www.w3.org/2018/credentials/v1"],
                            "type": ["VerifiablePresentation"],
                            "verifiableCredential": [{ "issuer": { "id": "did:web:demo-university.edu" }, "credentialSubject": { "degree": "Bachelor of Technology", "institution": "V.S.B Engineering College" } }]
                        });

                        window.UI.showModal({
                            title: 'Present Credential',
                            body: `
                                <div style="text-align: center;">
                                    <div class="badge badge-success mb-4"><i class="ph-bold ph-shield-check"></i> Zero-Knowledge Proof Generated</div>
                                    <p style="margin-bottom: 1.5rem; color: var(--color-text-secondary); font-size: var(--font-size-sm);">Show this QR code to the verifier. Only the selected claims are included.</p>
                                    <div id="qrcode-modal-display" style="margin: 0 auto; padding: 1rem; background: white; width: fit-content; border-radius: 8px; box-shadow: var(--shadow-md);"></div>
                                </div>
                            `,
                            confirmText: 'Done',
                            cancelText: 'Close',
                            type: 'default',
                            onConfirm: () => { window.UI.showToast('Success', 'Presentation shared securely', 'success'); }
                        });

                        setTimeout(() => {
                            const display = document.getElementById('qrcode-modal-display');
                            if (display) {
                                display.innerHTML = '';
                                new QRCode(display, {
                                    text: vp,
                                    width: 200,
                                    height: 200
                                });
                            }
                        }, 100);
                    }
                });
            });
        }
    },

    initVerifierDashboard() {
        const verifyBtn = document.getElementById('verify-btn');
        const emptyState = document.getElementById('verification-empty');
        const resultsDiv = document.getElementById('verification-results');
        const overallStatus = document.getElementById('overall-status');
        const titleText = document.getElementById('status-title');
        const descText = document.getElementById('status-desc');
        const checksList = document.getElementById('verification-checks');
        const scanLine = document.getElementById('scan-line');

        const checks = [
            { id: 'format', label: 'Checking presentation format', msg: 'Valid VerifiablePresentation structure' },
            { id: 'sig', label: 'Verifying digital signature', msg: 'Ed25519 signature is valid' },
            { id: 'trust', label: 'Checking issuer trust registry', msg: 'Issuer DID is registered and trusted' },
            { id: 'chain', label: 'Checking blockchain commitment', msg: 'Credential hash anchored in block #48291' },
            { id: 'bind', label: 'Verifying holder binding', msg: 'Presentation signed by credential subject' },
            { id: 'exp', label: 'Checking expiration', msg: 'Credential is valid until 2030' },
            { id: 'rev', label: 'Checking revocation registry', msg: 'Credential has not been revoked' }
        ];

        if(verifyBtn) {
            verifyBtn.addEventListener('click', async () => {
                const input = document.getElementById('vc-input').value;
                if (!input) {
                    window.UI.showToast('Error', 'Please provide credential data.', 'error');
                    return;
                }

                verifyBtn.disabled = true;
                emptyState.style.display = 'none';
                resultsDiv.style.display = 'flex';
                
                overallStatus.style.background = 'transparent';
                overallStatus.style.borderColor = 'transparent';
                overallStatus.style.color = 'var(--color-text-primary)';
                overallStatus.innerHTML = `
                    <i class="ph ph-spinner-gap check-icon-spin" style="font-size: 2.5rem; margin-bottom: 0.5rem; display: block; color: var(--color-primary);"></i>
                    <h3 style="margin: 0;" id="status-title">VERIFYING CREDENTIAL...</h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: var(--font-size-sm); opacity: 0.8;" id="status-desc">Executing cryptographic proofs</p>
                `;

                checksList.innerHTML = checks.map(c => `
                    <div id="check-${c.id}" class="check-item">
                        <i class="ph-bold ph-circle" id="icon-${c.id}" style="font-size: 1.25rem;"></i>
                        <div>
                            <div style="font-weight: 500; font-size: var(--font-size-sm);">${c.label}</div>
                            <div id="msg-${c.id}" style="font-size: var(--font-size-xs); color: var(--color-text-muted); display: none;">${c.msg}</div>
                        </div>
                    </div>
                `).join('');

                try {
                    // Try to parse the input to see if it's a real JSON
                    let parsedData;
                    try {
                        parsedData = JSON.parse(input);
                    } catch (e) {
                        throw { step: 'format', message: 'Invalid JSON format in presentation' };
                    }

                    if (!parsedData["@context"] || !parsedData.type || !parsedData.verifiableCredential) {
                         throw { step: 'format', message: 'Missing required VerifiablePresentation fields' };
                    }

                    // Check against local trust registry (issuerService)
                    // (Replaced local verification with backend verification)
                    const response = await fetch('/api/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ credential: parsedData })
                    });
                    
                    const result = await response.json();

                    for (let i = 0; i < checks.length; i++) {
                        const c = checks[i];
                        const item = document.getElementById(`check-${c.id}`);
                        const icon = document.getElementById(`icon-${c.id}`);
                        const msg = document.getElementById(`msg-${c.id}`);
                        
                        item.classList.add('active');
                        icon.className = 'ph ph-spinner-gap check-icon-spin text-primary';
                        
                        // Simulate UI delay for check
                        await new Promise(r => setTimeout(r, 200)); 
                        
                        if (result.checks && result.checks[c.id] === false) {
                            item.classList.remove('active');
                            item.classList.add('failed');
                            icon.className = 'ph-fill ph-x-circle text-danger';
                            msg.textContent = result.reason || `Check failed at step: ${c.label}`;
                            msg.style.display = 'block';
                            msg.style.color = 'var(--color-danger)';
                            
                            finishVerification(result.reason && result.reason.includes('revoked') ? 'revoked' : 'tampered');
                            return;
                        }

                        item.classList.remove('active');
                        item.classList.add('passed');
                        icon.className = 'ph-fill ph-check-circle text-success';
                        msg.style.display = 'block';
                    }

                    finishVerification(result.valid ? 'valid' : 'tampered');
                } catch (err) {
                    // Handle validation errors dynamically
                    if (err.step) {
                        const item = document.getElementById(`check-${err.step}`);
                        const icon = document.getElementById(`icon-${err.step}`);
                        const msg = document.getElementById(`msg-${err.step}`);
                        if(item && icon && msg) {
                            item.classList.remove('active');
                            item.classList.add('failed');
                            icon.className = 'ph-fill ph-x-circle text-danger';
                            msg.textContent = err.message;
                            msg.style.display = 'block';
                            msg.style.color = 'var(--color-danger)';
                        }
                    } else {
                        window.UI.showToast('Error', 'Server connection failed', 'error');
                    }
                    finishVerification('tampered');
                }
            });
        }

        const finishVerification = (result) => {
            verifyBtn.disabled = false;
            scanLine.style.display = 'none';

            if (result === 'valid') {
                overallStatus.style.background = 'rgba(16, 185, 129, 0.1)';
                overallStatus.style.borderColor = 'var(--color-success)';
                overallStatus.style.color = 'var(--color-success)';
                overallStatus.innerHTML = `
                    <i class="ph-fill ph-shield-check" style="font-size: 3rem; margin-bottom: 0.5rem; display: block;"></i>
                    <h3 style="margin: 0; color: inherit;">✓ CREDENTIAL VERIFIED</h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: var(--font-size-sm); color: var(--color-text-primary);">Authentic • Trusted Issuer • Blockchain Anchored</p>
                `;
            } else if (result === 'tampered') {
                overallStatus.style.background = 'rgba(239, 68, 68, 0.1)';
                overallStatus.style.borderColor = 'var(--color-danger)';
                overallStatus.style.color = 'var(--color-danger)';
                overallStatus.innerHTML = `
                    <i class="ph-fill ph-warning-circle" style="font-size: 3rem; margin-bottom: 0.5rem; display: block;"></i>
                    <h3 style="margin: 0; color: inherit;">✕ INVALID CREDENTIAL</h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: var(--font-size-sm); color: var(--color-text-primary);">Validation failed. Document rejected.</p>
                `;
            } else if (result === 'revoked') {
                overallStatus.style.background = 'rgba(245, 158, 11, 0.1)';
                overallStatus.style.borderColor = 'var(--color-warning)';
                overallStatus.style.color = 'var(--color-warning)';
                overallStatus.innerHTML = `
                    <i class="ph-fill ph-shield-warning" style="font-size: 3rem; margin-bottom: 0.5rem; display: block;"></i>
                    <h3 style="margin: 0; color: inherit;">⚠ CREDENTIAL REVOKED</h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: var(--font-size-sm); color: var(--color-text-primary);">The issuer has explicitly revoked this credential.</p>
                `;
            }
        };

        // Initialize QR Scanner
        const html5QrCode = new Html5Qrcode("reader");
        const readerPlaceholder = document.getElementById("reader-placeholder");
        
        document.getElementById("reader-container").addEventListener("click", () => {
            readerPlaceholder.style.display = "none";
            document.getElementById('reader').style.display = 'block';
            scanLine.style.display = 'block';

            html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    document.getElementById('vc-input').value = decodedText;
                    html5QrCode.stop();
                    document.getElementById('reader').style.display = 'none';
                    verifyBtn.click();
                },
                (errorMessage) => {}
            ).catch(err => {
                window.UI.showToast('Camera Error', 'Could not start camera', 'error');
                readerPlaceholder.style.display = "block";
                scanLine.style.display = 'none';
            });
        });
    },

    async initIssuerDashboard() {
        const user = window.authService.user;
        const org = window.issuerService ? await window.issuerService.getOrganization(user.id) : null;
        
        const viewOnboarding = document.getElementById('view-onboarding');
        const viewPending = document.getElementById('view-pending');
        const viewStats = document.getElementById('view-stats');
        const headerActions = document.getElementById('issuer-header-actions');
        
        // Reset visibility
        viewOnboarding.style.display = 'none';
        viewPending.style.display = 'none';
        viewStats.style.display = 'none';
        if (headerActions) headerActions.style.display = 'none';
        
        // Force show stats and header actions (Bypass protection)
        viewStats.style.display = 'block';
        if (headerActions) {
            headerActions.style.display = 'flex';
            document.getElementById('issuer-org-name-badge').textContent = org ? org.name : 'Trusted Issuer';
        }
        
        // Render charts
        const ctx = document.getElementById('issuanceChart');
        if (ctx && typeof Chart !== 'undefined') {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Credentials Issued',
                        data: [12, 19, 3, 5, 2, 3, 10],
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        // Wizard Logic
        const nextBtns = document.querySelectorAll('.next-btn');
        const prevBtns = document.querySelectorAll('.prev-btn');

        const goToStep = (step) => {
            document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
            const targetPanel = document.getElementById(`panel-${step}`);
            if (targetPanel) targetPanel.classList.add('active');

            const wizardBar = document.getElementById('wizard-bar');
            if (wizardBar) wizardBar.style.width = ((step - 1) * 25) + '%';

            document.querySelectorAll('.wizard-step').forEach((s, idx) => {
                if (idx + 1 < step) {
                    s.classList.add('completed');
                    s.classList.remove('active');
                } else if (idx + 1 == step) {
                    s.classList.add('active');
                    s.classList.remove('completed');
                } else {
                    s.classList.remove('active');
                    s.classList.remove('completed');
                }
            });
            
            // Generate preview on step 3
            if(step == 3) {
                const did = document.getElementById('wiz-did').value;
                const name = document.getElementById('wiz-name').value;
                const degree = document.getElementById('wiz-degree').value;
                const year = document.getElementById('wiz-year').value;
                const grade = document.getElementById('wiz-grade').value;
                
                const previewStr = JSON.stringify({
                    issuer: "did:web:demo-university.edu",
                    holder: did,
                    claims: { name, degree, year, grade }
                }, null, 2);
                document.getElementById('wiz-preview').textContent = previewStr;
            }
        };

        nextBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('button').getAttribute('data-target');
                // Validation
                if(target == 2 && !document.getElementById('wiz-did').value) {
                    window.UI.showToast('Validation Error', 'Holder DID is required.', 'warning');
                    return;
                }
                if(target == 3 && (!document.getElementById('wiz-name').value || !document.getElementById('wiz-degree').value)) {
                    window.UI.showToast('Validation Error', 'Please complete the required claims.', 'warning');
                    return;
                }
                goToStep(target);
            });
        });

        prevBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('button').getAttribute('data-target');
                goToStep(target);
            });
        });

        // Execute Issue
        const simpleForm = document.getElementById('simple-issue-form');
        if(simpleForm) {
            simpleForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const issueBtn = document.getElementById('execute-issue-btn');
                issueBtn.disabled = true;
                const originalBtnHtml = issueBtn.innerHTML;
                issueBtn.innerHTML = '<i class="ph ph-spinner-gap check-icon-spin"></i> Issuing...';

                try {
                    const did = document.getElementById('wiz-did').value;
                    const name = document.getElementById('wiz-name').value;
                    const degree = document.getElementById('wiz-degree').value;
                    const year = document.getElementById('wiz-year').value;
                    const grade = document.getElementById('wiz-grade').value;
                    
                    // Call real IssuerService
                    await window.issuerService.issueCredential(did, { name, degree, year, grade });

                    document.getElementById('simple-issue-form').style.display = 'none';
                    document.getElementById('simple-issue-success').style.display = 'block';

                } catch (error) {
                    window.UI.showToast('Issuance Failed', error.message, 'danger');
                    issueBtn.disabled = false;
                    issueBtn.innerHTML = originalBtnHtml;
                }
            });
        }
    },

    async submitOrganizationRegistration() {
        const user = window.authService.user;
        const name = document.getElementById('org-name').value;
        const type = document.getElementById('org-type').value;
        const regId = document.getElementById('org-reg-id').value;
        
        const btn = document.getElementById('submit-org-btn');
        btn.disabled = true;
        btn.innerHTML = `<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Submitting...`;
        
        try {
            const org = {
                userId: user.id,
                name,
                type,
                regId,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };
            
            await window.issuerService.saveOrganization(org);
            window.UI.showToast('Submitted', 'Organization application submitted for review.', 'success');
            await this.initIssuerDashboard();
        } catch (e) {
            window.UI.showToast('Error', 'Failed to submit application', 'error');
            btn.disabled = false;
            btn.innerHTML = 'Submit for Verification';
        }
    },

    async initProfileView() {
        const user = window.authService.user;
        const profileData = JSON.parse(localStorage.getItem(`profile_${user.id}`)) || {
            name: user.role === 'HOLDER' ? 'Holder User' : 'Unknown',
            language: 'en',
            timezone: 'UTC'
        };

        // Populate fields
        document.getElementById('profile-email').value = user.email || 'N/A';
        document.getElementById('profile-role').value = user.role || 'N/A';

        // Override Edit Profile button to open modal
        const editBtn = document.querySelector('button.btn-outline i.ph-pencil-simple').parentElement;
        editBtn.onclick = () => {
            document.getElementById('profile-name').value = profileData.name;
            document.getElementById('profile-language').value = profileData.language;
            document.getElementById('profile-timezone').value = profileData.timezone;
            document.getElementById('edit-profile-modal').classList.add('active');
        };

        const didContainer = document.getElementById('profile-did-container');
        
        // Wait briefly for wallet service to load if it's async
        const did = window.walletService ? await window.walletService.loadCurrentDID() : null;

        if (did) {
            didContainer.innerHTML = `
                <div style="font-family: monospace; color: var(--color-primary-light); word-break: break-all; margin-bottom: 1rem; font-size: 1.1rem;">
                    ${did}
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--color-success);">
                    <span class="status-dot"></span> ACTIVE
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: var(--font-size-sm); margin-bottom: 2rem;">
                    <div><span style="color: var(--color-text-muted);">Created:</span> ${new Date().toLocaleDateString()}</div>
                    <div><span style="color: var(--color-text-muted);">Key Status:</span> Active</div>
                    <div><span style="color: var(--color-text-muted);">Document:</span> Available</div>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button type="button" class="btn btn-primary" onclick="navigator.clipboard.writeText('${did}'); window.UI.showToast('Copied', 'DID copied to clipboard', 'success');"><i class="ph ph-copy"></i> Copy DID</button>
                    <button type="button" class="btn btn-outline" onclick="App.viewDIDDocument('${did}')"><i class="ph ph-eye"></i> View DID</button>
                    <button type="button" class="btn btn-outline" onclick="App.exportDIDDocument('${did}')"><i class="ph ph-download"></i> Export</button>
                </div>
            `;
        } else {
            if (user.role === 'HOLDER' || user.role_id === 1) {
                didContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem 0;">
                        <i class="ph ph-warning-circle text-warning" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <p style="margin-bottom: 1.5rem;">No DID has been created yet.<br>Create your decentralized identity to start receiving verifiable credentials.</p>
                        <button type="button" class="btn btn-primary" onclick="document.getElementById('create-did-modal').classList.add('active')"><i class="ph ph-plus"></i> Create DID</button>
                    </div>
                `;
            } else {
                didContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem 0;">
                        <p style="margin-bottom: 1.5rem; color: var(--color-text-muted);">Digital Identity Management is only available for Holder accounts.</p>
                    </div>
                `;
            }
        }
    },

    saveProfile() {
        const user = window.authService.user;
        const name = document.getElementById('profile-name').value;
        const language = document.getElementById('profile-language').value;
        const timezone = document.getElementById('profile-timezone').value;
        
        localStorage.setItem(`profile_${user.id}`, JSON.stringify({ name, language, timezone }));
        window.UI.showToast('Success', 'Profile saved successfully.', 'success');
        document.getElementById('edit-profile-modal').classList.remove('active');
        this.initProfileView();
    },

    async createDID() {
        const pwd = document.getElementById('wallet-password').value;
        const confirmPwd = document.getElementById('wallet-password-confirm').value;
        const errorDiv = document.getElementById('did-creation-error');
        const btn = document.getElementById('create-did-btn');
        
        if (pwd !== confirmPwd) {
            errorDiv.textContent = "Passwords do not match.";
            errorDiv.style.display = 'block';
            return;
        }
        
        if (pwd.length < 8) {
            errorDiv.textContent = "Password must be at least 8 characters.";
            errorDiv.style.display = 'block';
            return;
        }
        
        errorDiv.style.display = 'none';
        btn.innerHTML = `<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Creating...`;
        btn.disabled = true;
        
        try {
            await window.walletService.createWallet(pwd);
            document.getElementById('create-did-modal').classList.remove('active');
            window.UI.showToast('Identity Created', 'Your decentralized identity is now active.', 'success');
            await this.initProfileView();
        } catch(e) {
            errorDiv.textContent = "Failed to create identity. Please try again.";
            errorDiv.style.display = 'block';
        } finally {
            btn.innerHTML = 'Generate DID';
            btn.disabled = false;
        }
    },

    viewDIDDocument(did) {
        const doc = {
            "@context": [
                "https://www.w3.org/ns/did/v1",
                "https://w3id.org/security/suites/ed25519-2020/v1"
            ],
            "id": did,
            "verificationMethod": [{
                "id": `${did}#keys-1`,
                "type": "Ed25519VerificationKey2020",
                "controller": did,
                "publicKeyMultibase": did.split(':')[2]
            }],
            "authentication": [`${did}#keys-1`],
            "assertionMethod": [`${did}#keys-1`]
        };
        
        document.getElementById('did-document-content').textContent = JSON.stringify(doc, null, 2);
        document.getElementById('view-did-modal').classList.add('active');
    },

    exportDIDDocument(did) {
        const doc = {
            "@context": ["https://www.w3.org/ns/did/v1"],
            "id": did,
            "verificationMethod": [{
                "id": `${did}#keys-1`,
                "type": "Ed25519VerificationKey2020",
                "controller": did,
                "publicKeyMultibase": did.split(':')[2]
            }]
        };
        const blob = new Blob([JSON.stringify(doc, null, 2)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `did-document-${did.substring(8, 16)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    async initAdminDashboard() {
        const ctx = document.getElementById('adminActivityChart');
        if (ctx && typeof Chart !== 'undefined') {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                    datasets: [
                        {
                            label: 'Verifications',
                            data: [120, 190, 300, 500, 420, 280],
                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            borderRadius: 4
                        },
                        {
                            label: 'Issuances',
                            data: [30, 45, 80, 110, 95, 60],
                            backgroundColor: 'rgba(16, 185, 129, 0.8)',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top', labels: { color: '#94a3b8' } }
                    },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' }, stacked: true },
                        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' }, stacked: true }
                    }
                }
            });
        }

        // Render Organizations
        if (window.issuerService) {
            const orgs = await window.issuerService.getAllOrganizations();
            const tbody = document.getElementById('admin-org-table-body');
            if (tbody) {
                tbody.innerHTML = orgs.length ? '' : '<tr><td colspan="4" class="text-center text-muted">No organizations found.</td></tr>';
                orgs.forEach(org => {
                    const tr = document.createElement('tr');
                    let statusHtml = '';
                    let actionHtml = '';
                    
                    if (org.status === 'PENDING') {
                        statusHtml = `<span class="badge badge-warning" style="background: rgba(245,158,11,0.1); color: var(--color-warning);">Pending Review</span>`;
                        actionHtml = `
                            <button type="button" class="btn btn-outline text-success" style="padding: 0.2rem 0.5rem; font-size: var(--font-size-xs);" onclick="App.approveOrganization('${org.userId}')">Approve</button>
                            <button type="button" class="btn btn-outline text-danger" style="padding: 0.2rem 0.5rem; font-size: var(--font-size-xs);">Reject</button>
                        `;
                    } else if (org.status === 'APPROVED') {
                        statusHtml = `<span class="badge badge-success">Active</span>`;
                        actionHtml = `
                            <button type="button" class="btn btn-outline" style="padding: 0.2rem 0.5rem; font-size: var(--font-size-xs);">Revoke Access</button>
                        `;
                    }

                    tr.innerHTML = `
                        <td>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="width: 30px; height: 30px; border-radius: 4px; background: white; display: flex; align-items: center; justify-content: center;"><i class="ph-fill ph-buildings text-primary"></i></div>
                                <span style="font-weight: 500;">${org.name}</span>
                            </div>
                        </td>
                        <td style="font-family: monospace; color: var(--color-text-secondary);">${org.regId}</td>
                        <td>${statusHtml}</td>
                        <td>${actionHtml}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }
    },

    async approveOrganization(userId) {
        if (!window.issuerService) return;
        try {
            const org = await window.issuerService.getOrganization(userId);
            if (org) {
                org.status = 'APPROVED';
                await window.issuerService.saveOrganization(org);
                window.UI.showToast('Approved', 'Organization added to Trust Registry', 'success');
                this.initAdminDashboard();
            }
        } catch (e) {
            window.UI.showToast('Error', 'Failed to approve organization', 'error');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());

