/*
 * 双侧肢体镜像协调训练模块
 * 核心训练目标：左右脑协调、身体平衡感、精细运动控制
 * 科学原理：利用神经可塑性，同时激活双侧运动皮层，促进脑半球协同
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Trophy,
  Hand,
  Settings,
  Target
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
type Difficulty = "easy" | "medium" | "hard";
type PatternType = "line" | "circle" | "spiral";

interface GameConfig {
  difficulty: Difficulty;
  patternType: PatternType;
}

interface Point {
  x: number;
  y: number;
}

export default function MirrorCoordination() {
  const { addTrainingRecord, updateAbilityScores, updateAchievementProgress, userData } = useUserData();
  
  const [gameState, setGameState] = useState<GameState>("idle");
  const [config, setConfig] = useState<GameConfig>({
    difficulty: "easy",
    patternType: "line",
  });
  
  const [leftPath, setLeftPath] = useState<Point[]>([]);
  const [rightPath, setRightPath] = useState<Point[]>([]);
  const [targetPath, setTargetPath] = useState<Point[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime, setStartTime] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 生成目标路径
  const generateTargetPath = useCallback((): Point[] => {
    const points: Point[] = [];
    const centerX = 150;
    const centerY = 150;
    
    if (config.patternType === "line") {
      // 简单线条
      const startY = 50 + Math.random() * 50;
      const endY = 200 + Math.random() * 50;
      for (let i = 0; i <= 20; i++) {
        points.push({
          x: centerX + (Math.random() - 0.5) * 20,
          y: startY + (endY - startY) * (i / 20),
        });
      }
    } else if (config.patternType === "circle") {
      // 圆形
      const radius = 80;
      for (let i = 0; i <= 36; i++) {
        const angle = (i / 36) * Math.PI * 2;
        points.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        });
      }
    } else {
      // 螺旋
      for (let i = 0; i <= 72; i++) {
        const angle = (i / 18) * Math.PI;
        const radius = 20 + i * 1.5;
        points.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        });
      }
    }
    
    return points;
  }, [config.patternType]);

  // 绘制路径
  const drawPath = (canvas: HTMLCanvasElement | null, path: Point[], color: string, mirror: boolean = false) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (path.length < 2) return;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    const firstPoint = path[0];
    ctx.moveTo(mirror ? canvas.width - firstPoint.x : firstPoint.x, firstPoint.y);
    
    for (let i = 1; i < path.length; i++) {
      const point = path[i];
      ctx.lineTo(mirror ? canvas.width - point.x : point.x, point.y);
    }
    
    ctx.stroke();
  };

  // 绘制目标路径
  const drawTargetPath = useCallback(() => {
    const leftCanvas = leftCanvasRef.current;
    const rightCanvas = rightCanvasRef.current;
    
    if (leftCanvas && rightCanvas) {
      const ctx1 = leftCanvas.getContext("2d");
      const ctx2 = rightCanvas.getContext("2d");
      
      if (ctx1 && ctx2) {
        // 绘制目标路径（虚线）
        ctx1.setLineDash([5, 5]);
        ctx2.setLineDash([5, 5]);
        
        drawPath(leftCanvas, targetPath, "rgba(100, 116, 139, 0.5)");
        drawPath(rightCanvas, targetPath, "rgba(100, 116, 139, 0.5)", true);
        
        ctx1.setLineDash([]);
        ctx2.setLineDash([]);
      }
    }
  }, [targetPath]);

  // 开始游戏
  const startGame = () => {
    setScore(0);
    setRound(1);
    setStartTime(Date.now());
    startRound();
  };

  // 开始一轮
  const startRound = () => {
    const newTargetPath = generateTargetPath();
    setTargetPath(newTargetPath);
    setLeftPath([]);
    setRightPath([]);
    setTimeLeft(config.difficulty === "easy" ? 30 : config.difficulty === "medium" ? 20 : 15);
    setGameState("playing");
    
    // 启动计时器
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          evaluateRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 评估本轮表现
  const evaluateRound = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // 计算同步率（简化版本：比较路径长度和大致形状）
    const leftLen = leftPath.length;
    const rightLen = rightPath.length;
    const targetLen = targetPath.length;
    
    // 长度相似度
    const lengthScore = Math.max(0, 100 - Math.abs(leftLen - rightLen) * 2 - Math.abs(leftLen - targetLen) * 0.5);
    
    // 路径覆盖度（简化计算）
    const coverageScore = Math.min(100, (leftLen + rightLen) / (targetLen * 2) * 100);
    
    const roundScore = Math.round((lengthScore * 0.5 + coverageScore * 0.5));
    setScore(prev => prev + roundScore);
    
    if (round < 5) {
      toast.success(`本轮得分: ${roundScore}，进入第 ${round + 1} 轮`);
      setTimeout(() => {
        setRound(prev => prev + 1);
        startRound();
      }, 1500);
    } else {
      finishGame();
    }
  };

  // 完成游戏
  const finishGame = useCallback(() => {
    setGameState("finished");
    if (timerRef.current) clearInterval(timerRef.current);
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    const avgScore = Math.round(score / 5);
    const finalScore = Math.min(100, avgScore);
    
    // 保存记录
    addTrainingRecord({
      trainingType: "mirror",
      score: finalScore,
      accuracy: avgScore,
      duration,
      difficulty: config.difficulty === "easy" ? 1 : config.difficulty === "medium" ? 2 : 3,
    });

    // 更新能力分数
    const currentCoordination = userData.abilityScores.coordination;
    const newCoordination = Math.min(100, currentCoordination + (finalScore > 70 ? 2 : finalScore > 50 ? 1 : 0));
    updateAbilityScores({ coordination: newCoordination });

    updateAchievementProgress("first_training", 1);
  }, [addTrainingRecord, updateAbilityScores, updateAchievementProgress, userData.abilityScores.coordination, config.difficulty, score, startTime]);

  // 处理触摸/鼠标事件
  const handlePointerDown = (e: React.PointerEvent, isLeft: boolean) => {
    if (gameState !== "playing") return;
    setIsDrawing(true);
    
    const canvas = isLeft ? leftCanvasRef.current : rightCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isLeft) {
      setLeftPath([{ x, y }]);
    } else {
      setRightPath([{ x, y }]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent, isLeft: boolean) => {
    if (!isDrawing || gameState !== "playing") return;
    
    const canvas = isLeft ? leftCanvasRef.current : rightCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isLeft) {
      setLeftPath(prev => [...prev, { x, y }]);
    } else {
      setRightPath(prev => [...prev, { x, y }]);
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  // 绘制用户路径
  useEffect(() => {
    if (gameState === "playing") {
      drawTargetPath();
      drawPath(leftCanvasRef.current, leftPath, "#00D4FF");
      drawPath(rightCanvasRef.current, rightPath, "#8B5CF6", true);
    }
  }, [leftPath, rightPath, gameState, drawTargetPath]);

  // 清理
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <Layout>
      <div className="container py-8 max-w-5xl">
        {/* 返回按钮和标题 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/training">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-glow" style={{ textShadow: "0 0 10px rgba(244, 63, 94, 0.5)" }}>双侧肢体协调</span>
            </h1>
            <p className="text-muted-foreground">
              左右脑协调 · 身体平衡感 · 精细运动控制
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
                <Settings className="w-5 h-5 text-rose-500" />
                <h2 className="text-xl font-semibold">训练设置</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-2">难度等级</label>
                  <Select 
                    value={config.difficulty} 
                    onValueChange={(v) => setConfig(prev => ({ ...prev, difficulty: v as Difficulty }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">简单 (30秒)</SelectItem>
                      <SelectItem value="medium">中等 (20秒)</SelectItem>
                      <SelectItem value="hard">困难 (15秒)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">图形类型</label>
                  <Select 
                    value={config.patternType} 
                    onValueChange={(v) => setConfig(prev => ({ ...prev, patternType: v as PatternType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">直线</SelectItem>
                      <SelectItem value="circle">圆形</SelectItem>
                      <SelectItem value="spiral">螺旋</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/20 rounded-xl p-4 mb-8">
                <h3 className="font-medium mb-2">训练说明</h3>
                <p className="text-sm text-muted-foreground">
                  使用双手（或两个手指）同时在左右两个画布上绘制镜像对称的图形。
                  左侧画布显示目标路径，右侧画布需要绘制其镜像。
                  尽量保持双手同步，追求路径的准确性和对称性。
                </p>
              </div>

              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-8">
                <p className="text-sm text-rose-400">
                  💡 提示：此训练在触摸屏设备上效果最佳，可以真正实现双手同时操作。
                </p>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600"
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
                  <Hand className="w-5 h-5 text-rose-500" />
                  <span className="text-lg">第 <span className="font-bold text-rose-500">{round}</span> / 5 轮</span>
                </div>
                <div className="text-2xl font-mono font-bold text-primary">
                  {timeLeft}s
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-lg font-bold">{score}</span>
                </div>
              </div>

              {/* 双画布区域 */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* 左侧画布 */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">左手 (原图)</p>
                  <canvas
                    ref={leftCanvasRef}
                    width={300}
                    height={300}
                    className="border-2 border-primary/30 rounded-xl bg-muted/10 touch-none cursor-crosshair mx-auto"
                    onPointerDown={(e) => handlePointerDown(e, true)}
                    onPointerMove={(e) => handlePointerMove(e, true)}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                  />
                </div>

                {/* 右侧画布 */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">右手 (镜像)</p>
                  <canvas
                    ref={rightCanvasRef}
                    width={300}
                    height={300}
                    className="border-2 border-secondary/30 rounded-xl bg-muted/10 touch-none cursor-crosshair mx-auto"
                    onPointerDown={(e) => handlePointerDown(e, false)}
                    onPointerMove={(e) => handlePointerMove(e, false)}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                  />
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  沿着虚线绘制，尽量保持双手同步
                </p>
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
              <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-rose-500" />
              </div>

              <h2 className="text-3xl font-bold mb-2">训练完成！</h2>
              
              <div className="grid grid-cols-3 gap-4 my-8 max-w-md mx-auto">
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-rose-500">{score}</div>
                  <div className="text-sm text-muted-foreground">总分</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-secondary">{Math.round(score / 5)}</div>
                  <div className="text-sm text-muted-foreground">平均分</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-500">5</div>
                  <div className="text-sm text-muted-foreground">完成轮数</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600"
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
