import React, { useContext, useState } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login } = useContext(AuthContext);

  const onSubmitHandler = (event) => {
    event.preventDefault();

    if (currState === 'Sign up' && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    login(currState === "Sign up" ? "signup" : "login", {
      fullName,
      email,
      password,
      bio
    });
  };

  const switchToLogin = () => {
    setCurrState("Login");
    setIsDataSubmitted(false);
    setFullname("");
    setBio("");
    setEmail("");
    setPassword("");
  };

  const switchToSignup = () => {
    setCurrState("Sign up");
    setIsDataSubmitted(false);
    setFullname("");
    setBio("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* Left: Logo */}
      <img 
        src={assets.logo_big} 
        alt="Logo" 
        className='w-[min(30vw, 250px)]' 
      />

      {/* Right: Form */}
      <form 
        onSubmit={onSubmitHandler} 
        className='border-2 bg-white text-gray-800 border-gray-300 p-6 flex flex-col gap-6 rounded-lg shadow-lg w-full max-w-md'
      >
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
          {isDataSubmitted && (
            <img 
              onClick={() => setIsDataSubmitted(false)} 
              src={assets.arrow_icon} 
              alt="Go back" 
              className='w-5 cursor-pointer' 
            />
          )}
        </h2>

        {/* Full Name (only in signup, step 1) */}
        {currState === "Sign up" && !isDataSubmitted && (
          <input 
            onChange={(e) => setFullname(e.target.value)} 
            value={fullName}
            type="text" 
            className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' 
            placeholder="Full Name" 
            required 
          />
        )}

        {/* Email & Password (common in both steps and login) */}
        {!isDataSubmitted && (
          <>
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              value={email}
              type="email" 
              placeholder='Email Address' 
              required 
              className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />

            <input 
              onChange={(e) => setPassword(e.target.value)} 
              value={password}
              type="password" 
              placeholder='Password' 
              required 
              className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </>
        )}

        {/* Bio (signup step 2) */}
        {currState === "Sign up" && isDataSubmitted && (
          <textarea 
            onChange={(e) => setBio(e.target.value)} 
            value={bio}
            rows={4} 
            className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' 
            placeholder='Tell us about yourself' 
            required
          />
        )}

        <button 
          type="submit"
          className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer font-medium'
        >
          {currState === "Sign up" ? "Create Account" : "Login Now"}
        </button>

        <div className='flex items-start gap-2 text-sm text-gray-600'>
          <input type="checkbox" required />
          <p>I agree to the terms of use & privacy policy</p>
        </div>

        <div className='flex flex-col gap-2 pt-2'>
          {currState === "Sign up" ? (
            <p className='text-sm text-gray-600'>
              Already have an account?{' '}
              <span 
                onClick={switchToLogin} 
                className='font-medium text-violet-600 cursor-pointer hover:underline'
              >
                Login here
              </span>
            </p>
          ) : (
            <p className='text-sm text-gray-600'>
              Don’t have an account?{' '}
              <span 
                onClick={switchToSignup} 
                className='font-medium text-violet-600 cursor-pointer hover:underline'
              >
                Sign up
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;