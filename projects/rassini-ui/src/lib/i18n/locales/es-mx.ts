import { RassiniI18nDictionary } from '../i18n.models';

export const ES_MX_DICTIONARY: RassiniI18nDictionary = {
  rassini: {
    shell: {
      profile: 'Mi Perfil',
      security: 'Seguridad (Autenticador 2FA)',
      changePassword: 'Cambiar Contraseña',
      roles: 'Mis Roles',
      permissions: 'Mis Permisos',
      logout: 'Cerrar Sesión',
      user: 'Usuario',
      email: 'Email',
      noRoles: 'No tienes roles asignados.',
      noPermissions: 'No tienes permisos asignados.',
      none: 'Ninguno'
    },
    actions: {
      save: 'Guardar',
      cancel: 'Cancelar',
      accept: 'Aceptar',
      close: 'Cerrar',
      activate: 'Activar',
      disable: 'Desactivar',
      setupAuthenticator: 'Configurar Autenticador'
    },
    changePassword: {
      title: 'Cambiar contraseña',
      currentPassword: 'Contraseña actual',
      newPassword: 'Nueva contraseña',
      confirmPassword: 'Confirmar nueva contraseña',
      requiredField: 'Este campo es requerido.',
      sameAsCurrent: 'La nueva contraseña debe ser diferente a la actual.',
      mismatch: 'Las contraseñas no coinciden.',
      success: 'Contraseña actualizada correctamente.'
    },
    mfa: {
      title: 'Seguridad de la Cuenta',
      userEnabledTitle: 'MFA habilitado por el usuario',
      userEnabledDesc: 'Has activado la autenticación multifactor para proteger tu cuenta.',
      policyRequiredTitle: 'MFA requerido por política de seguridad',
      policyRequiredDesc: 'La autenticación multifactor es obligatoria para esta cuenta y no puede ser desactivada por el usuario.',
      policyRequiredNotice: 'Si cambiaste de dispositivo, perdiste acceso a Microsoft Authenticator o necesitas reconfigurar MFA, contacta a un administrador con permisos de gestión MFA para recibir asistencia.',
      disableTitle: 'Desactivar Autenticador',
      currentPassword: 'Contraseña actual',
      authCodeLabel: 'Código del Autenticador (6 dígitos)',
      codePlaceholder: 'Ej. 123456',
      increaseSecurityDesc: 'Aumenta la seguridad de tu cuenta activando la Autenticación Multifactor (MFA).',
      qrAlt: 'Código QR',
      manualKeyLabel: 'O ingresa esta clave manualmente:',
      enterCodeLabel: 'Ingresa el código generado para verificar',
      generatingQr: 'Generando código QR...',
      initError: 'Error al iniciar la configuración de MFA.'
    },
    auth: {
      login: {
        title: 'Bienvenido a Rassini',
        subtitle: 'Inicia sesión para continuar',
        usernameLabel: 'Usuario',
        usernamePlaceholder: 'Usuario',
        passwordLabel: 'Contraseña',
        passwordPlaceholder: 'Contraseña',
        loginButton: 'Iniciar Sesión',
        signingIn: 'Iniciando sesión...',
        mfaAdminSetupNotice: 'Un administrador ha habilitado la autenticación en dos pasos. Configura tu autenticador para continuar.',
        manualKey: 'Clave manual:',
        verificationCode: 'Código de verificación (MFA)',
        sixDigitPlaceholder: 'Código de 6 dígitos',
        verifying: 'Verificando...',
        verify: 'Verificar',
        remainingTime: 'Tiempo restante:',
        timeExpired: 'El tiempo expiró',
        cancel: 'Cancelar',
        returnToLogin: 'Volver a iniciar sesión',
        invalidCredentials: 'Usuario o contraseña incorrectos.',
        userDisabled: 'Tu usuario se encuentra deshabilitado. Contacta a un administrador.',
        internalError: 'Ocurrió un error interno del sistema. Intenta nuevamente.',
        connectionError: 'No fue posible conectar con el servicio. Intenta nuevamente.',
        mfaSessionExpired: 'La sesión de configuración MFA expiró. Inicia sesión nuevamente.',
        mfaVerifyExpired: 'La sesión de verificación expiró. Inicia sesión nuevamente.',
        mfaInvalidCode: 'Código incorrecto o token expirado.',
        tooManyAttempts: 'Demasiados intentos fallidos.',
        forgotPassword: '¿Olvidaste tu contraseña?',
        contactAdmin: 'Contacta al administrador del sistema'
      }
    },
    sessionClosed: {
      title: 'Sesión cerrada correctamente',
      description: 'Gracias por utilizar la Plataforma Corporativa Rassini.',
      goToPortal: 'Ir al Portal de Empleados'
    }
  }
};
