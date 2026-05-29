import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const leaderboardData = [
  { name: 'Alex Rivera', score: 1520, candy: 102, avatar: '/images/homepage/avatar.png' },
  { name: 'Janette', score: 1480, candy: 97, avatar: '/images/homepage/generic-avatar.png' },
  { name: 'Sam Cruz', score: 1400, candy: 86, avatar: '/images/homepage/avatar.png' },
  { name: 'Mika Santos', score: 1350, candy: 82, avatar: '/images/homepage/generic-avatar.png' },
  { name: 'Chris Lee', score: 1300, candy: 74, avatar: '/images/homepage/avatar.png' },
];

const Leaderboard = () => {
  const navigate = useNavigate();
  return (
    <div className="home-root leaderboard-bg">
      <nav className="home-navbar home-navbar-sticky">
        <div className="home-navbar-inner">
          <img src="/images/logo.png" alt="LoopTech Logo" className="home-logo" />
          <ul className="home-nav-list">
            <li className="home-nav-item" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>Learn</li>
            <li className="home-nav-item" onClick={() => navigate('/Challenge')} style={{ cursor: 'pointer' }}>Challenge</li>
            <li className="home-nav-item active">Leaderboard</li>
          </ul>
        </div>
      </nav>
      <div className="leaderboard-content">
  <h1 className="leaderboard-title">Leaderboard</h1>
  <div className="leaderboard-list">
    {leaderboardData.map((user, idx) => (
      <div
        className={`leaderboard-card${idx === 0 ? ' first' : ''}`}
        key={user.name}
      >
        <div className="leaderboard-rank">#{idx + 1}</div>
        <img
          src={user.avatar}
          alt={user.name}
          className="leaderboard-avatar"
        />
        <div className="leaderboard-name">{user.name}</div>
        <div className="leaderboard-score">
         {user.score} pts
          <img
            className="leaderbosard-candy"
            src="/images/candy-icon.png"
            alt="Candy Icon"
          />
          {user.candy}
        </div> 
      </div>
    ))}
  </div>
</div>

    </div>
  );
};

export default Leaderboard; 