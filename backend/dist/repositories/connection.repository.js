import { getPool } from "../db/pool.js";
export async function getCalendarConnectionRow(userId) {
    const result = await getPool().query(`
        SELECT user_id, provider, status
        FROM connections
        WHERE user_id = $1 AND provider = 'calendar'
        
        `, [userId]);
    return result.rows[0] ?? null;
}
export async function upsertCalendarConnection(input) {
    const result = await getPool().query(`
        INSERT INTO connections (user_id, provider, status)
        VALUES ($1, 'calendar', $2)
        on CONFLICT (user_id, provider)
        DO UPDATE SET status = EXCLUDED.status
        RETURNING user_id, provider, status
        
        `, [input.userId, input.status]);
    return result.rows[0];
}
