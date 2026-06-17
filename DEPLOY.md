# Deploy Tecnova

## Backups automaticos

El sistema guarda backups fuera de `public`, en la carpeta `backups/` del proyecto o en la ruta definida por `BACKUP_DIR`.

Cada backup automatico incluye:

- `prisma/tecnova.db`
- `public/uploads` si existe
- `package.json` si existe
- `manifest.json`

El script mantiene solo los ultimos 30 backups automaticos y no elimina backups manuales.

### Activar cron cada 6 horas

```bash
0 */6 * * * cd /root/Tecnova && bash scripts/backup.sh
```

### Activar cron diario a las 3 AM

```bash
0 3 * * * cd /root/Tecnova && bash scripts/backup.sh
```

No ejecutes seed ni reset de base de datos en produccion para activar backups.
