
import { UserRole, ApplicationStatus, Application, User, UserProfile, Scheme, AuditLog } from '../types';

/**
 * CSDP REAL API SERVICE
 * Interfaces with the Node.js/Vercel backend endpoints.
 * Includes intentional vulnerabilities for WSTG testing.
 */

const getBaseUrl = () => '';

export const apiService = {
  // --- AUTHENTICATION ---
  
  async login(email: string, password_hash: string): Promise<User | null> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: password_hash })
    });
    
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('csdp_user', JSON.stringify(data.user));
      return data.user;
    }
    return null;
  },

  async signup(payload: any): Promise<User | null> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok ? await res.json() : null;
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('csdp_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  logout() {
    localStorage.removeItem('csdp_user');
    window.location.href = '/login';
  },

  // --- PROFILE MANAGEMENT ---

  async getProfile(userId: string): Promise<UserProfile | null> {
    const res = await fetch(`/api/profile?userId=${userId}`);
    return res.ok ? await res.json() : null;
  },

  async updateProfile(userId: string, data: any) {
    /**
     * VULNERABILITY: MASS ASSIGNMENT (WSTG-BUSL-08)
     * Backend trusts the 'data' object entirely.
     */
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data })
    });
    
    if (res.ok) {
      const updated = await res.json();
      // Update local storage flag
      const user = this.getCurrentUser();
      if (user) {
        user.profileCompleted = true;
        localStorage.setItem('csdp_user', JSON.stringify(user));
      }
      return updated;
    }
    throw new Error('Failed to update profile');
  },

  // --- APPLICATIONS ---

  async submitApplication(userId: string, data: any) {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data })
    });
    return res.ok ? await res.json() : null;
  },

  /**
   * VULNERABILITY: IDOR (WSTG-AUTHZ-04)
   * Fetches by numeric ID without verifying ownership.
   */
  async getApplication(id: number): Promise<Application | null> {
    const res = await fetch(`/api/applications/${id}`);
    return res.ok ? await res.json() : null;
  },

  async getUserApplications(userId: string): Promise<Application[]> {
    const res = await fetch(`/api/applications?userId=${userId}`);
    return res.ok ? await res.json() : [];
  },

  // --- TRACKING ---

  async trackApplication(ref: string): Promise<Application | null> {
    const res = await fetch(`/api/track?ref=${ref}`);
    return res.ok ? await res.json() : null;
  },

  // --- ADMINISTRATION ---

  async getAllApplications(role: UserRole): Promise<Application[]> {
    /**
     * VULNERABILITY: BROKEN ACCESS CONTROL (WSTG-AUTHZ-01)
     * The role is passed as a query param and trusted by the backend.
     */
    const res = await fetch(`/api/admin/applications?role=${role}`);
    return res.ok ? await res.json() : [];
  },

  async updateApplicationStatus(appId: number, status: ApplicationStatus, adminId: string) {
    const res = await fetch(`/api/applications/${appId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminId })
    });
    return res.ok;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit');
    return res.ok ? await res.json() : [];
  }
};
