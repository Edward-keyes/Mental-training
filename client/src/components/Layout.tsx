import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Brain, 
  Home, 
  Gamepad2, 
  BarChart3, 
  ClipboardCheck, 
  Trophy,
  Calendar,
  Zap,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/", label: "首页", icon: Home },
  { path: "/training", label: "训练中心", icon: Gamepad2 },
  { path: "/daily-challenge", label: "每日挑战", icon: Zap, highlight: true },
  { path: "/plans", label: "训练计划", icon: Calendar },
  { path: "/dashboard", label: "数据面板", icon: BarChart3 },
  { path: "/assessment", label: "能力评估", icon: ClipboardCheck },
  { path: "/achievements", label: "成就勋章", icon: Trophy },
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <motion.div 
                className="flex items-center gap-3 cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  <Brain className="w-8 h-8 text-primary" />
                  <div className="absolute inset-0 blur-lg bg-primary/30 -z-10" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] bg-clip-text text-transparent">
                  脑力训练大师
                </span>
              </motion.div>
            </Link>

            {/* 桌面端导航 */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                const isHighlight = 'highlight' in item && item.highlight;
                return (
                  <Link key={item.path} href={item.path}>
                    <motion.div
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                        isActive 
                          ? "bg-primary/20 text-primary" 
                          : isHighlight
                          ? "text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className={`w-4 h-4 ${isHighlight && !isActive ? 'animate-pulse' : ''}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden glass-card border-t border-border/50"
          >
            <nav className="container py-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive 
                          ? "bg-primary/20 text-primary" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </header>

      {/* 主内容区域 */}
      <main className="pt-16">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-border/50 py-8 mt-16">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="text-sm">
            © 2025 脑力训练大师 - 科学训练，激活大脑潜能
          </p>
        </div>
      </footer>
    </div>
  );
}
