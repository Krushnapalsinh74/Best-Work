import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute } from "@/components/auth/AuthContext";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Users from "@/pages/users";
import UserDetail from "@/pages/user-detail";
import Activities from "@/pages/activities";
import Challenges from "@/pages/challenges";
import Events from "@/pages/events";
import Badges from "@/pages/badges";
import Leaderboard from "@/pages/leaderboard";
import Notifications from "@/pages/notifications";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import AuditLogs from "@/pages/audit-logs";

setAuthTokenGetter(() => localStorage.getItem("dokra_admin_token"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/users/:id">
        <ProtectedRoute><UserDetail /></ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute><Users /></ProtectedRoute>
      </Route>
      <Route path="/activities">
        <ProtectedRoute><Activities /></ProtectedRoute>
      </Route>
      <Route path="/challenges">
        <ProtectedRoute><Challenges /></ProtectedRoute>
      </Route>
      <Route path="/events">
        <ProtectedRoute><Events /></ProtectedRoute>
      </Route>
      <Route path="/badges">
        <ProtectedRoute><Badges /></ProtectedRoute>
      </Route>
      <Route path="/leaderboard">
        <ProtectedRoute><Leaderboard /></ProtectedRoute>
      </Route>
      <Route path="/notifications">
        <ProtectedRoute><Notifications /></ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute><Reports /></ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute><Settings /></ProtectedRoute>
      </Route>
      <Route path="/audit-logs">
        <ProtectedRoute><AuditLogs /></ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
