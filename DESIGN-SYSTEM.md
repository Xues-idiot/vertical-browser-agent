# Spider 前端设计系统文档

## 概述

本文档记录了 Spider 招聘筛选平台前端重新设计的完整设计规范，参考了 UI/UX Pro Max 技能（50+ 样式、161+ 配色方案、57+ 字体配对）和 Frontend Design 技能的生产级前端设计原则。

---

## 1. 设计风格选择

### 风格定位: Refined Dark SaaS

**选型依据** (UI/UX Pro Max - Style Selection):
- 产品类型: SaaS 招聘筛选工具 (Tool类产品)
- 用户群体: HR专业人员、招聘经理
- 使用场景: 办公环境、长时间使用
- 竞品分析: 需要与传统招聘软件区分，体现智能化、专业感

**风格关键词**:
- Modern Professional - 现代专业
- Glassmorphism - 玻璃拟态
- Layered Depth - 多层次深度
- Subtle Gradient - 微妙渐变

**避免的反模式** (UI/UX Pro Max Anti-Patterns):
- ❌ 避免使用 Inter, Roboto, Arial 等通用字体
- ❌ 避免紫色渐变配白色背景的 clichéd 配色
- ❌ 避免随机混用 flat 和 skeuomorphic 风格
- ❌ 避免 emoji 作为结构性图标

---

## 2. 色彩系统 (Color Palette)

### 主色调: Cyan/Teal Spectrum

**选型依据**: Cyan 传达信任、专业、智能的感觉，适合 B2B SaaS 产品

| 色阶 | Hex值 | 用途 |
|------|-------|------|
| primary-50 | #ecfeff | 高亮背景 |
| primary-100 | #cffafe | 悬停背景 |
| primary-200 | #a5f3fc | 边框高亮 |
| primary-300 | #67e8f9 | 强调文字 |
| primary-400 | #22d3ee | 活跃状态 |
| **primary-500** | **#06b6d4** | 主色调 |
| **primary-600** | **#0891b2** | 主要品牌色 |
| primary-700 | #0e7490 | 深色强调 |
| primary-800 | #155e75 | 深色文字 |
| primary-900 | #164e63 | 深色背景 |

### 辅助色: Violet Spectrum

**选型依据**: Violet 传达创意、智能化，与 Cyan 形成互补

| 色阶 | Hex值 | 用途 |
|------|-------|------|
| accent-400 | #a78bfa | 悬停状态 |
| **accent-500** | **#8b5cf6** | 辅助强调 |
| **accent-600** | **#7c3aed** | 按钮/标签 |
| accent-700 | #6d28d9 | 深色强调 |

### 背景色 (Surface Layers)

**选型依据**: 多层次深度设计，通过 surface 色阶区分内容层级

| 色阶 | Hex值 | 用途 |
|------|-------|------|
| surface-0 | #ffffff | 浅色模式背景 |
| surface-50 | #f8fafc | 浅色模式卡片 |
| surface-800 | #1e293b | 深色模式卡片 |
| surface-900 | #0f172a | 深色模式背景 |
| surface-950 | #020617 | 最深背景 |

### 当前项目实际使用的配色:

```css
--color-bg-deep: #0a0f1a;        /* 最深背景 - 页面背景 */
--color-bg-surface: #111827;      /* 表面背景 - 主卡片 */
--color-bg-elevated: #1a2332;    /* 提升背景 - 悬停状态 */
--color-bg-card: #1f2937;         /* 卡片背景 */

--color-primary: #0891b2;        /* 主品牌色 - Cyan 600 */
--color-primary-hover: #0e7490;   /* 主色悬停 */
--color-primary-light: #22d3ee;   /* 主色亮色 */
--color-primary-glow: rgba(6, 182, 212, 0.3); /* 发光效果 */

--color-accent: #7c3aed;         /* 辅助色 - Violet 600 */
--color-accent-hover: #6d28d9;   /* 辅助色悬停 */

--color-success: #10b981;         /* 成功状态 */
--color-warning: #f59e0b;        /* 警告状态 */
--color-error: #ef4444;          /* 错误状态 */
--color-info: #3b82f6;           /* 信息状态 */

--color-text-primary: #f8fafc;    /* 主要文字 */
--color-text-secondary: #94a3b8;  /* 次要文字 */
--color-text-muted: #64748b;     /* 弱化文字 */

--color-border: #334155;          /* 边框色 */
--color-border-light: #475569;   /* 浅边框 */
```

---

## 3. 字体系统 (Typography)

### 字体配对策略

**选型依据** (UI/UX Pro Max - Typography):
- 避免使用 Inter（过度使用的 AI 生成字体）
- 选择独特但专业的字体组合
- 标题用 Display 字体，正文用 Body 字体

### 选用的字体组合:

| 用途 | 字体 | 特点 |
|------|------|------|
| **Display/Headings** | Plus Jakarta Sans | 现代、几何、有特色 |
| **Body Text** | DM Sans | 清晰、可读、专业 |
| **Monospace/Code** | JetBrains Mono | 等宽、适合数据显示 |

### 字体使用规范:

