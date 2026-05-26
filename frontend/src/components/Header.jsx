function Header({ user, setUser, page, setPage }) {
  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setPage('login');
  };

  return (
    <header className="header">
      <h2>GiftApp</h2>

      <nav>
        <button onClick={() => setPage('gifts')}>Подарки</button>
        <button onClick={() => setPage('favorites')}>Избранное</button>
      </nav>

      <div>
        <span>
          {user.name} ({user.role})
        </span>
        <button onClick={logout}>Выйти</button>
      </div>
    </header>
  );
}

export default Header;