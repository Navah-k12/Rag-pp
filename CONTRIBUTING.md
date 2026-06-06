# Contribuir a StudyRAG

## Flujo de trabajo (GitHub Flow)

Antes de escribir cualquier línea de código, siempre partir de main actualizado:

```bash
git checkout main
git pull origin main
git checkout -b feature/lo-que-vas-a-hacer
```

## Convención de nombres para ramas

| Prefijo  | Cuándo usarlo       | Ejemplo            |
|---       |---                  |---                 |
| feature/ | Funcionalidad nueva | feature/login-page |
| fix/     | Corregir un bug     | fix/error-api-null |
| docs/    | Documentación       | docs/update-readme |
| chore/   | Mantenimiento       | chore/update-deps  |

## Convención de commits
feat: descripción     → funcionalidad nueva
fix: descripción      → corrección de bug
docs: descripción     → documentación
chore: descripción    → mantenimiento

## Después de terminar

```bash
git add .
git commit -m "tipo: descripción del cambio"
git push origin nombre-de-tu-rama
```

Abrir Pull Request en GitHub → describir los cambios → mergear → eliminar rama. 