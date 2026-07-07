import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getUsers, assignRole, deleteUser, createUser } from "../../api/userApi";
import DeleteModal from "../../components/common/DeleteModal";

// ── Helpers ──
const ROLE_STYLE = {
  admin: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  hr: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/30 dark:text-brand-400 dark:border-brand-800",
};

const ROLE_LABEL = {
  admin: "Admin",
  hr: "HR",
  no_role: "No Role",
};

function RoleBadge({ role }) {
  const style = ROLE_STYLE[role] ?? "bg-surface-100 text-surface-500 border-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:border-surface-700";
  return <span className={`badge border ${style}`}>{ROLE_LABEL[role] ?? role}</span>;
}

function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card">
      <p className={`text-[28px] font-bold ${accent} tracking-tight dark:text-surface-50`}>{value}</p>
      <p className="text-sm text-surface-500 mt-1">{label}</p>
    </div>
  );
}

// ── Main ──
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "", email: "", password: "", role: "hr",
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data.users);
      setRoles(res.data.roles);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(user, newRole) {
    if (newRole === user.role) return;
    setRoleLoading(user.id);
    try {
      const res = await assignRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to update role.");
    } finally {
      setRoleLoading(null);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const res = await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.success(res.data.message);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to delete user.");
    } finally {
      setDeleteLoading(false);
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const res = await createUser(createForm);
      setUsers((prev) => [...prev, res.data.user]);
      setShowCreateModal(false);
      setCreateForm({ name: "", email: "", password: "", role: "hr" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>User Management</h1>
            <p>Manage accounts and assign roles.</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flash-error">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-bold ml-4">✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Users" value={users.length} accent="text-surface-900 dark:text-surface-100" />
          <StatCard label="Admins" value={users.filter((u) => u.role === "admin").length} accent="text-purple-600" />
          <StatCard label="HR Recruiters" value={users.filter((u) => u.role === "hr").length} accent="text-brand-600" />
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-card-header">
            <h2>All Users</h2>
            <span className="text-sm text-surface-400">{users.length} total</span>
          </div>

          {loading ? (
            <div className="animate-pulse overflow-x-auto table-container">
              <table>
                <thead>
                  <tr>
                    <th className="text-left"><div className="h-3 bg-surface-100 rounded w-12" /></th>
                    <th className="text-left"><div className="h-3 bg-surface-100 rounded w-14" /></th>
                    <th className="text-left"><div className="h-3 bg-surface-100 rounded w-20" /></th>
                    <th className="text-left"><div className="h-3 bg-surface-100 rounded w-20" /></th>
                    <th className="text-left"><div className="h-3 bg-surface-100 rounded w-14" /></th>
                    <th className="text-right"><div className="h-3 bg-surface-100 rounded w-14 ml-auto" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-surface-100 rounded-xl flex-shrink-0" />
                          <div className="h-4 bg-surface-100 rounded w-28" />
                        </div>
                      </td>
                      <td><div className="h-4 bg-surface-100 rounded w-36" /></td>
                      <td><div className="h-6 bg-surface-100 rounded-full w-16" /></td>
                      <td><div className="h-8 bg-surface-100 rounded-xl w-24" /></td>
                      <td><div className="h-4 bg-surface-100 rounded w-20" /></td>
                      <td className="text-right"><div className="h-8 bg-surface-100 rounded-xl w-14 ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-4" aria-hidden="true">👥</p>
              <p className="font-semibold text-surface-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto table-container">
              <table>
                <thead>
                  <tr>
                    <th className="text-left">Name</th>
                    <th className="text-left">Email</th>
                    <th className="text-left">Current Role</th>
                    <th className="text-left">Change Role</th>
                    <th className="text-left">Joined</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-500
                                          flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-surface-900 dark:text-surface-100">{user.name}</span>
                        </div>
                      </td>
                      <td className="text-surface-500">{user.email}</td>
                      <td><RoleBadge role={user.role} /></td>
                      <td>
                        <div className="relative">
                          <select
                            value={user.role}
                            disabled={roleLoading === user.id}
                            onChange={(e) => handleRoleChange(user, e.target.value)}
                            className="text-sm border border-surface-200 rounded-xl px-3 py-1.5 bg-white
                                       text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       dark:bg-surface-800 dark:border-surface-700 dark:text-surface-200"
                          >
                            {roles.map((role) => (
                              <option key={role} value={role}>{ROLE_LABEL[role] ?? role}</option>
                            ))}
                          </select>
                          {roleLoading === user.id && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                              <div className="w-4 h-4 border-[2px] border-brand-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-surface-400">{user.created_at}</td>
                      <td className="text-right">
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="text-red-400 hover:text-red-600 text-xs font-medium px-3 py-1.5
                                     rounded-xl hover:bg-red-50 transition-colors
                                     dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-surface-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
             role="dialog" aria-modal="true" aria-labelledby="create-user-title">
          <div className="bg-white rounded-3xl shadow-modal w-full max-w-md p-6 animate-scale-in
                          dark:bg-surface-900 dark:border dark:border-surface-800">
            <h2 id="create-user-title" className="text-lg font-bold text-surface-900 mb-5 dark:text-surface-50">Create New User</h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label htmlFor="create-user-name" className="block text-sm font-medium text-surface-700 mb-1 dark:text-surface-300">Full Name</label>
                <input id="create-user-name" type="text" required value={createForm.name}
                       onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                       placeholder="John Doe" className="input-field" />
              </div>
              <div>
                <label htmlFor="create-user-email" className="block text-sm font-medium text-surface-700 mb-1 dark:text-surface-300">Email Address</label>
                <input id="create-user-email" type="email" required value={createForm.email}
                       onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                       placeholder="user@company.com" className="input-field" />
              </div>
              <div>
                <label htmlFor="create-user-password" className="block text-sm font-medium text-surface-700 mb-1 dark:text-surface-300">Password</label>
                <input id="create-user-password" type="password" required minLength={8} value={createForm.password}
                       onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                       placeholder="Min. 8 characters" className="input-field" />
              </div>
              <div>
                <label htmlFor="create-user-role" className="block text-sm font-medium text-surface-700 mb-1 dark:text-surface-300">Role</label>
                <select id="create-user-role" value={createForm.role}
                        onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                        className="select-field w-full">
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)}
                        className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={createLoading} aria-busy={createLoading}
                        className="flex-1 btn-primary">
                  {createLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <DeleteModal
          title="Delete User"
          description={
            <>
              Are you sure you want to delete{" "}
              <strong className="text-surface-900 dark:text-surface-100">{deleteTarget.name}</strong>?
              This cannot be undone.
            </>
          }
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </DashboardLayout>
  );
}
