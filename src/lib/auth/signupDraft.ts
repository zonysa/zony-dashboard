// Non-sensitive signup fields kept in sessionStorage so a customer who
// notices a mistake (usually the email) on the verify-otp screen can go
// back to /auth/signup without retyping everything. Password is never
// persisted here.
export interface SignupDraft {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
}

const SIGNUP_DRAFT_KEY = "pendingSignupDraft";

export function saveSignupDraft(draft: SignupDraft): void {
  sessionStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify(draft));
}

export function readSignupDraft(): SignupDraft | null {
  const raw = sessionStorage.getItem(SIGNUP_DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SignupDraft;
  } catch {
    return null;
  }
}

export function clearSignupDraft(): void {
  sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
}
