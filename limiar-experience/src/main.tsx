import { createRoot } from "react-dom/client";
import App from "./App";
import { initVat } from "./vat/runtime";
import { loadContent } from "./data/contentStore";

// O descriptor VAT ativo (?vat=<nome>, gerado pelo tools/vat-bake.mjs) precisa
// estar resolvido antes do primeiro render: shaders e sim capturam vat() ao
// montar. O content/ (corpus real) também: os atributos da multidão e os fios
// nascem certos em vez de re-montar depois do primeiro frame.
Promise.all([initVat(), loadContent()]).then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
