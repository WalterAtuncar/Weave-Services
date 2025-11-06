console.log('=== DEBUGGING LOCALSTORAGE ===');
try {
  const sessionData = localStorage.getItem('userSession');
  console.log('sessionData exists:', !!sessionData);
  if (sessionData) {
    const session = JSON.parse(sessionData);
    console.log('session:', session);
    console.log('organizacion:', session?.organizacion);
    console.log('organizacionId:', session?.organizacion?.organizacionId);
  }
  const authToken = localStorage.getItem('authToken');
  console.log('authToken exists:', !!authToken);
} catch (error) {
  console.error('Error checking localStorage:', error);
}
