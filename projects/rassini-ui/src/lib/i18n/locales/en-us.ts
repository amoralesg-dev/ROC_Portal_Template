import { RassiniI18nDictionary } from '../i18n.models';

export const EN_US_DICTIONARY: RassiniI18nDictionary = {
  rassini: {
    shell: {
      profile: 'My Profile',
      security: 'Security (2FA Authenticator)',
      changePassword: 'Change Password',
      roles: 'My Roles',
      permissions: 'My Permissions',
      logout: 'Sign Out',
      user: 'User',
      email: 'Email',
      noRoles: 'You have no assigned roles.',
      noPermissions: 'You have no assigned permissions.',
      none: 'None'
    },
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      accept: 'Accept',
      close: 'Close',
      activate: 'Activate',
      disable: 'Disable',
      setupAuthenticator: 'Configure Authenticator'
    },
    changePassword: {
      title: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      requiredField: 'This field is required.',
      sameAsCurrent: 'The new password must be different from the current one.',
      mismatch: 'Passwords do not match.',
      success: 'Password updated successfully.'
    },
    mfa: {
      title: 'Account Security',
      userEnabledTitle: 'MFA enabled by user',
      userEnabledDesc: 'You have enabled multi-factor authentication to protect your account.',
      policyRequiredTitle: 'MFA required by security policy',
      policyRequiredDesc: 'Multi-factor authentication is required for this account and cannot be disabled by the user.',
      policyRequiredNotice: 'If you changed devices, lost access to Microsoft Authenticator, or need to reconfigure MFA, please contact an administrator with MFA management permissions for assistance.',
      disableTitle: 'Disable Authenticator',
      currentPassword: 'Current Password',
      authCodeLabel: 'Authenticator Code (6 digits)',
      codePlaceholder: 'e.g. 123456',
      increaseSecurityDesc: 'Enhance your account security by enabling Multi-Factor Authentication (MFA).',
      qrAlt: 'QR Code',
      manualKeyLabel: 'Or enter this key manually:',
      enterCodeLabel: 'Enter the generated code to verify',
      generatingQr: 'Generating QR code...',
      initError: 'Error initiating MFA configuration.'
    },
    auth: {
      login: {
        title: 'Welcome to Rassini',
        subtitle: 'Sign in to continue',
        usernameLabel: 'Username',
        usernamePlaceholder: 'Username',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Password',
        loginButton: 'Sign In',
        signingIn: 'Signing in...',
        mfaAdminSetupNotice: 'An administrator has enabled two-step verification. Set up your authenticator to continue.',
        manualKey: 'Manual key:',
        verificationCode: 'Verification code (MFA)',
        sixDigitPlaceholder: '6-digit code',
        verifying: 'Verifying...',
        verify: 'Verify',
        remainingTime: 'Remaining time:',
        timeExpired: 'Time expired',
        cancel: 'Cancel',
        returnToLogin: 'Back to sign in',
        invalidCredentials: 'Invalid username or password.',
        userDisabled: 'Your account is disabled. Contact an administrator.',
        internalError: 'An internal system error occurred. Please try again.',
        connectionError: 'Unable to connect to service. Please try again.',
        mfaSessionExpired: 'The MFA setup session expired. Please sign in again.',
        mfaVerifyExpired: 'The verification session expired. Please sign in again.',
        mfaInvalidCode: 'Incorrect code or expired token.',
        tooManyAttempts: 'Too many failed attempts.',
        forgotPassword: 'Forgot your password?',
        contactAdmin: 'Contact system administrator'
      }
    },
    sessionClosed: {
      title: 'Signed Out Successfully',
      description: 'Thank you for using the Rassini Corporate Platform.',
      goToPortal: 'Go to Employee Portal'
    }
  }
};
