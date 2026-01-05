/*
 * 舒尔特表训练模块
 * 核心训练目标：视觉搜索速度、注意力广度与稳定性
 * 科学原理：通过动态练习锻炼视神经末梢和视觉定向搜索能力
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Trophy,
  Clock,
  Target,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import Layout from "@/components/Layout";
import { useUserData } from "@/hooks/useUserData";
import { toast } from "sonner";

type GameState = "idle" | "playing" | "finished";
type GridSize = 3 | 4 | 5;
type ContentType = "numbers" | "letters" | "mixed";

interface GameConfig {
  gridSize: GridSize;
  contentType: ContentType;
  colorMode: boolean;
}

export default function SchulteTable() {
  const { addTrainingRecord, updateAbilityScores, updateAchievementProgress, userData } = useUserData();
  
  const [gameState, setGameState] = useState<GameState>("idle");
  const [config, setConfig] = useState<GameConfig>({
    gridSize: 3,
    contentType: "numbers",
    colorMode: false,
  });
  
  const [grid, setGrid] = useState<string[]>([]);
  const [currentTarget, setCurrentTarget] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [clickedCells, setClickedCells] = useState<Set<number>>(new Set());

  // 生成网格内容
  const generateGrid = useCallback(() => {
    const size = config.gridSize * config.gridSize;
    let items: string[] = [];
    
    if (config.contentType === "numbers") {
      items = Array.from({ length: size }, (_, i) => String(i + 1));
    } else if (config.contentType === "letters") {
      items = Array.from({ length: size }, (_, i) => String.fromCharCode(65 + i));
    } else {
      // 混合模式：数字和字母交替
      items = Array.from({ length: size }, (_, i) => 
        i % 2 === 0 ? String(Math.floor(i / 2) + 1) : String.fromCharCode(65 + Math.floor(i / 2))
      );
    }
    
    // 随机打乱
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    
    return items;
  }, [config.gridSize, config.contentType]);

  // 获取目标序列
  const getTargetSequence = useCallback(() => {
    const size = config.gridSize * config.gridSize;
    if (config.contentType === "numbers") {
      return Array.from({ length: size }, (_, i) => String(i + 1));
    } else if (config.contentType === "letters") {
      return Array.from({ length: size }, (_, i) => String.fromCharCode(65 + i));
    } else {
      return Array.from({ length: size }, (_, i) => 
        i % 2 === 0 ? String(Math.floor(i / 2) + 1) : String.fromCharCode(65 + Math.floor(i / 2))
      );
    }
  }, [config.gridSize, config.contentType]);

  // 开始游戏
  const startGame = () => {
    setGrid(generateGrid());
    setCurrentTarget(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setMistakes(0);
    setClickedCells(new Set());
    setGameState("playing");
  };

  // 计时器
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing") {
      timer = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(timer);
  }, [gameState, startTime]);

  // 处理点击
  const handleCellClick = (index: number) => {
    if (gameState !== "playing") return;
    
    const targetSequence = getTargetSequence();
    const clickedValue = grid[index];
    const expectedValue = targetSequence[currentTarget];
    
    if (clickedValue === expectedValue) {
      // 正确点击
      setClickedCells(prev => new Set(prev).add(index));
      
      if (currentTarget === targetSequence.length - 1) {
        // 游戏完成
        finishGame();
      } else {
        setCurrentTarget(prev => prev + 1);
      }
    } else {
      // 错误点击
      setMistakes(prev => prev + 1);
      toast.error("点击错误！", { duration: 500 });
    }
  };

  // 完成游戏
  const finishGame = () => {
    setGameState("finished");
    const totalTime = (Date.now() - startTime) / 1000;
    const totalCells = config.gridSize * config.gridSize;
    
    // 计算分数
    // 基础分：根据时间计算（越快越高）
    const timeScore = Math.max(0, 100 - totalTime * 2);
    // 准确率加成
    const accuracy = Math.max(0, 100 - mistakes * 10);
    // 难度加成
    const difficultyBonus = (config.gridSize - 3) * 10 + (config.contentType !== "numbers" ? 10 : 0);
    
    const finalScore = Math.round(Math.min(100, timeScore * (accuracy / 100) + difficultyBonus));
    
    // 保存记录
    addTrainingRecord({
      trainingType: "schulte",
      score: finalScore,
      accuracy,
      duration: Math.round(totalTime),
      difficulty: config.gridSize,
    });

    // 更新能力分数
    const currentAttention = userData.abilityScores.attention;
    const newAttention = Math.min(100, currentAttention + (finalScore > 70 ? 2 : finalScore > 50 ? 1 : 0));
    updateAbilityScores({ attention: newAttention });

    // 检查成就
    if (config.gridSize === 5 && totalTime < 30) {
      updateAchievementProgress("speed_demon", 1);
      toast.success("🏆 解锁成就：速度恶魔！");
    }

    updateAchievementProgress("first_training", 1);
  };

  // 格式化时间
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const decimals = Math.floor((ms % 1000) / 100);
    return `${seconds}.${decimals}`;
  };

  // 获取单元格颜色
  const getCellColor = (index: number) => {
    if (clickedCells.has(index)) {
      return "bg-green-500/30 border-green-500";
    }
    if (config.colorMode) {
      const colors = [
        "bg-cyan-500/20 border-cyan-500/50",
        "bg-purple-500/20 border-purple-500/50",
        "bg-emerald-500/20 border-emerald-500/50",
        "bg-orange-500/20 border-orange-500/50",
      ];
      return colors[index % colors.length];
    }
    return "bg-muted/30 border-border hover:border-primary/50";
  };

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* 返回按钮和标题 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/training">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-glow">舒尔特表</span>
            </h1>
            <p className="text-muted-foreground">
              视觉搜索速度 · 注意力广度 · 注意力稳定性
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* 设置界面 */}
          {gameState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">训练设置</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-2">网格大小</label>
                  <Select 
                    value={String(config.gridSize)} 
                    onValueChange={(v) => setConfig(prev => ({ ...prev, gridSize: Number(v) as GridSize }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3×3 (入门)</SelectItem>
                      <SelectItem value="4">4×4 (进阶)</SelectItem>
                      <SelectItem value="5">5×5 (挑战)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">内容类型</label>
                  <Select 
                    value={config.contentType} 
                    onValueChange={(v) => setConfig(prev => ({ ...prev, contentType: v as ContentType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="numbers">纯数字</SelectItem>
                      <SelectItem value="letters">纯字母</SelectItem>
                      <SelectItem value="mixed">数字+字母</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/20 rounded-xl p-4 mb-8">
                <h3 className="font-medium mb-2">训练说明</h3>
                <p className="text-sm text-muted-foreground">
                  按照顺序（1, 2, 3... 或 A, B, C...）快速点击网格中的内容。
                  训练你的视觉搜索能力和注意力集中度。尽量减少眼球移动，用余光扫视整个网格。
                </p>
              </div>

              <Button 
                size="lg" 
                className="btn-neural w-full"
                onClick={startGame}
              >
                <Play className="w-5 h-5 mr-2" />
                开始训练
              </Button>
            </motion.div>
          )}

          {/* 游戏界面 */}
          {gameState === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl p-8"
            >
              {/* 状态栏 */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-mono font-bold">{formatTime(elapsedTime)}s</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-secondary" />
                  <span className="text-lg">
                    下一个: <span className="font-bold text-primary">{getTargetSequence()[currentTarget]}</span>
                  </span>
                </div>
                <div className="text-muted-foreground">
                  错误: {mistakes}
                </div>
              </div>

              {/* 网格 */}
              <div 
                className="grid gap-2 mx-auto"
                style={{ 
                  gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
                  maxWidth: config.gridSize * 80 + (config.gridSize - 1) * 8,
                }}
              >
                {grid.map((value, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: clickedCells.has(index) ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCellClick(index)}
                    disabled={clickedCells.has(index)}
                    className={`aspect-square rounded-xl border-2 text-2xl md:text-3xl font-bold transition-all ${getCellColor(index)}`}
                  >
                    {clickedCells.has(index) ? "✓" : value}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* 结果界面 */}
          {gameState === "finished" && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-green-500" />
              </div>

              <h2 className="text-3xl font-bold mb-2">训练完成！</h2>
              
              <div className="grid grid-cols-3 gap-4 my-8 max-w-md mx-auto">
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-primary">{formatTime(elapsedTime)}s</div>
                  <div className="text-sm text-muted-foreground">用时</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-secondary">{mistakes}</div>
                  <div className="text-sm text-muted-foreground">错误</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-500">
                    {Math.round(Math.min(100, Math.max(0, 100 - (elapsedTime / 1000) * 2) * (1 - mistakes * 0.1)))}
                  </div>
                  <div className="text-sm text-muted-foreground">得分</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  className="btn-neural"
                  onClick={startGame}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  再来一次
                </Button>
                <Link href="/training">
                  <Button size="lg" variant="outline">
                    返回训练中心
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
