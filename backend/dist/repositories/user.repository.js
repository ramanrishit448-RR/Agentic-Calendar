import { getPool } from "../db/pool.js";
export async function ensureUser(input) {
    const result = await getPool().query(`
        INSERT INTO users (auth_user_id, email)
        VALUES ($1, $2)
        ON CONFLICT (auth_user_id)
        DO UPDATE SET email = COALESCE(EXCLUDED.email, users.email)
        RETURNING *
        `, [input.authUserId, input.email]);
    return result.rows[0];
}
