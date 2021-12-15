import { ChangeEvent, FC, FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from 'firebase.config';
import { ReactComponent as ArrowRidgtIcon } from 'assets/svg/keyboardArrowRightIcon.svg';

const ForgotPassword: FC = () => {
  const [email, setEmail] = useState('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const auth = getAuth(app);

      await sendPasswordResetEmail(auth, email);

      toast.success('Email was sent');
    } catch (error) {
      toast.error('Could not send reset email');
    }
  };

  return (
    <div className="pageContainer">
      <header className="pageHeader">
        <p>ForgotPassword</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <input
            type="email"
            className="emailInput"
            placeholder="Email"
            id="email"
            value={email}
            onChange={onChange}
          />
          <Link to="/sign-in" className="forgotPasswordLink">
            Sign In
          </Link>
          <div className="signInBar">
            <div className="signInText">Send Reset Link</div>
            <button type="submit" className="signInButton">
              <ArrowRidgtIcon fill="#fff" width="34px" height="34px" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ForgotPassword;
