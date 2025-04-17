// Define the User type based on the MongoDB schema
export interface UserInfo {
  _id: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateJoined: string;
  status: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Allow User to be null
export type User = UserInfo | null;
