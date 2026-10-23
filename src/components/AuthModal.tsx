import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, OTPRecord } from '../types';
import { 
  validateJordanianPhone, 
  generateOTP, 
  verifyOTPCode,
  formatJordanPhone
} from '../utils/otpVerification';
import { 
  X, 
  Phone, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onLoginSuccess: (user: User) => void;
  initialPhoneToVerify?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  initialPhoneToVerify,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'signin' | 'signup' | 'otp_verify'>(
    initialPhoneToVerify ? 'otp_verify' : 'signin'
  );

  // Form Fields
  const [fullName, setFullName] = useState(currentUser.name || 'Tariq Al-Majali');
  const [email, setEmail] = useState(currentUser.email || 'tariq.majali@example.jo');
  const [phone, setPhone] = useState(initialPhoneToVerify || currentUser.phone || '0791234567');
  const [role, setRole] = useState<UserRole>('customer');
  const [phoneCarrier, setPhoneCarrier] = useState<string>('Zain');

  // OTP State
  const [otpRecord, setOtpRecord] = useState<OTPRecord | null>(null);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(60);
  const [otpError, setOtpError] = useState<string>('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [simulatedSmsToast, setSimulatedSmsToast] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update carrier indicator when phone changes
  useEffect(() => {
    const res = validateJordanianPhone(phone);
    if (res.isValid && res.carrier) {
      setPhoneCarrier(res.carrier);
    }
  }, [phone]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === 'otp_verify' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, countdown]);

  // Trigger dispatch of SMS OTP
  const dispatchSMS = (targetPhone: string, purpose: 'registration' | 'login' = 'registration') => {
    const valRes = validateJordanianPhone(targetPhone);
    if (!valRes.isValid) {
      setOtpError(valRes.errorMessage || 'Invalid Jordanian phone number.');
      return false;
    }

    const record = generateOTP(valRes.normalizedNumber, purpose);
    setOtpRecord(record);
    setDigits(['', '', '', '', '', '']);
    setCountdown(60);
    setOtpError('');
    setMode('otp_verify');

    // Simulate SMS delivery toast alert
    setSimulatedSmsToast(`[SMS from PlayJo] Your 6-digit athlete verification code is: ${record.code}`);

    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 150);

    return true;
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const valRes = validateJordanianPhone(phone);
    if (!valRes.isValid) {
      setOtpError(valRes.errorMessage || 'Invalid phone number');
      return;
    }
    // Existing users can sign in with OTP check
    dispatchSMS(valRes.normalizedNumber, 'login');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const valRes = validateJordanianPhone(phone);
    if (!valRes.isValid) {
      setOtpError(valRes.errorMessage || 'Please provide a valid Jordanian phone number.');
      return;
    }

    // Registration requires mandatory phone verification via SMS OTP
    dispatchSMS(valRes.normalizedNumber, 'registration');
  };

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = clean.slice(-1);
    setDigits(newDigits);
    setOtpError('');

    // Auto advance
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    if (!otpRecord) return;
    const submittedCode = digits.join('');

    if (submittedCode.length < 6) {
      setOtpError('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsVerifying(true);
    const result = verifyOTPCode(otpRecord, submittedCode);
    setOtpRecord(result.updatedRecord);

    setTimeout(() => {
      setIsVerifying(false);
      if (result.success) {
        setOtpSuccessMsg('✓ Phone verified! Welcome to PlayJo Jordan.');
        
        const updatedUser: User = {
          ...currentUser,
          name: fullName,
          email,
          phone: otpRecord.phone,
          phoneVerified: true,
          role,
        };

        setTimeout(() => {
          onLoginSuccess(updatedUser);
          onClose();
        }, 1000);
      } else {
        setOtpError(result.message);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Simulated SMS Toast Bar */}
        {simulatedSmsToast && (
          <div className="bg-slate-950 text-white p-3.5 px-4 text-xs flex items-start justify-between gap-3 border-b border-emerald-500/40">
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold text-sm">📲</span>
              <div>
                <span className="font-bold text-emerald-400 block">Simulated Jordanian SMS Inbound</span>
                <span className="font-mono text-slate-200">{simulatedSmsToast}</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (otpRecord) {
                  setDigits(otpRecord.code.split(''));
                }
              }}
              className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded cursor-pointer shrink-0"
              title="Auto-fill code"
            >
              Auto-fill Code
            </button>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg">
              PJ
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading text-slate-900">
                {mode === 'otp_verify'
                  ? 'Verify Phone Number'
                  : mode === 'signup'
                  ? 'Join PlayJo Jordan'
                  : 'Athlete Sign In'}
              </h3>
              <span className="text-xs text-slate-400">Hashemite Kingdom of Jordan</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher (if not in OTP state) */}
        {mode !== 'otp_verify' && (
          <div className="px-6 pt-3">
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`py-2 rounded-xl transition cursor-pointer ${
                  mode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`py-2 rounded-xl transition cursor-pointer ${
                  mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {mode === 'otp_verify' ? (
            /* OTP VERIFICATION VIEW */
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-xs text-slate-500">
                  Enter the 6-digit verification code sent via SMS to:
                </p>
                <div className="font-bold text-sm text-slate-800 mt-0.5">
                  {otpRecord ? formatJordanPhone(otpRecord.phone) : phone}
                </div>
              </div>

              {/* 6-Digit Grid */}
              <div className="flex justify-between gap-1.5 sm:gap-2">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className="w-11 sm:w-12 h-14 text-center text-2xl font-black rounded-xl border-2 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition bg-white text-slate-900"
                  />
                ))}
              </div>

              {/* Error or Success feedback */}
              {otpError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{otpSuccessMsg}</span>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="button"
                disabled={isVerifying}
                onClick={handleVerifyOtp}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                {isVerifying ? 'Verifying OTP...' : 'Verify Phone & Proceed'}
              </button>

              {/* Resend Cooldown */}
              <div className="text-center text-xs text-slate-500 pt-2">
                Didn't get the SMS?{' '}
                {countdown > 0 ? (
                  <span className="font-semibold text-slate-400">
                    Resend in <strong className="text-slate-700">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => dispatchSMS(phone)}
                    className="font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Resend SMS Code
                  </button>
                )}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                >
                  Change phone number
                </button>
              </div>
            </div>
          ) : mode === 'signin' ? (
            /* SIGN IN VIEW */
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jordanian Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">
                    🇯🇴 +962
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="079 123 4567 (Zain, Orange, Umniah)"
                    className="w-full pl-20 pr-16 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {phoneCarrier}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.jo"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              {otpError && (
                <div className="p-2 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold">
                  {otpError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition cursor-pointer"
              >
                Send SMS Verification OTP
              </button>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                🔒 PlayJo enforces 2-factor phone validation via Jordanian telecommunication SMS gateways to protect court bookings.
              </div>
            </form>
          ) : (
            /* SIGN UP VIEW */
            <form onSubmit={handleSignUp} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Athlete / Owner Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tariq Al-Majali"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tariq@example.jo"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jordanian Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">
                    🇯🇴 +962
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="079 123 4567"
                    className="w-full pl-20 pr-16 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {phoneCarrier}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Register As Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                >
                  <option value="customer">Customer (Book courts, earn loyalty PlayPoints)</option>
                  <option value="facility_owner">Facility Owner (List & manage sports club in Jordan)</option>
                </select>
              </div>

              {otpError && (
                <div className="p-2 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold">
                  {otpError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition cursor-pointer"
              >
                Send Mandatory SMS OTP
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
