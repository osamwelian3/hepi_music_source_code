import {useState, useEffect} from 'react';
import {Hub, Auth} from 'aws-amplify';

export default async function useAuthenticatedStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function ionViewCanEnter() {
    console.log('hey');
    try {
      const authenticatedUser = await Auth.currentAuthenticatedUser();
      if (authenticatedUser !== undefined) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }

  useEffect(() => {
    ionViewCanEnter();
  });

  useEffect(() => {
    const listener = data => {
      switch (data.payload.event) {
        case 'signIn' || 'autoSignIn' || 'tokenRefresh':
          console.log('is authenticated');
          setIsAuthenticated(true);
          break;
        case 'signOut' || 'signIn_failure' || 'tokenRefresh_failure' || 'autoSignIn_failure':
          console.log('is not authenticated');
          setIsAuthenticated(false);
          break;
      }
    };

    Hub.listen('auth', listener);
  });

  return isAuthenticated;
}