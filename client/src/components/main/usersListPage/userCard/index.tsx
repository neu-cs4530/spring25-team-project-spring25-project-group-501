import React from 'react';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { SafeDatabaseUser } from '../../../../types/types';

/**
 * Interface representing the props for the User component.
 *
 * user - The user object containing details about the user.
 * handleUserCardViewClickHandler - The function to handle the click event on the user card.
 */
interface UserProps {
  user: SafeDatabaseUser;
  handleUserCardViewClickHandler: (user: SafeDatabaseUser) => void;
}

/**
 * User component renders the details of a user including its username and dateJoined.
 * Clicking on the component triggers the handleUserPage function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param user - The user object containing user details.
 */
const UserCardView = (props: UserProps) => {
  const { user, handleUserCardViewClickHandler } = props;

  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='user-card-item' onClick={() => handleUserCardViewClickHandler(user)}>
      <div className='user-card-content'>
        <div className='user-username'>{user.username}</div>
        <div className='user-joined'>
          <FontAwesomeIcon icon={faCalendarAlt} className='date-icon' />
          <span>Joined {formatDate(String(user.dateJoined))}</span>
        </div>
      </div>
    </div>
  );
};

export default UserCardView;
