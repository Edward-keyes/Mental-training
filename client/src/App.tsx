import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Training from "./pages/Training";
import Dashboard from "./pages/Dashboard";
import Assessment from "./pages/Assessment";
import Achievements from "./pages/Achievements";
import Plans from "./pages/Plans";

// 训练模块页面
import SchulteTable from "./pages/training/SchulteTable";
import StroopTest from "./pages/training/StroopTest";
import SequenceMemory from "./pages/training/SequenceMemory";
import AuditoryAttention from "./pages/training/AuditoryAttention";
import MirrorCoordination from "./pages/training/MirrorCoordination";
import LogicClassification from "./pages/training/LogicClassification";
import SceneAssociation from "./pages/training/SceneAssociation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/training" component={Training} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/plans" component={Plans} />
      
      {/* 训练模块路由 */}
      <Route path="/training/schulte" component={SchulteTable} />
      <Route path="/training/stroop" component={StroopTest} />
      <Route path="/training/sequence-memory" component={SequenceMemory} />
      <Route path="/training/auditory" component={AuditoryAttention} />
      <Route path="/training/mirror" component={MirrorCoordination} />
      <Route path="/training/logic" component={LogicClassification} />
      <Route path="/training/scene" component={SceneAssociation} />
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
