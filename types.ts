
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingSources?: GroundingSource[];
}

export interface GroundingSource {
  title: string;
  uri: string;
  type: 'web' | 'maps';
}

export interface SejongArea {
  name: string;
  description: string;
  icon: string;
  tags: string[];
}
