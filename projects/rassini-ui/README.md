# RassiniUi

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.0.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the library, run:

```bash
ng build rassini-ui
```

This command will compile your project, and the build artifacts will be placed in the `dist/` directory.

### Publishing the Library

Once the project is built, you can publish your library by following these steps:

1. Navigate to the `dist` directory:
   ```bash
   cd dist/rassini-ui
   ```

2. Run the `npm publish` command to publish your library to the npm registry:
   ```bash
   npm publish
   ```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Autenticación Centralizada (Opcional)

A partir de la versión 0.0.6, la librería ofrece un sistema centralizado de autenticación. Este mecanismo es estrictamente **opt-in (opcional)**.

- **provideRassiniAuth() es opcional:** No es necesario llamarlo en el pp.config.ts de aplicaciones existentes.
- **AUTH_CONFIG tiene configuración por defecto:** El token de inyección cuenta con un actory que provee valores nulos si no se configura explícitamente, evitando errores de inyección (NG0201).
- **Compatibilidad hacia atrás (Backward Compatibility):** Los consumidores existentes de RassiniLogin que utilizan sus propios mecanismos de autenticación no requieren ningún cambio para actualizar a las versiones recientes de assini-ui.
  
==================================================  
COMPATIBILIDAD OBLIGATORIA DE RASSINI-UI Y MFA  
==================================================  
rassini-ui es una libreria compartida y debe continuar funcionando para Employee Portal y para todas las aplicaciones que actualmente la consumen.  
  
Queda como criterio de aceptacion obligatorio:  
  
1. Compatibilidad hacia atras (Backward Compatibility)  
- Ninguna aplicacion consumidora actual debe requerir modificaciones para continuar autenticandose.  
- El flujo login() tradicional debe seguir funcionando exactamente igual cuando el backend responda HTTP 200.  
  
2. MFA como capacidad opt-in  
- MFA se activa unicamente cuando el backend responde HTTP 202 con MfaPendingResponse.  
- Si el backend responde LoginResponse tradicional, el comportamiento debe ser identico al actual.  
  
3. Sin Breaking Changes  
- No eliminar metodos publicos existentes.  
- No modificar firmas publicas consumidas por aplicaciones actuales.  
- Todo cambio debe ser aditivo.  
  
4. Validacion cruzada obligatoria  
Debe existir evidencia de:  
- Employee Portal funcionando con MFA.  
- portal-minimal (o consumidor equivalente) funcionando sin MFA.  
- Compilacion y ejecucion correctas en ambos casos.  
  
5. Persistencia  
- tempToken unicamente en memoria.  
- No localStorage.  
- No sessionStorage.  
- No restoreSession.  
- No refresh token hasta completar MFA.  
  
6. Evidencia final  
- Login normal sigue funcionando.  
- Login MFA (202 -> verify -> 200) funciona.  
- MFA Enable funciona.  
- MFA Disable funciona.  
