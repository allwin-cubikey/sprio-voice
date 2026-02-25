import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute, PublicRoute, AdminRoute } from './components/ProtectedRoute';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { AdminUsersPage } from './admin/pages/AdminUsersPage';
import { AdminOrgsPage } from './admin/pages/AdminOrgsPage';
import { AdminAssistantsPage } from './admin/pages/AdminAssistantsPage';
import { AdminCallsPage } from './admin/pages/AdminCallsPage';
import { AdminBillingPage } from './admin/pages/AdminBillingPage';
import { AdminSystemPage } from './admin/pages/AdminSystemPage';
import { AdminAnalyticsPage } from './admin/pages/AdminAnalyticsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssistantListPage } from './pages/assistants/AssistantListPage';
import { AssistantEditorPage } from './pages/assistants/AssistantEditorPage';
import { CallLogsPage, CallDetailPage } from './pages/CallsPage';
import { PhoneNumbersPage, PhoneNumberDetailPage } from './pages/PhoneNumbersPage';
import { SquadsPage } from './pages/SquadsPage';
import { ToolsPage } from './pages/ToolsPage';
import { FilesPage } from './pages/FilesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ApiKeysPage } from './pages/ApiKeysPage';
import { BillingPage } from './pages/BillingPage';
import { SettingsPage } from './pages/SettingsPage';
import { DocsPage } from './pages/DocsPage';
import { LoginPage, SignupPage, ForgotPasswordPage } from './pages/AuthPages';
import { WorkflowsPage, WorkflowEditorPage } from './pages/WorkflowsPage';
import { SessionLogsPage } from './pages/SessionLogsPage';
import { MetricsPage } from './pages/MetricsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

        {/* ── Admin portal ──────────────────────────────────────────────────── */}
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

        {/* ── Regular app ───────────────────────────────────────────────────── */}
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
    </BrowserRouter>
  );
}
