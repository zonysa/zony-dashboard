export interface RegisterApiRequest {
  first_name: string;
  last_name: string;
  // Optional on the backend; omit rather than send "".
  phone_number?: string;
  email: string;
  password: string;
  username?: string;
  role_id: number;
}
