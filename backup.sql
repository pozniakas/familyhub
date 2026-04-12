--
-- PostgreSQL database dump
--

\restrict 5PPAijV8exVYfpP3nAyJABdDx9qhN8gOYUJxFtiCbjsJggPoTmBMzJlUphu8jZ7

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: entities; Type: TABLE; Schema: public; Owner: familyhub
--

CREATE TABLE public.entities (
    id character varying NOT NULL,
    name text NOT NULL,
    emoji character varying DEFAULT '📁'::character varying NOT NULL
);


ALTER TABLE public.entities OWNER TO familyhub;

--
-- Name: items; Type: TABLE; Schema: public; Owner: familyhub
--

CREATE TABLE public.items (
    id character varying NOT NULL,
    entity_id character varying NOT NULL,
    section_id character varying NOT NULL,
    name text NOT NULL,
    status character varying DEFAULT 'ok'::character varying NOT NULL,
    notes text DEFAULT ''::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.items OWNER TO familyhub;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: familyhub
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO familyhub;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: familyhub
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO familyhub;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: familyhub
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: familyhub
--

CREATE TABLE public.push_subscriptions (
    id character varying NOT NULL,
    user_id character varying NOT NULL,
    endpoint text NOT NULL,
    keys text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.push_subscriptions OWNER TO familyhub;

--
-- Name: sections; Type: TABLE; Schema: public; Owner: familyhub
--

CREATE TABLE public.sections (
    id character varying NOT NULL,
    entity_id character varying NOT NULL,
    name text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.sections OWNER TO familyhub;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: familyhub
--

CREATE TABLE public.tasks (
    id character varying NOT NULL,
    name text NOT NULL,
    entity_id character varying,
    priority character varying,
    done boolean DEFAULT false NOT NULL,
    assigned_to text DEFAULT ''::text NOT NULL,
    due_date character varying,
    repeat character varying,
    repeat_every integer,
    repeat_frequency character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tasks OWNER TO familyhub;

--
-- Name: users; Type: TABLE; Schema: public; Owner: familyhub
--

CREATE TABLE public.users (
    id character varying NOT NULL,
    username character varying NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO familyhub;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: familyhub
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: entities; Type: TABLE DATA; Schema: public; Owner: familyhub
--

COPY public.entities (id, name, emoji) FROM stdin;
home	Namai	🏠
car	Automobilis	🚗
investments	Investicijos	📈
mnukskysk88z	Musė	🐶
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: familyhub
--

COPY public.items (id, entity_id, section_id, name, status, notes, sort_order) FROM stdin;
mnuopqngncqj	car	documents	Privalomasis draudimas	ok	Galioja iki 2027-01-05 23:59	1
mnuoq1awktfg	car	documents	Technikinė	ok	Galioja iki XXXX-XX-XX XX:XX	2
mnuocsv67wu3	car	comfort	Girgžda vairuotojo sėdynė	soon		0
mnuoeshpym43	car	comfort	Jungiant pavaras oda trinasi	soon	Junginėjant pavaras odai besitrinant labai nemalonus garsas yra	1
i4	car	service	Tepalai	ok	Keisti tepalai ties X km	1
mnuosyrf5kn8	investments	mnuorwp7oyj2	Pagalvė (Indėlis, 3.05% metinė grąža)	ok	Suma: 1590$ (Atnaujinta: 2026-04-11)	0
mnuoyfikom1t	investments	mnuox74eg57k	Amerikietiškų akcijų paketas su dividendais	ok	Suma: 166.20€ (Atnaujinta: 2026-04-11)	0
mnuktmj45usy	mnukskysk88z	mnukssri3m48	Dantų higiena	urgent	Bloga situacija su dantimis	0
mnupa6pxen2v	mnukskysk88z	mnukssri3m48	Vakcinacija	ok	Vakcinos galioja iki:\nNuo pasiutligės iki X\nNuo X iki X	1
mnuoc2hgcs3i	car	repairs	Rūdys ant stogo	urgent	Ant stogo atsirado rūdžių mažų, reikia neuždelsti	0
mnuor3yup97g	car	repairs	Gazuojant keistas zvimbėjimas	soon	Spaudžiant gazą girdisi keistas zvimbėjimas, ant laisvų apsukų geriausiai. Mechanikas testavo diržą nuėmęs, sakė ne, spėja, kad turbina, bet nieko nedarė.	2
i5	car	documents	Dokumentis užsieniui	ok	Atspausdinti draudimo lapai, žalias lapas, technikinė	0
mnumzosww5jg	car	repairs	Sankabos drebėjimas	soon	Po sankabos ir smagračio pakeitimo dreba pajudant pirmom pavarom (1 ir R). Mechanikai sako, kad viskas okay, bet neaišku	1
mnup2cc5rgr8	car	service	Pasikeisti sez. padangas	urgent	Reikalingas padangų keitimas į vasarines, kad nedrožti žieminių	0
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: familyhub
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1744408800000	InitialSchema1744408800000
2	1744408800001	AddUsers1744408800001
3	1744408800002	AddPushSubscriptions1744408800002
\.


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: familyhub
--

COPY public.push_subscriptions (id, user_id, endpoint, keys, created_at) FROM stdin;
5a02c99f-7257-417b-8428-3fe8efc86fb2	c28059bd-0b29-4499-94ad-cf4c2abc0bcd	https://web.push.apple.com/QDXOxiR-Ll6BhO9lxfD05K8cE20itWUPpMs75jdjYZUGmCk_iDzDZw-4mUMV14QhQia1qC32WudD9gtLcHRhz1A_lVQmuv0L8b4MFAwTLwwKf_c1Z5RAiTnSoUNHuC_xW8MUVY6JhFfJmKZ5Rp-_z8jLS_Fjul0q4vohRxsfSC4	{"p256dh":"BML-SO2QxvZzc-kw8iKyjir89hBwPs7RaOIltFziRIUN9Rji68gREYGM4vcy7GImJ9XbERQx-7SOBsNqwx80V1U","auth":"5AcMIaA26p4IYezyh0cirw"}	2026-04-12 10:14:28.416819+00
\.


--
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: familyhub
--

COPY public.sections (id, entity_id, name, sort_order) FROM stdin;
repairs	car	Važiuoklė	0
service	car	Einamieji darbai	1
comfort	car	Salonas	2
documents	car	Dokumentai	3
mnuorwp7oyj2	investments	Revolut	0
mnuox74eg57k	investments	Trading212	1
mnukssri3m48	mnukskysk88z	Sveikata	0
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: familyhub
--

COPY public.tasks (id, name, entity_id, priority, done, assigned_to, due_date, repeat, repeat_every, repeat_frequency, created_at) FROM stdin;
mnvano2tun8s	Išvalyti Musei dantis	mnukskysk88z	\N	f		2026-04-15	custom	3	days	2026-04-12 05:26:23.735149+00
mnvafql6vef2	Išvalyti Musei dantis	mnukskysk88z	\N	t		2026-04-12	custom	3	days	2026-04-12 05:26:22.735149+00
mnvafp2ovtbj	Išgerti vitaminus	\N	\N	f		2026-04-12	daily	\N	\N	2026-04-12 05:26:21.735149+00
mnus817l2296	Išgerti vitaminus	\N	\N	t		2026-04-11	daily	\N	\N	2026-04-12 05:26:20.735149+00
mnus817ftoe6	Išvalyti Musei dantis	mnukskysk88z	\N	t		2026-04-11	daily	\N	\N	2026-04-12 05:26:19.735149+00
mnupu840b5m7	Suderinti vizitą dėl Musės higienos	mnukskysk88z	high	f	Domas	2026-04-13T15:00	\N	\N	\N	2026-04-12 05:26:18.735149+00
mnupcncwnnc5	Pasikeisti padangas į vasarines	car	\N	f	Domas	2026-05-01	\N	\N	\N	2026-04-12 05:26:17.735149+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: familyhub
--

COPY public.users (id, username, password_hash, created_at) FROM stdin;
c28059bd-0b29-4499-94ad-cf4c2abc0bcd	domas	$2b$10$yvsGfZlYCA6S1r4.A6bzkeFCv1y0iQk44P2p70G.H9xOuj1n9QLs2	2026-04-12 08:03:31.611492+00
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: familyhub
--

SELECT pg_catalog.setval('public.migrations_id_seq', 3, true);


--
-- Name: push_subscriptions PK_757fc8f00c34f66832668dc2e53; Type: CONSTRAINT; Schema: public; Owner: familyhub
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT "PK_757fc8f00c34f66832668dc2e53" PRIMARY KEY (id);


--
-- Name: entities PK_8640855ae82083455cbb806173d; Type: CONSTRAINT; Schema: public; Owner: familyhub
--

ALTER TABLE ONLY public.entities
    ADD CONSTRAINT "PK_8640855ae82083455cbb806173d" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: familyhub
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: tasks PK_8d12ff38fcc62aaba2cab748772; Type: CONSTRAINT; Schema: public; Owner: familyhub
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: familyhub
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: items PK_ba5885359424c15ca6b9e79bcf6; Type: CONSTRAINT; Schema: public; Owner: familyhub
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY (id);


--
-- Name: sections PK_f9749dd3bffd880a497d007e450; Type: CONSTRAINT; Schema: public; Owner: familyhub
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT "PK_f9749dd3bffd880a497d007e450" PRIMARY KEY (id);


--
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: familyhub
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- Name: push_subscriptions FK_6771f119f1c06d2ccf38f238664; Type: FK CONSTRAINT; Schema: public; Owner: familyhub
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT "FK_6771f119f1c06d2ccf38f238664" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sections FK_d0361c4f976a8d4daedbbe46670; Type: FK CONSTRAINT; Schema: public; Owner: familyhub
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT "FK_d0361c4f976a8d4daedbbe46670" FOREIGN KEY (entity_id) REFERENCES public.entities(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 5PPAijV8exVYfpP3nAyJABdDx9qhN8gOYUJxFtiCbjsJggPoTmBMzJlUphu8jZ7
