// stores/userStore.ts
import { writable } from 'svelte/store';

interface UserData {
  studentNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  section: string;
}

const createUserStore = () => {
  const { subscribe, set, update } = writable<UserData>({
    studentNumber: '',
    email: '',
    firstName: '',
    lastName: '',
    section: '',
  });

  return {
    subscribe,
    setUser: (userData: UserData) => set(userData),
    clearUser: () => set({
      studentNumber: '',
      email: '',
      firstName: '',
      lastName: '',
      section: '',
    }),
    isLoggedIn: () => {
      let currentUser: UserData;
      subscribe(user => {
        currentUser = user;
      })();
      return Boolean(currentUser?.studentNumber);
    }
  };
};

export const userStore = createUserStore();
