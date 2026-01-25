export default function Home() {
  const endpoints = {
    'HR & Employee Management': [
      { method: 'GET', path: '/api/clean/hr_employees', description: 'Get all employees', params: 'id (optional) - Employee number' },
      { method: 'GET', path: '/api/clean/hr_payroll', description: 'Get payroll data', params: 'payroll_period_start, payroll_period_end (required), employee_number (optional)' },
      { method: 'GET', path: '/api/departments', description: 'Get all departments', params: null },
    ],
    'Bus Operations': [
      { method: 'GET', path: '/api/clean/op_bus-trip-details', description: 'Get bus trip details with driver/conductor info', params: 'RequestType (optional): revenue | expense' },
      { method: 'PATCH', path: '/api/clean/op_bus-trip-details', description: 'Update trip recorded flags (IsRevenueRecorded, IsExpenseRecorded)', params: null },
    ],
    'Bus Fleet Management': [
      { method: 'GET', path: '/api/clean/buses', description: 'Get all buses or specific bus', params: 'id (optional) - Bus ID' },
      { method: 'POST', path: '/api/clean/buses', description: 'Create a new bus', params: 'Body: { license_plate, body_number, type, capacity }' },
    ],
    'Rental Management': [
      { method: 'GET', path: '/api/clean/rentals', description: 'Get all rentals with bus/employee details', params: 'id (optional), status (optional): pending | confirmed | in_progress | completed | cancelled' },
      { method: 'POST', path: '/api/clean/rentals', description: 'Create a new rental', params: 'Body: { rental_date, return_date, rental_type, bus_id, employee_ids }' },
      { method: 'PATCH', path: '/api/clean/rentals', description: 'Update rental', params: 'Body: { assignment_id, status, bus_id, notes }' },
    ],
    'Inventory (FTMS)': [
      { method: 'GET', path: '/api/clean/ftms_items', description: 'Get unprocessed receipt items grouped by transaction', params: null },
      { method: 'PATCH', path: '/api/clean/ftms_items', description: 'Mark items as inventory processed', params: 'Body: [{ receipt_id, item_id, isInventoryProcessed }]' },
    ],
    'System': [
      { method: 'GET', path: '/api/status', description: 'Database status and table counts', params: null },
      { method: 'GET', path: '/api', description: 'API info', params: null },
    ],
  };

  const methodColors: Record<string, string> = {
    GET: '#61affe',
    POST: '#49cc90',
    PATCH: '#fca130',
    PUT: '#fca130',
    DELETE: '#f93e3e',
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0, color: '#333' }}>🚌 Dummy Backend API</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>Fleet Management, HR, Payroll & Operations API</p>
        <div style={{ marginTop: '1rem' }}>
          <a 
            href="/docs" 
            style={{ 
              display: 'inline-block',
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#49cc90', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '6px',
              fontWeight: 'bold',
              marginRight: '1rem'
            }}
          >
            📖 View API Documentation (Swagger)
          </a>
          <a 
            href="/api/docs" 
            style={{ 
              display: 'inline-block',
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#61affe', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '6px',
              fontWeight: 'bold'
            }}
          >
            📄 OpenAPI Spec (JSON)
          </a>
        </div>
      </header>

      <main>
        <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>Available Endpoints</h2>
        
        {Object.entries(endpoints).map(([category, routes]) => (
          <section key={category} style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: '#444', 
              backgroundColor: '#f5f5f5', 
              padding: '0.75rem 1rem', 
              borderRadius: '6px',
              margin: '0 0 1rem 0'
            }}>
              {category}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {routes.map((endpoint, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    padding: '1rem', 
                    backgroundColor: '#fafafa', 
                    borderRadius: '6px',
                    border: '1px solid #eee'
                  }}
                >
                  <span style={{ 
                    backgroundColor: methodColors[endpoint.method] || '#888',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    minWidth: '60px',
                    textAlign: 'center',
                    marginRight: '1rem'
                  }}>
                    {endpoint.method}
                  </span>
                  <div style={{ flex: 1 }}>
                    <code style={{ 
                      fontSize: '0.95rem', 
                      color: '#333',
                      fontWeight: '500'
                    }}>
                      {endpoint.path}
                    </code>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                      {endpoint.description}
                    </p>
                    {endpoint.params && (
                      <p style={{ margin: '0.25rem 0 0 0', color: '#888', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        {endpoint.params}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #eee', color: '#888', fontSize: '0.85rem' }}>
        <p>Version 1.0.0 • <a href="/docs" style={{ color: '#61affe' }}>API Documentation</a> • <a href="/api/status" style={{ color: '#61affe' }}>System Status</a></p>
      </footer>
    </div>
  );
}

