const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function main() {
  console.log('Testing authentication flow...');
  
  try {
    // First try to register a test user
    console.log('Attempting to register test user...');
    const registerResponse = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser123',
        password: 'password123',
        displayName: 'Test User 123'
      }),
      credentials: 'include'
    });
    
    if (registerResponse.ok) {
      console.log('User registered successfully!');
      const userData = await registerResponse.json();
      console.log('User data:', JSON.stringify(userData, null, 2));
    } else {
      console.log('Registration failed with status:', registerResponse.status);
      const errorText = await registerResponse.text();
      console.log('Error:', errorText);
      
      // If registration failed, try logging in instead
      console.log('Attempting to login...');
      const loginResponse = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser123',
          password: 'password123'
        }),
        credentials: 'include'
      });
      
      if (loginResponse.ok) {
        console.log('Login successful!');
        const userData = await loginResponse.json();
        console.log('User data:', JSON.stringify(userData, null, 2));
      } else {
        console.log('Login failed with status:', loginResponse.status);
        const errorText = await loginResponse.text();
        console.log('Error:', errorText);
      }
    }
    
    // Now try to get posts
    console.log('\nFetching posts...');
    const postsResponse = await fetch('http://localhost:5000/api/posts', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (postsResponse.ok) {
      const posts = await postsResponse.json();
      console.log(`Retrieved ${posts.length} posts`);
      if (posts.length > 0) {
        console.log('First post:', JSON.stringify(posts[0], null, 2));
      }
    } else {
      console.log('Failed to fetch posts with status:', postsResponse.status);
      const errorText = await postsResponse.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('Error during authentication flow:', error);
  }
}

main();