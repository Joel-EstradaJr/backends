export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Dummy Backend API</h1>
      <p>Database URL: {process.env.NEXT_PUBLIC_DATABASE_URL}</p>
      <p>Your API is running successfully!</p>
      <div>
        <h2>Available Endpoints:</h2>
        <ul>
          <li><code>GET /api/clean/hr_employees</code> - Employee data</li>
          <li><code>GET /api/clean/hr_payroll</code> - Payroll data</li>
          <li><code>GET /api/clean/op_bus-trip-details</code> - Bus trip details</li>
        </ul>
      </div>
    </div>
  )
}
