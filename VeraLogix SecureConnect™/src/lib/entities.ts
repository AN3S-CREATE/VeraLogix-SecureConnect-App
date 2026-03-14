
export type User = {
    id: string;
    role: 'resident' | 'agent';
    name: string;
    email: string;
    unitId?: string;
};

export type Unit = {
    id: string;
    label: string;
    siteId: string;
};

export type Pass = {
    id: string;
    code: string;
    areas: string[];
    start: string;
    end: string;
    status: 'active' | 'expired';
    unitId: string;
};

export type Booking = {
    id: string;
    amenityId: string;
    slotStart: string;
    slotEnd: string;
    price: number;
    status: 'confirmed' | 'cancelled';
    userId: string;
};

export type Amenity = {
    id: string;
    name: string;
    rules: string;
    priceRuleId: string;
    photos: string[];
};

export type Invoice = {
    id: string;
    userId: string;
    amount: number;
    due: string;
    status: 'paid' | 'unpaid';
    ledger: string[];
};

export type Ticket = {
    id: string;
    unitId: string;
    category: string;
    desc: string;
    media?: string[];
    status: string;
    slaDeadline: string;
    timeline: string[];
    severity?: 'critical' | 'high' | 'medium' | 'low';
    assignee?: string;
    sla?: number;
};

export type Door = {
    id: string;
    name: string;
    state: 'locked' | 'unlocked';
    proximityReady: boolean;
    siteId: string;
};

export type AccessLog = {
    id: string;
    ts: string;
    doorId: string;
    result: 'granted' | 'denied';
};

export type Incident = {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: string;
    slaDeadline: string;
    evidence: string[];
    relatedIds?: string[];
};

export type Energy = {
    siteId: string;
    ts: string;
    kwh: number;
    waterL: number;
    iaqIndex: number;
    zone: string;
};

export type EVSession = {
    id: string;
    bayId: string;
    userId: string;
    kwh: number;
    cost: number;
    status: 'charging' | 'completed';
    startedAt: string;
    endedAt?: string;
};

    