import { auth } from './firebase';

export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const currentUser = auth.currentUser;
  
  if (currentUser) {
    const token = await currentUser.getIdToken();
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  return fetch(url, options);
}

// Custom fetch for React Query that includes auth headers
export async function queryFn({ queryKey }: { queryKey: string[] }) {
  const [url] = queryKey;
  const response = await makeAuthenticatedRequest(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}
