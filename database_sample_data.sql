-- Sample data for testing trading functionality
-- Run these queries in your Supabase SQL Editor

-- First, let's add some sample users (using test wallet addresses)
INSERT INTO users (wallet_address, username) VALUES
  ('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'Alice'),
  ('0x123d35Cc6634C0532925a3b844Bc454e4438f44e', 'Bob'),
  ('0x987d35Cc6634C0532925a3b844Bc454e4438f44e', 'Charlie')
ON CONFLICT (wallet_address) DO NOTHING;

-- Add sample cards to the cards table (this mirrors on-chain data)
INSERT INTO cards (token_id, owner_address, player_name, position, team, rarity) VALUES
  (1, '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'Patrick Mahomes', 'QB', 'Chiefs', 4),
  (2, '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'Josh Allen', 'QB', 'Bills', 3),
  (3, '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'Lamar Jackson', 'QB', 'Ravens', 4),
  (4, '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'Christian McCaffrey', 'RB', 'Panthers', 3),
  (5, '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'Travis Kelce', 'TE', 'Chiefs', 2),

  (10, '0x123d35Cc6634C0532925a3b844Bc454e4438f44e', 'Aaron Rodgers', 'QB', 'Packers', 3),
  (11, '0x123d35Cc6634C0532925a3b844Bc454e4438f44e', 'Stefon Diggs', 'WR', 'Bills', 2),
  (12, '0x123d35Cc6634C0532925a3b844Bc454e4438f44e', 'Davante Adams', 'WR', 'Packers', 3),
  (13, '0x123d35Cc6634C0532925a3b844Bc454e4438f44e', 'Saquon Barkley', 'RB', 'Giants', 2),

  (20, '0x987d35Cc6634C0532925a3b844Bc454e4438f44e', 'Joe Burrow', 'QB', 'Bengals', 3),
  (21, '0x987d35Cc6634C0532925a3b844Bc454e4438f44e', 'Ja''Marr Chase', 'WR', 'Bengals', 2),
  (22, '0x987d35Cc6634C0532925a3b844Bc454e4438f44e', 'Nick Chubb', 'RB', 'Browns', 2)
ON CONFLICT (token_id) DO NOTHING;

-- Add some cards to the listed_cards table for the marketplace
INSERT INTO listed_cards (token_id, owner_address, player_name, position, rarity, status) VALUES
  (10, '0x123d35Cc6634C0532925a3b844Bc454e4438f44e', 'Aaron Rodgers', 'QB', 3, 'active'),
  (11, '0x123d35Cc6634C0532925a3b844Bc454e4438f44e', 'Stefon Diggs', 'WR', 2, 'active'),
  (20, '0x987d35Cc6634C0532925a3b844Bc454e4438f44e', 'Joe Burrow', 'QB', 3, 'active'),
  (21, '0x987d35Cc6634C0532925a3b844Bc454e4438f44e', 'Ja''Marr Chase', 'WR', 2, 'active')
ON CONFLICT (token_id, owner_address) DO NOTHING;

-- Optional: Create a sample trade to test the "My Trades" functionality
-- Uncomment these lines if you want to test with existing trades

/*
INSERT INTO trades (trade_id, status, initiator_address, counterparty_address) VALUES
  (123456789, 'pending', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', '0x123d35Cc6634C0532925a3b844Bc454e4438f44e');

-- Get the trade ID we just created
-- Then insert trade participants (you'll need to replace TRADE_ID_HERE with the actual ID)

INSERT INTO trade_participants (trade_id, token_id, participant_address, offered) VALUES
  ((SELECT id FROM trades WHERE trade_id = 123456789), 1, '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', true),  -- Alice offering Mahomes
  ((SELECT id FROM trades WHERE trade_id = 123456789), 2, '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', true),  -- Alice offering Allen
  ((SELECT id FROM trades WHERE trade_id = 123456789), 10, '0x123d35Cc6634C0532925a3b844Bc454e4438f44e', false); -- Bob requesting Rodgers
*/

-- Query to verify data was inserted
SELECT
  'Users' as table_name,
  COUNT(*) as count
FROM users
UNION ALL
SELECT
  'Cards' as table_name,
  COUNT(*) as count
FROM cards
UNION ALL
SELECT
  'Listed Cards' as table_name,
  COUNT(*) as count
FROM listed_cards;
