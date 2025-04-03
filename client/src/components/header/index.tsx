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
  const { handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  return (
    <div id='header' className='header p-4 outline outline-blue-600'>
      <div className='title'>
        collabor<span className='text-blue-600'>8</span>
      </div>
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
