import { useState } from 'react';

function LoginPage({ setUser, setPage }) {
  const [email, setEmail] = useState('admin@gift.local');
  const [password, setPassword] = useState('1234');

  const login = async (event) => {
    event.preventDefault();

    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      alert('Неверный email или пароль');
      return;
    }

    const data = await response.json();

    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));

    setUser(data.user);
    setPage('gifts');
  };

  return (
    <div className="login-page">
      <form className="card" onSubmit={login}>
        <h1>GiftApp</h1>
        <p>Вход в приложение</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit">Войти</button>

        <button
          type="button"
          className="secondary"
          onClick={() => setPage('register')}
        >
          Зарегистрироваться
        </button>

        <p className="hint">
          Тестовые данные: admin@gift.local / 1234
        </p>
      </form>
    </div>
  );
}

export default LoginPage;