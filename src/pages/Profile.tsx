import { FC, useEffect, useState } from 'react';
import { getAuth, User } from 'firebase/auth';
import { app } from 'firebase.config';

const Profile: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth(app);

  useEffect(() => {
    console.log(auth);
    setUser(auth.currentUser);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return user ? <h1>{user.displayName}</h1> : <h1>Not logged in</h1>;
};

export default Profile;
