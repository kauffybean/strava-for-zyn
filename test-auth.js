const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const tough = require('tough-cookie');
const { CookieJar } = tough;

// Create a cookie jar to store cookies between requests
const jar = new CookieJar();

// Helper function to get all cookies from jar for a URL
async function getCookiesForUrl(url) {
  return new Promise((resolve, reject) => {
    jar.getCookies(url, (err, cookies) => {
      if (err) reject(err);
      else resolve(cookies);
    });
  });
}

// Helper function to add cookies to the request
async function fetchWithCookies(url, options = {}) {
  // Get cookies for this URL
  const cookies = await getCookiesForUrl(url);
  const cookieHeader = cookies.map(c => `${c.key}=${c.value}`).join('; ');
  
  // Add cookie header to the request if we have cookies
  const headers = {
    ...options.headers,
    ...(cookieHeader ? { 'Cookie': cookieHeader } : {})
  };
  
  // Make the request
  const response = await fetch(url, { ...options, headers });
  
  // Save cookies from the response
  const responseCookies = response.headers.raw()['set-cookie'];
  if (responseCookies) {
    for (const cookie of responseCookies) {
      await new Promise((resolve, reject) => {
        jar.setCookie(cookie, url, { ignoreError: true }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    // Write cookies to file for debugging
    const cookiesAfter = await getCookiesForUrl(url);
    fs.writeFileSync('cookies.txt', JSON.stringify(cookiesAfter, null, 2));
  }
  
  return response;
}

async function main() {
  console.log('Testing authentication flow with proper cookie handling...');
  
  const BASE_URL = 'http://localhost:5000';
  
  try {
    // First try logging in with existing user
    console.log('Attempting to login...');
    const loginResponse = await fetchWithCookies(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser123',
        password: 'password123'
      })
    });
    
    if (loginResponse.ok) {
      console.log('Login successful!');
      const userData = await loginResponse.json();
      console.log('User data:', JSON.stringify(userData, null, 2));
      
      // Show the session cookie we received
      const cookies = await getCookiesForUrl(BASE_URL);
      console.log('\nSession cookie received:');
      console.log(cookies.map(c => `${c.key}=${c.value} (${c.expires})`).join('\n'));
      
      // Now try to get user data to verify session
      console.log('\nVerifying session by fetching user data...');
      const userResponse = await fetchWithCookies(`${BASE_URL}/api/user`);
      
      if (userResponse.ok) {
        const user = await userResponse.json();
        console.log('Session verified! User data:');
        console.log(JSON.stringify(user, null, 2));
        
        // Now try to get posts (should work if session is maintained)
        console.log('\nFetching posts using the same session...');
        const postsResponse = await fetchWithCookies(`${BASE_URL}/api/posts`);
        
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
        
      } else {
        console.log('Session verification failed with status:', userResponse.status);
        const errorText = await userResponse.text();
        console.log('Error:', errorText);
      }
      
    } else {
      console.log('Login failed with status:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Error:', errorText);
      
      // If login failed, try registering a new user
      console.log('\nAttempting to register a new test user...');
      const registerResponse = await fetchWithCookies(`${BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `testuser${Date.now().toString().slice(-5)}`,
          password: 'password123',
          displayName: 'New Test User'
        })
      });
      
      if (registerResponse.ok) {
        console.log('User registered successfully!');
        const userData = await registerResponse.json();
        console.log('User data:', JSON.stringify(userData, null, 2));
        
        // Now try to get posts with this new session
        console.log('\nFetching posts with new user session...');
        const postsResponse = await fetchWithCookies(`${BASE_URL}/api/posts`);
        
        if (postsResponse.ok) {
          const posts = await postsResponse.json();
          console.log(`Retrieved ${posts.length} posts`);
        } else {
          console.log('Failed to fetch posts with status:', postsResponse.status);
          const errorText = await postsResponse.text();
          console.log('Error:', errorText);
        }
      } else {
        console.log('Registration failed with status:', registerResponse.status);
        const errorText = await registerResponse.text();
        console.log('Error:', errorText);
      }
    }
    
  } catch (error) {
    console.error('Error during authentication flow:', error);
  }
}

main();