CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

seperate table for games user has bought
-- games a user has bought
CREATE TABLE user_games (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, user_id tkn from users at users TABLE 
    game_id INT NOT NULL REFERENCES games(id) ON DELETE RESTRICT, game_id tkn from games from games TABLE
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    price_paid NUMERIC(10,2),
    UNIQUE (user_id, game_id)
);

seperate table for games user has favorited
-- games a user has favorited
CREATE TABLE user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, user_id tkn from users at users TABLE
    game_id INT NOT NULL REFERENCES games(id) ON DELETE RESTRICT, game_id tkn from games from games TABLE
    favorited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, game_id)
);