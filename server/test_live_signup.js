async function test() {
  const testEmail = `test_live_${Math.random().toString(36).substring(2, 8)}@gmail.com`;
  console.log(`Testing live signup with email: ${testEmail}`);
  
  try {
    const res = await fetch('https://sumersend-backend.onrender.com/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
        name: 'Live Test User'
      })
    });
    
    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (res.status === 201) {
      console.log('✅ LIVE SIGNUP TEST PASSED SUCCESSFULLY!');
    } else {
      console.log('❌ LIVE SIGNUP TEST FAILED.');
    }
  } catch (err) {
    console.error('Network Error:', err.message);
  }
}

test();
