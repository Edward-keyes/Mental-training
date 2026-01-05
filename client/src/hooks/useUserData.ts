import { useState, useEffect, useCallback } from 'react';

// 训练记录类型
export interface TrainingRecord {
  id: string;
  trainingType: string;
  score: number;
  accuracy: number;
  duration: number; // 秒
  difficulty: number;
  timestamp: number;
}

// 能力评估数据
export interface AbilityScores {
  attention: number;      // 注意力
  memory: number;         // 记忆力
  reaction: number;       // 反应速度
  logic: number;          // 逻辑推理
  coordination: number;   // 协调能力
  inhibition: number;     // 抑制控制
  creativity: number;     // 创造力
}

// 成就类型
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress: number;
  target: number;
}

// 用户数据类型
export interface UserData {
  totalTrainingTime: number;  // 总训练时间（秒）
  totalSessions: number;      // 总训练次数
  currentStreak: number;      // 连续训练天数
  longestStreak: number;      // 最长连续天数
  lastTrainingDate: string;   // 最后训练日期
  level: number;              // 用户等级
  experience: number;         // 经验值
  abilityScores: AbilityScores;
  trainingHistory: TrainingRecord[];
  achievements: Achievement[];
  dailyGoal: number;          // 每日目标（分钟）
  dailyProgress: number;      // 今日进度（分钟）
}

// 默认能力分数
const defaultAbilityScores: AbilityScores = {
  attention: 50,
  memory: 50,
  reaction: 50,
  logic: 50,
  coordination: 50,
  inhibition: 50,
  creativity: 50,
};

// 默认成就列表
const defaultAchievements: Achievement[] = [
  { id: 'first_training', name: '初次启程', description: '完成第一次训练', icon: '🚀', progress: 0, target: 1 },
  { id: 'week_streak', name: '坚持一周', description: '连续训练7天', icon: '🔥', progress: 0, target: 7 },
  { id: 'month_streak', name: '月度坚持', description: '连续训练30天', icon: '💪', progress: 0, target: 30 },
  { id: 'speed_demon', name: '速度恶魔', description: '舒尔特表5x5完成时间低于30秒', icon: '⚡', progress: 0, target: 1 },
  { id: 'memory_master', name: '记忆大师', description: '序列记忆达到10个物品', icon: '🧠', progress: 0, target: 1 },
  { id: 'focus_king', name: '专注之王', description: 'STOP训练连续正确50次', icon: '👑', progress: 0, target: 50 },
  { id: 'all_rounder', name: '全能选手', description: '所有训练模块都完成过', icon: '🌟', progress: 0, target: 7 },
  { id: 'level_10', name: '初级训练师', description: '达到10级', icon: '🎖️', progress: 0, target: 10 },
  { id: 'level_50', name: '高级训练师', description: '达到50级', icon: '🏆', progress: 0, target: 50 },
  { id: 'training_100', name: '百次训练', description: '完成100次训练', icon: '💯', progress: 0, target: 100 },
];

// 默认用户数据
const defaultUserData: UserData = {
  totalTrainingTime: 0,
  totalSessions: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastTrainingDate: '',
  level: 1,
  experience: 0,
  abilityScores: defaultAbilityScores,
  trainingHistory: [],
  achievements: defaultAchievements,
  dailyGoal: 15,
  dailyProgress: 0,
};

const STORAGE_KEY = 'brain_training_user_data';

