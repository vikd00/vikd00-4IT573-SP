# Semestrálna Práca - 4IT573 E-Shop - Prehľad

Tento projekt je jednoduchá e-commerce platforma vytvorená ako full-stack aplikácia s oddeleným backendom a frontendom. Cieľom bolo precvičiť si kľúčové koncepty vývoja webových aplikácií vrátane REST API, správy databázy, autentifikácie a real-time komunikácie pomocou WebSockets.

## Tech Stack

- **Backend (BE):**
  - Node.js
  - Hono (minimalistický web framework)
  - Drizzle ORM (pre prácu s databázou)
  - SQLite (databáza)
  - JSON Web Tokens (JWT) pre autentifikáciu
  - `ws` knižnica a `@hono/node-ws` pre WebSockets
- **Frontend (FE):**
  - React.js (s Vite ako build tool)
  - React Router pre navigáciu
  - Material-UI (MUI) pre UI komponenty
  - Context API pre globálny state management (Auth, Cart, Admin, WebSocket)
  - Natívny `WebSocket` API (cez vlastného klienta) pre real-time komunikáciu

## Spustenie Projektu

Projekt je rozdelený na dve hlavné časti: Backend (BE) a Frontend (FE). Každá časť sa spúšťa samostatne.

### 1. Backend (BE)

Nachádza sa v priečinku `BE`. **(Pre prvé spustenie po stiahnutí z Gitu:)**

1.  **Inštalácia závislostí:**
    V termináli, v adresári `BE`:
    ```bash
    npm install
    ```
2.  **Vytvorenie databázy a naplnenie dátami:**
    Spustite nasledujúci príkaz. Tento skript automaticky aplikuje databázové migrácie (vytvorí súbor `db.sqlite` a tabuľky podľa schémy) a následne naplní databázu počiatočnými dátami (používatelia, produkty, atď.):

    ```bash
    npm run db:seed
    ```

    Predvolené prihlasovacie údaje po seedingu:

    - Používateľ: `test` / `password123`
    - Admin: `admin` / `admin123`

3.  **Spustenie vývojového servera:**

    ```bash
    npm run dev
    ```

    Backend server beží štandardne na `http://localhost:3003`. Automaticky sleduje zmeny v súboroch a reštartuje sa. **Migrácie sa taktiež spúšťajú automaticky pri každom štarte servera**, takže ak ste po `db:seed` nespravili žiadne zmeny v schéme, nemusíte sa o ne starať.

    _Poznámka k migráciám:_ Ak by ste v budúcnosti menili databázovú schému (`BE/src/models/schema.js`), je potrebné najprv vygenerovať nové migračné súbory príkazom `npm run db:generate` a následne ich aplikovať (buď manuálne cez `npm run db:migrate` alebo automaticky pri ďalšom štarte servera/seedingu).

### 2. Frontend (FE)

Nachádza sa v priečinku `FE`.

1.  **Inštalácia závislostí:**
    V termináli, v adresári `FE`:
    ```bash
    npm install
    ```
2.  **Spustenie vývojového servera:**
    ```bash
    npm run dev
    ```
    Frontend aplikácia beží štandardne na `http://localhost:3000` (definované vo `FE/vite.config.js`) a pripája sa na backend API a WebSocket server na `http://localhost:3003`.

## Prehľad Codebase

### Backend (BE)

- **Vstupný bod (`BE/index.js`):** Inicializuje Hono server, **automaticky spúšťa databázové migrácie**, pripája WebSocket handler a spúšťa HTTP server.
- **Aplikácia Hono (`BE/src/app.js`):** Konfiguruje Hono, definuje globálne middleware (logger, CORS, serveStatic pre `public` adresár, WebSocket upgrade) a registruje všetky API a administrátorské routes. Obsahuje tiež globálny error handler a 404 handler.
- **Databáza:**
  - `BE/src/config/database.js`: Nastavuje SQLite klienta a Drizzle ORM inštanciu (`db`). Exportuje funkciu `runMigrations`.
  - `BE/drizzle.config.js`: Konfigurácia pre Drizzle Kit (CLI nástroj pre generovanie a správu migrácií).
  - `BE/src/models/schema.js`: Definuje Drizzle schému pre všetky databázové tabuľky (users, products, carts, cartItems, orders, orderItems).
