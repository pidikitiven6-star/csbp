
export enum UserRole {
  BENEFICIARY = 'beneficiary',
  LOCAL_OFFICER = 'local_officer',
  DISTRICT_ADMIN = 'district_admin',
  SUPER_ADMIN = 'super_admin'
}

export enum ApplicationStatus {
  SUBMITTED = 'Submitted',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PAID = 'Paid'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profileCompleted: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  gov_id: string;
  phone: string;
  state_id: number;
  district_id: number;
  address: string;
  bank_details: string;
}

export interface State {
  id: number;
  name: string;
}

export interface District {
  id: number;
  state_id: number;
  name: string;
}

export interface Application {
  id: number;
  reference_number: string;
  user_id: string;
  scheme_id: number;
  amount_requested: number;
  status: ApplicationStatus;
  state_id: number;
  district_id: number;
  created_at: string;
  updated_at: string;
}

export interface Scheme {
  id: number;
  name: string;
  description: string;
  max_amount: number;
}

export interface AuditLog {
  id: number;
  user_id?: string;
  action: string;
  details: string;
  created_at: string;
}
