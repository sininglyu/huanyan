<!DOCTYPE html>
<html class="light"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;family=Dancing+Script:wght@600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#C69C6D",
                        "primary-dark": "#8C6B4B",
                        "background-light": "#fffaf9",
                        "background-dark": "#1e1914",
                        "accent": "#F5E6D3",
                        "peach-light": "#F9F3EA"
                    },
                    fontFamily: {
                        "display": ["Manrope", "sans-serif"],
                        "cursive": ["Dancing Script", "cursive"]
                    },
                    borderRadius: { "DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .fill-icon {
            font-variation-settings: 'FILL' 1;
        }
        body {
            min-height: max(884px, 100dvh);
        }#edit-post-modal {
            display: none;
        }
        #edit-post-trigger:checked ~ #edit-post-modal {
            display: flex;
        }textarea::-webkit-scrollbar {
            width: 8px;
        }
        textarea::-webkit-scrollbar-track {
            background: transparent;
        }
        textarea::-webkit-scrollbar-thumb {
            background-color: rgba(198, 156, 109, 0.3);
            border-radius: 20px;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-[#161412] dark:text-white min-h-screen">
<input class="hidden peer" id="edit-post-trigger" type="checkbox"/>
<div class="relative flex h-auto min-h-screen w-full max-w-[430px] mx-auto flex-col overflow-x-hidden shadow-2xl border-x border-gray-100 dark:border-zinc-800">
<div class="sticky top-0 z-40 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between">
<div class="text-primary flex size-12 shrink-0 items-center">
<span class="material-symbols-outlined">menu</span>
</div>
<h2 class="text-primary text-3xl font-cursive leading-tight tracking-tight flex-1 text-center">焕颜社区中心</h2>
<div class="flex w-12 items-center justify-end">
<button class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-transparent text-primary gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
<span class="material-symbols-outlined">notifications</span>
</button>
</div>
</div>
<div class="px-4 py-3">
<label class="flex flex-col min-w-40 h-12 w-full">
<div class="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
<div class="text-[#81766a] flex border-none bg-white dark:bg-zinc-800 items-center justify-center pl-4 rounded-l-xl border-r-0">
<span class="material-symbols-outlined text-[20px]">search</span>
</div>
<input class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#161412] dark:text-white focus:outline-0 focus:ring-0 border-none bg-white dark:bg-zinc-800 focus:border-none h-full placeholder:text-[#81766a] px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal" placeholder="搜索群组或讨论"/>
</div>
</label>
</div>
<div class="flex items-center justify-between px-4 pt-4 pb-2">
<h3 class="text-[#161412] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">社区中心</h3>
<span class="text-primary text-sm font-semibold">查看全部</span>
</div>
<div class="grid grid-cols-2 gap-4 p-4">
<div class="bg-cover bg-center flex flex-col gap-3 rounded-xl justify-end p-4 aspect-square shadow-md border border-white dark:border-zinc-700 relative overflow-hidden" style='background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCGzO4vibrIVycx--Qe8fd1txo7rLzn6XVmUlmBaPBSdojNJM0LNN6flXzpNwu2GBzX_cDaNAbMoFI7Uv-2FeoAB8ayeQOnneXRSy4064jgdaZy3yYN2jllHyndyMJHVjkSk_OPQ4BsWmX-5DISl3CEmI6fiI9MxtioZBYkSHxBApsFHKR4hY7mVTtJGAYk5sxyeRBk-LTRLJJLYXGks6VorARIzreF33BhYiZbpjF1Hc3-KYovDFmAlcsVWZk7N2bZf97vnPkhKV3T");'>
<p class="text-white text-base font-bold leading-tight">油皮战士</p>
<div class="flex items-center gap-1">
<span class="text-[10px] text-white/90 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/20">2400 成员</span>
</div>
</div>
<div class="bg-cover bg-center flex flex-col gap-3 rounded-xl justify-end p-4 aspect-square shadow-md border border-white dark:border-zinc-700 relative overflow-hidden" style='background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCRwPXfeLH3yq8ErR3yRPNXBl-nm7abTENaQZr_Q9KYAQdUzGCjndlNTl6CykFm35PBvk5w1g_UaO8-wjYkM1lJ8MjUe1iyMKMMr6hikkNz4oCrFbkFk-bN72c4p6Ije_8klqBAp_Rb0Yssli1t3hccqpvdE_RCp4Pn_nV973C2-gY7I_xbZ-hmjte5buBsgZxThnViZ-LsgJvWCHc-pVz8vUZ4x1y6LPHzdWxxcf3Y4sYCZIZ_pguJOFZpeqmXtJq4xydLw6_7fFyM");'>
<p class="text-white text-base font-bold leading-tight">抗老先锋</p>
<div class="flex items-center gap-1">
<span class="text-[10px] text-white/90 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/20">5100 成员</span>
</div>
</div>
<div class="bg-cover bg-center flex flex-col gap-3 rounded-xl justify-end p-4 aspect-square shadow-md border border-white dark:border-zinc-700 relative overflow-hidden" style='background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDxNWwcGcV9yCzENGCGkb3JDmGRJJfJttSCAkCVd8cN-_vKrIBd7nYUbLmPe57rsBtcNlGHLOKsjB2HFzhDwWg5QAdhc__dKyljZy1My4OFWB2E_leAxE2oluKmiCKWoa2SF0XwIMg3eTR3wP9Tq5_2I6N8ATVhGMoDnG_PBd_Dt6qzu77SrWJ0r4gXSptpOIR78IQLTmeNWgBj-EutemWAm--ikOBHhxTqqcQSVsf1foOioMyj1KNQe1jAdMMZ4xVZpCUVAcmGhZ2Q");'>
<p class="text-white text-base font-bold leading-tight">祛痘历程</p>
<div class="flex items-center gap-1">
<span class="text-[10px] text-white/90 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/20">1.2万 成员</span>
</div>
</div>
<div class="bg-cover bg-center flex flex-col gap-3 rounded-xl justify-end p-4 aspect-square shadow-md border border-white dark:border-zinc-700 relative overflow-hidden" style='background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDTf2N6Bj0APcnS3SchyhQQQ7hazORHzl-7Opj7IzY3CDmixuVZB9hce5JWKrajaLDfIv37Wzlr-PfFEnE9LZ0WMCSeUGF8RGLIRHLz41kfwyCKyayZA6mkyUpU5efnZwtC5CyCh4cZo1qJluMrvQg_7hMeEtV1Dmbim4nZEDvJehh6jvVC33C_O-rRK_eveyv5oQXxLxYUdeQiDTWmgAAboldOxU-Yz53-PIXVCwnV_HoEu6HhtbRyoAqGwS92fF18W1xYqAEhxygg");'>
<p class="text-white text-base font-bold leading-tight">敏肌呵护</p>
<div class="flex items-center gap-1">
<span class="text-[10px] text-white/90 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/20">1800 成员</span>
</div>
</div>
</div>
<h3 class="text-[#161412] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">热门讨论</h3>
<div class="flex flex-col gap-3 px-4 pb-6">
<div class="flex gap-4 items-start bg-white dark:bg-zinc-800/50 p-4 rounded-xl shadow-sm border border-primary/10">
<div class="bg-primary/10 p-2 rounded-lg">
<span class="material-symbols-outlined text-primary fill-icon">local_fire_department</span>
</div>
<div class="flex-1">
<h4 class="font-bold text-sm leading-tight text-[#161412] dark:text-white">SPF 50 防晒真的有区别吗？</h4>
<p class="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">245 评论 • 12分钟前</p>
</div>
<div class="flex flex-col items-center">
<span class="material-symbols-outlined text-zinc-400">arrow_drop_up</span>
<span class="text-xs font-bold text-primary">1.2k</span>
</div>
</div>
<div class="flex gap-4 items-start bg-white dark:bg-zinc-800/50 p-4 rounded-xl shadow-sm border border-primary/10">
<div class="bg-primary/10 p-2 rounded-lg">
<span class="material-symbols-outlined text-primary fill-icon">spa</span>
</div>
<div class="flex-1">
<h4 class="font-bold text-sm leading-tight text-[#161412] dark:text-white">评测：Bloom 推出的新款玻尿酸精华</h4>
<p class="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">89 评论 • 1小时前</p>
</div>
<div class="flex flex-col items-center">
<span class="material-symbols-outlined text-zinc-400">arrow_drop_up</span>
<span class="text-xs font-bold text-primary">842</span>
</div>
</div>
<div class="flex gap-4 items-start bg-white dark:bg-zinc-800/50 p-4 rounded-xl shadow-sm border border-primary/10">
<div class="bg-primary/10 p-2 rounded-lg">
<span class="material-symbols-outlined text-primary fill-icon">science</span>
</div>
<div class="flex-1">
<h4 class="font-bold text-sm leading-tight text-[#161412] dark:text-white">维C和视黄醇可以混合使用吗？</h4>
<p class="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">156 评论 • 3小时前</p>
</div>
<div class="flex flex-col items-center">
<span class="material-symbols-outlined text-zinc-400">arrow_drop_up</span>
<span class="text-xs font-bold text-primary">612</span>
</div>
</div>
</div>
<div class="px-4 pb-32">
<div class="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 flex flex-col gap-4 shadow-lg shadow-primary/20 text-white relative overflow-hidden">
<div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
<div class="flex items-center justify-between">
<div class="bg-white/30 backdrop-blur-md p-2 rounded-lg">
<span class="text-2xl">🤝</span>
</div>
<span class="material-symbols-outlined text-white/60">close</span>
</div>
<div>
<h3 class="text-xl font-bold">寻找你的焕颜伙伴</h3>
<p class="text-white/90 text-sm mt-1">与拥有相同肤质的人联系，获取互相激励和护肤贴士。</p>
</div>
<button class="bg-white text-primary font-bold py-3 px-6 rounded-xl text-center shadow-md active:scale-95 transition-transform">
                    开始匹配
                </button>
</div>
</div>
<label class="fixed bottom-24 right-4 z-40 cursor-pointer group transition-transform active:scale-95" for="edit-post-trigger">
<div class="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-xl shadow-primary/40 flex items-center justify-center text-white ring-4 ring-white/20 dark:ring-black/20">
<span class="material-symbols-outlined text-3xl transition-transform group-hover:rotate-90">add</span>
</div>
</label>
<div class="fixed inset-0 z-50 flex-col bg-background-light dark:bg-background-dark max-w-[430px] mx-auto w-full h-full overflow-hidden" id="edit-post-modal">
<div class="flex items-center justify-between px-4 py-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-zinc-100 dark:border-zinc-800">
<label class="text-primary-dark dark:text-primary cursor-pointer p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" for="edit-post-trigger">
<span class="material-symbols-outlined">close</span>
</label>
<h2 class="text-lg font-bold text-[#161412] dark:text-white">发布帖子</h2>
<button class="text-primary font-bold text-base px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">发布</button>
</div>
<div class="flex-1 overflow-y-auto px-5 pt-6 pb-20">
<div class="mb-6">
<input class="w-full bg-transparent text-xl font-bold text-[#161412] dark:text-white placeholder:text-zinc-400 border-none focus:ring-0 p-0 mb-2" placeholder="加一个响亮的标题..." type="text"/>
<div class="h-0.5 w-12 bg-primary rounded-full"></div>
</div>
<div class="mb-6 h-[40vh]">
<textarea class="w-full h-full bg-transparent text-base leading-relaxed text-[#594a3d] dark:text-zinc-300 placeholder:text-zinc-400 border-none focus:ring-0 p-0 resize-none" placeholder="分享你的护肤心得、产品评测或提出你的疑问..."></textarea>
</div>
<div class="flex flex-col gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-6">
<div class="flex items-center justify-between">
<span class="text-sm font-bold text-[#8C6B4B] dark:text-primary flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">label</span>
                            添加标签
                        </span>
<span class="material-symbols-outlined text-zinc-400 text-sm">chevron_right</span>
</div>
<div class="flex flex-wrap gap-2">
<button class="px-3 py-1.5 rounded-full bg-[#F9F3EA] dark:bg-zinc-800 text-[#8C6B4B] dark:text-zinc-300 text-xs font-medium border border-transparent hover:border-primary/30 transition-colors"># 油皮救星</button>
<button class="px-3 py-1.5 rounded-full bg-[#F9F3EA] dark:bg-zinc-800 text-[#8C6B4B] dark:text-zinc-300 text-xs font-medium border border-transparent hover:border-primary/30 transition-colors"># 晚间护肤</button>
<button class="px-3 py-1.5 rounded-full border border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-400 text-xs font-medium flex items-center gap-1 hover:text-primary hover:border-primary transition-colors">
<span class="material-symbols-outlined text-[14px]">add</span>
                            自定义
                         </button>
</div>
</div>
<div class="mt-6">
<div class="w-24 h-24 rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-primary/60 bg-[#F9F3EA]/50 dark:bg-zinc-800/50 cursor-pointer hover:bg-[#F9F3EA] transition-colors">
<span class="material-symbols-outlined mb-1">add_photo_alternate</span>
<span class="text-[10px] font-medium">添加图片</span>
</div>
</div>
</div>
<div class="border-t border-zinc-100 dark:border-zinc-800 p-3 flex items-center gap-4 text-zinc-500 bg-background-light dark:bg-background-dark">
<span class="material-symbols-outlined cursor-pointer hover:text-primary">sentiment_satisfied</span>
<span class="material-symbols-outlined cursor-pointer hover:text-primary">format_bold</span>
<span class="material-symbols-outlined cursor-pointer hover:text-primary">format_list_bulleted</span>
<div class="flex-1"></div>
<span class="text-xs text-zinc-400">0/1000</span>
</div>
</div>
<div class="fixed bottom-0 w-full max-w-[430px] bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 flex justify-around items-end py-3 px-2 pb-6 z-30">
<div class="flex flex-col items-center w-16 text-zinc-400">
<span class="material-symbols-outlined">home</span>
<span class="text-[10px] mt-1 font-medium">首页</span>
</div>
<div class="flex flex-col items-center w-16 text-primary">
<span class="material-symbols-outlined fill-icon">groups</span>
<span class="text-[10px] mt-1 font-bold">社区</span>
</div>
<div class="flex flex-col items-center w-20 relative">
<div class="bg-gradient-to-b from-primary to-primary-dark rounded-full p-3.5 -mt-10 shadow-lg shadow-primary/40 text-white flex items-center justify-center border-4 border-background-light dark:border-background-dark">
<span class="material-symbols-outlined !text-[28px] fill-icon">center_focus_strong</span>
</div>
<span class="text-[10px] mt-1 text-zinc-400 font-medium">扫描</span>
</div>
<div class="flex flex-col items-center w-16 text-zinc-400">
<span class="material-symbols-outlined">calendar_today</span>
<span class="text-[10px] mt-1 font-medium">方案</span>
</div>
<div class="flex flex-col items-center w-16 text-zinc-400">
<span class="material-symbols-outlined">person</span>
<span class="text-[10px] mt-1 font-medium">个人</span>
</div>
</div>
</div>

</body></html>