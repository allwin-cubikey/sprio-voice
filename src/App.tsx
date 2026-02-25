import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute, PublicRoute, AdminRoute } from './components/ProtectedRoute';
import { AdminLayout } from './admin/AdminLayout';

// ── Lazy-loaded admin pages ──────────────────────────────────────────────────
const AdminDashboardPage = lazy(() => import('./admin/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('./admin/pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminOrgsPage = lazy(() => import('./admin/pages/AdminOrgsPage').then(m => ({ default: m.AdminOrgsPage })));
const AdminAssistantsPage = lazy(() => import('./admin/pages/AdminAssistantsPage').then(m => ({ default: m.AdminAssistantsPage })));
const AdminCallsPage = lazy(() => import('./admin/pages/AdminCallsPage').then(m => ({ default: m.AdminCallsPage })));
const AdminBillingPage = lazy(() => import('./admin/pages/AdminBillingPage').then(m => ({ default: m.AdminBillingPage })));
const AdminAnalyticsPage = lazy(() => import('./admin/pages/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const AdminSystemPage = lazy(() => import('./admin/pages/AdminSystemPage').then(m => ({ default: m.AdminSystemPage })));

// ── Lazy-loaded user pages ────────────────────────────────────────────────────
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AssistantListPage = lazy(() => import('./pages/assistants/AssistantListPage').then(m => ({ default: m.AssistantListPage })));
const AssistantEditorPage = lazy(() => import('./pages/assistants/AssistantEditorPage').then(m => ({ default: m.AssistantEditorPage })));
const CallLogsPage = lazy(() => import('./pages/CallsPage').then(m => ({ default: m.CallLogsPage })));
const CallDetailPage = lazy(() => import('./pages/CallsPage').then(m => ({ default: m.CallDetailPage })));
const PhoneNumbersPage = lazy(() => import('./pages/PhoneNumbersPage').then(m => ({ default: m.PhoneNumbersPage })));
const PhoneNumberDetailPage = lazy(() => import('./pages/PhoneNumbersPage').then(m => ({ default: m.PhoneNumberDetailPage })));
const SquadsPage = lazy(() => import('./pages/SquadsPage').then(m => ({ default: m.SquadsPage })));
const ToolsPage = lazy(() => import('./pages/ToolsPage').then(m => ({ default: m.ToolsPage })));
const FilesPage = lazy(() => import('./pages/FilesPage').then(m => ({ default: m.FilesPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ApiKeysPage = lazy(() => import('./pages/ApiKeysPage').then(m => ({ default: m.ApiKeysPage })));
const BillingPage = lazy(() => import('./pages/BillingPage').then(m => ({ default: m.BillingPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const DocsPage = lazy(() => import('./pages/DocsPage').then(m => ({ default: m.DocsPage })));
const LoginPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.ForgotPasswordPage })));
const WorkflowsPage = lazy(() => import('./pages/WorkflowsPage').then(m => ({ default: m.WorkflowsPage })));
const WorkflowEditorPage = lazy(() => import('./pages/WorkflowsPage').then(m => ({ default: m.WorkflowEditorPage })));
const SessionLogsPage = lazy(() => import('./pages/SessionLogsPage').then(m => ({ default: m.SessionLogsPage })));
const MetricsPage = lazy(() => import('./pages/MetricsPage').then(m => ({ default: m.MetricsPage })));

// ── Page loader fallback ──────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          {/* ── Admin portal ──────────────────────────────────────────────── */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/orgs" element={<AdminOrgsPage />} />
            <Route path="/admin/assistants" element={<AdminAssistantsPage />} />
            <Route path="/admin/calls" element={<AdminCallsPage />} />
            <Route path="/admin/billing" element={<AdminBillingPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/system" element={<AdminSystemPage />} />
          </Route>

          {/* ── Regular app ───────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/assistants" element={<AssistantListPage />} />
            <Route path="/assistants/new" element={<AssistantEditorPage />} />
            <Route path="/assistants/:id" element={<AssistantEditorPage />} />

            <Route path="/phone-numbers" element={<PhoneNumbersPage />} />
            <Route path="/phone-numbers/:id" element={<PhoneNumberDetailPage />} />

            <Route path="/calls" element={<CallLogsPage />} />
            <Route path="/calls/:id" element={<CallDetailPage />} />

            <Route path="/squads" element={<SquadsPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/api-keys" element={<ApiKeysPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/workflows/:id" element={<WorkflowEditorPage />} />
            <Route path="/session-logs" element={<SessionLogsPage />} />
            <Route path="/metrics" element={<MetricsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
