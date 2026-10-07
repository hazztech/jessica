import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '../lib/router.jsx';
import {
  ITEM_TYPES, STEPS, allStaticFields, budgetFields, commonDetailFields, contactFields,
  inspirationField, requestDetailFields, visionFields, BUDGETS,
} from '../data/customRequestForm.js';
import { applyChange, cleanSelections, defaultValues, summarize, validate } from '../lib/customization.js';
import { load, save } from '../lib/storage.js';
import { submitCustomRequest } from '../services/customRequests.js';
import { useToast } from '../context/ToastContext.jsx';
import FormStepper from '../components/FormStepper.jsx';
import ItemTypePicker from '../components/ItemTypePicker.jsx';
import FieldRenderer from '../components/customization/FieldRenderer.jsx';
import CustomOrderProcess from '../components/CustomOrderProcess.jsx';
import RequestReview from '../components/RequestReview.jsx';
import Ornament from '../components/Ornament.jsx';
import Button from '../components/Button.jsx';
import { getCategory } from '../data/categories.js';
import '../components/customization/Customization.css';
import './CustomOrderPage.css';

const DRAFT_KEY = 'jcsa-custom-request-draft-v1';
const REVIEW = STEPS.length; // step index of the review screen

const freshState = (preselect) => ({
  step: 0,
  furthest: 0,
  itemTypes: preselect ? [preselect] : [],
  answers: defaultValues(allStaticFields),
  details: preselect ? { [preselect]: defaultValues(requestDetailFields(preselect)) } : {},
});

