-- Use this for UUIDs, generally faster indexing
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- For generating slugs
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Utility Slugify function
CREATE OR REPLACE FUNCTION slugify("value" TEXT)
RETURNS TEXT AS $$
  -- removes accents (diacritic signs) from a given string --
  WITH "unaccented" AS (
    SELECT unaccent("value") AS "value"
  ),
  -- lowercases the string
  "lowercase" AS (
    SELECT lower("value") AS "value"
    FROM "unaccented"
  ),
  -- replaces anything that's not a letter, number, hyphen('-'), or underscore('_') with a hyphen('-')
  "hyphenated" AS (
    SELECT regexp_replace("value", '[^a-z0-9\\-_]+', '-', 'gi') AS "value"
    FROM "lowercase"
  ),
  -- trims hyphens('-') if they exist on the head or tail of the string
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("value", '\\-+$', ''), '^\\-', '') AS "value"
    FROM "hyphenated"
  )
  SELECT "value" FROM "trimmed";
$$ LANGUAGE SQL STRICT IMMUTABLE;

-- Map slugify over an input array, useful e.g. for selecting languages
CREATE OR REPLACE FUNCTION slugify_array("value" TEXT[])
RETURNS TEXT[] AS $$
	SELECT array_agg(slugify(n)) FROM unnest("value") AS "n";  
$$ LANGUAGE SQL STRICT IMMUTABLE;

/*
 A handy dandy function that leverages
 PSQL's regtype interals and will
 get the value for a JSON key
 and cast it to the appropriate datatype
*/
CREATE OR REPLACE FUNCTION cast_from_json(
	IN dto jsonb,
	IN key_name text,
	INOUT target_type anyelement = NULL::text)
RETURNS ANYELEMENT
LANGUAGE plpgsql
AS $function$
BEGIN
	SELECT dto->>key_name
   	INTO target_type;
END
$function$;

/*
 Leveraging cast_from_json's definition,
 this is useful for inserting table records
 from passed-in function DTOs
*/
CREATE OR REPLACE FUNCTION json_fallback(
	IN update_dto JSONB,
	IN key_name TEXT,
	IN fallback ANYELEMENT)
 RETURNS ANYELEMENT
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN
    	CASE WHEN (update_dto ? key_name)
    	-- So that case branches type-match
    	THEN cast_from_json(update_dto, key_name, fallback)
    	ELSE fallback END;
END;
$function$;

/*
 Decided with going with a UUID for the users primary key
 coupled with a unique index on the username
 as the data model could be split across
 different entities.
 Namely: <user, locations, languages>
*/

CREATE TABLE "locations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT "UQ_location_SLUG"
    	UNIQUE ("slug")
);

CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" TEXT NOT NULL,
    "name" TEXT NULL,
    "location_id" UUID NULL,
    "full_user_data" JSONB NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT "UQ_username"
    	UNIQUE ("username"),
    CONSTRAINT "FK_has_location"
        FOREIGN KEY("location_id")
        REFERENCES "locations"("id")
);

CREATE TABLE "languages" (
	"id" UUID NOT NULL DEFAULT uuid_generate_v4(),
	"name" TEXT NOT NULL,
	"slug" TEXT NOT NULL,
	PRIMARY KEY ("id"),
    CONSTRAINT "UQ_language_SLUG"
    	UNIQUE ("slug")
);

CREATE TABLE "user_languages" (
    "user_id" UUID NOT NULL,
    "language_id" UUID NOT NULL,
    PRIMARY KEY ("user_id", "language_id"),
    CONSTRAINT "FK_has_user"
        FOREIGN KEY("user_id")
        REFERENCES "users"("id"),
    CONSTRAINT "FK_has_language"
        FOREIGN KEY("language_id")
        REFERENCES "languages"("id")
);

CREATE OR REPLACE FUNCTION insert_and_get_location_uuid("location" TEXT) RETURNS UUID AS $$
DECLARE
    "v_location_slug" TEXT = slugify("location");
	"v_location_id" UUID = NULL;
BEGIN
    SELECT "id"
    	INTO "v_location_id"
    FROM "locations"
    WHERE "slug" = "v_location_slug";

	IF ("v_location_id" IS NULL AND "v_location_slug" IS NOT NULL) THEN
		INSERT INTO "locations"
			("slug","name")
		VALUES ("v_location_slug", "location")
		RETURNING "id"
			INTO "v_location_id";
	END IF;
		
	RETURN "v_location_id";
END;
$$ LANGUAGE plpgsql;

-- Could probably generalize these two, but won't for the sake of not mixing up concerns.
CREATE OR REPLACE FUNCTION insert_and_get_language_uuid("language" TEXT) RETURNS UUID AS $$
DECLARE
    "v_language_slug" TEXT = slugify("language");
	"v_language_id" UUID = NULL;
BEGIN
    SELECT "id"
    	INTO "v_language_id"
    FROM "languages"
    WHERE "slug" = "v_language_slug";

	IF ("v_language_id" IS NULL) THEN
		INSERT INTO "languages"
			("slug","name")
		VALUES ("v_language_slug", "language")
		RETURNING "id"
			INTO "v_language_id";
	END IF;
		
	RETURN "v_language_id";
END;
$$ LANGUAGE plpgsql;

-- Takes the user data JSON and inserts it into the DB, returning its UUID
CREATE OR REPLACE FUNCTION insert_user_data("user_data" JSONB) RETURNS UUID AS $$
DECLARE
	"v_user_id" UUID = NULL;
    "v_location_id" UUID = NULL;
	"v_language_id" UUID = NULL;
	"v_language" RECORD;
BEGIN

	SELECT "insert_and_get_location_uuid"("user_data"->>'location')
		INTO "v_location_id";

	INSERT INTO "users"
		("username",
		"name",
		"location_id",
		"full_user_data")
	VALUES
		(json_fallback("user_data", 'userName', NULL::TEXT),
		json_fallback("user_data", 'name', NULL::TEXT),
		"v_location_id",
		"user_data")
	RETURNING "id"
		INTO "v_user_id";



	FOR "v_language" IN (SELECT jsonb_array_elements("user_data"->'languages') "name") LOOP
    	SELECT "insert_and_get_language_uuid"("v_language"."name"#>>'{}')
		INTO "v_language_id";

		IF ("v_language_id" IS NOT NULL) THEN
			INSERT INTO "user_languages"
				("user_id","language_id")
			VALUES
				("v_user_id", "v_language_id")
            ON CONFLICT ("user_id", "language_id") DO NOTHING;
		END IF;
  	END LOOP;
		
	RETURN "v_user_id";
END;
$$ LANGUAGE plpgsql;