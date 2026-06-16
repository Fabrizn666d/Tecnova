import { mkdirSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

const dbPath = path.join(process.cwd(), "prisma", "tecnova.db");
mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);

const statements = [
  `CREATE TABLE IF NOT EXISTS Category (
    id TEXT PRIMARY KEY NOT NULL,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    icono TEXT,
    imagen TEXT,
    color TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS Product (
    id TEXT PRIMARY KEY NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'producto',
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subtitulo TEXT,
    descripcionCorta TEXT NOT NULL,
    descripcionLarga TEXT,
    categoryId TEXT NOT NULL,
    marca TEXT,
    modelo TEXT,
    codigoRef TEXT,
    condicion TEXT NOT NULL DEFAULT 'nuevo',
    precio REAL,
    precioAnterior REAL,
    mostrarPrecio BOOLEAN NOT NULL DEFAULT false,
    etiquetaPrecio TEXT,
    imagenes TEXT NOT NULL DEFAULT '[]',
    imagenPrincipal TEXT,
    especificaciones TEXT NOT NULL DEFAULT '[]',
    caracteristicas TEXT NOT NULL DEFAULT '[]',
    aplicaciones TEXT NOT NULL DEFAULT '[]',
    compatibilidad TEXT NOT NULL DEFAULT '[]',
    archivos TEXT NOT NULL DEFAULT '[]',
    activo BOOLEAN NOT NULL DEFAULT true,
    destacado BOOLEAN NOT NULL DEFAULT false,
    ordenDestacado INTEGER,
    destacadoRepuesto BOOLEAN NOT NULL DEFAULT false,
    ordenRepuesto INTEGER,
    nuevo BOOLEAN NOT NULL DEFAULT false,
    disponible BOOLEAN NOT NULL DEFAULT true,
    etiqueta TEXT,
    seoTitulo TEXT,
    seoDesc TEXT,
    vistas INTEGER NOT NULL DEFAULT 0,
    cotizaciones INTEGER NOT NULL DEFAULT 0,
    tags TEXT NOT NULL DEFAULT '[]',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS Lead (
    id TEXT PRIMARY KEY NOT NULL,
    nombre TEXT,
    telefono TEXT,
    email TEXT,
    consulta TEXT NOT NULL,
    fuente TEXT NOT NULL DEFAULT 'contacto',
    estado TEXT NOT NULL DEFAULT 'nuevo',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS Complaint (
    id TEXT PRIMARY KEY NOT NULL,
    nombre TEXT NOT NULL,
    documento TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    tipo TEXT NOT NULL DEFAULT 'reclamo',
    productoServicio TEXT,
    monto REAL,
    detalle TEXT NOT NULL,
    pedido TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'nuevo',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS Service (
    id TEXT PRIMARY KEY NOT NULL,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    descripcionLarga TEXT,
    icono TEXT,
    imagen TEXT,
    caracteristicas TEXT NOT NULL DEFAULT '[]',
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS Project (
    id TEXT PRIMARY KEY NOT NULL,
    titulo TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    cliente TEXT,
    ubicacion TEXT,
    fecha DATETIME,
    imagenes TEXT NOT NULL DEFAULT '[]',
    categoria TEXT,
    destacado BOOLEAN NOT NULL DEFAULT false,
    activo BOOLEAN NOT NULL DEFAULT true,
    orden INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS Banner (
    id TEXT PRIMARY KEY NOT NULL,
    titulo TEXT NOT NULL,
    subtitulo TEXT,
    descripcion TEXT,
    ctaTexto TEXT,
    ctaLink TEXT,
    ctaTipo TEXT NOT NULL DEFAULT 'link',
    ctaTexto2 TEXT,
    ctaLink2 TEXT,
    imagenDesktop TEXT,
    imagenMobile TEXT,
    colorTexto TEXT NOT NULL DEFAULT 'light',
    overlay BOOLEAN NOT NULL DEFAULT true,
    overlayOpacity REAL NOT NULL DEFAULT 0.5,
    posicion TEXT NOT NULL DEFAULT 'hero',
    activo BOOLEAN NOT NULL DEFAULT true,
    orden INTEGER NOT NULL DEFAULT 0,
    fechaInicio DATETIME,
    fechaFin DATETIME,
    clics INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS Brand (
    id TEXT PRIMARY KEY NOT NULL,
    nombre TEXT NOT NULL,
    logo TEXT,
    url TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true
  )`,
  `CREATE TABLE IF NOT EXISTS Quote (
    id TEXT PRIMARY KEY NOT NULL,
    nombre TEXT,
    telefono TEXT,
    email TEXT,
    mensaje TEXT,
    fuente TEXT NOT NULL DEFAULT 'whatsapp',
    estado TEXT NOT NULL DEFAULT 'nuevo',
    notas TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS QuoteItem (
    id TEXT PRIMARY KEY NOT NULL,
    quoteId TEXT NOT NULL,
    productId TEXT NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    nota TEXT,
    FOREIGN KEY (quoteId) REFERENCES Quote(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS FAQ (
    id TEXT PRIMARY KEY NOT NULL,
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    categoria TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true
  )`,
  `CREATE TABLE IF NOT EXISTS Testimonial (
    id TEXT PRIMARY KEY NOT NULL,
    nombre TEXT NOT NULL,
    empresa TEXT,
    cargo TEXT,
    mensaje TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    imagen TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    orden INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS Setting (
    id TEXT PRIMARY KEY NOT NULL,
    clave TEXT NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'string',
    grupo TEXT NOT NULL DEFAULT 'general',
    label TEXT,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS AdminUser (
    id TEXT PRIMARY KEY NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'admin',
    activo BOOLEAN NOT NULL DEFAULT true,
    ultimoAcceso DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS ActivityLog (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT,
    userName TEXT,
    accion TEXT NOT NULL,
    modulo TEXT NOT NULL,
    detalle TEXT,
    ip TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS LoginAttempt (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL,
    ip TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

db.exec("PRAGMA foreign_keys = ON;");
db.exec(statements.join(";\n"));

const dbWithPrepare = db as unknown as {
  prepare(query: string): { all(): { name: string }[] };
};

const productColumns = new Set(
  dbWithPrepare.prepare("PRAGMA table_info(Product)").all().map((column) => String(column.name))
);

const productAlterStatements = [
  ["tipo", "ALTER TABLE Product ADD COLUMN tipo TEXT NOT NULL DEFAULT 'producto'"],
  ["aplicaciones", "ALTER TABLE Product ADD COLUMN aplicaciones TEXT NOT NULL DEFAULT '[]'"],
  ["destacadoRepuesto", "ALTER TABLE Product ADD COLUMN destacadoRepuesto BOOLEAN NOT NULL DEFAULT false"],
  ["ordenRepuesto", "ALTER TABLE Product ADD COLUMN ordenRepuesto INTEGER"],
];

for (const [column, statement] of productAlterStatements) {
  if (!productColumns.has(column)) {
    db.exec(statement);
  }
}

db.close();

console.log(`Base SQLite inicializada en ${dbPath}`);
