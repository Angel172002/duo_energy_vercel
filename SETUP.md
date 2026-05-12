# Setup pendiente en Firebase Console

Estos pasos no se pueden hacer desde código — requieren tu login en https://console.firebase.google.com

## 1. Activar Auth anónima

`Authentication` → `Sign-in method` → `Anonymous` → habilitar.

Sin esto, las Firebase Rules nuevas (que exigen `auth != null`) bloquearán todo el sync.

## 2. Aplicar Database Rules

`Realtime Database` → `Rules` → pegar el contenido de `firebase-rules.json` → `Publicar`.

## 3. Crear Firebase Storage (si no existe)

`Storage` → `Empezar` → modo de prueba → región más cercana.

## 4. Aplicar Storage Rules

`Storage` → `Rules` → pegar el contenido de `firebase-storage-rules.txt` → `Publicar`.

## 5. Limpiar SW viejo en tu navegador (una sola vez)

Solo necesario en dispositivos que ya tienen la app instalada con el SW viejo cache-first:

- DevTools (F12) → `Application` → `Service Workers` → `Unregister` en `duo-energy.vercel.app`
- `Application` → `Storage` → `Clear site data`
- `Ctrl + Shift + R` para recargar

Desde el próximo deploy en adelante, las actualizaciones se aplican solas (auto-reload en `controllerchange`).

## Verificación

Después de aplicar todo:

1. Abre la app y verifica en consola que NO aparezca `Auth anónimo no disponible`
2. Abre Realtime Database y verifica que `duo_state` se sigue actualizando al marcar ejercicios
3. Sube una foto de progreso y verifica en `Storage` → `Files` que aparece en `progress/sofia/...` o `progress/angel/...`
4. Cambia el avatar y verifica en `Storage` → `Files` que aparece `avatars/sofia.jpg` o `avatars/angel.jpg`
