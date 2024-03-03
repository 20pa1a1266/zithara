const express = require('express');
const { Pool } = require('pg');
const cors=require('cors')

const app = express();
const port = 5000;
app.use(cors())
// PostgreSQL configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'bannujaanu78',
  port: 4000,
});

app.get('/search', async (req, res) => {
  try {
    const { term ,sortBy} = req.query;
    let query = 'SELECT * FROM customers WHERE 1=1';
    let params = [];

    if (term) {
      query += ' AND customer_name ILIKE $1';
      params.push(`%${term}%`);
      if (sortBy === 'created_at') {
        query += ' ORDER BY created_at';
      } else {
        query += ' ORDER BY sno';
      }
    }

    let result;
    result = await pool.query(query, params);
    if (result.rows.length > 0) {
      result = await pool.query(query, params);
    } else {
      // If no matching customer names, search by location
      query = 'SELECT * FROM customers WHERE 1=1 AND location ILIKE $1';
      params = [];
      params.push(`%${term}%`);
      if (sortBy === 'created_at') {
        query += ' ORDER BY created_at';
      } else {
        query += ' ORDER BY sno';
      }
      result = await pool.query(query, params);
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/table-length', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM customers');
    const length = result.rows[0].count;
    res.json({ length });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Get customers with pagination
app.get('/customers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const sortBy = req.query.sortBy || 'sno'; // Default sorting by Sno
    const offset = (page - 1) * 10; // Assuming 10 records per page

    let query = 'SELECT * FROM customers';

    // Adding sorting
    if (sortBy === 'created_at') {
      query += ' ORDER BY created_at';
    } else {
      query += ' ORDER BY sno';
    }

    query += ' OFFSET $1 LIMIT 10';

    const result = await pool.query(query, [offset]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