- **Routes (`BE/src/routes/`):** Definovanie API endpointov. Sú logicky rozdelené (napr. `users.js`, `products.js`) a administrátorské routes sú v podadresári `admin/` (napr. `admin/products.js`). Routes zvyčajne delegujú logiku na príslušné kontroléry a aplikujú potrebné middleware (napr. `authMiddleware`, `adminAuthMiddleware`).
- **Kontroléry (`BE/src/controllers/`):** Srdce biznis logiky. Obsahujú funkcie, ktoré priamo interagujú s databázou pomocou `db` (Drizzle) a vykonávajú CRUD operácie, validácie a ďalšie úlohy. Po dôležitých operáciách často volajú `wsNotifyService` pre odoslanie real-time notifikácií.
- **Middleware (`BE/src/middleware/`):**
  - `auth.js` (`authMiddleware`): Overuje JWT token z `Authorization` hlavičky. Ak je token platný a používateľ je aktívny, nastaví `userId` a `userRole` do kontextu požiadavky (`c.set()`). V opačnom prípade vráti 401.
  - `adminAuth.js` (`adminAuthMiddleware`): Najprv zavolá `authMiddleware`. Ak je používateľ úspešne autentifikovaný, skontroluje, či má rolu "admin". Ak nie, vráti 403. Inak povolí pokračovanie requestu.
- **WebSockets:**
  - `BE/src/websocket/wsServer.js`: Hlavná logika pre WebSocket server. Zodpovedá za:
    - Upgrade HTTP požiadaviek na WebSocket pripojenia (`createWebSocketHandler`).
    - Autentifikáciu WebSocket pripojení pomocou JWT tokenu (poslaného cez query parameter `token` alebo `Authorization` hlavičku). Pri neúspešnej autentifikácii sa pripojenie neakceptuje alebo sa klientovi odošle chybová správa.
    - Udržiavanie mapy aktívnych pripojení (`connections`) s informáciami o používateľovi (ID, rola, či je admin).
    - Poskytovanie funkcií (`sendToAll`, `sendToAdmins`, `sendToUser`, `sendDashboardMetrics`) pre cielené odosielanie správ len autentifikovaným a relevantným klientom.
    - Logovanie stavu pripojení a počtu rôznych typov pripojených klientov.
  - `BE/src/services/wsNotifyService.js`: Abstraktná vrstva nad `wsServer.js`. Kontroléry volajú jej funkcie (napr. `orderCreated`, `productUpdated`) na odoslanie špecifických typov notifikácií. Táto služba tiež implementuje jednoduchý debouncing (2 sekundy) pre aktualizácie dashboard metrík (`dashboardUpdate`), aby sa predišlo ich príliš častému odosielaniu pri rýchlych zmenách.
- **Služby (`BE/src/services/analyticsService.js`):** Zodpovedá za výpočet rôznych metrík pre administrátorský dashboard (napr. dnešné objednávky, tržby, aktívni používatelia za posledných 30 dní, produkty s nízkym stavom zásob).

### Frontend (FE)

- **Vstupný bod (`FE/src/main.jsx`):** Renderuje koreňovú `App` komponentu do DOM.
- **Hlavná komponenta (`FE/src/App.jsx`):**
  - Obaľuje celú aplikáciu do potrebných providerov: `ThemeProvider` (MUI), `AuthProvider`, `WebSocketProvider`, `CartProvider`, `AdminProvider`.
  - Nastavuje `BrowserRouter` pre React Router a definuje hlavné routes aplikácie pomocou `<Routes>` a `<Route>`.
  - Používa `AdminRoute` wrapper pre ochranu administrátorských stránok.
