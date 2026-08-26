-- CredTrust Initial Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);
INSERT INTO roles (name, description) VALUES 
('HOLDER', 'Credential Holder'), 
('ISSUER', 'Credential Issuer'), 
('VERIFIER', 'Credential Verifier'), 
('ADMIN', 'Platform Administrator');

-- 2. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Profiles
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. DIDs (Decentralized Identifiers)
CREATE TABLE dids (
    did VARCHAR(255) PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    did_document_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Issuer Organizations
CREATE TABLE issuer_organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    website VARCHAR(255),
    contact_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, SUSPENDED, REJECTED
    did VARCHAR(255) REFERENCES dids(did),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Issuer Staff
CREATE TABLE issuer_staff (
    user_id UUID REFERENCES users(id),
    issuer_id UUID REFERENCES issuer_organizations(id),
    is_admin BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, issuer_id)
);

-- 7. Credential Schemas
CREATE TABLE credential_schemas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issuer_id UUID REFERENCES issuer_organizations(id),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    schema_definition JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Credential Offers
CREATE TABLE credential_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schema_id UUID REFERENCES credential_schemas(id),
    issuer_id UUID REFERENCES issuer_organizations(id),
    holder_did VARCHAR(255) REFERENCES dids(did),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED
    encrypted_payload TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Credentials (Metadata only, full data stored in wallet)
CREATE TABLE credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schema_id UUID REFERENCES credential_schemas(id),
    issuer_id UUID REFERENCES issuer_organizations(id),
    holder_did VARCHAR(255) REFERENCES dids(did),
    credential_hash VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, REVOKED, EXPIRED
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 10. Blockchain Transactions
CREATE TABLE blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_hash VARCHAR(255) UNIQUE NOT NULL,
    contract_address VARCHAR(255),
    action VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, CONFIRMED, FAILED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Revocations
CREATE TABLE revocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credential_id UUID REFERENCES credentials(id),
    issuer_id UUID REFERENCES issuer_organizations(id),
    reason TEXT,
    blockchain_tx_id UUID REFERENCES blockchain_transactions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Presentation Requests
CREATE TABLE presentation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verifier_id UUID REFERENCES users(id),
    requested_schemas JSONB,
    nonce VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, EXPIRED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Presentations
CREATE TABLE presentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES presentation_requests(id),
    holder_did VARCHAR(255) REFERENCES dids(did),
    presentation_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
