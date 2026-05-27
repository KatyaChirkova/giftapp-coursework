import { useEffect, useState } from 'react';
import Header from './components/Header';
import FavoritesPage from './pages/FavoritesPage';
import GiftsPage from './pages/GiftsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function getSavedUser() {
  try {
    const saved = localStorage.getItem('currentUser');

    if (!saved || saved === 'undefined') {
      return null;
    }

    return JSON.parse(saved);
  } catch {
    localStorage.removeItem('currentUser');
    return null;
  }
}

function App() {
  const savedUser = getSavedUser();

  const [user, setUser] = useState(savedUser);
  const [page, setPage] = useState(savedUser ? 'gifts' : 'login');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      return;
    }

    fetch('http://localhost:3000/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Токен недействителен');
        }

        return response.json();
      })
      .then((currentUser) => {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        setUser(currentUser);
        setPage('gifts');
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setUser(null);
        setPage('login');
      });
  }, []);

  if (page === 'register') {
    return <RegisterPage setUser={setUser} setPage={setPage} />;
  }

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