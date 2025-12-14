export default function SimplePage() {
  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center',
      backgroundColor: '#f0f9ff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#0ea5e9', fontSize: '48px', marginBottom: '20px' }}>
        ✅ WAutoFlow
      </h1>
      <p style={{ color: '#666', fontSize: '20px' }}>
        If you see this, Next.js is working!
      </p>
      <a 
        href="/login" 
        style={{ 
          marginTop: '30px',
          padding: '12px 24px',
          backgroundColor: '#0ea5e9',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          display: 'inline-block'
        }}
      >
        Go to Login
      </a>
    </div>
  )
}

