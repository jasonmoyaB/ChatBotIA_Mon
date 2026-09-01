import { Chat } from "@/components/chat/chat";

// La pagina no se prerenderiza: el proxy decide en cada peticion si hay
// sesion, y una version cacheada en el CDN se serviria sin pasar por el.
export const dynamic = "force-dynamic";

export default function Pagina() {
  return <Chat />;
}
