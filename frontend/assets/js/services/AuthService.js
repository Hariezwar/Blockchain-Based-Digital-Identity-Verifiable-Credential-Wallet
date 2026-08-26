class AuthService {
    constructor() {
        this.token = localStorage.getItem('credtrust_token');
        this.user = JSON.parse(localStorage.getItem('credtrust_user') || 'null');
    }

    async login(email, password) {
        // Since we have a dual-mode application (Full vs Static Demo),
        // we'll simulate the backend call in Static Demo mode if the real backend is unreachable.
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) throw new Error('Login failed');
            
            const data = await response.json();
            this.setSession(data.token, data.user);
            return data;
        } catch (error) {
            console.warn("Backend unreachable, falling back to Static Demo Mode auth");
            
            // Demo Mode fallback
            if (email === "holder@demo.com" && password === "Demo@123") {
                const demoUser = { id: 'demo-holder', email, role_id: 1, role: 'HOLDER' };
                this.setSession('demo-token-xyz', demoUser);
                return { token: 'demo-token-xyz', user: demoUser };
            } else if (email === "issuer@demo.com" && password === "Demo@123") {
                const demoUser = { id: 'demo-issuer', email, role_id: 2, role: 'ISSUER' };
                this.setSession('demo-token-xyz', demoUser);
                return { token: 'demo-token-xyz', user: demoUser };
            } else if (email === "verifier@demo.com" && password === "Demo@123") {
                const demoUser = { id: 'demo-verifier', email, role_id: 3, role: 'VERIFIER' };
                this.setSession('demo-token-xyz', demoUser);
                return { token: 'demo-token-xyz', user: demoUser };
            } else if (email === "admin@demo.com" && password === "Demo@123") {
                const demoUser = { id: 'demo-admin', email, role_id: 4, role: 'ADMIN' };
                this.setSession('demo-token-xyz', demoUser);
                return { token: 'demo-token-xyz', user: demoUser };
            } else {
                throw new Error("Invalid demo credentials");
            }
        }
    }

    setSession(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('credtrust_token', token);
        localStorage.setItem('credtrust_user', JSON.stringify(user));
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('credtrust_token');
        localStorage.removeItem('credtrust_user');
        window.walletService.lockWallet();
        window.location.hash = '#/';
    }

    isAuthenticated() {
        return !!this.token;
    }
}

window.authService = new AuthService();
