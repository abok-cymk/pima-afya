import type { QuestionId } from '@/types/pima-afya';

export interface Question {
  id: QuestionId;
  text: { en: string; sw: string };
  yesLabel: { en: string; sw: string };
  noLabel: { en: string; sw: string };
  points: { yes: number; no: number };
}

export const QUESTIONS: Question[] = [
  {
    id: 'age',
    text: { en: 'What is your age?', sw: 'Umri wako ni nini?' },
    yesLabel: { en: '40 years and above', sw: 'Miaka 40 na zaidi' },
    noLabel: { en: 'Below 40', sw: 'Chini ya miaka 40' },
    points: { yes: 1, no: 0 },
  },
  {
    id: 'gender',
    text: { en: 'Your gender?', sw: 'Jinsia yako?' },
    yesLabel: { en: 'Male', sw: 'Mwanaume' },
    noLabel: { en: 'Female', sw: 'Mwanamke' },
    points: { yes: 1, no: 0 },
  },
  {
    id: 'familyHistory',
    text: {
      en: 'Has any relative suffered from or died of complications related to diabetes?',
      sw: 'Je, yeyote wa jamaa yako ameugua au kufa kutokana na matatizo yanayohusiana na kisukari?',
    },
    yesLabel: { en: 'Yes', sw: 'Ndio' },
    noLabel: { en: 'No', sw: 'La' },
    points: { yes: 1, no: 0 },
  },
  {
    id: 'alcoholOrSmoking',
    text: {
      en: 'Do you currently drink alcohol or smoke cigarettes?',
      sw: 'Je, kwa sasa unakunywa pombe au kuvuta sigara?',
    },
    yesLabel: { en: 'Yes', sw: 'Ndio' },
    noLabel: { en: 'No', sw: 'La' },
    points: { yes: 1, no: 0 },
  },
  {
    id: 'weight',
    text: { en: 'How do you feel about your weight?', sw: 'Unahisije kuhusu uzito wako?' },
    yesLabel: { en: 'Heavy', sw: 'Mzito' },
    noLabel: { en: 'Okay / slim', sw: 'Sawa / mwembamba' },
    points: { yes: 1, no: 0 },
  },
  {
    id: 'hypertension',
    text: {
      en: 'Have you been diagnosed with hypertension or are you on medication for a chronic disease?',
      sw: 'Je, umegunduliwa na shinikizo la damu au uko kwenye dawa ya ugonjwa sugu?',
    },
    yesLabel: { en: 'Yes', sw: 'Ndio' },
    noLabel: { en: 'No', sw: 'La' },
    points: { yes: 1, no: 0 },
  },
  {
    id: 'physicalActivity',
    text: {
      en: 'Do you engage in at least 30 minutes of physical activity daily?',
      sw: 'Je, unajihusisha na angalau dakika 30 za mazoezi ya viungo kila siku?',
    },
    yesLabel: { en: 'Yes', sw: 'Ndio' },
    noLabel: { en: 'No', sw: 'La' },
    points: { yes: 0, no: 1 }, // reversed — being active is protective
  },
];