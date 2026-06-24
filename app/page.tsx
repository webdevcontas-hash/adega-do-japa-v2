import { prisma } from "@/lib/prisma";
import StorefrontV2 from "@/components/v2/StorefrontV2";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { name: "asc" },
  });

  return <StorefrontV2 products={products} />;
}
