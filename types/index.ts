export interface Masjid {
  id: string;
  name: string;
  address: string;
  image: string;
  imamName: string;
  contact: string;
  username?: string;
  password?: string;
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
  type: 'speech' | 'event';
  youtubeUrl?: string;
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
  priority?: 'high' | 'normal' | 'low';
  fulfilledAt?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  needyId: string;
  amount: number;
  date: string;
}
