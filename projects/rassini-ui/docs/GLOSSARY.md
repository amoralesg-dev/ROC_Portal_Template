# Glosario - @rassini/rassini-ui

Define los conceptos clave utilizados en el ecosistema IAM y rassini-ui.

* **APP_INITIALIZER**: Token de inyección de Angular que se ejecuta antes de que la aplicación arranque. `rassini-ui` lo usa para despertar la sesión silenciosamente (F5) invocando `/auth/me`.
* **AuthService (`Auth`)**: Es un Singleton (Servicio) exportado por la librería y administrado 100% por ella. Es el dueño de la sesión y los Tokens.
* **IAM**: *Identity and Access Management*. Base de datos y arquitectura corporativa que administra quién tiene qué rol y qué menú puede ver.
* **Smart Component**: Componente muy acoplado (Ej. `<rui-login>`) que hace requests HTTP y se auto-gestiona, a diferencia de los *Dumb Components* que solo pintan inputs.
* **F5 (Reload)**: Refrescar la pestaña. Provoca que las variables de memoria (Signals) se limpien, obligando al sistema a restaurarse mediante el `APP_INITIALIZER`.
* **Signal**: Herramienta reactiva de Angular. La librería la usa masivamente (`auth.menus()`, `auth.permissions()`) para refrescar la UI al vuelo sin RxJS (Observables).
* **Tarball (`.tgz`)**: Archivo comprimido que contiene la librería compilada. Se genera con `npm pack` y se instala localmente.
