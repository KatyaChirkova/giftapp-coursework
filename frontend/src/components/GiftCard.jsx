function GiftCard({ gift, onAddFavorite, onDelete, isAdmin }) {
  return (
    <div className="gift-card">
      <h3>{gift.title}</h3>
      <p>{gift.description}</p>

      <p>
        <b>Категория:</b> {gift.category_name}
      </p>

      <p>
        <b>Цена:</b> {Number(gift.price).toFixed(2)} ₽
      </p>

      <button onClick={() => onAddFavorite(gift)}>
        Добавить в избранное
      </button>

      {isAdmin && (
        <button className="danger" onClick={() => onDelete(gift.id)}>
          Удалить
        </button>
      )}
    </div>
  );
}

export default GiftCard;