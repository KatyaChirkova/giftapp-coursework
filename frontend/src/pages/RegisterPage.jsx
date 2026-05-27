import { useState } from 'react';

function RegisterPage({ setUser, setPage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(18);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const register = async (event) => {
    event.preventDefault();

    const createResponse = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        age: Number(age),
        password,
        role,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json().catch(() => null);
      const message = Array.isArray(error?.message)
        ? error.message.join('\n')
        : error?.message || 'Ошибка регистрации';

      alert(message);
      return;
    }

    const loginResponse = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await loginResponse.json();

    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));

    setUser(data.user);
    setPage('gifts');
  };

  return (
    <div className="login-page">
      <form className="card" onSubmit={register}>
        <h1>Регистрация</h1>

        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="number"
          placeholder="Возраст"
          value={age}
          onChange={(event) => setAge(event.target.value)}
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>

        <button type="submit">Зарегистрироваться</button>

        <button
          type="button"
          className="secondary"
          onClick={() => setPage('login')}
        >
          Назад ко входу
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;