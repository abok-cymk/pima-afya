export const HOSPITALS = [
  { id: 'vihiga', name: { en: 'Vihiga County Referral Hospital', sw: 'Hospitali ya Rufaa ya Kaunti ya Vihiga' }, phone: '07xxxxxxxx' },
  { id: 'mbagathi', name: { en: 'Mbagathi Hospital', sw: 'Hospitali ya Mbagathi' }, phone: '07xxxxxxxx' },
] as const;

export type HospitalId = (typeof HOSPITALS)[number]['id'];
export const CHP_PHONE = '07xxxxxxxx';