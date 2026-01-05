/*
 * 能力评估页面
 * 提供初始认知能力评估，生成能力画像
 */

import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/Layout";
import { useUserData } from "@/hooks/useUserData";

// 评估阶段
type AssessmentPhase = "intro" | "testing" | "result";

// 评估测试类型
interface AssessmentTest {
  id: string;
  name: string;
  description: string;
  duration: string;
  ability: keyof typeof abilityMap;
}

const abilityMap = {
  attention: "注意力",
  memory: "记忆力",
  reaction: "反应速度",
  logic: "逻辑推理",
  coordination: "协调能力",
  inhibition: "抑制控制",
};

const assessmentTests: AssessmentTest[] = [
  { id: "reaction", name: "反应速度测试", description: "点击出现的目标，测试反应速度", duration: "30秒", ability: "reaction" },
  { id: "memory", name: "数字记忆测试", description: "记住并输入显示的数字序列", duration: "1分钟", ability: "memory" },
  { id: "attention", name: "注意力测试", description: "在干扰中找到目标", duration: "1分钟", ability: "attention" },
  { id: "logic", name: "逻辑推理测试", description: "完成简单的逻辑推理题", duration: "2分钟", ability: "logic" },
];

export default function Assessment() {
  const { updateAbilityScores } = useUserData();
  const [phase, setPhase] = useState<AssessmentPhase>("intro");
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testResults, setTestResults] = useState<Record<string, number>>({});
  const [isTestActive, setIsTestActive] = useState(false);
  
  // 反应测试状态
  const [reactionTargets, setReactionTargets] = useState<{x: number, y: number, id: number}[]>([]);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [reactionStartTime, setReactionStartTime] = useState(0);
  
  // 记忆测试状态
  const [memorySequence, setMemorySequence] = useState<number[]>([]);
  const [memoryInput, setMemoryInput] = useState("");
  const [memoryPhase, setMemoryPhase] = useState<"show" | "input">("show");
  const [memoryLevel, setMemoryLevel] = useState(3);
  const [memoryScore, setMemoryScore] = useState(0);
  
  // 注意力测试状态
  const [attentionGrid, setAttentionGrid] = useState<{value: number, isTarget: boolean}[]>([]);
  const [attentionScore, setAttentionScore] = useState(0);
  const [attentionTimeLeft, setAttentionTimeLeft] = useState(60);
  
  // 逻辑测试状态
  const [logicQuestions, setLogicQuestions] = useState<{question: string, options: string[], answer: number}[]>([]);
  const [logicCurrentQ, setLogicCurrentQ] = useState(0);
  const [logicScore, setLogicScore] = useState(0);

  const currentTest = assessmentTests[currentTestIndex];
  const progress = ((currentTestIndex + 1) / assessmentTests.length) * 100;

  // 开始反应测试
  const startReactionTest = () => {
    setIsTestActive(true);
    setReactionTimes([]);
    showNextTarget();
  };

  const showNextTarget = () => {
    if (reactionTimes.length >= 10) {
      finishReactionTest();
      return;
    }
    
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    setReactionTargets([{ x, y, id: Date.now() }]);
    setReactionStartTime(Date.now());
  };

  const handleReactionClick = () => {
    const time = Date.now() - reactionStartTime;
    setReactionTimes(prev => [...prev, time]);
    setReactionTargets([]);
    setTimeout(showNextTarget, 500 + Math.random() * 1000);
  };

  const finishReactionTest = () => {
    const avgTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
    // 转换为0-100分数，200ms以下100分，600ms以上0分
    const score = Math.max(0, Math.min(100, Math.round((600 - avgTime) / 4)));
    setTestResults(prev => ({ ...prev, reaction: score }));
    setIsTestActive(false);
    nextTest();
  };

  // 开始记忆测试
  const startMemoryTest = () => {
    setIsTestActive(true);
    setMemoryLevel(3);
    setMemoryScore(0);
    generateMemorySequence(3);
  };

  const generateMemorySequence = (length: number) => {
    const seq = Array.from({ length }, () => Math.floor(Math.random() * 10));
    setMemorySequence(seq);
    setMemoryPhase("show");
    setMemoryInput("");
    
    // 显示序列后切换到输入
    setTimeout(() => {
      setMemoryPhase("input");
    }, length * 800 + 500);
  };

  const checkMemoryInput = () => {
    const correct = memoryInput === memorySequence.join("");
    if (correct) {
      setMemoryScore(prev => prev + memoryLevel * 10);
      if (memoryLevel < 8) {
        setMemoryLevel(prev => prev + 1);
        generateMemorySequence(memoryLevel + 1);
      } else {
        finishMemoryTest();
      }
    } else {
      finishMemoryTest();
    }
  };

  const finishMemoryTest = () => {
    const score = Math.min(100, memoryScore + (memoryLevel - 3) * 15);
    setTestResults(prev => ({ ...prev, memory: score }));
    setIsTestActive(false);
    nextTest();
  };

  // 开始注意力测试
  const startAttentionTest = () => {
    setIsTestActive(true);
    setAttentionScore(0);
    setAttentionTimeLeft(60);
    generateAttentionGrid();
    
    const timer = setInterval(() => {
      setAttentionTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishAttentionTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const generateAttentionGrid = () => {
    const grid = Array.from({ length: 25 }, (_, i) => ({
      value: Math.floor(Math.random() * 9) + 1,
      isTarget: i < 5, // 5个目标
    }));
    // 打乱顺序
    for (let i = grid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [grid[i], grid[j]] = [grid[j], grid[i]];
    }
    // 目标数字设为特定值
    grid.forEach((item, i) => {
      if (item.isTarget) item.value = 7;
    });
    setAttentionGrid(grid);
  };

  const handleAttentionClick = (index: number) => {
    if (attentionGrid[index].isTarget) {
      setAttentionScore(prev => prev + 10);
      setAttentionGrid(prev => prev.map((item, i) => 
        i === index ? { ...item, isTarget: false, value: -1 } : item
      ));
      
      // 检查是否全部找到
      const remaining = attentionGrid.filter((item, i) => item.isTarget && i !== index);
      if (remaining.length === 0) {
        generateAttentionGrid();
      }
    }
  };

  const finishAttentionTest = () => {
    const score = Math.min(100, attentionScore);
    setTestResults(prev => ({ ...prev, attention: score }));
    setIsTestActive(false);
    nextTest();
  };

  // 开始逻辑测试
  const startLogicTest = () => {
    setIsTestActive(true);
    setLogicScore(0);
    setLogicCurrentQ(0);
    setLogicQuestions([
      { question: "2, 4, 6, 8, ?", options: ["9", "10", "11", "12"], answer: 1 },
      { question: "如果A>B，B>C，那么A和C的关系是？", options: ["A<C", "A=C", "A>C", "无法确定"], answer: 2 },
      { question: "1, 1, 2, 3, 5, ?", options: ["6", "7", "8", "9"], answer: 2 },
      { question: "所有的狗都是动物，小白是狗，所以？", options: ["小白不是动物", "小白是动物", "无法确定", "小白是猫"], answer: 1 },
      { question: "3, 6, 12, 24, ?", options: ["36", "48", "42", "30"], answer: 1 },
    ]);
  };

  const handleLogicAnswer = (answerIndex: number) => {
    if (answerIndex === logicQuestions[logicCurrentQ].answer) {
      setLogicScore(prev => prev + 20);
    }
    
    if (logicCurrentQ < logicQuestions.length - 1) {
      setLogicCurrentQ(prev => prev + 1);
    } else {
      finishLogicTest();
    }
  };

  const finishLogicTest = () => {
    setTestResults(prev => ({ ...prev, logic: logicScore }));
    setIsTestActive(false);
    nextTest();
  };

  const nextTest = () => {
    if (currentTestIndex < assessmentTests.length - 1) {
      setCurrentTestIndex(prev => prev + 1);
    } else {
      // 所有测试完成，保存结果
      const finalResults = {
        ...testResults,
        coordination: 50, // 默认值
        inhibition: 50,
        creativity: 50,
      };
      updateAbilityScores(finalResults);
      setPhase("result");
    }
  };

  const startTest = () => {
    switch (currentTest.id) {
      case "reaction":
        startReactionTest();
        break;
      case "memory":
        startMemoryTest();
        break;
      case "attention":
        startAttentionTest();
        break;
      case "logic":
        startLogicTest();
        break;
    }
  };

  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <AnimatePresence mode="wait">
          {/* 介绍阶段 */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8">
                <Brain className="w-12 h-12 text-primary" />
              </div>
              
              <h1 className="text-4xl font-bold mb-4">
                <span className="text-glow">认知能力评估</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                通过4个简短测试，全面评估你的认知能力，生成个性化的能力画像，
                为后续训练提供科学依据
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {assessmentTests.map((test, index) => (
                  <div key={test.id} className="glass-card rounded-xl p-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{test.name}</h3>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 text-muted-foreground mb-8">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  总时长约5分钟
                </span>
                <span className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  4项测试
                </span>
              </div>

              <Button 
                size="lg" 
                className="btn-neural text-lg px-8 py-6"
                onClick={() => setPhase("testing")}
              >
                开始评估
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* 测试阶段 */}
          {phase === "testing" && (
            <motion.div
              key="testing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* 进度条 */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>测试进度</span>
                  <span>{currentTestIndex + 1} / {assessmentTests.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* 当前测试 */}
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-2">{currentTest.name}</h2>
                <p className="text-muted-foreground mb-6">{currentTest.description}</p>

                {/* 测试区域 */}
                {!isTestActive ? (
                  <div className="text-center py-12">
                    <Button 
                      size="lg" 
                      className="btn-neural"
                      onClick={startTest}
                    >
                      开始测试
                    </Button>
                  </div>
                ) : (
                  <div className="min-h-[300px]">
                    {/* 反应测试 */}
                    {currentTest.id === "reaction" && (
                      <div 
                        className="relative w-full h-[300px] bg-muted/20 rounded-xl cursor-pointer"
                        onClick={() => reactionTargets.length > 0 && handleReactionClick()}
                      >
                        <div className="absolute top-4 left-4 text-sm text-muted-foreground">
                          点击次数: {reactionTimes.length} / 10
                        </div>
                        {reactionTargets.map(target => (
                          <motion.div
                            key={target.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute w-12 h-12 rounded-full bg-primary glow-blue"
                            style={{ left: `${target.x}%`, top: `${target.y}%` }}
                          />
                        ))}
                        {reactionTargets.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            等待目标出现...
                          </div>
                        )}
                      </div>
                    )}

                    {/* 记忆测试 */}
                    {currentTest.id === "memory" && (
                      <div className="text-center py-8">
                        <div className="text-sm text-muted-foreground mb-4">
                          当前长度: {memoryLevel} 位数字
                        </div>
                        {memoryPhase === "show" ? (
                          <div className="text-6xl font-mono font-bold text-primary tracking-widest">
                            {memorySequence.join(" ")}
                          </div>
                        ) : (
                          <div>
                            <input
                              type="text"
                              value={memoryInput}
                              onChange={(e) => setMemoryInput(e.target.value.replace(/\D/g, ""))}
                              className="text-4xl font-mono text-center bg-muted/20 border border-border rounded-xl px-6 py-4 w-full max-w-xs"
                              placeholder="输入数字"
                              autoFocus
                            />
                            <Button 
                              className="btn-neural mt-4"
                              onClick={checkMemoryInput}
                              disabled={memoryInput.length !== memoryLevel}
                            >
                              确认
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 注意力测试 */}
                    {currentTest.id === "attention" && (
                      <div>
                        <div className="flex justify-between text-sm mb-4">
                          <span>找出所有数字 7</span>
                          <span className="text-primary">得分: {attentionScore}</span>
                          <span>剩余时间: {attentionTimeLeft}s</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {attentionGrid.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => handleAttentionClick(index)}
                              className={`aspect-square text-2xl font-bold rounded-lg transition-all ${
                                item.value === -1 
                                  ? "bg-green-500/20 text-green-500" 
                                  : "bg-muted/30 hover:bg-muted/50"
                              }`}
                              disabled={item.value === -1}
                            >
                              {item.value === -1 ? "✓" : item.value}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 逻辑测试 */}
                    {currentTest.id === "logic" && logicQuestions.length > 0 && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-4">
                          问题 {logicCurrentQ + 1} / {logicQuestions.length}
                        </div>
                        <h3 className="text-xl font-semibold mb-6">
                          {logicQuestions[logicCurrentQ].question}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {logicQuestions[logicCurrentQ].options.map((option, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="py-6 text-lg"
                              onClick={() => handleLogicAnswer(index)}
                            >
                              {option}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 结果阶段 */}
          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              
              <h1 className="text-4xl font-bold mb-4">
                评估完成！
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                你的认知能力画像已生成
              </p>

              {/* 结果展示 */}
              <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
                {Object.entries(testResults).map(([key, value]) => (
                  <div key={key} className="glass-card rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{abilityMap[key as keyof typeof abilityMap]}</span>
                      <span className="text-primary font-bold">{value}分</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full progress-glow"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="btn-neural">
                    查看详细报告
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/training">
                  <Button size="lg" variant="outline">
                    开始训练
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
