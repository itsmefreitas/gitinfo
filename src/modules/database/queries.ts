const queries: Record<string, string> = {
  getNow: "SELECT NOW() AS \"currentTime\"",
  getUserById: `SELECT
    u.username AS "userName",
    u.name AS "name",
    loc.name AS "location",
    lang.name_array AS "languages",
    u.full_user_data AS "fullUserData"
    FROM "users" u
    LEFT JOIN (SELECT
        ul.user_id AS id,
        array_agg(l.name) AS "name_array",
        array_agg(l.slug) AS "slug_array"
    FROM "user_languages" ul
    INNER JOIN "languages" l ON l.id = ul.language_id
    GROUP BY ul.user_id
    ) lang USING (id)
    LEFT JOIN "locations" loc ON loc.id = u.location_id
    WHERE LOWER(u.username) = LOWER(\${userName})`,
  getUsers: `SELECT
	    u.username AS "userName",
	    u.name AS "name",
	    loc.name AS "location",
	    lang.name_array AS "languages",
	    u.full_user_data AS "fullUserData"
    FROM "users" u
    LEFT JOIN (SELECT
            ul.user_id AS id,
            array_agg(l.name) AS "name_array",
            array_agg(l.slug) AS "slug_array"
        FROM "user_languages" ul
        INNER JOIN "languages" l ON l.id = ul.language_id
        GROUP BY ul.user_id
    ) lang USING (id)
    LEFT JOIN "locations" loc ON loc.id = u.location_id`,
  insertUser: "SELECT insert_user_data(${userData}::JSONB) AS \"id\""
}

export default queries
