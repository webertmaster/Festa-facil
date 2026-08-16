import { supabase } from "./supabaseClient";

// Reimplementa a mesma API window.storage.{get,set,delete,list} que o app já usa,
// só que gravando/lendo de uma tabela no Supabase em vez do armazenamento do Claude.
// Como este é um sistema de um único negócio (sem contas de usuário separadas),
// o parâmetro "shared" é aceito por compatibilidade mas não muda o comportamento:
// tudo fica em uma única tabela compartilhada entre o painel e a loja pública.

async function get(key) {
  const { data, error } = await supabase
    .from("kv_store")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { key, value: JSON.stringify(data.value), shared: false };
}

async function set(key, value) {
  const parsed = JSON.parse(value);
  const { error } = await supabase
    .from("kv_store")
    .upsert({ key, value: parsed, updated_at: new Date().toISOString() });

  if (error) throw error;
  return { key, value, shared: false };
}

async function del(key) {
  const { error } = await supabase.from("kv_store").delete().eq("key", key);
  if (error) throw error;
  return { key, deleted: true, shared: false };
}

async function list(prefix) {
  let query = supabase.from("kv_store").select("key");
  if (prefix) query = query.like("key", `${prefix}%`);
  const { data, error } = await query;
  if (error) throw error;
  return { keys: (data || []).map((r) => r.key), prefix, shared: false };
}

export function installStoragePolyfill() {
  window.storage = { get, set, delete: del, list };
}