- **Kontexty (`FE/src/contexts/`):**
  - `AuthContext.jsx`: Spravuje stav prihlásenia, používateľské dáta a JWT token. Poskytuje funkcie `login`, `register`, `logout`, `updateUser`, `isAdmin`, `isAuthenticated`. Pri inicializácii sa pokúša načítať token z localStorage a validovať ho na backende.
  - `CartContext.jsx`: Spravuje obsah nákupného košíka. Logika zahŕňa:
    - Načítanie košíka z localStorage (pre neprihlásených) alebo z backendu (pre prihlásených).
    - Automatickú migráciu lokálneho košíka na backend po úspešnom prihlásení používateľa.
    - Funkcie `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`.
    - Real-time synchronizáciu košíka pomocou WebSocket eventu `cartSync`.
  - `AdminContext.jsx`: Zodpovedá za načítanie a správu dát pre administrátorské rozhranie (produkty, objednávky, používatelia, dashboard metriky). Poskytuje funkcie pre CRUD operácie nad týmito entitami. Dáta sa načítavajú pri inicializácii, ak je admin prihlásený a má platný token.
  - `WebSocketContext.jsx`: Inicializuje a spravuje WebSocket pripojenie k backendu pomocou `wsClient.js`. Dynamicky mení URL pripojenia (pridáva/odoberá `token` query parameter) na základe stavu prihlásenia z `AuthContext`. Poskytuje inštanciu WS klienta ostatným častiam aplikácie.
- **Komponenty (`FE/src/components/`):** Znovupoužiteľné UI prvky.
  - `Layout.jsx`: Hlavná štruktúra stránky s `Header.jsx`.
  - `Header.jsx`: Navigačná lišta, zobrazuje stav WebSocket pripojenia (cez `useWsStatus`), notifikácie (cez `useAdminNotifications` a `useOrderStatus`), odkazy na košík, prihlásenie/profil a admin menu.
  - `ProductList.jsx`: Zobrazuje zoznam produktov s možnosťou vyhľadávania a filtrovania. Reaguje na real-time aktualizácie produktov cez `useProductUpdates` hook (zmeny cien, inventára, aktivácie/deaktivácie, pridanie/zmazanie).
  - `AdminRoute.jsx`: Komponenta vyššieho radu (HOC) pre ochranu administrátorských stránok. Kontroluje, či je používateľ prihlásený a či má rolu admina. Ak nie, presmeruje na login alebo zobrazí stránku "Prístup zamietnutý".
  - `WebSocketNotification.jsx`: (Zobrazené v `Header.jsx` ako súčasť notifikačného menu) Zobrazuje stav WebSocket pripojenia a notifikácie pre admina (napr. nízky stav zásob) a používateľa (zmeny stavu jeho objednávok).
- **Stránky (`FE/src/pages/`):** Komponenty pre jednotlivé routes (napr. `HomePage.jsx`, `LoginPage.jsx`, `admin/AdminDashboardPage.jsx`).
- **API volania (`FE/src/api/`):** Funkcie pre komunikáciu s backend REST API, logicky rozdelené podľa zdrojov (napr. `users.js`, `products.js`, `admin.js`). `config.js` obsahuje base URL (`http://localhost:3003`) a pomocné funkcie pre vytváranie requestov a spracovanie odpovedí.
- **Hooky (`FE/src/hooks/`):**
  - `useWsSubscription.js`: Abstrahuje logiku pre prihlásenie (a odhlásenie pri odmountovaní) na odber špecifických WebSocket eventov z `WebSocketContext`.
  - `useWsStatus.js`: Vracia aktuálny stav WebSocket pripojenia (`true`/`false`).
  - `useAdminNotifications.js`: Prijíma a formátuje notifikácie typu `adminNotification` (napr. nová objednávka, nízky stav zásob, nový používateľ).
  - `useOrderStatus.js`: Sleduje a uchováva zmeny stavu objednávok (event `orderStatus`), relevantné pre prihláseného používateľa.
  - `useProductUpdates.js`: Sleduje eventy `productUpdated`, `productCreated`, `productDeleted` a poskytuje aktuálny zoznam produktov, nové produkty a zoznam zmazaných/deaktivovaných produktov pre dynamickú aktualizáciu UI.
  - `useDashboardMetrics.js`: Prijíma aktualizácie dashboard metrík (event `dashboardMetrics`) pre admin dashboard.
- **WebSocket klient (`FE/src/websocket/wsClient.js`):**
  - Vytvára a spravuje inštanciu `WebSocket`.
  - Implementuje logiku pre automatické znovupripojenie s exponenciálnym odstupom (5 pokusov) v prípade straty spojenia alebo neúspešného pripojenia.
  - Spravuje mapu subscriberov pre rôzne typy správ a notifikuje ich, keď príde správa daného typu.
  - Poskytuje metódy `subscribe`, `disconnect` a property `connected`.

