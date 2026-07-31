import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { HOSPITALS, CHP_PHONE } from "@/lib/hospitals"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Language, SubmissionSnapshot, HospitalId, SubmitStatus } from "@/types/pima-afya"

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

export function SuccessScreen({
  snapshot,
  language,
  selectedHospitalId,
  onHospitalChange,
  onSubmit,
  onCancel,
  status,
}: {
  snapshot: SubmissionSnapshot
  language: Language
  selectedHospitalId: HospitalId | ""
  onHospitalChange: (id: HospitalId) => void
  onSubmit: (isFinal: boolean) => void
  onCancel: () => void
  status: SubmitStatus
}) {
  const submittedDate = new Date(snapshot.submittedAt).toLocaleDateString(
    language === "sw" ? "sw-KE" : "en-KE",
    { year: "numeric", month: "long", day: "numeric" }
  )

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground" data-testid="submitted-date">
        {language === "sw" ? "Iliwasilishwa" : "Submitted"}: {submittedDate}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-muted-foreground">
          {language === "sw" ? "Alama yako" : "Your score"}
        </span>
        <span className="text-3xl font-medium" data-testid="score-value">
          {snapshot.score}
        </span>
        <span className="text-sm text-muted-foreground">/ 7</span>
      </div>

      <Alert
        variant={snapshot.scoreBand === "high" ? "destructive" : "default"}
      >
        <AlertTitle>
          {snapshot.scoreBand === "high" ? "High risk" : "Low risk"}
        </AlertTitle>
        <AlertDescription>
          {COPY[snapshot.scoreBand][language]}
        </AlertDescription>
      </Alert>

      {/* Hospital Selection Section */}
      <div className="flex flex-col gap-2 border-t pt-4">
        <p className="text-sm font-medium">{HOSPITAL_PROMPT[language]}</p>
        <RadioGroup value={selectedHospitalId} onValueChange={(v) => onHospitalChange(v as HospitalId)}>
          {HOSPITALS.map((h) => (
            <label key={h.id} className="flex items-center gap-2 text-sm">
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
          disabled={status === 'saving' || status === 'signing-in'}
        >
          {language === "sw" ? "Ghairi" : "Cancel"}
        </Button>
        <Button 
          onClick={() => onSubmit(true)} 
          disabled={!selectedHospitalId || status === 'saving' || status === 'signing-in'}
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