export function useUserData() {
  const [userData, setUserData] = useState<UserData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 合并默认值，确保新字段存在
        return {
          ...defaultUserData,
          ...parsed,
          abilityScores: { ...defaultAbilityScores, ...parsed.abilityScores },
          achievements: defaultAchievements.map(defaultAch => {
            const existing = parsed.achievements?.find((a: Achievement) => a.id === defaultAch.id);
            return existing ? { ...defaultAch, ...existing } : defaultAch;
          }),
        };
      }
    } catch (e) {
      console.error('Failed to load user data:', e);
    }
    return defaultUserData;
  });

  // 保存到localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to save user data:', e);
    }
  }, [userData]);

  // 检查并更新连续训练天数
  const checkStreak = useCallback((currentDate: string) => {
    setUserData(prev => {
      const lastDate = prev.lastTrainingDate;
      if (!lastDate) {
        return { ...prev, currentStreak: 1, lastTrainingDate: currentDate };
      }
      
      const last = new Date(lastDate);
      const current = new Date(currentDate);
      const diffDays = Math.floor((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return prev; // 同一天
      } else if (diffDays === 1) {
        const newStreak = prev.currentStreak + 1;
        return {
          ...prev,
          currentStreak: newStreak,
          longestStreak: Math.max(prev.longestStreak, newStreak),
          lastTrainingDate: currentDate,
        };
      } else {
        return { ...prev, currentStreak: 1, lastTrainingDate: currentDate };
      }
    });
  }, []);

  // 添加训练记录
  const addTrainingRecord = useCallback((record: Omit<TrainingRecord, 'id' | 'timestamp'>) => {
    const today = new Date().toISOString().split('T')[0];
    checkStreak(today);
    
    const newRecord: TrainingRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setUserData(prev => {
      // 计算经验值
      const expGained = Math.floor(record.score * record.accuracy / 100 * (1 + record.difficulty * 0.1));
      const newExp = prev.experience + expGained;
      
      // 计算等级（每100经验升一级，递增）
      let level = prev.level;
      let remainingExp = newExp;
      while (remainingExp >= level * 100) {
        remainingExp -= level * 100;
        level++;
      }

      // 更新今日进度
      const dailyProgress = prev.lastTrainingDate === today 
        ? prev.dailyProgress + Math.floor(record.duration / 60)
        : Math.floor(record.duration / 60);

      return {
        ...prev,
        totalTrainingTime: prev.totalTrainingTime + record.duration,
        totalSessions: prev.totalSessions + 1,
        level,
        experience: newExp,
        trainingHistory: [newRecord, ...prev.trainingHistory].slice(0, 500), // 保留最近500条
        dailyProgress,
        lastTrainingDate: today,
      };
    });

    return newRecord;
  }, [checkStreak]);

  // 更新能力分数
  const updateAbilityScores = useCallback((updates: Partial<AbilityScores>) => {
    setUserData(prev => ({
      ...prev,
      abilityScores: {
        ...prev.abilityScores,
        ...Object.fromEntries(
          Object.entries(updates).map(([key, value]) => [
            key,
            Math.min(100, Math.max(0, value as number)),
          ])
        ),
      },
    }));
  }, []);

  // 解锁成就
  const unlockAchievement = useCallback((achievementId: string) => {
    setUserData(prev => ({
      ...prev,
      achievements: prev.achievements.map(ach =>
        ach.id === achievementId && !ach.unlockedAt
          ? { ...ach, unlockedAt: Date.now(), progress: ach.target }
          : ach
      ),
    }));
  }, []);

  // 更新成就进度
  const updateAchievementProgress = useCallback((achievementId: string, progress: number) => {
    setUserData(prev => ({
      ...prev,
      achievements: prev.achievements.map(ach => {
        if (ach.id === achievementId) {
          const newProgress = Math.min(progress, ach.target);
          return {
            ...ach,
            progress: newProgress,
            unlockedAt: newProgress >= ach.target && !ach.unlockedAt ? Date.now() : ach.unlockedAt,
          };
        }
        return ach;
      }),
    }));
  }, []);

  // 设置每日目标
  const setDailyGoal = useCallback((minutes: number) => {
    setUserData(prev => ({ ...prev, dailyGoal: minutes }));
  }, []);

  // 重置数据
  const resetData = useCallback(() => {
    setUserData(defaultUserData);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // 获取特定训练类型的历史记录
  const getTrainingHistory = useCallback((trainingType?: string) => {
    if (!trainingType) return userData.trainingHistory;
    return userData.trainingHistory.filter(r => r.trainingType === trainingType);
  }, [userData.trainingHistory]);

  // 获取最近N天的训练数据
  const getRecentTrainingData = useCallback((days: number) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return userData.trainingHistory.filter(r => r.timestamp >= cutoff);
  }, [userData.trainingHistory]);

  return {
    userData,
    addTrainingRecord,
    updateAbilityScores,
    unlockAchievement,
    updateAchievementProgress,
    setDailyGoal,
    resetData,
    getTrainingHistory,
    getRecentTrainingData,
  };
}
