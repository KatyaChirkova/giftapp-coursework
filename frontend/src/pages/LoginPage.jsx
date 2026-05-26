function LoginPage({ setUser, setPage }) {
  const login = async (email, password) => {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      alert('Ошибка входа');
      return;
    }

    const user = await response.json();

    localStorage.setItem('currentUser', JSON.stringify(user));

    setUser(user);
    setPage('gifts');
  };

  return (
    <div className="login-page">
      <div className="card">
        <h1>GiftApp</h1>
        <p>Веб-приложение для подбора подарков</p>

        <button onClick={() => login('admin@gift.local', '1234')}>
          Войти как администратор
        </button>

        <button onClick={() => login('user@gift.local', '1234')}>
          Войти как пользователь
        </button>
      </div>
    </div>
  );
}

export default LoginPage;