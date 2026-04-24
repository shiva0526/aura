const BASE_URL = "http://localhost:8000"

export async function getStatus() {
    try {
        const res = await fetch(`${BASE_URL}/status`);
        return await res.json();
    } catch {
        return null;
    }
}

export async function getOracle() {
    try {
        const res = await fetch(`${BASE_URL}/oracle`);
        return await res.json();
    } catch {
        return null;
    }
}

export async function getPlan() {
    try {
        const res = await fetch(`${BASE_URL}/plan`);
        return await res.json();
    } catch {
        return null;
    }
}

export async function getFinal() {
    try {
        const res = await fetch(`${BASE_URL}/final`);
        return await res.json();
    } catch {
        return null;
    }
}