export default function CustomOrderPage() {
  const { query, navigate } = useRouter();
  const toast = useToast();
  const preselect = ITEM_TYPES.some((t) => t.id === query.get('type')) ? query.get('type') : null;

  const [restored, setRestored] = useState(false);
  const [state, setState] = useState(() => {
    const draft = load(DRAFT_KEY, null);
    if (draft && !preselect) {
      setTimeout(() => setRestored(true));
      // files can't survive a reload — start the upload step empty
      return { ...draft, answers: { ...draft.answers, inspiration: [] } };
    }
    return freshState(preselect);
  });
  const [errors, setErrors] = useState({ type: '', answers: {}, details: {} });
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef(null);
  const firstRender = useRef(true);

  const { step, furthest, itemTypes, answers, details } = state;

  // Save progress (minus files) so a refresh doesn't lose the customer's work
  useEffect(() => {
    save(DRAFT_KEY, { ...state, answers: { ...answers, inspiration: [] } });
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Move focus to the new step heading for keyboard & screen-reader users
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus({ preventScroll: true });
    document.getElementById('wizard')?.scrollIntoView({ block: 'start' });
  }, [step]);

  /* ---------- updates ---------- */
  const setAnswer = (id, value) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: value } }));
    if (errors.answers[id]) setErrors((e) => ({ ...e, answers: { ...e.answers, [id]: undefined } }));
  };
  const setDetail = (cat) => (id, value) => {
    setState((s) => ({
      ...s,
      details: { ...s.details, [cat]: applyChange(requestDetailFields(cat), s.details[cat] || {}, id, value) },
    }));
  };
  const setItemTypes = (types) => {
    setState((s) => {
      const nextDetails = { ...s.details };
      types.forEach((t) => { if (!nextDetails[t]) nextDetails[t] = defaultValues(requestDetailFields(t)); });
      return { ...s, itemTypes: types, details: nextDetails };
    });
    if (types.length) setErrors((e) => ({ ...e, type: '' }));
  };

  /* ---------- validation per step ---------- */
  const fieldsForStep = (i) =>
    ({ 1: visionFields, 2: [inspirationField], 3: commonDetailFields, 4: budgetFields, 5: contactFields }[i] || []);

  const validateStep = (i) => {
    if (i === 0) {
      const type = itemTypes.length ? '' : 'Choose at least one item type to continue.';
      setErrors({ type, answers: {}, details: {} });
      return !type;
    }
    const errs = validate(fieldsForStep(i), answers);
    setErrors({ type: '', answers: errs, details: {} });
    const firstId = Object.keys(errs)[0];
    if (firstId) {
      const el = document.getElementById(`field-${firstId}`);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el?.querySelector('input, select, textarea')?.focus({ preventScroll: true });
      return false;
    }
    return true;
  };

  const goTo = (i) => setState((s) => ({ ...s, step: i, furthest: Math.max(s.furthest, i) }));
  const next = () => { if (validateStep(step)) goTo(step + 1); };
  const back = () => goTo(Math.max(0, step - 1));

  /* ---------- review data ---------- */
  const review = useMemo(() => {
    if (step !== REVIEW) return null;
    const vision = cleanSelections(visionFields, answers);
    return {
      itemTypes,
      vision: summarize(visionFields, vision),
      images: answers.inspiration || [],
      details: itemTypes.map((cat) => {
        const fields = requestDetailFields(cat);
        return { category: cat, rows: summarize(fields, cleanSelections(fields, details[cat] || {})) };
      }),
      common: summarize(commonDetailFields, cleanSelections(commonDetailFields, answers)),
      budget: summarize(budgetFields, cleanSelections(budgetFields, answers)),
      contact: summarize(contactFields, cleanSelections(contactFields, answers)),
    };
  }, [step, answers, details, itemTypes]);

  /* ---------- submit ---------- */
  const submit = async () => {
    // re-check every step in case something was edited into an invalid state
    for (let i = 0; i < STEPS.length; i++) {
      if (!validateStep(i)) { goTo(i); return; }
    }
    setSubmitting(true);
    try {
      const vision = cleanSelections(visionFields, answers);
      const common = cleanSelections(commonDetailFields, answers);
      const budget = cleanSelections(budgetFields, answers);
      const contact = cleanSelections(contactFields, answers);
      const cleanDetails = Object.fromEntries(
        itemTypes.map((cat) => [cat, cleanSelections(requestDetailFields(cat), details[cat] || {})])
      );
      const detailSummary = itemTypes.map((cat) => ({
        category: cat,
        items: summarize(requestDetailFields(cat), cleanDetails[cat]),
      }));
      const request = await submitCustomRequest({
        itemTypes,
        occasion: vision.occasion || null,
        styleTheme: vision.styleTheme || null,
        colors: vision.colors || [],
        colorNotes: vision.colorNotes || '',
        description: vision.description,
        personalization: common.names || '',
        designElements: common.designElements || [],
        quantity: Number(common.quantity || 1),
        additionalRequests: common.additionalRequests || '',
        sizes: detailSummary.flatMap((d) =>
          d.items.filter((r) => /size/i.test(r.fieldId)).map((r) => ({ category: d.category, label: r.label, value: r.value }))
        ),
        details: cleanDetails,
        detailSummary,
        visionSummary: summarize(visionFields, vision),
        commonSummary: summarize(commonDetailFields, common),
        budget: budget.budget,
        budgetLabel: BUDGETS.find((b) => b.value === budget.budget)?.label,
        requestedDate: budget.requestedDate || null,
        rushRequested: !!budget.rushRequested,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone || '',
        preferredContactMethod: contact.preferredContactMethod,
        agree: contact.agree,
        inspiration: answers.inspiration || [],
      });
      localStorage.removeItem(DRAFT_KEY);
      navigate(`/custom-orders/success?ref=${request.requestId}`);
    } catch (err) {
      console.error(err);
      toast('Your request couldn’t be sent. Check your connection and try again.');
      setSubmitting(false);
    }
  };

  const startOver = () => {
    localStorage.removeItem(DRAFT_KEY);
    setState(freshState(null));
    setRestored(false);
    setErrors({ type: '', answers: {}, details: {} });
  };

  const current = STEPS[step];

  return (
    <div className="co">
      <header className="co__hero">
        <div className="container co__hero-inner">
          <h1>Create Your Custom Order</h1>
          <Ornament />
          <p className="co__tagline">Your Vision. Our Creativity. One-of-a-Kind Designs.</p>
          <p className="co__intro">
            Custom shoes, apparel and accessories made just for you. Tell us about your vision and let’s
            create something amazing together.
          </p>
        </div>
      </header>

      <div className="container co__layout">
        <div className="co__main" id="wizard">
          {restored && (
            <div className="co__restored" role="status">
              <span>We saved your progress from last time.</span>
              <button type="button" onClick={startOver}>Start over</button>
            </div>
          )}

          <FormStepper steps={STEPS} current={step} furthest={furthest} onSelect={goTo} />

          <div className="co__card">
            <div className="co__step-head">
              <h2 ref={headingRef} tabIndex={-1}>{step === REVIEW ? 'Review your request' : current.heading}</h2>
              <p>{step === REVIEW ? 'Check everything below. You can edit any section before sending.' : current.intro}</p>
            </div>

            {step === 0 && <ItemTypePicker types={ITEM_TYPES} value={itemTypes} onChange={setItemTypes} error={errors.type} />}

            {step === 1 && <Fields fields={visionFields} values={answers} errors={errors.answers} onChange={setAnswer} />}

            {step === 2 && <Fields fields={[inspirationField]} values={answers} errors={errors.answers} onChange={setAnswer} />}

            {step === 3 && (
              <>
                {itemTypes.map((cat) => {
                  const fields = requestDetailFields(cat);
                  if (!fields.length) return null;
                  return (
                    <section key={cat} className="co__detail" aria-labelledby={`detail-${cat}`}>
                      <h3 id={`detail-${cat}`}>{getCategory(cat)?.name}</h3>
                      <Fields fields={fields} values={details[cat] || {}} errors={{}} onChange={setDetail(cat)} ns={`${cat}-`} />
                    </section>
                  );
                })}
                <section className="co__detail" aria-labelledby="detail-common">
                  <h3 id="detail-common">{itemTypes.length > 1 ? 'For the whole request' : 'Finishing details'}</h3>
                  <Fields fields={commonDetailFields} values={answers} errors={errors.answers} onChange={setAnswer} />
                </section>
              </>
            )}

            {step === 4 && <Fields fields={budgetFields} values={answers} errors={errors.answers} onChange={setAnswer} />}

            {step === 5 && <Fields fields={contactFields} values={answers} errors={errors.answers} onChange={setAnswer} twoCol />}

            {step === REVIEW && review && <RequestReview review={review} onEdit={goTo} />}

            <div className="co__nav">
              {step > 0 ? (
                <Button variant="ghost" onClick={back} disabled={submitting}>Back</Button>
              ) : <span />}
              {step < STEPS.length - 1 && <Button onClick={next}>Continue</Button>}
              {step === STEPS.length - 1 && <Button onClick={next}>Review Request</Button>}
              {step === REVIEW && (
                <Button size="lg" onClick={submit} disabled={submitting} aria-busy={submitting || undefined}>
                  {submitting ? 'Sending…' : 'Submit Custom Request'}
                </Button>
              )}
            </div>
          </div>
        </div>

        <CustomOrderProcess />
      </div>
    </div>
  );
}

function Fields({ fields, values, errors, onChange, ns = '', twoCol = false }) {
  return (
    <div className={`co__fields ${twoCol ? 'co__fields--two' : ''}`}>
      {fields.map((f) => (
        <FieldRenderer key={f.id} field={f} values={values} error={errors[f.id]} onChange={onChange} ns={ns} />
      ))}
    </div>
  );
}
