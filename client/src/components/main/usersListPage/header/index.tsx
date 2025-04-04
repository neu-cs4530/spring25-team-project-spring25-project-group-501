import React from 'react';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUsers } from '@fortawesome/free-solid-svg-icons';
import useUserSearch from '../../../../hooks/useUserSearch';

/**
 * Interface representing the props for the UserHeader component.
 *
 * userCount - The number of users to be displayed in the header.
 * setUserFilter - A function that sets the search bar filter value.
 */
interface UserHeaderProps {
  userCount: number;
  setUserFilter: (search: string) => void;
}

/**
 * UsersListHeader component displays the header section for a list of users.
 * It includes the title and search bar to filter the user.
 * Username search is case-sensitive.
 *
 * @param userCount - The number of users displayed in the header.
 * @param setUserFilter - Function that sets the search bar filter value.
 */
const UsersListHeader = ({ userCount, setUserFilter }: UserHeaderProps) => {
  const { val, handleInputChange } = useUserSearch(setUserFilter);

  return (
    <div className='users-list-header'>
      <div className='users-list-title-row'>
        <h2 className='users-list-title'>Users List</h2>
        <div className='search-wrapper'>
          <FontAwesomeIcon icon={faSearch} className='search-icon' />
          <input
            id='user_search_bar'
            className='user-search-input'
            placeholder='Search Usernames...'
            type='text'
            value={val}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className='users-count-row'>
        <div id='user_count' className='users-count'>
          <FontAwesomeIcon icon={faUsers} className='users-icon' />
          <span>
            {userCount} {userCount === 1 ? 'user' : 'users'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UsersListHeader;
