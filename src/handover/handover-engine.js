export function buildHandoverPayload(lead = {}) {
  return {
    assignedTo: 'Niken',
    channel: 'sales_admin',
    priority: lead.category || 'warm',
    customer: {
      name: lead.name || null,
      phone: lead.phone || null,
      city: lead.city || null,
      companyName: lead.companyName || null
    },
    opportunity: {
      product: lead.product || null,
      quantity: lead.quantity || 1,
      usageType: lead.usageType || null,
      budget: lead.budget || null,
      timeline: lead.timeline || null,
      requestQuotation: Boolean(lead.requestQuotation)
    },
    qualification: {
      score: lead.score || 0,
      category: lead.category || 'cold',
      reasons: lead.reasons || []
    },
    nextAction: lead.requestQuotation ? 'prepare_quotation' : 'sales_follow_up',
    createdAt: new Date().toISOString()
  };
}
