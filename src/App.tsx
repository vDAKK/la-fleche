import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import Home from "./pages/Home";
import Players from "./pages/Players";
import GameConfig from "./pages/GameConfig";
import Game from "./pages/Game";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const isNative = Capacitor.isNativePlatform();
  const Router = isNative ? HashRouter : BrowserRouter;
  const routerProps = isNative ? {} : { basename: import.meta.env.BASE_URL };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router {...routerProps}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/players" element={<Players />} />
            <Route path="/config" element={<GameConfig />} />
            <Route path="/game" element={<Game />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
