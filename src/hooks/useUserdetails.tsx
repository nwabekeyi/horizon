import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { UserState } from 'store/slices/userSlice'; // Import the UserState type

export const useUserDetails = () => {
  const userState = useSelector((state: RootState) => state.user) as UserState; // Explicit casting to UserState
  return userState.user ?? null;
};
