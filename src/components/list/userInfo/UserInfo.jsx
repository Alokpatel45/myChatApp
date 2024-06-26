import React from 'react';
import './userInfo.css';
import { useUserStore } from '../../../lib/userStore';

const UserInfo = () => {
  const { currentUser } = useUserStore();

  if (!currentUser) {
    return <div>Loading...</div>; // Or any appropriate fallback UI
  }

  return (
    <div className='userInfo'>
      <div className="user">
        <img src={currentUser.avatar || './avatar.png'} alt="User Avatar" />
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icon">
        <img src="./more.png" alt="More Options" />
        <img src="./video.png" alt="Video Call" />
        <img src="./edit.png" alt="Edit Profile" />
      </div>
    </div>
  );
};

export default UserInfo;
