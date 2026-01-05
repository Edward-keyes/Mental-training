/*
 * 成就勋章页面
 * 展示用户获得的成就和进度
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Lock, 
  Star,
  Flame,
  Target,
  Zap,
  Crown,
  Medal
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/Layout";
import { useUserData } from "@/hooks/useUserData";

export default function Achievements() {
  const { userData } = useUserData();

  // 分类成就
  const categorizedAchievements = useMemo(() => {
    const categories = {
      streak: { name: "坚持不懈", icon: <Flame className="w-5 h-5" />, achievements: [] as typeof userData.achievements },
      skill: { name: "技能精通", icon: <Star className="w-5 h-5" />, achievements: [] as typeof userData.achievements },
      milestone: { name: "里程碑", icon: <Target className="w-5 h-5" />, achievements: [] as typeof userData.achievements },
      special: { name: "特殊成就", icon: <Crown className="w-5 h-5" />, achievements: [] as typeof userData.achievements },
    };

    userData.achievements.forEach(ach => {
      if (ach.id.includes('streak') || ach.id.includes('week') || ach.id.includes('month')) {
        categories.streak.achievements.push(ach);
      } else if (ach.id.includes('master') || ach.id.includes('king') || ach.id.includes('demon')) {
        categories.skill.achievements.push(ach);
      } else if (ach.id.includes('level') || ach.id.includes('training')) {
        categories.milestone.achievements.push(ach);
      } else {
        categories.special.achievements.push(ach);
      }
    });

    return categories;
  }, [userData.achievements]);

  // 统计
  const stats = useMemo(() => {
    const unlocked = userData.achievements.filter(a => a.unlockedAt).length;
    const total = userData.achievements.length;
    return { unlocked, total, percentage: Math.round((unlocked / total) * 100) };
  }, [userData.achievements]);

  // 获取稀有度颜色
  const getRarityColor = (target: number) => {
    if (target >= 100) return "from-yellow-500 to-amber-500"; // 传说
    if (target >= 50) return "from-purple-500 to-pink-500"; // 史诗
    if (target >= 10) return "from-blue-500 to-cyan-500"; // 稀有
    return "from-green-500 to-emerald-500"; // 普通
  };

  const getRarityName = (target: number) => {
    if (target >= 100) return "传说";
    if (target >= 50) return "史诗";
    if (target >= 10) return "稀有";
    return "普通";
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
            <span className="text-glow-gold">成就殿堂</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            记录你的每一个突破和里程碑
          </p>
        </motion.div>

        {/* 总体进度 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">成就收集进度</h2>
                <p className="text-muted-foreground">已解锁 {stats.unlocked} / {stats.total} 个成就</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-yellow-500">{stats.percentage}%</div>
              <div className="text-sm text-muted-foreground">完成度</div>
            </div>
          </div>
          <Progress value={stats.percentage} className="h-3" />
        </motion.div>

        {/* 成就分类 */}
        <div className="space-y-8">
          {Object.entries(categorizedAchievements).map(([key, category], categoryIndex) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + categoryIndex * 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-primary">{category.icon}</span>
                {category.name}
                <span className="text-sm text-muted-foreground ml-2">
                  ({category.achievements.filter(a => a.unlockedAt).length}/{category.achievements.length})
                </span>
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.achievements.map((achievement, index) => {
                  const isUnlocked = !!achievement.unlockedAt;
                  const progress = (achievement.progress / achievement.target) * 100;
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`glass-card rounded-xl p-4 relative overflow-hidden ${
                        isUnlocked ? '' : 'opacity-70'
                      }`}
                    >
                      {/* 背景装饰 */}
                      {isUnlocked && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(achievement.target)} opacity-10`} />
                      )}
                      
                      <div className="relative">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                            isUnlocked 
                              ? `bg-gradient-to-br ${getRarityColor(achievement.target)}` 
                              : 'bg-muted'
                          }`}>
                            {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{achievement.name}</h3>
                              {isUnlocked && (
                                <span className={`px-1.5 py-0.5 rounded text-xs bg-gradient-to-r ${getRarityColor(achievement.target)} text-white`}>
                                  {getRarityName(achievement.target)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                        
                        {!isUnlocked && (
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">进度</span>
                              <span>{achievement.progress} / {achievement.target}</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                          </div>
                        )}
                        
                        {isUnlocked && achievement.unlockedAt && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Medal className="w-3 h-3" />
                            {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')} 解锁
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 成就提示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-muted/20 rounded-2xl"
        >
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            成就小贴士
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 坚持每日训练可以解锁连续训练成就</li>
            <li>• 在特定训练中达到高分可以解锁技能精通成就</li>
            <li>• 完成一定数量的训练可以解锁里程碑成就</li>
            <li>• 成就稀有度：<span className="text-green-500">普通</span> → <span className="text-blue-500">稀有</span> → <span className="text-purple-500">史诗</span> → <span className="text-yellow-500">传说</span></li>
          </ul>
        </motion.div>
      </div>
    </Layout>
  );
}
