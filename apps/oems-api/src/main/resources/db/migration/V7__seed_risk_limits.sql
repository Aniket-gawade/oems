INSERT INTO risk_limit (trader_id, symbol, max_qty, max_notional, price_band_pct)
VALUES
    ('trader1', NULL, 10000.00000000, 2000000.00000000, 10.0000),
    ('trader1', 'AAPL', 5000.00000000, 1000000.00000000, 5.0000),
    ('trader1', 'TSLA', 1000.00000000, 500000.00000000, 7.5000),
    ('trader2', NULL, 2000.00000000, 250000.00000000, 8.0000);
