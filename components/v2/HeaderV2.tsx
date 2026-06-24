import { Search, MapPin, ShoppingCart } from "lucide-react";

export default function HeaderV2({
  cartCount,
  onCartClick,
  searchQuery,
  setSearchQuery,
}: {
  cartCount: number;
  onCartClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  return (
    <header className="sticky top-0 z-40 flex flex-col items-center justify-between gap-4 border-b border-orange-100 bg-white px-4 py-4 shadow-sm md:flex-row md:px-8">
      {/* Marca */}
      <div className="flex w-full items-center justify-between md:w-auto md:justify-start">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-xl font-black italic text-white shadow-md shadow-red-200">
            A
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight text-slate-800">
            ADEGA <span className="text-red-600">DO JAPA</span>
          </h1>
        </div>

        <button
          onClick={onCartClick}
          aria-label="Abrir carrinho"
          className="relative cursor-pointer rounded-full bg-orange-50 p-2 text-orange-600 transition-all hover:bg-orange-100 md:hidden"
        >
          <ShoppingCart className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 animate-bounce rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Busca */}
      <div className="w-full max-w-md flex-1 px-0 md:px-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="O que você procura? (cerveja, whisky, charuto...)"
            className="w-full rounded-full border-2 border-transparent bg-slate-100 py-2.5 pl-11 pr-5 text-sm text-slate-700 transition-all focus:border-orange-400 focus:bg-white focus:outline-none"
          />
          <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Localização + carrinho (desktop) */}
      <div className="hidden items-center gap-6 md:flex">
        <button
          onClick={onCartClick}
          className="group cursor-pointer rounded-xl p-2 text-left transition-colors hover:bg-slate-50"
        >
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-red-500" />
            <p className="text-[10px] font-bold uppercase leading-none text-slate-400">Entregar em</p>
          </div>
          <p className="text-sm font-bold text-slate-700 transition-colors group-hover:text-orange-600">
            Informe seu endereço
          </p>
        </button>

        <button
          onClick={onCartClick}
          aria-label="Abrir carrinho"
          className="relative flex cursor-pointer items-center justify-center rounded-full bg-orange-50 p-3.5 text-orange-600 shadow-sm transition-all hover:scale-105 hover:bg-orange-100 active:scale-95"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
