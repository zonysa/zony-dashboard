export const mockUsers = [
  {
    id: 1,
    email: "test@example.com",
    phone: "+1234567890",
    firstName: "John",
    lastName: "Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    dateOfBirth: "1990-01-01",
    bio: "Software developer passionate about React and TypeScript",
    isVerified: true,
  },
  {
    id: 2,
    email: "jane@example.com",
    phone: "+1987654321",
    firstName: "Jane",
    lastName: "Smith",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    dateOfBirth: "1992-05-15",
    bio: "UX Designer with a love for clean interfaces",
    isVerified: false,
  },
];

export const mockCredentials = [
  {
    emailOrPhone: "test@example.com",
    password: "password123",
    userId: 1,
  },
  {
    emailOrPhone: "+1234567890",
    password: "password123",
    userId: 1,
  },
  {
    emailOrPhone: "jane@example.com",
    password: "password456",
    userId: 2,
  },
];

export const mockTokens = {
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-access-token",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-refresh-token",
};

export const mockOtpCodes = {
  "test@example.com": "123456",
  "jane@example.com": "654321",
};

// Mock responses
export const mockResponses = {
  loginSuccess: {
    success: true,
    message: "Login successful",
    data: {
      user: mockUsers[0],
      tokens: mockTokens,
    },
  },
  loginError: {
    success: false,
    message: "Invalid credentials",
    error: "INVALID_CREDENTIALS",
  },
  registerSuccess: {
    success: true,
    message: "Registration successful. Please verify your email.",
    data: {
      user: { ...mockUsers[0], id: Date.now() },
    },
  },
  otpSuccess: {
    success: true,
    message: "OTP verified successfully",
    data: {
      user: mockUsers[0],
      tokens: mockTokens,
    },
  },
  profileUpdateSuccess: {
    success: true,
    message: "Profile updated successfully",
    data: {
      user: mockUsers[0],
    },
  },
};
