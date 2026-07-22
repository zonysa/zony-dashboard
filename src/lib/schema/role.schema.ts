export type Role = {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
};

export type GetRolesRes = {
  status: "success" | "error";
  message: string;
  roles: Role[];
};
