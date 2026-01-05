/*
 * 数据仪表盘页面
 * 展示用户训练数据、能力分析和进步曲线
 */

import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Target,
  Flame,
  Award,
  ChevronRight,
  Calendar,
  BarChart3,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";
import Layout from "@/components/Layout";
import { useUserData } from "@/hooks/useUserData";
import { useAdaptiveSystem } from "@/hooks/useAdaptiveSystem";

export default function Dashboard() {
  const { userData, getRecentTrainingData } = useUserData();
  const { analyzeAbilities, getTrainingRecommendations, getDailyPlan } = useAdaptiveSystem();

  // 能力雷达图数据
  const radarData = useMemo(() => {
    return [
      { ability: "注意力", value: userData.abilityScores.attention, fullMark: 100 },
      { ability: "记忆力", value: userData.abilityScores.memory, fullMark: 100 },
      { ability: "反应速度", value: userData.abilityScores.reaction, fullMark: 100 },
      { ability: "逻辑推理", value: userData.abilityScores.logic, fullMark: 100 },
      { ability: "协调能力", value: userData.abilityScores.coordination, fullMark: 100 },
      { ability: "抑制控制", value: userData.abilityScores.inhibition, fullMark: 100 },
    ];
  }, [userData.abilityScores]);

  // 最近7天训练数据
  const weeklyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayRecords = userData.trainingHistory.filter(r => 
        new Date(r.timestamp).toISOString().split('T')[0] === dateStr
      );
      
      days.push({
        date: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        sessions: dayRecords.length,
        avgScore: dayRecords.length > 0 
          ? Math.round(dayRecords.reduce((sum, r) => sum + r.score, 0) / dayRecords.length)
          : 0,
        duration: Math.round(dayRecords.reduce((sum, r) => sum + r.duration, 0) / 60),
      });
    }
    return days;
  }, [userData.trainingHistory]);

  // 能力分析
  const abilityAnalysis = useMemo(() => analyzeAbilities(), [analyzeAbilities]);

  // 训练推荐
  const recommendations = useMemo(() => getTrainingRecommendations().slice(0, 3), [getTrainingRecommendations]);

  // 今日计划
  const dailyPlan = useMemo(() => getDailyPlan(), [getDailyPlan]);

  // 计算等级进度
  const levelProgress = useMemo(() => {
    const expForCurrentLevel = userData.level * 100;
    let currentLevelExp = userData.experience;
    for (let i = 1; i < userData.level; i++) {
      currentLevelExp -= i * 100;
    }
    return Math.min(100, (currentLevelExp / expForCurrentLevel) * 100);
  }, [userData.level, userData.experience]);

  // 趋势图标
  const getTrendIcon = (trend: string) => {
    if (trend === "improving") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === "declining") return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    return <span className="w-4 h-4 text-muted-foreground">—</span>;
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-glow">数据仪表盘</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            追踪你的认知能力成长轨迹
          </p>
        </motion.div>

        {/* 顶部统计卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{userData.totalSessions}</div>
                <div className="text-sm text-muted-foreground">总训练次数</div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(userData.totalTrainingTime / 60)}</div>
                <div className="text-sm text-muted-foreground">总训练分钟</div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{userData.currentStreak}</div>
                <div className="text-sm text-muted-foreground">连续训练天</div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">Lv.{userData.level}</div>
                <div className="text-sm text-muted-foreground">当前等级</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧：能力雷达图和分析 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* 能力雷达图 */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                认知能力画像
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(100, 116, 139, 0.3)" />
                    <PolarAngleAxis 
                      dataKey="ability" 
                      tick={{ fill: 'rgb(148, 163, 184)', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: 'rgb(148, 163, 184)', fontSize: 10 }}
                    />
                    <Radar
                      name="能力值"
                      dataKey="value"
                      stroke="#00D4FF"
                      fill="#00D4FF"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 能力详细分析 */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-secondary" />
                能力详细分析
              </h2>
              <div className="space-y-4">
                {abilityAnalysis.map((analysis, index) => (
                  <div key={analysis.ability} className="p-4 bg-muted/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{analysis.name}</span>
                        {getTrendIcon(analysis.trend)}
                        {analysis.recentChange !== 0 && (
                          <span className={`text-xs ${analysis.recentChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {analysis.recentChange > 0 ? '+' : ''}{analysis.recentChange}
                          </span>
                        )}
                      </div>
                      <span className="text-lg font-bold text-primary">{analysis.score}</span>
                    </div>
                    <Progress value={analysis.score} className="h-2 mb-2" />
                    <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 周训练趋势 */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                本周训练趋势
              </h2>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'rgb(148, 163, 184)', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: 'rgb(148, 163, 184)', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="avgScore" 
                      stroke="#00D4FF" 
                      fill="url(#colorScore)" 
                      name="平均分数"
                    />
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* 周统计 */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {weeklyData.reduce((sum, d) => sum + d.sessions, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">本周训练次数</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">
                    {weeklyData.reduce((sum, d) => sum + d.duration, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">本周训练分钟</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">
                    {Math.round(weeklyData.filter(d => d.avgScore > 0).reduce((sum, d) => sum + d.avgScore, 0) / Math.max(1, weeklyData.filter(d => d.avgScore > 0).length))}
                  </div>
                  <div className="text-xs text-muted-foreground">本周平均分</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 右侧：今日计划和推荐 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* 等级进度 */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">等级进度</h2>
                <span className="text-2xl font-bold text-primary">Lv.{userData.level}</span>
              </div>
              <Progress value={levelProgress} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground text-right">
                {userData.experience} / {userData.level * 100} EXP
              </p>
            </div>

            {/* 今日目标 */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                今日目标
              </h2>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold mb-1">
                  {userData.dailyProgress} / {userData.dailyGoal}
                </div>
                <div className="text-sm text-muted-foreground">分钟</div>
              </div>
              <Progress 
                value={(userData.dailyProgress / userData.dailyGoal) * 100} 
                className="h-3 mb-4" 
              />
              {userData.dailyProgress >= userData.dailyGoal ? (
                <div className="text-center text-green-500 font-medium">
                  🎉 今日目标已完成！
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm">
                  还需 {userData.dailyGoal - userData.dailyProgress} 分钟完成目标
                </div>
              )}
            </div>

            {/* 智能推荐 */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-secondary" />
                智能推荐
              </h2>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <Link 
                    key={rec.trainingType}
                    href={`/training/${rec.trainingType === 'sequence-memory' ? 'sequence-memory' : rec.trainingType}`}
                  >
                    <div className="p-3 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{rec.name}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.reason}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          难度 {rec.suggestedDifficulty}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 成就进度 */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  成就进度
                </h2>
                <Link href="/achievements">
                  <Button variant="ghost" size="sm">
                    查看全部
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {userData.achievements
                  .filter(a => !a.unlockedAt && a.progress > 0)
                  .slice(0, 3)
                  .map(achievement => (
                    <div key={achievement.id} className="p-3 bg-muted/20 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{achievement.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {achievement.progress} / {achievement.target}
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.target) * 100} 
                        className="h-1.5" 
                      />
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
