import { createContext, useContext, useState, ReactNode } from 'react';

type ProfileContextData = {
  profileImage: string | null;
  setProfileImage: (uri: string | null) => void;
};

const ProfileContext = createContext<ProfileContextData>({
  profileImage: null,
  setProfileImage: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  return (
    <ProfileContext.Provider value={{ profileImage, setProfileImage }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
