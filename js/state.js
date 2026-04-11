import { api } from "./api.js";

let state = { entities: [], items: [], tasks: [] };
let taskFilter = "todo"; // 'todo' | 'done' | 'all'
let taskAssigneeFilter = ""; // '' = all, '__none__' = unassigned, or a name
let taskEntityFilter = ""; // '' = all, '__none__' = no entity, or an entity id

/** Load all data from the server */
export async function loadState() {
  state = await api.loadAll();
}

/** Return the live state object — callers may mutate it directly */
export function getState() {
  return state;
}

export function getTaskFilter() {
  return taskFilter;
}
export function setTaskFilter(value) {
  taskFilter = value;
}

export function getTaskAssigneeFilter() {
  return taskAssigneeFilter;
}
export function setTaskAssigneeFilter(value) {
  taskAssigneeFilter = value;
}

export function getTaskEntityFilter() {
  return taskEntityFilter;
}
export function setTaskEntityFilter(value) {
  taskEntityFilter = value;
}
