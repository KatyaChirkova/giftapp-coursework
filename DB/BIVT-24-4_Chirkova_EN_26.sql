DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS gifts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP VIEW IF EXISTS view_gifts_with_categories;
DROP VIEW IF EXISTS view_user_favorites;
DROP VIEW IF EXISTS view_admin_gifts;

DROP FUNCTION IF EXISTS get_gift_count_by_category(INTEGER);
DROP FUNCTION IF EXISTS get_user_favorites_count(INTEGER);
DROP FUNCTION IF EXISTS get_average_gift_price();

DROP PROCEDURE IF EXISTS add_gift(VARCHAR, TEXT, NUMERIC, INTEGER, INTEGER);
DROP PROCEDURE IF EXISTS add_category(VARCHAR, TEXT);
DROP PROCEDURE IF EXISTS add_favorite(INTEGER, INTEGER);

DROP FUNCTION IF EXISTS check_gift_price();
DROP FUNCTION IF EXISTS set_favorite_date();
DROP FUNCTION IF EXISTS prevent_duplicate_favorites();

-- 1. ТАБЛИЦЫ

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    age INTEGER,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user'
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE gifts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category_id INTEGER NOT NULL,
    created_by INTEGER NOT NULL,

    CONSTRAINT fk_gifts_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_gifts_user
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    gift_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_favorites_gift
        FOREIGN KEY (gift_id)
        REFERENCES gifts(id)
        ON DELETE CASCADE
);

-- 2. ТЕСТОВЫЕ ДАННЫЕ

INSERT INTO users (name, email, age, password, role) VALUES
('Администратор', 'admin@gift.local', 20, '1234', 'admin'),
('Пользователь', 'user@gift.local', 19, '1234', 'user'),
('Екатерина', 'katya@gift.local', 18, '1234', 'user'),
('Мария', 'maria@gift.local', 21, '1234', 'user');

INSERT INTO categories (name, description) VALUES
('Техника', 'Электронные устройства и аксессуары'),
('Книги', 'Печатные и электронные книги'),
('Красота', 'Косметика и уходовые средства'),
('Универсальное', 'Подарки, подходящие для разных случаев');

INSERT INTO gifts (title, description, price, category_id, created_by) VALUES
('Беспроводные наушники', 'Подарок для музыки, учебы и прогулок', 3500.00, 1, 6),
('Электронная книга', 'Устройство для чтения книг', 8500.00, 1, 6),
('Художественная книга', 'Книга для приятного отдыха', 1200.00, 2, 6),
('Набор косметики', 'Подарочный набор средств ухода', 2500.00, 3, 6),
('Подарочный сертификат', 'Универсальный подарок на любой праздник', 3000.00, 4, 6),
('Настольная лампа', 'Полезный подарок для учебы и работы', 1800.00, 1, 6);

INSERT INTO favorites (user_id, gift_id) VALUES
(2, 1),
(2, 3),
(3, 5),
(4, 2);

-- 3. ПРЕДСТАВЛЕНИЯ

CREATE VIEW view_gifts_with_categories AS
SELECT
    gifts.id,
    gifts.title,
    gifts.description,
    gifts.price,
    categories.name AS category_name
FROM gifts
JOIN categories ON gifts.category_id = categories.id;

CREATE VIEW view_user_favorites AS
SELECT
    users.id AS user_id,
    users.name AS user_name,
    gifts.id AS gift_id,
    gifts.title AS gift_title,
    gifts.price,
    favorites.created_at
FROM favorites
JOIN users ON favorites.user_id = users.id
JOIN gifts ON favorites.gift_id = gifts.id;

CREATE VIEW view_admin_gifts AS
SELECT
    gifts.id,
    gifts.title,
    gifts.price,
    users.name AS created_by_user
FROM gifts
JOIN users ON gifts.created_by = users.id
WHERE users.role = 'admin';

-- 4. ФУНКЦИИ

CREATE FUNCTION get_gift_count_by_category(category_id_param INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    gift_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO gift_count
    FROM gifts
    WHERE category_id = category_id_param;

    RETURN gift_count;
END;
$$;

CREATE FUNCTION get_user_favorites_count(user_id_param INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    favorites_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO favorites_count
    FROM favorites
    WHERE user_id = user_id_param;

    RETURN favorites_count;
END;
$$;

CREATE FUNCTION get_average_gift_price()
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    average_price NUMERIC;
BEGIN
    SELECT AVG(price)
    INTO average_price
    FROM gifts;

    RETURN average_price;
END;
$$;

-- 5. ХРАНИМЫЕ ПРОЦЕДУРЫ

CREATE PROCEDURE add_category(
    category_name VARCHAR,
    category_description TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO categories (name, description)
    VALUES (category_name, category_description);
END;
$$;

CREATE PROCEDURE add_gift(
    gift_title VARCHAR,
    gift_description TEXT,
    gift_price NUMERIC,
    gift_category_id INTEGER,
    gift_created_by INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO gifts (title, description, price, category_id, created_by)
    VALUES (
        gift_title,
        gift_description,
        gift_price,
        gift_category_id,
        gift_created_by
    );
END;
$$;

CREATE PROCEDURE add_favorite(
    favorite_user_id INTEGER,
    favorite_gift_id INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO favorites (user_id, gift_id)
    VALUES (favorite_user_id, favorite_gift_id);
END;
$$;

-- 6. ТРИГГЕРЫ

CREATE FUNCTION check_gift_price()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.price <= 0 THEN
        RAISE EXCEPTION 'Цена подарка должна быть больше 0';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_check_gift_price
BEFORE INSERT OR UPDATE ON gifts
FOR EACH ROW
EXECUTE FUNCTION check_gift_price();


CREATE FUNCTION set_favorite_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.created_at IS NULL THEN
        NEW.created_at = CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_favorite_date
BEFORE INSERT ON favorites
FOR EACH ROW
EXECUTE FUNCTION set_favorite_date();


CREATE FUNCTION prevent_duplicate_favorites()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM favorites
        WHERE user_id = NEW.user_id
          AND gift_id = NEW.gift_id
    ) THEN
        RAISE EXCEPTION 'Этот подарок уже добавлен в избранное';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_prevent_duplicate_favorites
BEFORE INSERT ON favorites
FOR EACH ROW
EXECUTE FUNCTION prevent_duplicate_favorites();

-- 7. ПРОВЕРОЧНЫЕ ЗАПРОСЫ

SELECT * FROM users;
SELECT * FROM categories;
SELECT * FROM gifts;
SELECT * FROM favorites;

SELECT * FROM view_gifts_with_categories;
SELECT * FROM view_user_favorites;
SELECT * FROM view_admin_gifts;

SELECT get_gift_count_by_category(1);
SELECT get_user_favorites_count(2);
SELECT get_average_gift_price();