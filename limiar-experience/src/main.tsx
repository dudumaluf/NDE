import { createRoot } from "react-dom/client";
import App from "./App";
import { initVat } from "./vat/runtime";

// O descriptor VAT ativo (?vat=<nome>, gerado pelo tools/vat-bake.mjs) precisa
// estar resolvido antes do primeiro render: shaders e sim capturam vat() ao montar.
initVat().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
