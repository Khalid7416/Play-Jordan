import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateJordanianPhone,
  formatJordanPhone,
  generateOTP,
  verifyOTPCode,
} from './otpVerification';

test('validateJordanianPhone handles standard Jordanian mobile numbers and identifies carriers', () => {
  // Zain (079)
  const zainRes = validateJordanianPhone('0791234567');
  assert.equal(zainRes.isValid, true);
  assert.equal(zainRes.normalizedNumber, '+962791234567');
  assert.equal(zainRes.carrier, 'Zain');

  // Orange (077) with spaces
  const orangeRes = validateJordanianPhone('+962 7 7987 6543');
  assert.equal(orangeRes.isValid, true);
  assert.equal(orangeRes.normalizedNumber, '+962779876543');
  assert.equal(orangeRes.carrier, 'Orange');

  // Umniah (078)
  const umniahRes = validateJordanianPhone('0785551234');
  assert.equal(umniahRes.isValid, true);
  assert.equal(umniahRes.normalizedNumber, '+962785551234');
  assert.equal(umniahRes.carrier, 'Umniah');

  // Invalid numbers
  assert.equal(validateJordanianPhone('0761234567').isValid, false); // invalid prefix 076
  assert.equal(validateJordanianPhone('12345').isValid, false);
  assert.equal(validateJordanianPhone('').isValid, false);
});

test('formatJordanPhone returns clean user-facing format', () => {
  assert.equal(formatJordanPhone('0791234567'), '+962 79 123 4567');
});

test('generateOTP produces 6-digit code with 5-minute expiry', () => {
  const otp = generateOTP('+962791234567', 'registration');
  assert.match(otp.code, /^\d{6}$/);
  assert.equal(otp.verified, false);
  assert.equal(otp.attempts, 0);
  assert.ok(otp.expiresAt > Date.now());
});

test('verifyOTPCode handles success, wrong code, and attempt limits', () => {
  const otp = generateOTP('+962791234567');
  const code = otp.code;

  // Wrong code
  const fail1 = verifyOTPCode(otp, '000000', otp.createdAt + 1000);
  assert.equal(fail1.success, false);
  assert.equal(fail1.updatedRecord.attempts, 1);
  assert.equal(fail1.updatedRecord.verified, false);

  // Correct code
  const successRes = verifyOTPCode(fail1.updatedRecord, code, otp.createdAt + 2000);
  assert.equal(successRes.success, true);
  assert.equal(successRes.updatedRecord.verified, true);

  // Expired code test
  const freshOtp = generateOTP('+962791234567');
  const expiredRes = verifyOTPCode(freshOtp, freshOtp.code, freshOtp.expiresAt + 1000);
  assert.equal(expiredRes.success, false);
  assert.match(expiredRes.message, /expired/i);
});
