import { useState } from 'react';
import Header from './components/Header';
import FavoritesPage from './pages/FavoritesPage';
import GiftsPage from './pages/GiftsPage';
import LoginPage from './pages/LoginPage';

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('currentUser')) || null,
  );

  const [page, setPage] = useState(user ? 'gifts' : 'login');

  if (!user) {
    return <LoginPage setUser={setUser} setPage={setPage} />;
  }

  return (
    <div className="container">
      <Header
        user={user}
        setUser={setUser}
        page={page}
        setPage={setPage}
      />

      {page === 'gifts' && <GiftsPage user={user} />}
      {page === 'favorites' && <FavoritesPage />}
    </div>
  );
}

export default App;