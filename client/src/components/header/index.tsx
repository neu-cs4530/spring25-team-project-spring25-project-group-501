import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useHeader from '../../hooks/useHeader';
import './index.css';
import useUserContext from '../../hooks/useUserContext';

/**
 * Header component that renders the main title and a search bar.
 * The search bar allows the user to input a query and navigate to the search results page
 * when they press Enter.
 */
const Header = () => {
  const { val, handleInputChange, handleKeyDown, handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  return (
    <div id='header' className='header px-8 w-full bg-gray-200 border-b-2 border-black shadow-md'>
      <div className='title'>
        collabor<span className='text-blue-700'>8</span>
      </div>
      <input
        id='searchBar'
        placeholder='Search ...'
        type='text'
        value={val}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className='rounded-md px-2 py-1 outline'
      />
      <div className='header-right'>
        {currentUser.avatarUrl && !imageError ? (
          <img
            src={currentUser.avatarUrl}
            alt='Profile'
            className='profile-picture'
            onClick={() => navigate(`/user/${currentUser.username}`)}
            onError={() => setImageError(true)}
          />
        ) : (
          <button
            className='view-profile-button'
            onClick={() => navigate(`/user/${currentUser.username}`)}>
            View Profile
          </button>
        )}
        <button onClick={handleSignOut} className='logout-button'>
          Log out
        </button>
      </div>
    </div>
  );
};

export default Header;
