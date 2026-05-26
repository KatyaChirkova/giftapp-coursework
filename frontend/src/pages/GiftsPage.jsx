import { useEffect, useState } from 'react';
import GiftCard from '../components/GiftCard';

function GiftsPage({ user }) {
  const [gifts, setGifts] = useState([]);

  const loadGifts = async () => {
    const response = await fetch('http://localhost:3000/gifts');
    const data = await response.json();
    setGifts(data);
  };

  useEffect(() => {
    loadGifts();
  }, []);

  const addToFavorites = (gift) => {
    const savedFavorites =
      JSON.parse(localStorage.getItem('favorites')) || [];

    const exists = savedFavorites.some((item) => item.id === gift.id);

    if (exists) {
      alert('Этот подарок уже есть в избранном');
      return;
    }

    const updatedFavorites = [...savedFavorites, gift];

    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));

    alert('Подарок добавлен в избранное');
  };

  const deleteGift = async (id) => {
    await fetch(`http://localhost:3000/gifts/${id}`, {
      method: 'DELETE',
    });

    loadGifts();
  };

  return (
    <div>
      <h1>Список подарков</h1>

      <div className="gift-grid">
        {gifts.map((gift) => (
          <GiftCard
            key={gift.id}
            gift={gift}
            onAddFavorite={addToFavorites}
            onDelete={deleteGift}
            isAdmin={user.role === 'admin'}
          />
        ))}
      </div>
    </div>
  );
}

export default GiftsPage;