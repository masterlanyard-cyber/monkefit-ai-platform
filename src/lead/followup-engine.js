const DAY = 24 * 60 * 60 * 1000;

export function getFollowUpRecommendation(lead, now = new Date()) {
  const updatedAt = new Date(lead.updatedAt || lead.createdAt || now).getTime();
  const ageDays = Math.floor((now.getTime() - updatedAt) / DAY);

  if (['won', 'lost'].includes(lead.status)) {
    return { required: false, reason: `Lead status ${lead.status}` };
  }

  if (lead.category === 'priority' && ageDays >= 1) {
    return { required: true, urgency: 'high', action: 'follow_up_today', reason: 'Priority lead belum ditindaklanjuti dalam 1 hari' };
  }

  if (lead.category === 'hot' && ageDays >= 2) {
    return { required: true, urgency: 'medium', action: 'follow_up_today', reason: 'Hot lead belum ditindaklanjuti dalam 2 hari' };
  }

  if (lead.status === 'quotation_sent' && ageDays >= 3) {
    return { required: true, urgency: 'medium', action: 'check_quotation_feedback', reason: 'Quotation menunggu respons minimal 3 hari' };
  }

  return { required: false, reason: 'Belum masuk jadwal follow-up' };
}
