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

export async function deployOfficer(data) {
    try {
        const res = await fetch(`${BASE_URL}/api/officers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
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

export async function deleteOfficer(officerId) {
    try {
        const res = await fetch(`${BASE_URL}/api/officers/${officerId}`, {
            method: 'DELETE'
        });
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

export async function approveMission(data) {
    try {
        const res = await fetch(`${BASE_URL}/api/approve-mission`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch {
        return null;
    }
}

export async function getIgnitionPrediction(features) {
    try {
        const res = await fetch(`${BASE_URL}/api/v1/predict-ignition`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(features)
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function getApprovedMission() {
    try {
        const res = await fetch(`${BASE_URL}/api/approved-mission?t=${Date.now()}`, { cache: 'no-store' });
        return await res.json();
    } catch {
        return null;
    }
}

export async function freeOfficer(officer_id) {
    try {
        const res = await fetch(`${BASE_URL}/api/free-officer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ officer_id })
        });
        return await res.json();
    } catch {
        return null;
    }
}

export async function getSpreadPrediction(features) {
    try {
        const res = await fetch(`${BASE_URL}/api/v1/predict-spread`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(features)
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}