/** Checkout fields — standard autocomplete tokens so phones can fill them in one tap. */
export const US_STATES = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'
  .split(' ').map((s) => ({ value: s, label: s }));

export const contactFields = [
  { id: 'email', type: 'text', inputType: 'email', label: 'Email', required: true, format: 'email', maxLength: 120, autoComplete: 'email', enterKeyHint: 'next' },
  { id: 'phone', type: 'text', inputType: 'tel', label: 'Phone', format: 'phone', maxLength: 20, autoComplete: 'tel', enterKeyHint: 'next',
    help: 'For delivery questions about your order.' },
];

const address = (section) => [
  { id: 'firstName', type: 'text', label: 'First name', required: true, maxLength: 50, autoComplete: `${section} given-name`, enterKeyHint: 'next' },
  { id: 'lastName', type: 'text', label: 'Last name', required: true, maxLength: 50, autoComplete: `${section} family-name`, enterKeyHint: 'next' },
  { id: 'address1', type: 'text', label: 'Address', required: true, maxLength: 100, autoComplete: `${section} address-line1`, enterKeyHint: 'next', placeholder: 'Street address' },
  { id: 'address2', type: 'text', label: 'Apartment, suite, etc. (optional)', maxLength: 60, autoComplete: `${section} address-line2`, enterKeyHint: 'next' },
  { id: 'city', type: 'text', label: 'City', required: true, maxLength: 60, autoComplete: `${section} address-level2`, enterKeyHint: 'next' },
  { id: 'state', type: 'select', label: 'State', required: true, placeholder: 'State', options: US_STATES, autoComplete: `${section} address-level1` },
  { id: 'zip', type: 'text', label: 'ZIP code', required: true, maxLength: 10, inputMode: 'numeric', autoComplete: `${section} postal-code`,
    pattern: '^\\d{5}(-\\d{4})?$', patternMessage: 'Enter a 5-digit ZIP code.', enterKeyHint: 'done' },
];
const quiet = (fields) => fields.map((f) => ({ ...f, hideCount: true }));
export const shippingFields = quiet(address('shipping'));
export const billingFields = quiet(address('billing'));
