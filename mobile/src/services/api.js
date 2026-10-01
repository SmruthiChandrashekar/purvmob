import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const DEFAULT_ANDROID_URL = 'http://10.0.2.2:8000';
const DEFAULT_IOS_URL = 'http://localhost:8000';

let customBaseUrl = null;

export async function getApiBaseUrl() {
  if (customBaseUrl) return customBaseUrl;
  try {
    const saved = await AsyncStorage.getItem('@purva_api_base_url');
    if (saved) {
      customBaseUrl = saved;
      return saved;
    }
  } catch (_) {}
  return Platform.OS === 'android' ? DEFAULT_ANDROID_URL : DEFAULT_IOS_URL;
}

export async function setApiBaseUrl(url) {
  customBaseUrl = url.trim().replace(/\/+$/, '');
  try {
    await AsyncStorage.setItem('@purva_api_base_url', customBaseUrl);
  } catch (_) {}
  return customBaseUrl;
}

export async function apiClient(path, options = {}) {
  const baseUrl = await getApiBaseUrl();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;

  const response = await fetch(url, { ...options, headers });
  return response;
}

// ── Agent & Chat API ────────────────────────────────────────────────────────
export async function sendChatMessage(message, lang = 'en', sessionId = null) {
  const payload = {
    message,
    lang,
    ...(sessionId ? { session_id: sessionId } : {}),
  };

  const res = await apiClient('/api/agents/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Chat request failed: ${res.status} ${errorText}`);
  }

  return await res.json();
}

// ── Complaint / Grievance Submission ─────────────────────────────────────────
export async function submitGrievance(payload) {
  const res = await apiClient('/submit-complaint', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Submit failed: ${res.status} ${errorText}`);
  }

  return await res.json();
}

// ── Health Check ─────────────────────────────────────────────────────────────
export async function checkBackendHealth() {
  try {
    const res = await apiClient('/health', { method: 'GET' });
    return res.ok;
  } catch (_) {
    return false;
  }
}
