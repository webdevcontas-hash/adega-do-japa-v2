import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const products = [
  // ── Cervejas ──────────────────────────────────────────────────────────────
  { name: "Brahma Pilsen — Lata 350ml",               category: "Cervejas",    price: 5.90,  description: "A cerveja do povo. Refrescante e fácil de beber." },
  { name: "Skol Pilsen — Lata 350ml",                 category: "Cervejas",    price: 5.90,  description: "Leve, gelada, essa desce redondo." },
  { name: "Heineken — Long Neck 355ml",               category: "Cervejas",    price: 10.90, description: "Premium holandesa, amarga na medida certa." },
  { name: "Cerveja Império — Long Neck 355ml",        category: "Cervejas",    price: 8.90,  description: "Mineira encorpada, sabor marcante." },
  { name: "Original — Garrafa 600ml",                 category: "Cervejas",    price: 13.90, description: "Pilsen brasileira com corpo e cor dourada." },
  { name: "Budweiser — Long Neck 355ml",              category: "Cervejas",    price: 9.90,  description: "King of Beers. Leve, suave e refrescante." },
  { name: "Corona Extra — Long Neck 355ml",           category: "Cervejas",    price: 11.90, description: "Mexicana com aquela fatia de limão." },
  { name: "Stella Artois — Long Neck 330ml",          category: "Cervejas",    price: 10.90, description: "Belga premium, sabor sofisticado e suave." },
  { name: "IPA Lúpulo Selvagem — Garrafa 500ml",     category: "Cervejas",    price: 16.90, description: "Amargor marcante e aroma cítrico intenso. Artesanal." },
  { name: "Brahma Zero Álcool — Lata 350ml",         category: "Cervejas",    price: 6.90,  description: "Todo o sabor Brahma, sem o álcool." },
  { name: "Six Pack Brahma Pilsen — 6 latas 350ml",  category: "Cervejas",    price: 32.90, description: "Pacote econômico para a rodada completa." },
  { name: "Six Pack Heineken — 6 long necks 355ml",  category: "Cervejas",    price: 59.90, description: "Pack premium para a galera." },

  // ── Destilados ────────────────────────────────────────────────────────────
  { name: "Johnnie Walker Red Label — 1L",            category: "Destilados",  price: 129.90, description: "Blended scotch. Fácil de beber, ótimo para highball com gelo." },
  { name: "Johnnie Walker Black Label — 750ml",       category: "Destilados",  price: 189.90, description: "12 anos de envelhecimento, sabor rico e defumado." },
  { name: "Jack Daniel's Tennessee Whiskey — 1L",    category: "Destilados",  price: 159.90, description: "Old No. 7. Filtrado em carvão de bordo, suave e adocicado." },
  { name: "Absolut Vodka — 1L",                       category: "Destilados",  price: 89.90,  description: "Destilação contínua sueca, pura e versátil para drinks." },
  { name: "Smirnoff Vodka — 1L",                      category: "Destilados",  price: 69.90,  description: "Tripla destilação, sabor limpo e equilibrado." },
  { name: "Gin Tanqueray — 750ml",                    category: "Destilados",  price: 119.90, description: "Quadrupla destilação, notas de zimbro, coentro e regaliz." },
  { name: "Gin Hendrick's — 750ml",                   category: "Destilados",  price: 179.90, description: "Infusão de pepino e rosa. Inusitado e sofisticado." },
  { name: "Ballantine's Finest — 1L",                 category: "Destilados",  price: 109.90, description: "Blended scotch suave, ótimo custo-benefício." },
  { name: "Saquê Ozeki Nigori — 750ml",               category: "Destilados",  price: 79.90,  description: "Sake não filtrado, cremoso e levemente adocicado." },
  { name: "Saquê Hakutsuru Junmai — 720ml",           category: "Destilados",  price: 99.90,  description: "Premium junmai, encorpado com final seco e limpo." },
  { name: "Cachaça 51 — 1L",                          category: "Destilados",  price: 34.90,  description: "A mais vendida do Brasil. Perfeita para caipirinha." },
  { name: "Cachaça Ypióca Ouro — 1L",                category: "Destilados",  price: 49.90,  description: "Envelhecida em barril de carvalho, sabor amadeirado." },
  { name: "Tequila Jose Cuervo Prata — 750ml",        category: "Destilados",  price: 109.90, description: "100% agave. O clássico dos shots e margaritas." },

  // ── Tabacaria ─────────────────────────────────────────────────────────────
  // Essências Zomo
  { name: "Zomo Exotic Flowers — 50g",                category: "Tabacaria",   price: 24.90,  description: "Mistura floral tropical com toque adocicado. Um dos mais vendidos." },
  { name: "Zomo Double Apple — 50g",                  category: "Tabacaria",   price: 24.90,  description: "Maçã dupla clássica, fumaça densa e saborosa." },
  { name: "Zomo Black Ice — 50g",                     category: "Tabacaria",   price: 24.90,  description: "Menta intensa com toque gelado que refresca." },
  { name: "Zomo Monster Energy — 50g",                category: "Tabacaria",   price: 27.90,  description: "Sabor energético marcante, muito pedido nas sessões." },
  { name: "Zomo Mint Ice — 50g",                      category: "Tabacaria",   price: 24.90,  description: "Menta pura, gelada e refrescante do começo ao fim." },
  { name: "Zomo Blueberry Ice — 50g",                 category: "Tabacaria",   price: 24.90,  description: "Mirtilo com toque gelado. Doce e refrescante." },
  // Essências Adalya
  { name: "Adalya Love 66 — 50g",                     category: "Tabacaria",   price: 32.90,  description: "Morango com menta e chiclete. O mais famoso da Adalya." },
  { name: "Adalya Cherry Mints — 50g",                category: "Tabacaria",   price: 32.90,  description: "Cereja com hortelã gelado. Fumô longo e saboroso." },
  { name: "Adalya Watermelon Ice — 50g",              category: "Tabacaria",   price: 32.90,  description: "Melancia fresca com gelo. Perfeito para o verão." },
  { name: "Adalya Ice Peach — 50g",                   category: "Tabacaria",   price: 32.90,  description: "Pêssego suave com menta fria, bastante procurado." },
  // Essências Sense
  { name: "Sense Two Apples — 50g",                   category: "Tabacaria",   price: 26.90,  description: "Maçã dupla árabe clássica, fumô denso e equilibrado." },
  { name: "Sense Summer Mix — 50g",                   category: "Tabacaria",   price: 26.90,  description: "Mix de frutas tropicais, leve e agradável." },
  // Outros tabacaria
  { name: "Carvão Cocoboco para Narguilé — 1kg",      category: "Tabacaria",   price: 29.90,  description: "Natural de coco, sem autoacendimento, queima longa e uniforme." },
  { name: "Carvão Autoacendível — Pacote 40 discos",  category: "Tabacaria",   price: 14.90,  description: "Acende rápido na chama, prático para uso imediato." },
  { name: "Piteira Lavoo de Vidro — Unidade",         category: "Tabacaria",   price: 8.90,   description: "Vidro borossilicato, lavável e reutilizável." },
  { name: "Isqueiro Clipper Turbo — Unidade",         category: "Tabacaria",   price: 12.90,  description: "Chama turbo regulável, recarregável." },
  { name: "Charuto Dannemann Speciale — Unidade",     category: "Tabacaria",   price: 22.90,  description: "Charuto médio brasileiro, sabor suave e equilibrado." },
  { name: "Cigarro de Palha Caburé — Maço",           category: "Tabacaria",   price: 9.90,   description: "Artesanal, tabaco virgínia selecionado." },

  // ── Combos / Gelo ─────────────────────────────────────────────────────────
  { name: "Saco de Gelo em Cubos — 2kg",              category: "Combos/Gelo", price: 9.90,   description: "Gelo filtrado, ideal para drinks e geladeiras portáteis." },
  { name: "Balde de Gelo com Alça — 5kg",             category: "Combos/Gelo", price: 19.90,  description: "Para quem não pode deixar a bebida esquentar nunca." },
  { name: "Combo Churrasco — Brahma 12 latas + 5kg gelo", category: "Combos/Gelo", price: 79.90, description: "Tudo para o fim de semana não faltar cerveja gelada." },
  { name: "Combo Heineken + Gelo — 6 long necks + 2kg", category: "Combos/Gelo", price: 74.90, description: "Premium pronto para servir." },
  { name: "Combo Narguilé Completo",                  category: "Combos/Gelo", price: 79.90,  description: "1 essência Zomo + carvão cocoboco + piteira. Só montar e fumar." },
  { name: "Combo Drinks de Verão — Absolut + suco + gelo", category: "Combos/Gelo", price: 109.90, description: "Vodka Absolut 1L + sucos variados + 2kg de gelo." },
  { name: "Combo Whisky Night — JW Red + gelo",       category: "Combos/Gelo", price: 149.90, description: "Johnnie Walker Red Label 1L + balde de gelo 5kg." },
  { name: "Combo Gin Tônica — Tanqueray + tônica",    category: "Combos/Gelo", price: 139.90, description: "Gin Tanqueray 750ml + 4 tônicas + gelo. Só adicionar limão." },
];

