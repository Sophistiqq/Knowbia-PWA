
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'http://10.0.23.245.:3000'; // Use your local IP address here

export async function login(student_number: string, password: string) {
  if (!student_number || !password) {
    return { success: false, message: 'Please fill in both fields.' };
  }

  try {
    const response = await fetch(`${API_URL}/teacher/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_number, password }),
      credentials: 'include'
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        console.log('User:', result.user);
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Invalid credentials' };
      }
    } else {
      const result = await response.json();
      return { success: false, message: result.message || 'Invalid credentials' };
    }
  } catch (error) {
    console.error('Error:', error);
    return { success: false, message: 'An error occurred while trying to log in.' };
  }
}

export async function checkAuth() {
  try {
    const response = await fetch(`${API_URL}/teacher/authenticate`, {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      return { isAuthenticated: true };
    } else {
      return { isAuthenticated: false };
    }
  } catch (error) {
    console.error('Error:', error);
    return { isAuthenticated: false };
  }
}
