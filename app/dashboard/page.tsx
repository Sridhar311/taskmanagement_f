"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

export default function Dashboard() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editSnapshot, setEditSnapshot] = useState<{
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);
  const [view, setView] = useState<"create" | "myTasks">("myTasks");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const totalPages = Math.ceil(totalCount / pageSize);

  const isDirty =
    !editSnapshot ||
    title !== editSnapshot.title ||
    description !== editSnapshot.description ||
    status !== editSnapshot.status ||
    priority !== editSnapshot.priority ||
    dueDate !== editSnapshot.dueDate;

  const resetForm = () => {
    setEditingTaskId(null);
    setEditSnapshot(null);
    setTitle("");
    setDescription("");
    setStatus("Pending");
    setPriority("Medium");
    setDueDate("");
    setFormError("");
  };

  const fetchTasks = async () => {
    setListLoading(true);
    try {
      const res = await api.get(
        `/tasks?page=${page}&pageSize=${pageSize}&search=${search}&status=${filterStatus}&sortBy=${sortBy}`,
      );
      const responseData = res.data.data || res.data;
      const tasksData = responseData.items || [];
      setTasks(tasksData);
      setTotalCount(responseData.totalCount || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setListLoading(false);
    }
  };

  const createTask = async () => {
    setFormError("");

    if (!title.trim()) {
      setFormError("Task title is required");
      return;
    }

    if (!description.trim()) {
      setFormError("Task description is required");
      return;
    }

    setLoading(true);
    try {
      const payload: any = { title, description, status, priority };
      if (dueDate) payload.dueDate = dueDate;

      await api.post("/tasks", payload);
      setSuccessMessage("Task created successfully!");
      resetForm();
      setView("myTasks");
      setTimeout(() => setSuccessMessage(""), 3000);
      await fetchTasks();
    } catch (error: any) {
      setFormError(error.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async () => {
    if (editingTaskId === null) return;
    setFormError("");

    if (!title.trim()) {
      setFormError("Task title is required");
      return;
    }

    if (!description.trim()) {
      setFormError("Task description is required");
      return;
    }

    setLoading(true);
    try {
      const payload: any = { title, description, status, priority };
      if (dueDate) payload.dueDate = dueDate;

      await api.patch(`/tasks/${editingTaskId}`, payload);
      setSuccessMessage("Task updated successfully!");
      resetForm();
      setView("myTasks");
      setTimeout(() => setSuccessMessage(""), 3000);
      await fetchTasks();
    } catch (error: any) {
      setFormError(error.response?.data?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    setDeletingId(id);
    try {
      await api.delete(`/tasks/${id}`);
      setSuccessMessage("Task deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      await fetchTasks();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const markComplete = async (id: string) => {
    setCompletingId(id);
    try {
      await api.patch(`/tasks/${id}`, { status: "Completed" });
      setSuccessMessage("Task marked complete!");
      setTimeout(() => setSuccessMessage(""), 2500);
      await fetchTasks();
    } catch (error) {
      console.error(error);
      setFormError("Failed to mark task complete");
    } finally {
      setCompletingId(null);
    }
  };

  const editTask = (task: any) => {
    const dueDateValue = task.dueDate?.split("T")[0] || "";
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(dueDateValue);
    setEditSnapshot({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: dueDateValue,
    });
    setView("create");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToCreate = () => {
    if (editingTaskId) resetForm();
    setView("create");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  useEffect(() => {
    fetchTasks();
  }, [page, pageSize, search, filterStatus, sortBy]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "InProgress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Pending":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-colors">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Task Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage your tasks efficiently
              </p>
            </div>
            <div className="flex items-center gap-3">
              <nav className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  onClick={goToCreate}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    view === "create"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Create Task
                </button>
                <button
                  onClick={() => setView("myTasks")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    view === "myTasks"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  My Tasks
                </button>
              </nav>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {view === "create" && (
          /* Create/Edit Task Section */
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm p-8 mb-8 transition-colors">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              {editingTaskId ? "Edit Task" : "Create New Task"}
            </h2>

            <div className="space-y-4">
              {formError && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-200">
                  {formError}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-200">
                  {successMessage}
                </div>
              )}

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">
                  Task Title *
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-colors"
                  placeholder="Enter task title"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">
                  Description *
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-none transition-colors"
                  placeholder="Enter task description"
                  rows={3}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">
                    Status
                  </span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-2 block w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-colors"
                  >
                    <option value="Pending">Pending</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">
                    Priority
                  </span>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="mt-2 block w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-colors"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">
                  Due Date
                </span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-colors"
                />
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={editingTaskId ? updateTask : createTask}
                  disabled={loading || (!!editingTaskId && !isDirty)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Spinner />}
                  {editingTaskId ? "Update Task" : "Create Task"}
                </button>

                {editingTaskId && (
                  <button
                    onClick={resetForm}
                    className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
          )}

          {view === "myTasks" && (
          <>
          {successMessage && (
            <div className="rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-200 mb-6">
              {successMessage}
            </div>
          )}

          {/* Search & Filter Section */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 rounded-3xl shadow-sm p-8 mb-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Search & Filter
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
                  Search Tasks
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-none transition-colors"
                  placeholder="Search by title..."
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
                  Filter by Status
                </span>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-none transition-colors"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
                  Sort By
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-none transition-colors"
                >
                  <option value="">Newest</option>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                </select>
              </label>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white mb-6">
              My Tasks{" "}
              {tasks.length > 0 && (
                <span className="text-slate-500 font-normal">
                  ({totalCount})
                </span>
              )}
              {listLoading && (
                <Spinner className="w-5 h-5 text-indigo-600" />
              )}
            </h3>

            {tasks.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 rounded-3xl shadow-sm p-8 mb-8">
                <svg
                  className="w-16 h-16 mx-auto text-slate-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-slate-500 text-lg">
                  No tasks found. Create one to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden  h-full flex flex-col"
                  >
                    <div className="p-6 bg-white dark:bg-slate-800 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                          {task.title}
                        </h4>
                      </div>
{/* text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300 */}
                      {task.description && (
                        <p className="text-slate-700 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex gap-2 mb-4 flex-wrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}
                        >
                          {task.status}
                        </span>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.dueDate && (
                        <p className="text-xs text-slate-500 mb-4">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}

                      <div className="flex gap-2 pt-4 border-t border-slate-200 flex-wrap">
                        {task.status !== "Completed" && (
                          <button
                            onClick={() => markComplete(task.id)}
                            disabled={completingId === task.id}
                            className="flex flex-1 min-w-fit items-center justify-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-2 text-sm font-medium transition disabled:opacity-60"
                          >
                            {completingId === task.id && <Spinner className="w-3.5 h-3.5" />}
                            Complete
                          </button>
                        )}

                        <button
                          onClick={() => editTask(task)}
                          className="flex-1 min-w-fit rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-2 text-sm font-medium transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteTask(task.id)}
                          disabled={deletingId === task.id}
                          className="flex flex-1 min-w-fit items-center justify-center gap-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 text-sm font-medium transition disabled:opacity-60"
                        >
                          {deletingId === task.id && <Spinner className="w-3.5 h-3.5" />}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-4 items-center mt-8">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
                Tasks per page:
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50 transition"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`rounded-lg w-10 h-10 text-sm font-medium transition ${
                        page === p
                          ? "bg-indigo-600 text-white"
                          : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Next →
              </button>
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