async function main() {
  await prisma.product.deleteMany();
  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log(`${products.length} produtos cadastrados.`);

  const created = await prisma.product.findMany({ select: { id: true, name: true } });
  const find = (kw: string) => created.find((p) => p.name.toLowerCase().includes(kw.toLowerCase()))?.id;

  // Settings padrão
  const defaultSettings = [
    { key: "deliveryTime",       value: "30-45 min" },
    { key: "businessHoursOpen",  value: "18" },
    { key: "businessHoursClose", value: "3" },
    { key: "whatsappNumber",     value: "" },
    { key: "deliveryDefaultFee", value: "12" },
  ];
  for (const s of defaultSettings) {
    await prisma.setting.upsert({ where: { key: s.key }, create: s, update: {} });
  }
  console.log("Settings configurados.");

  // Zonas de entrega
  await prisma.deliveryZone.deleteMany();
  await prisma.deliveryZone.createMany({
    data: [
      { neighborhood: "Centro",        fee: 5  },
      { neighborhood: "Jardim Europa", fee: 7  },
      { neighborhood: "Vila Nova",     fee: 8  },
      { neighborhood: "Boa Vista",     fee: 10 },
    ],
  });
  console.log("Zonas de entrega configuradas.");

  // Cupons de exemplo
  await prisma.coupon.deleteMany();
  await prisma.coupon.createMany({
    data: [
      { code: "PRIMEIROPEDIDO", type: "percent", value: 10, minOrder: 30, maxUses: null },
      { code: "MT15",           type: "fixed",   value: 15, minOrder: 50, maxUses: 100 },
    ],
  });
  console.log("2 cupons de exemplo criados.");

  // Kits
  await prisma.kit.deleteMany();
  const kits = [
    {
      name: "Kit Churrasco 🔥",
      description: "Brahma 12 latas geladas + balde de gelo. A galera não passa sede.",
      emoji: "🔥",
      items: JSON.stringify([
        { productId: find("Six Pack Brahma"),   quantity: 2 },
        { productId: find("Balde de Gelo"),     quantity: 1 },
        { productId: find("Isqueiro Clipper"),  quantity: 1 },
      ].filter((i) => i.productId)),
    },
    {
      name: "Kit Noite de Card Game 🃏",
      description: "JW Red Label + gelo para manter a concentração.",
      emoji: "🃏",
      items: JSON.stringify([
        { productId: find("Johnnie Walker Red"), quantity: 1 },
        { productId: find("Saco de Gelo"),       quantity: 2 },
      ].filter((i) => i.productId)),
    },
    {
      name: "Kit Verão na Piscina ☀️",
      description: "Absolut + drinks + gelo para curtir o calor.",
      emoji: "☀️",
      items: JSON.stringify([
        { productId: find("Absolut"),            quantity: 1 },
        { productId: find("Combo Drinks"),       quantity: 1 },
        { productId: find("Saco de Gelo"),       quantity: 2 },
      ].filter((i) => i.productId)),
    },
    {
      name: "Kit Happy Hour Gin 🍸",
      description: "Tanqueray + tônicas + gelo. Só adicionar o limão.",
      emoji: "🍸",
      items: JSON.stringify([
        { productId: find("Tanqueray"),          quantity: 1 },
        { productId: find("Saco de Gelo"),       quantity: 1 },
      ].filter((i) => i.productId)),
    },
    {
      name: "Kit Narguilé Pronto 💨",
      description: "Essência Zomo + carvão cocoboco + piteira. Só montar.",
      emoji: "💨",
      items: JSON.stringify([
        { productId: find("Zomo Exotic"),        quantity: 1 },
        { productId: find("Cocoboco"),           quantity: 1 },
        { productId: find("Piteira"),            quantity: 1 },
      ].filter((i) => i.productId)),
    },
  ].filter((k) => JSON.parse(k.items).length > 0);

  for (const kit of kits) {
    await prisma.kit.create({ data: kit });
  }
  console.log(`${kits.length} kits criados.`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