## Prepojenie a Funkcionalita

Systém funguje na princípe klient-server architektúry s REST API pre štandardné operácie a WebSocketmi pre real-time komunikáciu.

1.  **Autentifikácia a Autorizácia:**

    - Používateľ sa registruje/prihlasuje cez FE (napr. `LoginPage.jsx`), ktoré volá BE API (`/api/users/register` alebo `/api/users/login`).
    - BE (`userController.js`) overí údaje, vygeneruje JWT token a vráti ho spolu s dátami používateľa.
    - FE (`AuthContext`) uloží token do localStorage a do stavu.
    - Pri každej chránenej API požiadavke FE posiela token v `Authorization: Bearer <token>` hlavičke.
    - BE middleware (`authMiddleware`) overí token. Pre admin endpointy `adminAuthMiddleware` navyše overí rolu "admin".
    - WebSocket pripojenie sa autentifikuje tokenom poslaným v URL pri prvotnom pripojení. `wsServer.js` na BE overí tento token a asociuje pripojenie s `userId` a rolou. Neautentifikované alebo neautorizované WS spojenia sú zamietnuté alebo obmedzené.

2.  **Používateľská interakcia (napr. pridanie produktu do košíka):**

    - FE (`ProductList.jsx` -> `CartContext.addToCart`) pripraví dáta.
    - **Ak je používateľ prihlásený:**
      - `CartContext` volá `addToCartAPI` (`FE/src/api/cart.js`).
      - API funkcia odošle `POST` request na BE endpoint `/api/cart/items` **s priloženým JWT tokenom**.
      - BE route (`BE/src/routes/cart.js`) je chránená `authMiddleware`. Ak je token platný, middleware extrahuje `userId` a posunie request ďalej.
      - route zavolá `addItemToCart` v `cartController.js`, pričom mu odovzdá `userId` získané z middleware.
      - `cartController.js` overí produkt, jeho dostupnosť (inventár), aktualizuje databázu (tabuľky `carts` a `cartItems` pre daného používateľa).
      - Po úspešnej aktualizácii databázy `cartController.js` zavolá `wsNotifyService.cartUpdated(userId, updatedCart)`.
      - `wsNotifyService.js` použije `wsServer.js` na odoslanie správy typu `cartSync` s dátami aktualizovaného košíka **iba** WebSocket pripojeniam patriacim danému `userId`.
      - FE (`CartContext` sa subscribuje na `cartSync` pomocou `useWsSubscription`) prijme túto správu a aktualizuje lokálny stav košíka, čím sa UI automaticky prekreslí na stránke `/cart` alebo v `Header.jsx` (počet položiek).
    - **Ak používateľ nie je prihlásený:**
      - `CartContext` spravuje košík iba lokálne v `localStorage`.
      - Pri následnom prihlásení `CartContext` deteguje zmenu stavu autentifikácie, načíta lokálny košík a migruje jeho položky na backend (volaním `addToCartAPI` pre každú položku). Po úspešnej migrácii sa lokálny košík vymaže.

3.  **Admin interakcia (napr. aktualizácia stavu objednávky):**
    - Admin na FE (`AdminOrdersPage.jsx` -> `AdminContext.updateOrderStatus`) odošle požiadavku.
    - Volá sa `updateOrderStatusAPI` (`FE/src/api/admin.js`), ktorá pošle `PUT` request na `/api/admin/orders/:id` **s priloženým JWT tokenom admina**.
    - BE middleware (`adminAuthMiddleware`) overí, či je požiadavka od admina (token platný + rola "admin").
    - BE route (`BE/src/routes/admin/orders.js`) zavolá `updateOrderStatus` v `orderController.js`.
    - `orderController.js` aktualizuje stav objednávky v databáze.
    - Potom zavolá `wsNotifyService.orderStatusChanged(updatedOrder)`.
    - `wsNotifyService.js` odošle dve správy:
      - Správu typu `orderStatus` používateľovi, ktorému objednávka patrí (`sendToUser`).
      - Správu typu `adminNotification` (s typom `orderUpdated` v dátach) všetkým prihláseným adminom (`sendToAdmins`).
      - Taktiež spustí debouncovanú aktualizáciu `dashboardMetrics`.
    - FE:
      - Príslušný používateľ (ak je pripojený) dostane aktualizáciu stavu svojej objednávky, ktorá sa prejaví na stránke `/orders` (cez `OrdersPage.jsx`, ktorá používa `useOrderStatus` hook) a v notifikáciách v `Header.jsx`.
      - Všetci pripojení admini dostanú notifikáciu (zobrazenú v `Header.jsx` cez `WebSocketNotification.jsx`, ktorá používa `useAdminNotifications`).
      - Admin dashboard (`/admin` cez `AdminDashboardPage.jsx`, ktorá používa `useDashboardMetrics`) dostane aktualizované metriky. Zmeny sa prejavia aj na stránke `/admin/orders`.

