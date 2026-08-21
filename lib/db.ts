import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '213.159.6.158',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'dvt_tabu',
  password: process.env.DB_PASSWORD || 'Akblt_157',
  database: process.env.DB_NAME || 'dvt_tabu',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  try {
    const [results] = await pool.query(sql, params);
    return results as T;
  } catch (err: any) {
    console.error('MySQL Query Error:', err.message);
    throw err;
  }
}

export default pool;
