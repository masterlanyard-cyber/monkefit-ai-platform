const PRODUCTS = {
  personal: { product: 'HUSSAR300RS', positioning: 'personal use' },
  semi_commercial: { product: 'HUSSAR800RS', positioning: 'semi commercial' },
  commercial: { product: 'HUSSAR1000RS', positioning: 'commercial' }
};

export function recommendEquipment(input = {}) {
  const usageType = input.usageType || 'personal';
  const base = PRODUCTS[usageType] || PRODUCTS.personal;
  const reasons = [`Sesuai untuk ${base.positioning}`];

  if (input.targetUsers >= 20 && usageType === 'semi_commercial') {
    reasons.push('Target pengguna cukup tinggi untuk studio personal training');
  }
  if (input.powerOutageConcern) reasons.push('Tidak memerlukan listrik saat digunakan');

  return {
    primary: base.product,
    alternative: usageType === 'personal' ? 'HUSSAR800RS' : usageType === 'semi_commercial' ? 'HUSSAR1000RS' : null,
    reasons,
    requiresHumanReview: !PRODUCTS[usageType]
  };
}
