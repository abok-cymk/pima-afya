import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { HOSPITALS, CHP_PHONE } from "@/lib/hospitals"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { normalizeKenyanPhone } from '@/lib/phone';
import type { Language, SubmissionSnapshot, HospitalId, SubmitStatus, RiskBand } from "@/types/pima-afya"
import { cn } from "@/lib/utils";

const COPY = {
  high: {
    en: "Based on your score, you're likely to have prediabetes, but only your doctor can diagnose it for sure.",
    sw: "Kulingana na alama yako, una uwezekano wa kuwa na ugonjwa wa kisukari, lakini ni daktari wako pekee anayeweza kuugundua kwa hakika.",
  },
  low: {
    en: "Based on your score, you're likely not to have prediabetes, but only your doctor can diagnose it for sure.",
    sw: "Kulingana na alama yako, una uwezekano wa kutokuwa na ugonjwa wa kisukari, lakini ni daktari wako pekee anayeweza kuugundua kwa hakika.",
  },
}

const HOSPITAL_PROMPT = {
  en: 'Select your nearest hospital for further assessment',
  sw: 'Chagua hospitali yako iliyo karibu kwa tathmini zaidi',
};

const PRIVACY_MESSAGE = {
  en: 'Your data is collected securely and will only be shared with your selected hospital and health providers for your clinical follow-up and care coordination.',
  sw: 'Data zako zinakusanywa kwa usalama na zitashirikiwa tu na hospitali uliyochagua na watoa huduma wa afya kwa ajili ya ufuatiliaji wako wa kliniki na uratibu wa huduma.',
};

const PHONE_LABEL = {
  en: 'Phone number',
  sw: 'Nambari ya simu',
};

const PHONE_PLACEHOLDER = {
  en: '0712345678 or +254712345678',
  sw: '0712345678 au +254712345678',
};

const PHONE_HELPER = {
  en: 'Use a Kenyan mobile number.',
  sw: 'Tumia nambari ya simu ya Kenya.',
};

const PHONE_ERROR = {
  country: {
    en: 'This app is not available in your country yet.',
    sw: 'Programu hii bado haipatikani katika nchi yako.',
  },
  format: {
    en: 'Enter a valid Kenyan phone number.',
    sw: 'Weka nambari halali ya simu ya Kenya.',
  },
} as const;

export function SuccessScreen({
  snapshot,
  score,
  riskBand,
  language,
  phone,
  phoneError,
  onPhoneChange,
  onPhoneBlur,
  selectedHospitalId,
  onHospitalChange,
  onSubmit,
  onCancel,
  status,
}: {
  snapshot: SubmissionSnapshot | null
  score: number
  riskBand: RiskBand
  language: Language
  phone: string
  phoneError: string | null
  onPhoneChange: (value: string) => void
  onPhoneBlur: () => void
  selectedHospitalId: HospitalId | ""
  onHospitalChange: (id: HospitalId) => void
  onSubmit: (isFinal: boolean) => void
  onCancel: () => void
  status: SubmitStatus
}) {
  const submittedDate = snapshot 
    ? new Date(snapshot.submittedAt).toLocaleString(
        language === "sw" ? "sw-KE" : "en-KE",
        { year: "numeric", month: "long", day: "numeric", hour: '2-digit', minute: '2-digit' }
      )
    : null

  const phoneStatus = normalizeKenyanPhone(phone)
  const displayScore = snapshot ? snapshot.score : score
  const displayRiskBand = snapshot ? snapshot.scoreBand : riskBand

  return (
    <div className="flex flex-col gap-4">
      {submittedDate && (
        <p className="text-sm text-muted-foreground" data-testid="submitted-date">
          {language === "sw" ? "Iliwasilishwa" : "Submitted"}: {submittedDate}
        </p>
      )}
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-muted-foreground">
          {language === "sw" ? "Alama yako" : "Your score"}
        </span>
        <span className="text-3xl font-medium" data-testid="score-value">
          {displayScore}
        </span>
        <span className="text-sm text-muted-foreground">/ 7</span>
      </div>

      <Alert
        variant={displayRiskBand === "high" ? "destructive" : "default"}
        className={cn(
          
        )}
      >
        <AlertTitle>
          {displayRiskBand === "high" ? (language === 'sw' ? 'Hatari kubwa' : 'High risk') : (language === 'sw' ? 'Hatari ndogo' : 'Low risk')}
        </AlertTitle>
        <AlertDescription>
          {COPY[displayRiskBand][language]}
        </AlertDescription>
      </Alert>

      {/* Phone Number Section */}
      <div className="flex flex-col gap-2 border-t pt-4">
        <label className="text-sm font-medium" htmlFor="participant-phone">
          {PHONE_LABEL[language]}
        </label>
        <input
          id="participant-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          onBlur={onPhoneBlur}
          placeholder={PHONE_PLACEHOLDER[language]}
          aria-invalid={Boolean(phoneError)}
          aria-describedby="participant-phone-help participant-phone-error"
          className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <p id="participant-phone-help" className="text-xs text-muted-foreground">
          {PHONE_HELPER[language]}
        </p>
        <p id="participant-phone-error" className="min-h-5 text-xs text-destructive">
          {phoneError
            ? phoneError
            : !phoneStatus.ok && phone.trim()
              ? PHONE_ERROR[phoneStatus.reason][language]
              : ''}
        </p>
      </div>

      {/* Hospital Selection Section */}
      <div className="flex flex-col gap-2 border-t pt-4">
        <p className="text-sm font-medium">{HOSPITAL_PROMPT[language]}</p>
        <RadioGroup value={selectedHospitalId} onValueChange={(v) => onHospitalChange(v as HospitalId)}>
          {HOSPITALS.map((h) => (
            <label key={h.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors">
              <RadioGroupItem value={h.id} />
              {h.name[language]} — {h.phone}
            </label>
          ))}
        </RadioGroup>
        <div className="text-sm text-muted-foreground">CHP: {CHP_PHONE}</div>
      </div>

      {/* Privacy Message */}
      <p className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded">
        {PRIVACY_MESSAGE[language]}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={status === 'saving'}
        >
          {language === "sw" ? "Ghairi" : "Cancel"}
        </Button>
        <Button 
          onClick={() => onSubmit(true)} 
          disabled={!selectedHospitalId || !phoneStatus.ok || status === 'saving'}
          className="flex-1"
        >
          {status === 'saving'
            ? (language === "sw" ? "Inahifadhiwa..." : "Saving...")
            : (language === "sw" ? "Wasilisha matokeo" : "Submit results")}
        </Button>
      </div>

      {status === 'error' && (
        <p className="text-sm text-destructive">
          {language === 'sw' ? 'Hitilafu imetokea — tafadhali jaribu tena.' : 'Something went wrong — please try again.'}
        </p>
      )}
    </div>
  )
}
