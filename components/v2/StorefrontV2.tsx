"use client";

import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { ProductModel } from "@/app/generated/prisma/models";
import AgeGate from "@/components/AgeGate";
import BusinessHoursNotice from "@/components/BusinessHoursNotice";
import { StoreStatusProvider, useStoreStatus } from "@/components/StoreStatusProvider";
import CartDrawer from "@/components/CartDrawer";
import PaymentScreen from "@/components/PaymentScreen";
import HeaderV2 from "@/components/v2/HeaderV2";
import CategoryHubV2 from "@/components/v2/CategoryHubV2";
import ProductCardV2 from "@/components/v2/ProductCardV2";
import { useCart, type CheckoutResult } from "@/lib/useCart";

const CATEGORY_HEADINGS: Record<string, string> = {
  Cervejas: "Cervejas Geladas",
  Destilados: "Destilados Premium",
  Tabacaria: "Artigos de Tabacaria",
  "Combos/Gelo": "Combos e Gelo para a Galera",
};

export default function StorefrontV2({ products }: { products: ProductModel[] }) {
  return (
    <StoreStatusProvider>
      <StorefrontV2Content products={products} />
    </StoreStatusProvider>
  );
}

function StorefrontV2Content({ products }: { products: ProductModel[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [payment, setPayment] = useState<CheckoutResult | null>(null);
  const { cart, itemCount, addToCart, changeQuantity, clear } = useCart();
  const { open } = useStoreStatus();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory && product.category !== selectedCategory) return false;
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const inName = product.name.toLowerCase().includes(query);
        const inDesc = (product.description ?? "").toLowerCase().includes(query);
        const inCategory = product.category.toLowerCase().includes(query);
        return inName || inDesc || inCategory;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  function quantityOf(productId: string) {
    return cart.find((item) => item.productId === productId)?.quantity ?? 0;
  }

  function removeOne(product: ProductModel) {
    changeQuantity(product.id, quantityOf(product.id) - 1);
  }

  function handleCheckoutSuccess(result: CheckoutResult) {
    setPayment(result);
    setDrawerOpen(false);
    clear();
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory(null);
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-background selection:bg-orange-200">
      <AgeGate />

      <div className="flex w-full flex-1 flex-col">
        <HeaderV2
          cartCount={itemCount}
          onCartClick={() => setDrawerOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <BusinessHoursNotice />

        <div className="flex-1 pb-16">
          <CategoryHubV2 selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

          <main className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-black uppercase italic tracking-tight text-slate-800 underline decoration-orange-400 underline-offset-4">
                  {selectedCategory ? CATEGORY_HEADINGS[selectedCategory] ?? selectedCategory : "Todos os Favoritos da Galera"}
                </h3>
                {searchQuery && <p className="mt-1 text-xs text-slate-400">Resultados para &quot;{searchQuery}&quot;</p>}
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-400">
                {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "itens"}
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="mx-auto my-8 max-w-md rounded-3xl border border-orange-100 bg-white p-12 text-center">
                <span className="text-4xl">🔍</span>
                <h4 className="mt-4 font-bold text-slate-800">Nenhum produto encontrado</h4>
                <p className="mt-2 text-xs text-slate-400">
                  Não encontramos correspondências. Tente outros termos ou explore os departamentos acima.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 cursor-pointer rounded-full bg-orange-50 px-4 py-2 text-xs font-extrabold text-orange-600 hover:bg-orange-100"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCardV2
                    key={product.id}
                    product={product}
                    quantityInCart={quantityOf(product.id)}
                    onAdd={addToCart}
                    onRemoveOne={removeOne}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Carrinho flutuante (mobile) */}
      {itemCount > 0 && (
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir carrinho"
          className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-30 flex animate-pulse cursor-pointer items-center justify-center rounded-full bg-orange-500 p-4 text-white shadow-xl hover:bg-orange-600 md:hidden"
        >
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 text-[10px] font-black text-white shadow-sm">
            {itemCount}
          </span>
        </button>
      )}

      {/* Rodapé com status das lojas */}
      <footer className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-white px-4 py-5 md:flex-row md:px-8">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${open ? "animate-ping bg-emerald-500" : "bg-red-500"}`} />
          <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">
            {open ? "Aberto agora — entregando gelado" : "Fechado no momento"}
          </span>
        </div>
        <div className="flex items-center gap-4 rounded-full border border-orange-100 bg-orange-50 px-5 py-2.5 text-center shadow-inner">
          <p className="text-xs font-extrabold text-orange-700">🚚 Entrega rápida e gelada na sua região!</p>
          <div className="flex h-6 w-6 select-none items-center justify-center rounded-full bg-orange-200 text-xs">🚀</div>
        </div>
      </footer>

      <CartDrawer
        isOpen={drawerOpen}
        items={cart}
        onClose={() => setDrawerOpen(false)}
        onChangeQuantity={changeQuantity}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      {payment && (
        <PaymentScreen
          orderId={payment.orderId}
          qrCode={payment.qrCode}
          qrCodeBase64={payment.qrCodeBase64}
          total={payment.total}
          onClose={() => setPayment(null)}
        />
      )}
    </div>
  );
}
