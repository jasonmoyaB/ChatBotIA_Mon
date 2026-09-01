/**
 * Genera los iconos PNG de la PWA sin dependencias ni descargas.
 *
 * Se ejecuta a mano (`node scripts/generar-iconos.mjs`) y los PNG resultantes se
 * commitean. No va en el build: son estaticos y no cambian.
 *
 * Dibujo: cuadrado del color de acento con una cruz blanca centrada.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const FONDO = [0x2f, 0x6b, 0x4f]; // --acento
const TRAZO = [0xff, 0xff, 0xff];

function crc32(buf) {
  let c = ~0;
  for (const byte of buf) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function trozo(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, "ascii"), datos]);
  const suma = Buffer.alloc(4);
  suma.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, suma]);
}

function png(lado) {
  // Cruz: brazo del 20% del lado, extension del 56%.
  const grosor = Math.round(lado * 0.2);
  const largoBrazo = Math.round(lado * 0.56);
  const centro = lado / 2;
  const medioGrosor = grosor / 2;
  const medioBrazo = largoBrazo / 2;

  const filas = [];
  for (let y = 0; y < lado; y++) {
    const fila = Buffer.alloc(1 + lado * 3); // 1 byte de filtro por fila
    for (let x = 0; x < lado; x++) {
      const dx = Math.abs(x + 0.5 - centro);
      const dy = Math.abs(y + 0.5 - centro);
      const enCruz =
        (dx <= medioGrosor && dy <= medioBrazo) ||
        (dy <= medioGrosor && dx <= medioBrazo);
      const [r, g, b] = enCruz ? TRAZO : FONDO;
      fila[1 + x * 3] = r;
      fila[2 + x * 3] = g;
      fila[3 + x * 3] = b;
    }
    filas.push(fila);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(lado, 0);
  ihdr.writeUInt32BE(lado, 4);
  ihdr[8] = 8; // profundidad de bits
  ihdr[9] = 2; // color RGB
  // 10..12: compresion, filtro e interlazado, todos 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo("IHDR", ihdr),
    trozo("IDAT", deflateSync(Buffer.concat(filas), { level: 9 })),
    trozo("IEND", Buffer.alloc(0)),
  ]);
}

for (const lado of [180, 192, 512]) {
  const destino = join(PUBLIC, `icono-${lado}.png`);
  writeFileSync(destino, png(lado));
  console.log(`${destino}`);
}
