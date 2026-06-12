async function testMe() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@workflow.com',
        password: 'password123'
      })
    });
    const data = await res.json();
    console.log('Login Response:', data);
    
    if (data.token) {
      const meRes = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      const meData = await meRes.json();
      console.log('Me Response:', meData);
    }
  } catch (e) {
    console.error('Error!', e);
  }
}
testMe();
