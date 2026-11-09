import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [cities] = await db.query('SELECT id, name FROM cities ORDER BY name');
    const [streets] = await db.query('SELECT id, city_id, name FROM streets ORDER BY name');
    const [salons] = await db.query(`
      SELECT 
        sa.id,
        sa.name,
        sa.city_id,
        sa.street_id,
        sa.building,
        sa.phone,
        TIME_FORMAT(sa.open_time, '%H:%i') AS open_time,
        TIME_FORMAT(sa.close_time, '%H:%i') AS close_time,
        sa.slot_minutes,
        c.name AS city_name,
        st.name AS street_name
      FROM salons sa
      JOIN cities c ON c.id = sa.city_id
      JOIN streets st ON st.id = sa.street_id
      ORDER BY c.name, sa.name
    `);

    const result = cities.map(city => ({
      ...city,
      streets: streets.filter(s => s.city_id === city.id),
      salons: salons.filter(s => s.city_id === city.id),
    }));

    res.json(result);
  } catch (error) {
    console.error('Locations error:', error);
    res.status(500).json({ message: 'Server error fetching locations' });
  }
});

router.get('/salons/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const [salons] = await db.query(`
      SELECT 
        sa.id,
        sa.name,
        sa.building,
        sa.phone,
        TIME_FORMAT(sa.open_time, '%H:%i') AS open_time,
        TIME_FORMAT(sa.close_time, '%H:%i') AS close_time,
        sa.slot_minutes,
        st.name AS street_name
      FROM salons sa
      JOIN streets st ON st.id = sa.street_id
      WHERE sa.city_id = ?
      ORDER BY sa.name
    `, [cityId]);

    res.json(salons);
  } catch (error) {
    console.error('Salons error:', error);
    res.status(500).json({ message: 'Server error fetching salons' });
  }
});

export default router;