## Real-time aktualizácie cez WebSockets

Nasledujúce udalosti spúšťajú WebSocket notifikácie a miesta, kde sa zmeny prejavia na FE:

- **Pre všetkých používateľov:**
  - `productCreated`: Keď admin pridá nový produkt.
    - **Vysledok:** Zoznam produktov (`/products`, `HomePage.jsx`) sa aktualizuje. Admini vidia notifikáciu a zmenu na `/admin/products`.
  - `productUpdated`: Keď admin aktualizuje existujúci produkt (názov, cena, popis, obrázok, aktivita, inventár).
    - **Vysledok:** Zoznam produktov (`/products`, `HomePage.jsx`) a detaily produktu sa aktualizujú. Košík (`/cart`) môže byť ovplyvnený, ak sa zmení cena alebo dostupnosť. Admini vidia notifikáciu a zmenu na `/admin/products`.
  - `productDeleted`: Keď admin vymaže produkt.
    - **Vysledok:** Produkt zmizne zo zoznamu produktov (`/products`, `HomePage.jsx`). Admini vidia notifikáciu a zmenu na `/admin/products`.
- **Pre konkrétneho používateľa (podľa `userId`):**
  - `cartSync`: Pri akejkoľvek zmene v košíku používateľa (pridanie, odobratie, zmena množstva, vytvorenie objednávky – vyprázdnenie košíka).
    - **Vysledok:** Stránka košíka (`/cart`) a ikona košíka v `Header.jsx` sa okamžite aktualizujú.
  - `orderStatus`: Keď admin zmení stav objednávky daného používateľa.
    - **Vysledok:** Stránka histórie objednávok (`/orders`) používateľa sa aktualizuje. Používateľ dostane notifikáciu v `Header.jsx`.
- **Pre všetkých administrátorov:**
  - `adminNotification` (s rôznymi vnorenými typmi):
    - `newOrder`: Keď je vytvorená nová objednávka.
      - **Vysledok:** Notifikácia v `Header.jsx`. Dashboard metriky (`/admin`) sa aktualizujú.
    - `orderUpdated`: Keď je aktualizovaný stav objednávky.
      - **Vysledok:** Notifikácia v `Header.jsx`. Dashboard metriky (`/admin`) sa aktualizujú.
    - `orderDeleted`: Keď je objednávka (po zrušení) vymazaná.
      - **Vysledok:** Notifikácia v `Header.jsx`. Dashboard metriky (`/admin`) sa aktualizujú.
    - `productCreated`: Detaily o novom produkte.
      - **Vysledok:** Notifikácia v `Header.jsx`. Dashboard metriky (`/admin`) sa aktualizujú.
    - `productUpdated`: Detaily o aktualizovanom produkte.
      - **Vysledok:** Notifikácia v `Header.jsx`. Dashboard metriky (`/admin`) sa aktualizujú.
    - `productDeleted`: ID zmazaného produktu.
      - **Vysledok:** Notifikácia v `Header.jsx`. Dashboard metriky (`/admin`) sa aktualizujú.
    - `lowStock`: Notifikácia, keď inventár produktu klesne pod určitú hranicu (aktuálne <= 5).
      - **Vysledok:** Notifikácia v `Header.jsx`. Dashboard metriky (`/admin`) aktualizujú.
  - `dashboardMetrics`: Pravidelne (alebo po relevantných zmenách, debouncovane) odosielané agregované metriky pre admin dashboard.
    - **Vysledok:** Admin dashboard (`/admin`) sa dynamicky aktualizuje.
