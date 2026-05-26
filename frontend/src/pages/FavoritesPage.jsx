import { useState } from 'react';

function FavoritesPage() {
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem('favorites')) || [],
  );

  const removeFavorite = (id) => {
    const updatedFavorites = favorites.filter((gift) => gift.id !== id);

    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  return (
    <div>
      <h1>Избранные подарки</h1>

      {favorites.length === 0 ? (
        <p>Пока нет избранных подарков.</p>
      ) : (
        <div className="gift-grid">
          {favorites.map((gift) => (
            <div className="gift-card" key={gift.id}>
              <h3>{gift.title}</h3>
              <p>{gift.description}</p>
              <p>{gift.price} ₽</p>

              <button
                className="danger"
                onClick={() => removeFavorite(gift.id)}
              >
                Удалить из избранного
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;