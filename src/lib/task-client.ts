import { toTaskPayload, type TaskDraft } from "@/lib/task-payload";

export type CreateTaskResult = { ok: true; id: string } | { ok: false; message: string };

/** Browser helper: create a task and report failures honestly. */
export async function createTask(draft: TaskDraft): Promise<CreateTaskResult> {
  try {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toTaskPayload(draft)),
    });
    if (!res.ok) {
      if (res.status === 401) return { ok: false, message: "Your session has ended. Sign in again to create tasks." };
      if (res.status === 404) return { ok: false, message: "This project isn't available to your account." };
      return { ok: false, message: "We couldn't create the task. Please try again." };
    }
    const data = (await res.json()) as { id?: string };
    return data.id ? { ok: true, id: data.id } : { ok: false, message: "We couldn't create the task. Please try again." };
  } catch {
    return { ok: false, message: "We couldn't reach VSI. Check your connection and try again." };
  }
}
