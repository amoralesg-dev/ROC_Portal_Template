/**
 * Modelos del contexto de autenticación de rassini-ui.
 *
 * Estos tipos reflejan la respuesta real del endpoint /auth/me
 * y del endpoint /auth/login del backend Employee Portal.
 *
 * No utilizar `any` en consumidores de Auth — importar estas interfaces.
 */

/**
 * Referencia compacta a un menú (nodo del árbol de navegación).
 * El campo `children` permite representar la jerarquía completa.
 */
export interface AuthMenu {
    id: number;
    code: string;
    label: string;
    route: string | null;
    icon?: string | null;
    orderIndex?: number | null;
    parentId?: number | null;
    children?: AuthMenu[];
}

/**
 * Referencia compacta a una Business Unit dentro del contexto de sesión.
 * No incluye `children` para mantener el payload de /me liviano.
 */
export interface AuthBusinessUnit {
    id: number;
    code: string;
    name: string;
    parentId?: number | null;
    enabled?: boolean;
}

/**
 * Datos básicos del usuario autenticado.
 * Corresponde a `AuthenticatedUserResponse` del backend.
 *
 * IMPORTANTE: nunca incluye passwordHash.
 */
export interface AuthUser {
    id: number;
    username: string;
    email: string;
    enabled: boolean;
    forcePasswordChange: boolean;
}

/**
 * Contexto completo de autenticación que retorna /auth/me.
 *
 * Los signals del Auth service se tipan con esta interfaz.
 * El campo `user` se mantiene separado para poder actualizar
 * solo el subconjunto de datos del perfil sin afectar los demás.
 */
export interface AuthContext {
    user: AuthUser | null;
    roles: string[];
    permissions: string[];
    menus: AuthMenu[];
    businessUnits: AuthBusinessUnit[];
    hasAllBusinessUnits: boolean;
}
