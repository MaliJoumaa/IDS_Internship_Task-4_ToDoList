import { useState } from "react";
import type { FormEvent } from "react";
import type { TaskCreateRequest } from "../Types/task";

interface TaskFormProps {
    onCreate: (task: TaskCreateRequest) => Promise<void>;
}

export default function TaskForm({ onCreate }: TaskFormProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // The backend marks Title and Description [Required], and [Required] rejects
    // empty strings, so both must be filled in before we let the request go out.
    const canSubmit =
        title.trim() !== "" && description.trim() !== "" && !submitting;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!canSubmit) {
            return;
        }

        setSubmitting(true);
        try {
            await onCreate({
                title: title.trim(),
                description: description.trim(),
            });
            setTitle("");
            setDescription("");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                maxLength={200}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                maxLength={2000}
                rows={2}
                className="mt-2 w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <button
                type="submit"
                disabled={!canSubmit}
                className="mt-2 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
                {submitting ? "Adding…" : "Add task"}
            </button>
        </form>
    );
}
