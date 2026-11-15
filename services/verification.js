import emailjs from 'emailjs-com';

// EmailJS identifiers are public by design (they ship in the app bundle).
// Never put a private/secret key here.
const SERVICE_ID = 'service_y6igit7';
const TEMPLATE_ID = 'template_a7bqysj';
const PUBLIC_KEY = 'tqnSNSHM6dMmakDbI';

export const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Throws if the email could not be sent, so callers can show a real error
// instead of sending the user to a code screen for an email that never arrived.
export async function sendVerificationEmail({ name, code, email }) {
  return emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    { name, code, message: 'Welcome Onboard', from_name: 'Househelp.ng', email },
    PUBLIC_KEY
  );
}
