
import { UserRole, ApplicationStatus, State, District, Scheme, Application, AuditLog, UserProfile, User } from '../types';

/**
 * MOCK DATABASE SIMULATOR
 * This simulates a raw SQL environment with intentional flaws.
 */

class MockDatabase {
  users: any[] = [
    { id: 'u1', email: 'citizen@example.com', password: 'password', role: UserRole.BENEFICIARY },
    { id: 'u2', email: 'officer@example.com', password: 'password', role: UserRole.LOCAL_OFFICER },
    { id: 'u3', email: 'admin@example.com', password: 'password', role: UserRole.DISTRICT_ADMIN },
    { id: 'u4', email: 'super@example.com', password: 'password', role: UserRole.SUPER_ADMIN },
  ];
  profiles: UserProfile[] = [];
  states: State[] = [
    { id: 1, name: 'North Province' }, { id: 2, name: 'South Region' },
    { id: 3, name: 'East Territory' }, { id: 4, name: 'West Coast' },
    { id: 5, name: 'Central Hub' }, { id: 6, name: 'Mountain Ridge' },
    { id: 7, name: 'River Delta' }, { id: 8, name: 'Island State' }
  ];
  districts: District[] = [
    { id: 1, state_id: 1, name: 'Capital City' }, { id: 2, state_id: 1, name: 'Old Harbor' },
    { id: 3, state_id: 2, name: 'Green Valley' }, { id: 4, state_id: 2, name: 'Sunny Coast' }
  ];
  // Fix: Correct property names in Scheme objects to match types.ts
  schemes: Scheme[] = [
    { id: 1, name: 'Unemployment Allowance', description: 'Monthly stipend for job seekers', max_amount: 5000 },
    { id: 2, name: 'Rural Housing Grant', description: 'Grant for building rural homes', max_amount: 200000 }
  ];
  applications: Application[] = [];
  auditLogs: AuditLog[] = [];
  sessions: any[] = [];

  constructor() {
    // Initial profile for citizen to avoid onboarding every time in demo
    // Fix: Changed id from 1 to '1' (string) to match UserProfile interface
    this.profiles.push({
      id: '1', user_id: 'u1', full_name: 'John Citizen', gov_id: 'GOV123',
      phone: '555-0199', state_id: 1, district_id: 1, address: '123 Street', bank_details: 'IBAN1234'
    });
  }

  // Raw SQL "Executors"
  query(sql: string, params: any[] = []) {
    // This mocks a very simple SQL parser/executor
    if (sql.includes('INSERT INTO audit_logs')) {
      const log = { id: this.auditLogs.length + 1, user_id: params[0], action: params[1], details: params[2], ip_address: '127.0.0.1', created_at: new Date().toISOString() };
      this.auditLogs.push(log);
      return log;
    }
    return null;
  }
}

export const db = new MockDatabase();
