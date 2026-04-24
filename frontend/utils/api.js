const BASE_URL = "http://localhost:8000"

export async function getStatus() {
    try {
        const res = await fetch(`${BASE_URL}/status?t=${Date.now()}`, { cache: 'no-store' });
        return await res.json();
    } catch {
        return null;
    }
}

export async function getOracle() {
    try {
        const res = await fetch(`${BASE_URL}/oracle?t=${Date.now()}`, { cache: 'no-store' });
        return await res.json();
    } catch {
        return null;
    }
}

export async function getPlan() {
    try {
        const res = await fetch(`${BASE_URL}/plan?t=${Date.now()}`, { cache: 'no-store' });
        return await res.json();
    } catch {
        return null;
    }
}

export async function getFinal() {
    try {
        const res = await fetch(`${BASE_URL}/final?t=${Date.now()}`, { cache: 'no-store' });
        return await res.json();
    } catch {
        return null;
    }
}

export async function getOfficers() {
    try {
        const res = await fetch(`${BASE_URL}/api/officers?t=${Date.now()}`, { cache: 'no-store' });
        return await res.json();
    } catch {
        return null;
    }
}

export async function assignOfficer(lat, lon, task_id) {
    // POST requests are not cached, so no need for the timestamp here
    try {
        const res = await fetch(`${BASE_URL}/api/assign`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lon, task_id })
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}