--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Drop databases (except postgres and template1)
--





--
-- Drop roles
--

DROP ROLE postgres;


--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:4JRZ7jsG121eyoqjyUvL8Q==$gLlbENknqHjh6LUl/D5OwerzkOQMxkh1Kg+a7IlWKXk=:TWtITYn/vrwHoGlbHOuAesw0ZM9hmD/KSV35MxfBVBo=';

--
-- User Configurations
--








--
-- Databases
--

--
-- Database "template1" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1 (Debian 16.1-1.pgdg120+1)
-- Dumped by pg_dump version 16.1 (Debian 16.1-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

UPDATE pg_catalog.pg_database SET datistemplate = false WHERE datname = 'template1';
DROP DATABASE template1;
--
-- Name: template1; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE template1 WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE template1 OWNER TO postgres;

\connect template1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE template1; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE template1 IS 'default template for new databases';


--
-- Name: template1; Type: DATABASE PROPERTIES; Schema: -; Owner: postgres
--

ALTER DATABASE template1 IS_TEMPLATE = true;


\connect template1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE template1; Type: ACL; Schema: -; Owner: postgres
--

REVOKE CONNECT,TEMPORARY ON DATABASE template1 FROM PUBLIC;
GRANT CONNECT ON DATABASE template1 TO PUBLIC;


--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1 (Debian 16.1-1.pgdg120+1)
-- Dumped by pg_dump version 16.1 (Debian 16.1-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE postgres;
--
-- Name: postgres; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE postgres OWNER TO postgres;

\connect postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chat_room; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_room (
    "roomId" integer NOT NULL,
    "roomType" integer NOT NULL,
    "roomName" character varying NOT NULL,
    owner integer NOT NULL,
    password character varying NOT NULL,
    admins integer[] DEFAULT '{}'::integer[] NOT NULL,
    "blockedUsers" integer[] DEFAULT '{}'::integer[] NOT NULL,
    "mutedUsers" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "bannedUsers" integer[] DEFAULT '{}'::integer[] NOT NULL,
    users integer[] DEFAULT '{}'::integer[] NOT NULL
);


ALTER TABLE public.chat_room OWNER TO postgres;

--
-- Name: chat_room_roomId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."chat_room_roomId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."chat_room_roomId_seq" OWNER TO postgres;

--
-- Name: chat_room_roomId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."chat_room_roomId_seq" OWNED BY public.chat_room."roomId";


--
-- Name: game; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game (
    id integer NOT NULL,
    "gameMode" character varying,
    "player1Score" integer,
    "player2Score" integer,
    width double precision,
    height double precision,
    finished boolean,
    "player1Socket" character varying,
    "player2Socket" character varying,
    sockets text[] DEFAULT '{}'::text[] NOT NULL,
    "player1Playerid" integer,
    "player1X" double precision,
    "player1Y" double precision,
    "player1Xvel" double precision,
    "player1Yvel" double precision,
    "player1Speed" double precision,
    "player2Playerid" integer,
    "player2X" double precision,
    "player2Y" double precision,
    "player2Xvel" double precision,
    "player2Yvel" double precision,
    "player2Speed" double precision,
    "ballX" double precision,
    "ballY" double precision,
    "ballXvel" double precision,
    "ballYvel" double precision,
    "ballSpeed" double precision
);


ALTER TABLE public.game OWNER TO postgres;

--
-- Name: game_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.game_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_id_seq OWNER TO postgres;

--
-- Name: game_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.game_id_seq OWNED BY public.game.id;


--
-- Name: message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message (
    id integer NOT NULL,
    name character varying,
    userid integer,
    message character varying NOT NULL,
    "timestamp" character varying NOT NULL,
    "chatRoomRoomId" integer
);


ALTER TABLE public.message OWNER TO postgres;

--
-- Name: message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.message_id_seq OWNER TO postgres;

--
-- Name: message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.message_id_seq OWNED BY public.message.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    user_id bigint NOT NULL,
    names character varying DEFAULT ''::character varying NOT NULL,
    type character varying DEFAULT ''::character varying NOT NULL,
    friends text[] DEFAULT '{}'::text[] NOT NULL,
    "friendsId" integer[] DEFAULT '{}'::integer[] NOT NULL,
    blocked integer[] DEFAULT '{}'::integer[] NOT NULL,
    "chatRooms" integer[] DEFAULT '{}'::integer[] NOT NULL,
    "privateRooms" jsonb DEFAULT '[]'::jsonb NOT NULL,
    achievements text[] DEFAULT '{}'::text[] NOT NULL,
    logged jsonb,
    picture character varying DEFAULT ''::character varying NOT NULL,
    "sayHi" character varying DEFAULT ''::character varying NOT NULL,
    results jsonb DEFAULT '{"won": 0, "lost": 0, "total": 0, "points": 0}'::jsonb NOT NULL,
    "lastMatches" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "twoFactor" boolean DEFAULT false NOT NULL,
    "isPlaying" jsonb DEFAULT '{"state": false, "gameId": 0}'::jsonb NOT NULL,
    "userPic" character varying DEFAULT 'theWarrior'::character varying NOT NULL,
    rank character varying DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: chat_room roomId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room ALTER COLUMN "roomId" SET DEFAULT nextval('public."chat_room_roomId_seq"'::regclass);


--
-- Name: game id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game ALTER COLUMN id SET DEFAULT nextval('public.game_id_seq'::regclass);


--
-- Name: message id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message ALTER COLUMN id SET DEFAULT nextval('public.message_id_seq'::regclass);


--
-- Data for Name: chat_room; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_room ("roomId", "roomType", "roomName", owner, password, admins, "blockedUsers", "mutedUsers", "bannedUsers", users) FROM stdin;
\.


--
-- Data for Name: game; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game (id, "gameMode", "player1Score", "player2Score", width, height, finished, "player1Socket", "player2Socket", sockets, "player1Playerid", "player1X", "player1Y", "player1Xvel", "player1Yvel", "player1Speed", "player2Playerid", "player2X", "player2Y", "player2Xvel", "player2Yvel", "player2Speed", "ballX", "ballY", "ballXvel", "ballYvel", "ballSpeed") FROM stdin;
\.


--
-- Data for Name: message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.message (id, name, userid, message, "timestamp", "chatRoomRoomId") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (user_id, names, type, friends, "friendsId", blocked, "chatRooms", "privateRooms", achievements, logged, picture, "sayHi", results, "lastMatches", "twoFactor", "isPlaying", "userPic", rank) FROM stdin;
\.


--
-- Name: chat_room_roomId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."chat_room_roomId_seq"', 1, false);


--
-- Name: game_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.game_id_seq', 1, false);


--
-- Name: message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.message_id_seq', 1, false);


--
-- Name: game PK_352a30652cd352f552fef73dec5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game
    ADD CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY (id);


--
-- Name: chat_room PK_6f76e63dbb06d480b4f0067996c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_room
    ADD CONSTRAINT "PK_6f76e63dbb06d480b4f0067996c" PRIMARY KEY ("roomId");


--
-- Name: user PK_758b8ce7c18b9d347461b30228d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY (user_id);


--
-- Name: message PK_ba01f0a3e0123651915008bc578; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY (id);


--
-- Name: message FK_4f480e560595ae44d87381d526e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "FK_4f480e560595ae44d87381d526e" FOREIGN KEY ("chatRoomRoomId") REFERENCES public.chat_room("roomId");


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

