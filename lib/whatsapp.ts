type OrderItemForMessage = {
  quantity: number;
  price: number;
  product: { name: string };
};

type OrderForMessage = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  total: number;
  items: OrderItemForMessage[];
};

function buildOrderMessage(order: OrderForMessage) {
  const itemsList = order.items
    .map((item) => `• ${item.quantity}x ${item.product.name} — R$ ${(item.price * item.quantity).toFixed(2)}`)
    .join("\n");

  return [
    `✅ *PEDIDO PAGO* #${order.id.slice(-6).toUpperCase()}`,
    "",
    `Cliente: ${order.customerName}`,
    `Telefone: ${order.phone}`,
    `Endereço: ${order.address}`,
    "",
    itemsList,
    "",
    `Total: R$ ${order.total.toFixed(2)}`,
  ].join("\n");
}

/**
 * Envio modular de WhatsApp. Hoje apenas registra a mensagem nos logs;
 * basta trocar o corpo desta função por uma chamada ao whatsapp-web.js
 * (ou outro provedor) quando o robô estiver conectado.
 */
async function sendWhatsAppMessage(to: string, message: string) {
  console.log(`[whatsapp] para ${to}:\n${message}\n`);
}

export async function notifyOrderPaid(order: OrderForMessage) {
  const message = buildOrderMessage(order);
  const storeNumber = process.env.WHATSAPP_STORE_NUMBER;

  await sendWhatsAppMessage(order.phone, message);
  if (storeNumber) {
    await sendWhatsAppMessage(storeNumber, message);
  }
}
