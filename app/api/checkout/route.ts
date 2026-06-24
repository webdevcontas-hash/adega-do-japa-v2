import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPaymentClient } from "@/lib/mercadopago";
import { isStoreOpen } from "@/lib/business-hours";
import { getDeliveryFee } from "@/lib/delivery";

const checkoutSchema = z.object({
  customerName: z.string().min(1),
  phone: z.string().min(8),
  cep: z.string().optional(),
  neighborhood: z.string().optional(),
  address: z.string().min(1),
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive() }))
    .min(1),
});

export async function POST(request: Request) {
  if (!isStoreOpen()) {
    return NextResponse.json({ error: "Fora do horário de funcionamento." }, { status: 409 });
  }

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados do pedido inválidos." }, { status: 400 });
  }

  const { customerName, phone, cep, neighborhood, address, items } = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) }, isAvailable: true },
  });

  if (products.length !== new Set(items.map((item) => item.productId)).size) {
    return NextResponse.json({ error: "Um ou mais produtos não estão disponíveis." }, { status: 400 });
  }

  const deliveryFee = getDeliveryFee(neighborhood);
  const orderItems = items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId)!;
    return { productId: product.id, quantity: item.quantity, price: product.price };
  });
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;

  const order = await prisma.order.create({
    data: {
      customerName,
      phone,
      address,
      neighborhood,
      cep,
      deliveryFee,
      total,
      status: "PENDING",
      items: { create: orderItems },
    },
  });

  try {
    const payment = await getPaymentClient().create({
      body: {
        transaction_amount: total,
        description: `Pedido Adega do Japa #${order.id.slice(-6).toUpperCase()}`,
        payment_method_id: "pix",
        external_reference: order.id,
        notification_url: process.env.NEXT_PUBLIC_BASE_URL
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/webhook`
          : undefined,
        date_of_expiration: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        payer: {
          email: `pedido-${order.id}@adegadojapa.com.br`,
          first_name: customerName,
        },
      },
    });

    const transactionData = payment.point_of_interaction?.transaction_data;
    if (!transactionData?.qr_code || !transactionData?.qr_code_base64) {
      throw new Error("Mercado Pago não retornou os dados do Pix.");
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        pixId: String(payment.id),
        qrCode: transactionData.qr_code,
        qrCodeBase64: transactionData.qr_code_base64,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      total,
      qrCode: transactionData.qr_code,
      qrCodeBase64: transactionData.qr_code_base64,
    });
  } catch (error) {
    await prisma.order.delete({ where: { id: order.id } });
    console.error("[checkout] erro ao gerar pagamento Pix:", error);
    return NextResponse.json({ error: "Não foi possível gerar o pagamento Pix." }, { status: 502 });
  }
}
