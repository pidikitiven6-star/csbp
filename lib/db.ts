
/**
 * DATABASE DRIVER (SQL SIMULATOR)
 * Designed to act like a real PostgreSQL driver (e.g. 'pg')
 * Persistent across reloads via LocalStorage.
 */

interface DBResult {
  rows: any[];
  rowCount: number;
}

class DatabaseDriver {
  private initialized = false;

  private init() {
    if (this.initialized) return;
    const tables = [
      'auth_users', 'auth_sessions', 'user_profiles', 
      'states', 'districts', 'schemes', 
      'applications', 'payments', 'audit_logs'
    ];
    tables.forEach(t => {
      if (!localStorage.getItem(`db_${t}`)) {
        localStorage.setItem(`db_${t}`, '[]');
      }
    });
    this.initialized = true;
  }

  private getTable(name: string): any[] {
    this.init();
    return JSON.parse(localStorage.getItem(`db_${name}`) || '[]');
  }

  private saveTable(name: string, data: any[]) {
    localStorage.setItem(`db_${name}`, JSON.stringify(data));
  }

  /**
   * MOCKED SQL QUERY ENGINE
   * Translates common SQL patterns into JS operations on LocalStorage.
   * This allows the API layer to use real-looking SQL strings.
   */
  async query(sql: string, params: any[] = []): Promise<DBResult> {
    this.init();
    await new Promise(r => setTimeout(r, 100)); // Sim network latency

    const trimmedSql = sql.trim().toUpperCase();

    // --- SELECT OPERATIONS ---
    if (trimmedSql.startsWith('SELECT')) {
      const tableName = this.extractTable(sql);
      let data = this.getTable(tableName);

      // Simple WHERE filtering logic
      if (sql.includes('WHERE')) {
        const matches = sql.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
        if (matches) {
          const condition = matches[1];
          // Mocking $1, $2 params
          data = data.filter(row => {
            if (condition.includes('email = $1')) return row.email === params[0];
            if (condition.includes('id = $1')) return row.id === params[0];
            if (condition.includes('user_id = $1')) return row.user_id === params[0];
            if (condition.includes('reference_number = $1')) return row.reference_number === params[0];
            if (condition.includes('status = $1')) return row.status === params[0];
            if (condition.includes('district_id = $1')) return row.district_id === params[0];
            return true;
          });
        }
      }

      return { rows: data, rowCount: data.length };
    }

    // --- INSERT OPERATIONS ---
    if (trimmedSql.startsWith('INSERT INTO')) {
      const tableName = this.extractTable(sql);
      const rows = this.getTable(tableName);
      
      let newRow: any = {};
      
      if (tableName === 'auth_users') {
        newRow = { id: crypto.randomUUID(), email: params[0], password_hash: params[1], role: params[2], created_at: new Date().toISOString() };
      } else if (tableName === 'user_profiles') {
        newRow = { id: rows.length + 1, user_id: params[0], ...params[1], created_at: new Date().toISOString() };
      } else if (tableName === 'applications') {
        newRow = { 
          id: rows.length + 1, 
          reference_number: params[0], user_id: params[1], scheme_id: params[2], 
          amount_requested: params[3], status: 'Submitted', district_id: params[4], state_id: params[5],
          created_at: new Date().toISOString() 
        };
      } else if (tableName === 'audit_logs') {
        newRow = { id: rows.length + 1, user_id: params[0], action: params[1], details: params[2], created_at: new Date().toISOString() };
      }

      rows.push(newRow);
      this.saveTable(tableName, rows);
      return { rows: [newRow], rowCount: 1 };
    }

    // --- UPDATE OPERATIONS ---
    if (trimmedSql.startsWith('UPDATE')) {
      const tableName = this.extractTable(sql);
      const rows = this.getTable(tableName);

      if (tableName === 'applications' && sql.includes('status = $1')) {
        const idx = rows.findIndex(r => r.id === params[1]);
        if (idx !== -1) {
          rows[idx].status = params[0];
          rows[idx].updated_at = new Date().toISOString();
          this.saveTable(tableName, rows);
          return { rows: [rows[idx]], rowCount: 1 };
        }
      }

      if (tableName === 'auth_users' && sql.includes('profile_completed = $1')) {
         const idx = rows.findIndex(r => r.id === params[1]);
         if (idx !== -1) {
           rows[idx].profile_completed = params[0];
           this.saveTable(tableName, rows);
         }
      }
    }

    return { rows: [], rowCount: 0 };
  }

  private extractTable(sql: string): string {
    const fromMatch = sql.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    if (fromMatch) return fromMatch[1].toLowerCase();
    const insertMatch = sql.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)/i);
    if (insertMatch) return insertMatch[1].toLowerCase();
    const updateMatch = sql.match(/UPDATE\s+([a-zA-Z0-9_]+)/i);
    if (updateMatch) return updateMatch[1].toLowerCase();
    return '';
  }

  /**
   * Helper for direct access to static data (states, districts, schemes)
   * Fix: Changed from static async to async to allow access via dbDriver instance as requested by frontend components.
   */
  async getStatic(type: 'states' | 'districts' | 'schemes'): Promise<any[]> {
    // In a real app, these are in the DB. Here we return seed values.
    const seeds = {
      states: [
        { id: 1, name: 'North Province' }, { id: 2, name: 'South Region' },
        { id: 3, name: 'East Territory' }, { id: 4, name: 'West Coast' },
        { id: 5, name: 'Central Hub' }, { id: 6, name: 'Mountain Ridge' },
        { id: 7, name: 'River Delta' }, { id: 8, name: 'Island State' }
      ],
      districts: [
        { id: 1, state_id: 1, name: 'Capital City' }, { id: 2, state_id: 1, name: 'Old Harbor' },
        { id: 3, state_id: 2, name: 'Green Valley' }, { id: 4, state_id: 2, name: 'Sunny Coast' }
      ],
      schemes: [
        { id: 1, name: 'Unemployment Allowance', max_amount: 5000 },
        { id: 2, name: 'Rural Housing Grant', max_amount: 200000 },
        { id: 3, name: 'Student Education Fund', max_amount: 50000 }
      ]
    };
    return seeds[type];
  }
}

export const dbDriver = new DatabaseDriver();
