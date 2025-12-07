export interface Masjid {
  id: string;
  name: string;
  address: string;
  image: string;
  imamName: string;
  contact: string;
  username?: string;
  password?: string;
  isDisabled?: boolean;
}

export interface PrayerTimes {
  masjidId: string;
  date: string; // YYYY-MM-DD
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jummah: string;
}

export interface Speech {
  id: string;
  masjidId: string;
  title: string;
  speaker: string;
  datetime: string; // ISO string
  youtubeUrl: string; // Made required as per new requirement for speeches
  description: string;
}

export interface MasjidEvent {
  id: string;
  masjidId: string;
  title: string;
  type: 'khutba' | 'iftari' | 'meeting' | 'other';
  datetime: string; // ISO string
  description: string;
}

export interface Volunteer {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  image: string;
}

export interface Donor {
  id: string;
  username: string;
  password?: string; // Optional for frontend, required for backend
  name: string;
  email: string;
  mobile: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  status: 'pending' | 'approved';
}

export interface NeedyPerson {
  id: string;
  name: string;
  description: string;
  contact: string;
  amountNeeded: number;
  amountRaised?: number;
  status: 'open' | 'fulfilled';
  urgency?: 'critical' | 'urgent' | 'necessary';
  fulfilledAt?: string;
  fatherName?: string;
  address?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  needyId: string;
  amount: number;
  date: string;
}
