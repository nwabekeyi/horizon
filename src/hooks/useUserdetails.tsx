// hooks/useUserDetails.ts
import { useSelector } from 'react-redux';
import { RootState } from 'store';

export const useUserDetails = () => {
  return useSelector((state: RootState) => state.user.user);
};
