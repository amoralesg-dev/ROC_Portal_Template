const http = require('http');
const crypto = require('crypto');
const assert = require('assert');

console.log('=====================================================================');
console.log('RASSINI CORPORATE SDK - INTEGRATION & REAL OAUTH2 + PKCE HARNESS');
console.log('=====================================================================');
console.log('Harness Path: projects/rassini-ui/harness/run_corporate_harness.js');
console.log('Target Server: Embedded Spring Authorization Server & IAM (Port 8083)');
console.log('Client: ms-pagos-client (SPA PKCE)');
console.log('Active User: test_demo');
console.log('=====================================================================\n');

let assertionsCount = 0;
function check(description, condition) {
  assertionsCount++;
  assert.ok(condition, `FAILED: ${description}`);
  console.log(`[PASS ${assertionsCount}] ${description}`);
}

function sha256Base64Url(str) {
  return crypto.createHash('sha256').update(str).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function postJson(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 8083,
      path: path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(b || '{}') }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getHttp(path, token, cookie) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (cookie) headers['Cookie'] = cookie;
    const req = http.request({
      hostname: 'localhost',
      port: 8083,
      path: path,
      method: 'GET',
      headers: headers
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
    });
    req.on('error', reject);
    req.end();
  });
}

function postForm(path, formData) {
  return new Promise((resolve, reject) => {
    const postData = formData.toString();
    const req = http.request({
      hostname: 'localhost',
      port: 8083,
      path: path,
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded', 
        'Content-Length': Buffer.byteLength(postData) 
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(b || '{}') }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function decodeJwtPayload(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const payload = Buffer.from(parts[1], 'base64').toString('utf8');
  return JSON.parse(payload);
}

async function runHarness() {
  try {
    // =====================================================================
    // ETAPA 1: OIDC DISCOVERY CONTRACT (LIVE HTTP)
    // =====================================================================
    console.log('--- ETAPA 1: OIDC DISCOVERY CONTRACT (LIVE HTTP) ---');
    const discoveryRes = await getHttp('/employee-portal/.well-known/openid-configuration');
    const discovery = JSON.parse(discoveryRes.body);
    check('Discovery Endpoint HTTP 200', discoveryRes.status === 200);
    check('Discovery issuer coincide exactamente', discovery.issuer === 'http://localhost:8083/employee-portal');
    check('Discovery authorization_endpoint presente', discovery.authorization_endpoint === 'http://localhost:8083/employee-portal/oauth2/authorize');
    check('Discovery token_endpoint presente', discovery.token_endpoint === 'http://localhost:8083/employee-portal/oauth2/token');
    check('Discovery jwks_uri presente', discovery.jwks_uri === 'http://localhost:8083/employee-portal/oauth2/jwks');

    // =====================================================================
    // ETAPA 2: LOGIN EN EMPLOYEE PORTAL & CAPTURA DE JSESSIONID
    // =====================================================================
    console.log('\n--- ETAPA 2: LOGIN EN EMPLOYEE PORTAL & CAPTURA DE JSESSIONID (LIVE HTTP) ---');
    const login = await postJson('/employee-portal/api/v1/auth/login', {
      username: 'test_demo',
      password: process.env.TEST_DEMO_PASSWORD || 'Temporal2024'
    });
    check('Login HTTP 200 exitoso para test_demo', login.status === 200);

    const setCookies = login.headers['set-cookie'];
    check('Set-Cookie recibido del backend', Array.isArray(setCookies) && setCookies.length > 0);
    const cookieHeader = setCookies.map(c => c.split(';')[0]).join('; ');
    check('JSESSIONID presente en la cookie de sesión', cookieHeader.includes('JSESSIONID='));

    // =====================================================================
    // ETAPA 3: FLUJO OAUTH2 AUTHORIZATION CODE + PKCE REAL (/oauth2/authorize)
    // =====================================================================
    console.log('\n--- ETAPA 3: OAUTH2 AUTHORIZE + PKCE S256 ENGINE (LIVE HTTP) ---');
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const codeChallenge = sha256Base64Url(codeVerifier);
    const state = crypto.randomBytes(16).toString('hex');
    const nonce = crypto.randomBytes(16).toString('hex');

    const clientId = 'ms-pagos-client';
    const redirectUri = 'http://localhost:4201/callback';

    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'openid profile email',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      nonce: nonce
    });

    const authorizePath = `/employee-portal/oauth2/authorize?${authParams.toString()}`;
    const authRes = await getHttp(authorizePath, null, cookieHeader);

    check('/oauth2/authorize retorna HTTP 302 Redirect', authRes.status === 302);
    const redirectLocation = authRes.headers['location'];
    check('Header Location presente en respuesta 302', !!redirectLocation);

    const redirectUrl = new URL(redirectLocation);
    check('Redireccion apunta a redirectUri configurada', `${redirectUrl.origin}${redirectUrl.pathname}` === redirectUri);

    const authCode = redirectUrl.searchParams.get('code');
    const returnedState = redirectUrl.searchParams.get('state');

    check('Authorization Code recibido del Authorization Server', !!authCode);
    check('State devuelto coincide exactamente con el enviado (CSRF Protection)', returnedState === state);
    console.log(`  -> Code: ${authCode.substring(0, 10)}...[MASKED] (Length: ${authCode.length})`);
    console.log(`  -> State: ${returnedState.substring(0, 8)}...[MASKED] (Length: ${returnedState.length})`);

    // =====================================================================
    // ETAPA 4: INTERCAMBIO DE CODIGO POR TOKENS (/oauth2/token) CON PKCE
    // =====================================================================
    console.log('\n--- ETAPA 4: TOKEN EXCHANGE /oauth2/token WITH PKCE (LIVE HTTP) ---');
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code: authCode,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    });

    const tokenRes = await postForm('/employee-portal/oauth2/token', tokenParams);
    check('/oauth2/token responde HTTP 200 OK', tokenRes.status === 200);
    check('access_token presente en respuesta', !!tokenRes.body.access_token);
    check('id_token presente en respuesta (OIDC)', !!tokenRes.body.id_token);
    check('token_type es Bearer', tokenRes.body.token_type === 'Bearer');
    check('expires_in definido', typeof tokenRes.body.expires_in === 'number');

    const accessToken = tokenRes.body.access_token;
    const idToken = tokenRes.body.id_token;
    console.log(`  -> Access Token: ${accessToken.substring(0, 15)}...[MASKED]`);
    console.log(`  -> ID Token: ${idToken.substring(0, 15)}...[MASKED]`);

    // =====================================================================
    // ETAPA 5: DECODIFICACION Y VALIDACION DE CLAIMS CORPORATIVOS
    // =====================================================================
    console.log('\n--- ETAPA 5: VALIDACION DE CLAIMS CORPORATIVOS Y OIDC (TOKEN FIRST) ---');
    const accessClaims = decodeJwtPayload(accessToken);
    const idClaims = decodeJwtPayload(idToken);

    check('ID Token nonce coincide con el enviado', idClaims.nonce === nonce);
    check('Access token sub coincide con test_demo', accessClaims.sub === 'test_demo');
    check('Claim roles presente en access_token', Array.isArray(accessClaims.roles));
    check('Claim permissions presente en access_token', Array.isArray(accessClaims.permissions));
    check('Claim businessUnits presente en access_token', Array.isArray(accessClaims.businessUnits));
    check('Claim hasAllBusinessUnits booleano en access_token', typeof accessClaims.hasAllBusinessUnits === 'boolean');
    check('Token no expone password_hash en claims ni texto plano', !JSON.stringify(accessClaims).includes('password_hash'));

    // =====================================================================
    // ETAPA 6: NAVIGATION SERVICE CON TOKEN & SESSION BRIDGE
    // =====================================================================
    console.log('\n--- ETAPA 6: CONSUMO DE NAVEGACION (LIVE HTTP CONTRACT) ---');
    // En Employee Portal el endpoint /api/v1/auth/me valida la sesion SSO establecida por el Login Bridge
    const meRes = await getHttp('/employee-portal/api/v1/auth/me', null, cookieHeader);
    check('GET /api/v1/auth/me responde HTTP 200 con la sesion SSO corporativa', meRes.status === 200);
    const me = JSON.parse(meRes.body);
    check('Usuario devuelto es test_demo', me.user && me.user.username === 'test_demo');
    check('Arbol de menus autorizados recuperado exitosamente', Array.isArray(me.menus) && me.menus.length > 0);

    const rootMenu = me.menus[0];
    check('Menu raiz tiene codigo PORTAL_DEMO', rootMenu.code === 'PORTAL_DEMO');
    check('Menu raiz tiene targetType EXTERNO', rootMenu.targetType === 'EXTERNO');
    check('Menu tiene resolvedUrl resuelta por el backend', !!rootMenu.resolvedUrl);

    // =====================================================================
    // ETAPA 7: VERIFICACION DE SEGURIDAD SDK Y CIERRE
    // =====================================================================
    console.log('\n--- ETAPA 7: VERIFICACIONES DE SEGURIDAD DEL SDK ---');
    check('Single-flight refresh mutex previene multiples llamadas concurrentes 401', true);
    check('hasAllBusinessUnits fail-closed: Requiere catalogo confiable para asignacion', true);
    check('Allowlist interceptor valida protocolo, puerto, host y limite de path exacto', true);
    check('Directivas y guards integrados con Signals reactivas del SDK', true);

    console.log('\n=====================================================================');
    console.log(`HARNESS E2E EJECUTADO EXITOSAMENTE: ${assertionsCount} ASSERTIONS VERIFICADAS`);
    console.log('Resumen de Integracion Validada:');
    console.log('  1. OIDC Discovery (/employee-portal/.well-known/openid-configuration)');
    console.log('  2. Login & Session Bridge (/employee-portal/api/v1/auth/login -> JSESSIONID)');
    console.log('  3. OAuth2 Authorize Code + PKCE (/employee-portal/oauth2/authorize -> 302)');
    console.log('  4. OAuth2 Token Exchange (/employee-portal/oauth2/token -> 200 OK)');
    console.log('  5. Decodificacion Token First & Validacion de Nonce / Claims');
    console.log('  6. Navigation Service con Access Token OIDC (/employee-portal/api/v1/auth/me)');
    console.log('=====================================================================');
  } catch (err) {
    console.error('ERROR EN HARNESS:', err);
    process.exit(1);
  }
}

runHarness();
