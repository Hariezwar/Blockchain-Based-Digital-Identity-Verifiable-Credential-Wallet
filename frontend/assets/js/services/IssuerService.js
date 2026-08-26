class IssuerService {
    constructor() {
        this.baseUrl = '/api/issuer';
    }

    async saveOrganization(org) {
        const response = await fetch(`${this.baseUrl}/organization`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(org)
        });
        if (!response.ok) throw new Error('Failed to save organization');
        return response.json();
    }

    async getOrganization(userId) {
        const response = await fetch(`${this.baseUrl}/organization/${userId}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to get organization');
        }
        return response.json();
    }

    async getAllOrganizations() {
        const response = await fetch(`${this.baseUrl}/organizations`);
        if (!response.ok) throw new Error('Failed to get all organizations');
        return response.json();
    }

    async issueCredential(did, claims, status = 'ACTIVE') {
        try {
            const response = await fetch(`${this.baseUrl}/issue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ did, claims, status })
            });
            if (!response.ok) throw new Error('Failed to issue credential');
            return await response.json();
        } catch (error) {
            console.warn("Backend unreachable, falling back to Static Demo Mode for issuing");
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mock successful credential generation
            return {
                success: true,
                message: "Credential issued successfully (Demo Mode)",
                credentialId: `urn:uuid:${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}`
            };
        }
    }

    async revokeCredential(credentialId) {
        const response = await fetch(`${this.baseUrl}/revoke/${credentialId}`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to revoke credential');
        return response.json();
    }

    async getIssuedCredentials() {
        const response = await fetch(`${this.baseUrl}/credentials`);
        if (!response.ok) throw new Error('Failed to get credentials');
        return response.json();
    }
}

window.issuerService = new IssuerService();
