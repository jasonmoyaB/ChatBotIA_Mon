export const PATRONES_AJENOS = [
  /\b(capital|bandera|moneda|poblacion) de\b/,
  /\b(presidente|elecciones|partido politico|gobierno)\b/,
  /\b(futbol|resultado deportivo|campeonato|mundial)\b/,
  /\b(clima|pronostico del tiempo)\b/,
  /\b(chiste|poema|cancion|pelicula|serie de television)\b/,
  /\b(javascript|typescript|python|programar|codigo fuente)\b/,
  /\b(cuanto es|suma|resta|multiplica|divide)\s+\d/,
  /\b(receta de cocina|como cocinar|como preparar)\b/,
];

export const PATRONES_MEDICOS = [
  /\b(mama|madre|paciente|ella|le|medico|doctor|doctora|urgencias)\b/,
  /\b(medicamento|medicina|pastilla|dosis|tratamiento|receta|recetaron)\b/,
  /\b(dolor|duele|fiebre|temperatura|nausea|vomit|mareo|sangr|respir|pecho)\w*/,
  /\b(acidez|ardor|estomago|heces|diarrea|estrenimiento|tos|garganta|presion)\b/,
  /\b(comer|comida|alimento|dieta|cafe|tomar|beber|liquido)\w*/,
  /\b(dormir|sueno|banar|caminar|caida|debil|confusion)\w*/,
  /\b(metoclopramida|ondansetron|domperidona|enzypride)\b/,
  /\b(famotidina|solugastril|enalapril|tafil|difenhidramina)\b/,
  /\b(paracetamol|acetaminofen|ibuprofeno|tylex|sertal)\b/,
];

export const PATRONES_DEL_ASISTENTE = [
  /\b(quien eres|que puedes hacer|como puedes ayudar)\b/,
];

export const PATRONES_DE_SEGUIMIENTO = [
  /^[^a-z0-9]*(y|pero|entonces|tambien|cada cuanto|cuanto|cuando|como|cual|por que)\b/,
  /^[^a-z0-9]*(si|no)\b/,
];
