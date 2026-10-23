import { OTPRecord } from '../types';

export interface PhoneValidationResult {
  isValid: boolean;
  normalizedNumber: string;
  carrier?: 'Zain' | 'Orange' | 'Umniah' | 'Other';
  errorMessage?: string;
}

/**
 * Validates and normalizes Jordanian phone numbers.
 * Supported inputs:
 *  - "+962 7 9123 4567"
 *  - "0791234567"
 *  - "791234567"
 *  - "+962791234567"
 */
export function validateJordanianPhone(input: string): PhoneValidationResult {
  if (!input) {
    return {
      isValid: false,
      normalizedNumber: '',
      errorMessage: 'Phone number is required.',
    };
  }

  // Strip spaces, dashes, parentheses
  const cleaned = input.replace(/[\s\-()]/g, '');

  let localPart = '';
  if (cleaned.startsWith('+962')) {
    localPart = cleaned.slice(4);
  } else if (cleaned.startsWith('00962')) {
    localPart = cleaned.slice(5);
  } else if (cleaned.startsWith('07')) {
    localPart = cleaned.slice(1);
  } else if (cleaned.startsWith('7')) {
    localPart = cleaned;
  } else {
    return {
      isValid: false,
      normalizedNumber: '',
      errorMessage: 'Invalid country code. Must be a Jordanian number (+962 or 07...).',
    };
  }

  // Must be 9 digits starting with 7 (e.g. 79XXXXXXX, 77XXXXXXX, 78XXXXXXX)
  if (!/^7[789]\d{7}$/.test(localPart)) {
    return {
      isValid: false,
      normalizedNumber: '',
      errorMessage: 'Jordanian mobile numbers must start with 077, 078, or 079 followed by 7 digits.',
    };
  }

  const prefix = localPart.slice(0, 2);
  let carrier: 'Zain' | 'Orange' | 'Umniah' | 'Other' = 'Other';
  if (prefix === '79') carrier = 'Zain';
  else if (prefix === '77') carrier = 'Orange';
  else if (prefix === '78') carrier = 'Umniah';

  return {
    isValid: true,
    normalizedNumber: `+962${localPart}`,
    carrier,
  };
}

/**
 * Format phone number cleanly for Jordanian display (e.g. +962 79 123 4567)
 */
export function formatJordanPhone(phone: string): string {
  const res = validateJordanianPhone(phone);
  if (!res.isValid) return phone;
  const num = res.normalizedNumber; // +96279XXXXXXX
  return `+962 ${num.slice(4, 6)} ${num.slice(6, 9)} ${num.slice(9)}`;
}

/**
 * Generates a mock 6-digit OTP record with 5-minute validity.
 */
export function generateOTP(phone: string, purpose: 'registration' | 'login' | 'booking_confirmation' = 'registration'): OTPRecord {
  // Deterministic or random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  return {
    id: `otp-${now}-${Math.random().toString(36).substring(2, 7)}`,
    phone,
    code,
    purpose,
    expiresAt: now + 5 * 60 * 1000, // 5 minutes
    attempts: 0,
    verified: false,
    createdAt: now,
  };
}

/**
 * Verifies submitted OTP against record.
 */
export function verifyOTPCode(
  record: OTPRecord,
  submittedCode: string,
  currentTime: number = Date.now()
): {
  success: boolean;
  message: string;
  updatedRecord: OTPRecord;
} {
  const updatedRecord: OTPRecord = {
    ...record,
    attempts: record.attempts + 1,
  };

  if (record.verified) {
    return {
      success: false,
      message: 'This verification code was already used.',
      updatedRecord,
    };
  }

  if (currentTime > record.expiresAt) {
    return {
      success: false,
      message: 'Verification code has expired. Please request a new SMS OTP.',
      updatedRecord,
    };
  }

  if (record.attempts >= 3) {
    return {
      success: false,
      message: 'Maximum verification attempts exceeded. Please request a new code.',
      updatedRecord,
    };
  }

  const cleanSubmitted = submittedCode.trim();
  if (cleanSubmitted !== record.code) {
    return {
      success: false,
      message: `Invalid code. ${3 - updatedRecord.attempts} attempt(s) remaining.`,
      updatedRecord,
    };
  }

  updatedRecord.verified = true;
  return {
    success: true,
    message: 'Phone number successfully verified!',
    updatedRecord,
  };
}
