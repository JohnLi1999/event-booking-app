import { useContext, useRef, useState } from 'react';

import AuthContext from '../../context/auth-context';
import './index.css';

const AuthPage = () => {
  const authContext = useContext(AuthContext);

  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  const [isLogin, setLogin] = useState(true);

  const switchModeHandler = () => {
    setLogin((prevIsLogin) => !prevIsLogin);
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    const email = emailInputRef.current.value;
    const password = passwordInputRef.current.value;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    let requestBody = {
      query: `
        query Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userId
            token
            tokenExpiration
          }
        }
      `,
      variables: {
        email,
        password,
      },
    };

    if (!isLogin) {
      requestBody = {
        query: `
          mutation CreateUser($userInput: UserInput!) {
            createUser(userInput: $userInput) {
              _id
              email
            }
          }
        `,
        variables: {
          userInput: {
            email,
            password,
          },
        },
      };
    }

    try {
      const res = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed!');
      }
      const resData = await res.json();

      if (resData?.data?.login?.token) {
        const { token, userId, tokenExpiration } = resData.data.login;
        authContext.login(token, userId, tokenExpiration);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form className='auth-form' onSubmit={submitHandler}>
      <div className='form-control'>
        <label htmlFor='email'>E-Mail</label>
        <input type='email' id='email' ref={emailInputRef} />
      </div>
      <div className='form-control'>
        <label htmlFor='password'>Password</label>
        <input type='password' id='password' ref={passwordInputRef} />
      </div>
      <div className='form-actions'>
        <button type='submit'>{isLogin ? 'Login' : 'Signup'}</button>
        <button type='button' onClick={switchModeHandler}>
          Switch to {isLogin ? 'Signup' : 'Login'}
        </button>
      </div>
    </form>
  );
};

export default AuthPage;
