// Game Configuration Module
export const CONFIG = {
    difficulties: {
        easy: {
            name: '简单',
            range: [1, 5],
            hasTimer: false,
            cardsPerReward: 10,
            bgClass: 'bg-easy',
            timerSeconds: null,
            ponyIndex: 0
        },
        medium: {
            name: '中等',
            range: [1, 8],
            hasTimer: true,
            cardsPerReward: 10,
            bgClass: 'bg-medium',
            timerSeconds: 15,
            ponyIndex: 1,
            wrongPenalty: 1
        },
        hard: {
            name: '困难',
            range: [1, 10],
            hasTimer: true,
            cardsPerReward: 10,
            bgClass: 'bg-hard',
            timerSeconds: 10,
            ponyIndex: 2
        },
        infinite: {
            name: '无限',
            range: [1, 10],
            hasTimer: false,
            cardsPerReward: 10,
            bgClass: 'bg-infinite',
            timerSeconds: null,
            ponyIndex: 3
        },
        hell: {
            name: '地狱',
            range: [1, 30],
            hasTimer: true,
            cardsPerReward: 10,
            bgClass: 'bg-hell',
            timerSeconds: 8,
            ponyIndex: 4
        }
    },

    // Card collection - 63 cards from split images
    cards: (() => {
        const encouragements = [
            '你是最棒的！', '继续加油！', '太厉害了！', '数学小天才！',
            '真聪明！', '了不起！', '超级棒！', '学习之星！',
            '进步神速！', '思维敏捷！', '勇往直前！', '坚持就是胜利！',
            '你做到了！', '精彩绝伦！', '闪闪发光！', '独一无二！',
            '天赋异禀！', '妙不可言！', '出类拔萃！', '无与伦比！',
            '卓越非凡！', '光芒四射！', '才华横溢！', '潜力无限！',
            '未来之星！', '智慧满满！', '小马达人！', '友谊魔法！',
            '彩虹闪耀！', '勇敢前行！', '心想事成！', '快乐无限！',
            '魔力满满！', '闪亮登场！', '奇迹发生！', '梦想成真！',
            '活力四射！', '信心满满！', '步步高升！', '一路向前！',
            '璀璨夺目！', '惊喜连连！', '精益求精！', '更上层楼！',
            '奋勇向前！', '超越自我！', '乘风破浪！', '披荆斩棘！',
            '所向披靡！', '势不可挡！', '一往无前！', '勇攀高峰！',
            '登峰造极！', '炉火纯青！', '出神入化！', '叹为观止！',
            '令人惊叹！', '完美无瑕！', '无可挑剔！', '绝对精彩！',
            '超凡脱俗！', '鹤立鸡群！', '独占鳌头！'
        ];
        const cards = [];
        for (let i = 1; i <= 63; i++) {
            cards.push({
                id: i,
                image: `images/card/${i}.png`,
                encouragement: encouragements[i - 1]
            });
        }
        return cards;
    })(),

    // Points
    pointsPerCorrect: 10,
    bonusPointsStreak: 5,

    // Sounds - Web Audio API frequencies
    sounds: {
        correct: { frequency: 880, duration: 0.15, type: 'sine' },
        wrong: { frequency: 220, duration: 0.3, type: 'triangle' },
        collect: { frequency: 1200, duration: 0.2, type: 'sine' },
        click: { frequency: 600, duration: 0.05, type: 'square' }
    }
};