```css
/* 字体栈 */
font-family-display: 'Plus Jakarta Sans', system-ui, sans-serif;
font-family-body: 'DM Sans', system-ui, sans-serif;
font-family-mono: 'JetBrains Mono', monospace;

/* 字号系统 */
--text-xs: 0.75rem;      /* 12px - 标签、小注释 */
--text-sm: 0.875rem;     /* 14px - 次要文字 */
--text-base: 1rem;       /* 16px - 正文 */
--text-lg: 1.125rem;     /* 18px - 大正文 */
--text-xl: 1.25rem;      /* 20px - 小标题 */
--text-2xl: 1.5rem;      /* 24px - 区块标题 */
--text-3xl: 1.875rem;    /* 30px - 页面标题 */
--text-4xl: 2.25rem;     /* 36px - 大标题 */

/* 行高 */
--leading-tight: 1.25;   /* 紧凑行高 - 标题 */
--leading-normal: 1.5;  /* 标准行高 - 正文 */
--leading-relaxed: 1.75; /* 宽松行高 - 长文本 */

/* 字重 */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## 4. 间距系统 (Spacing)

**选型依据**: 8pt Grid System (Material Design / UI/UX Pro Max)

```css
/* 8pt 递增系统 */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

---

## 5. 圆角系统 (Border Radius)

```css
/* 圆角层次 */
--radius-sm: 0.25rem;     /* 4px - 小元素 */
--radius-md: 0.5rem;      /* 8px - 按钮、输入框 */
--radius-lg: 0.75rem;     /* 12px - 卡片 */
--radius-xl: 1rem;        /* 16px - 大卡片 */
--radius-2xl: 1.5rem;     /* 24px - 特殊卡片 */
--radius-full: 9999px;   /* 圆形 */
```

---

## 6. 阴影系统 (Elevation & Shadows)

**选型依据**: 层次化阴影传达深度和层级关系

```css
/* 阴影层次 */
--shadow-subtle: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-card: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-card-hover: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-elevated: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-modal: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* 发光效果 */
--shadow-glow-primary: 0 0 20px rgb(6 182 212 / 0.3);
--shadow-glow-accent: 0 0 20px rgb(124 58 237 / 0.3);
--shadow-glow-success: 0 0 20px rgb(16 185 129 / 0.3);
```

---

## 7. 动效系统 (Animation)

**选型依据** (UI/UX Pro Max - Animation Rules):
- 动效传达意义，不仅仅是装饰
- 150-300ms 为最佳微交互时长
- 使用 ease-out 进入，ease-in 退出

```css
/* 时长 */
--duration-fast: 150ms;      /* 微交互 */
--duration-normal: 250ms;    /* 标准过渡 */
--duration-slow: 400ms;      /* 复杂动画 */
--duration-slower: 500ms;    /* 页面过渡 */

/* 缓动函数 */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1);  /* 进入 */
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1);  /* 退出 */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* 弹性 */
```

### 动画类型:

| 动画 | 用途 | 时长 |
|------|------|------|
| fade-in | 元素出现 | 300ms |
| fade-in-up | 列表项依次出现 | 400ms |
| scale-in | 弹窗/卡片展开 | 200ms |
| slide-in-right | 侧边栏进入 | 300ms |
| pulse-glow | 强调/加载状态 | 2s infinite |

### 悬停动效规范:

```css
/* 按钮悬停 */
scale(1.02) + shadow-glow

/* 卡片悬停 */
scale(1.01) + border-color变化 + shadow增强

/* 标签悬停 */
scale(1.05) + boxShadow变化
```

---

## 8. 组件设计模式

### 按钮 (Buttons)

**Primary Button**:
- Background: primary-600
- Text: white
- Hover: primary-500 + shadow-glow
- Active: scale(0.98)
- Disabled: opacity 50%

**Secondary Button**:
- Background: surface-800
- Border: border色
- Text: text-secondary
- Hover: surface-700 + border-light

**Ghost Button**:
- Background: transparent
- Text: text-secondary
- Hover: surface-800

### 输入框 (Inputs)

- Background: surface-900
- Border: border色 (1px)
- Border-radius: radius-md
- Focus: primary-500 border + shadow-glow
- Height: 44px (touch target)

### 卡片 (Cards)

- Background: surface-800
- Border: border色
- Border-radius: radius-lg
- Padding: space-6
- Hover: scale(1.01) + shadow-card-hover

### 模态框 (Modals)

- Backdrop: black/50% + backdrop-blur-sm
- Container: surface-800 + radius-xl
- Shadow: shadow-modal
- Animation: scale-in

---

## 9. 无障碍设计 (Accessibility)

**关键规则** (UI/UX Pro Max - Accessibility CRITICAL):

- [ ] 颜色对比度 ≥ 4.5:1
- [ ] 触摸目标 ≥ 44×44px
- [ ] 焦点状态可见 (focus ring)
- [ ] aria-labels 用于图标按钮
- [ ] 支持 prefers-reduced-motion

---

## 10. 实现检查清单

- [x] 设计系统配色定义
- [ ] 更新 globals.css
- [ ] 更新 tailwind.config.js
- [ ] 重新设计 Header/Footer
- [ ] 重新设计 JDInput 组件
- [ ] 重新设计 ResumeList 组件
- [ ] 重新设计 MatchResult 组件
- [ ] 重新设计 ReportView 组件
- [ ] 重新设计 PipelineFunnel 组件
- [ ] 重新设计 CandidateComparison 组件
- [ ] 重新设计 JDComparison 组件
- [ ] 重新设计 BrowserPreview 组件
- [ ] 重新设计 KeyboardShortcutsHelp 组件
- [ ] 验证构建通过
- [ ] 测试响应式布局

---

## 参考资料

- **UI/UX Pro Max Skill**: 50+ styles, 161 color palettes, 57 font pairings
- **Frontend Design Skill**: Production-grade frontend with high design quality
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: React animation library

---

*文档版本: 1.0*
*更新日期: 2026-03-28*
