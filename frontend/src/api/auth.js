const API_BASE = "http://127.0.0.1:8001";

export async function registerUser(payload) {
  const res = await fetch(`${API_BASE}/api/users/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function loginUser(payload) {
  const res = await fetch(`${API_BASE}/api/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

export async function getMe(token) {
  const res = await fetch(`${API_BASE}/api/users/me/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}
