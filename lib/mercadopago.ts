import { MercadoPagoConfig, Payment } from "mercadopago";

function getAccessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado no .env");
  }
  return token;
}

export function getPaymentClient() {
  const config = new MercadoPagoConfig({ accessToken: getAccessToken() });
  return new Payment(config);
}
