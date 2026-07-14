const PUBLIC_PRICES = {
  HUSSAR300RS: 10920000,
  HUSSAR800RS: 18490000,
  HUSSAR1000RS: 24830000,
  MANDRILL: 6870000,
  ROWING_MACHINE: 10020000
};

export function buildQuotation(input = {}) {
  const items = (input.items || []).map((item) => {
    const unitPrice = PUBLIC_PRICES[item.product] || null;
    const quantity = Number(item.quantity || 1);
    return {
      product: item.product,
      quantity,
      unitPrice,
      subtotal: unitPrice ? unitPrice * quantity : null,
      requiresPriceReview: !unitPrice
    };
  });

  const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const freightEstimate = { min: 500000, max: 1500000, finalRequiresConfirmation: true };

  return {
    quotationId: `QUO-${Date.now()}`,
    customer: input.customer || {},
    items,
    subtotal,
    freightEstimate,
    warranty: '1 tahun spare part dan service',
    technicianTransport: 300000,
    leadTime: '5-7 hari kerja, tergantung stok dan lokasi',
    payment: input.isProject
      ? 'PO, DP 50%, pelunasan 50% sesuai ketentuan'
      : 'Transfer bank atau kartu kredit; marketplace mengikuti metode platform',
    status: 'draft_for_niken_review',
    createdAt: new Date().toISOString()
  };
}
