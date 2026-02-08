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
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-[#161412] dark:text-white min-h-screen">
<div class="relative flex h-auto min-h-screen w-full max-w-[430px] mx-auto flex-col overflow-x-hidden shadow-2xl border-x border-gray-100 dark:border-zinc-800">
<div class="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between">
<div class="text-primary flex size-12 shrink-0 items-center justify-center -ml-2 rounded-full active:bg-primary/10 transition-colors cursor-pointer">
<span class="material-symbols-outlined">arrow_back_ios_new</span>
</div>
<h2 class="text-primary text-xl font-bold leading-tight tracking-tight flex-1 text-center pr-10">专题详情</h2>
<div class="flex w-12 items-center justify-end absolute right-4">
<button class="flex items-center justify-center text-primary">
<span class="material-symbols-outlined">more_horiz</span>
</button>
</div>
</div>
<div class="relative w-full aspect-[16/9] max-h-64 overflow-hidden">
<div class="absolute inset-0 bg-cover bg-center" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCGzO4vibrIVycx--Qe8fd1txo7rLzn6XVmUlmBaPBSdojNJM0LNN6flXzpNwu2GBzX_cDaNAbMoFI7Uv-2FeoAB8ayeQOnneXRSy4064jgdaZy3yYN2jllHyndyMJHVjkSk_OPQ4BsWmX-5DISl3CEmI6fiI9MxtioZBYkSHxBApsFHKR4hY7mVTtJGAYk5sxyeRBk-LTRLJJLYXGks6VorARIzreF33BhYiZbpjF1Hc3-KYovDFmAlcsVWZk7N2bZf97vnPkhKV3T");'></div>
<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
<div class="absolute bottom-0 left-0 w-full p-5 text-white">
<div class="flex items-end justify-between">
<div>
<h1 class="text-3xl font-extrabold tracking-tight mb-1 shadow-sm">油皮战士</h1>
<div class="flex items-center gap-2 text-white/90">
<span class="material-symbols-outlined text-sm fill-icon">group</span>
<span class="text-xs font-semibold">2,400 成员</span>
<span class="text-white/60 mx-1">•</span>
<span class="text-xs font-medium text-white/80">控油 · 祛痘 · 清爽</span>
</div>
</div>
</div>
</div>
</div>
<div class="sticky top-[60px] z-40 bg-background-light dark:bg-background-dark border-b border-gray-100 dark:border-zinc-800 px-4">
<div class="flex items-center justify-between gap-4 pt-2">
<button class="flex-1 pb-3 text-primary border-b-2 border-primary font-bold text-sm">热门讨论</button>
<button class="flex-1 pb-3 text-zinc-500 dark:text-zinc-400 font-medium text-sm">最新发布</button>
<button class="flex-1 pb-3 text-zinc-500 dark:text-zinc-400 font-medium text-sm">精华贴</button>
</div>
</div>
<div class="flex flex-col gap-3 px-4 py-4 pb-28">
<div class="bg-peach-light/50 dark:bg-zinc-800/30 p-4 rounded-xl border border-primary/20">
<div class="flex items-center gap-2 mb-2">
<span class="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">置顶</span>
<h4 class="font-bold text-sm text-[#161412] dark:text-white line-clamp-1">新人必读：油皮护理的误区与正确姿势</h4>
</div>
<p class="text-xs text-zinc-500 line-clamp-2">很多油皮朋友容易陷入过度清洁的误区，导致屏障受损。本文总结了...</p>
<div class="flex items-center gap-3 mt-3">
<img alt="Admin" class="w-5 h-5 rounded-full border border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd5bWWdp1_DBfDLiBlnfQBOx_hk9a10ltTCrABBxppZzvc910JIhV_6a1eXMuIKc2ZX91PBrOsCgViKoNdBKxkJmNPF2K808dAjDp3UVYD2h_xUF73HcBzsDvPaL0cJiNcPgBN8-TH12Qr1L5yvvu22Z2cuwI8iHachpS7ZF_YrT5FfMsxbuPwWwEqCnG3hvCdwPcslMtuR1rTDAjUnpClPNKcbLi04fdvLxisFWZfbQsUSMkQmIu-6grPiqA9vsnT0xl0JZ8kOX8"/>
<span class="text-[10px] text-zinc-500 font-medium">管理员 · 3天前</span>
</div>
</div>
<div class="flex gap-4 items-start bg-white dark:bg-zinc-800/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700/50">
<div class="flex-1">
<div class="flex items-center gap-2 mb-1.5">
<img alt="user" class="w-5 h-5 rounded-full bg-gray-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv2on3AE8pyBleF9SoAwRNYvxQfoiegWv8IhiZil1kI9m_oyLTplI0qI86BmHeEHnDQJXL3OrRDlVZrdBfCJFdal6qGuO7hxw39zkHNEpeXN3sYHaElgCIRVHfU649eRO5ERL7RMkF353odlBSWOFjkQDJZit8i0kp37gHtLxeaM9inwcFqH_ZzX08iwkVlPcZnvklO_zDEDCiowWu87XpsLrPiXCrSN6gkYYbUi-LrIpFn9xwusQ-DwzHhO1soUil_Ing_vI_eJY"/>
<span class="text-[10px] text-zinc-500 font-medium">Sophie_L</span>
<span class="text-[10px] text-zinc-400">• 2小时前</span>
</div>
<h4 class="font-bold text-base leading-tight text-[#161412] dark:text-white mb-1">夏天用这款防晒真的不闷痘！</h4>
<p class="text-xs text-zinc-500 line-clamp-2 mb-2">亲测了两周，控油效果也不错，后续跟妆很服帖。推荐给同是油皮的姐妹们尝试一下。</p>
<div class="flex items-center gap-4">
<div class="flex items-center gap-1 text-zinc-400">
<span class="material-symbols-outlined text-[16px]">chat_bubble</span>
<span class="text-[10px] font-medium">42</span>
</div>
<div class="flex items-center gap-1 text-zinc-400">
<span class="material-symbols-outlined text-[16px]">visibility</span>
<span class="text-[10px] font-medium">1.2k</span>
</div>
</div>
</div>
<div class="flex flex-col items-center justify-center bg-background-light dark:bg-zinc-900 rounded-lg p-1 min-w-[48px]">
<span class="material-symbols-outlined text-primary text-xl">arrow_drop_up</span>
<span class="text-xs font-bold text-primary">256</span>
</div>
</div>
<div class="flex gap-4 items-start bg-white dark:bg-zinc-800/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700/50">
<div class="flex-1">
<div class="flex items-center gap-2 mb-1.5">
<img alt="user" class="w-5 h-5 rounded-full bg-gray-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9C6Facebdtt6AEX9wjMdWusAouHlvMRUqwIs5ER9Q_J2ocIT6KGshwo7KpOj_e1icRVGb4Zu7RgnLTEjvlEVnM7Wg5upiqF74Ija69V_iDMLPS4EVnbGvszrYXsyuyUjN9ADTV4Cob1e85kxbN3Z_XwGIbyZ00_TPHV5HV509xNgunky7ehWMqYO1gXPuHwxyF-WfsNENMjdQl1wKLeVbjEfd2I5GhZW89PracKGKni86BEMR4AtMmaBuFNmaOsUJOHBRD2hvUp0"/>
<span class="text-[10px] text-zinc-500 font-medium">MikeW</span>
<span class="text-[10px] text-zinc-400">• 5小时前</span>
</div>
<h4 class="font-bold text-base leading-tight text-[#161412] dark:text-white mb-1">求助：水杨酸刷酸爆痘期怎么度过？</h4>
<p class="text-xs text-zinc-500 line-clamp-2 mb-2">已经刷了一周了，脸上开始冒很多红肿痘痘，这是正常的排毒反应吗？有点慌...</p>
<div class="flex items-center gap-4">
<div class="flex items-center gap-1 text-zinc-400">
<span class="material-symbols-outlined text-[16px]">chat_bubble</span>
<span class="text-[10px] font-medium">156</span>
</div>
<div class="flex items-center gap-1 text-zinc-400">
<span class="material-symbols-outlined text-[16px]">visibility</span>
<span class="text-[10px] font-medium">3.4k</span>
</div>
</div>
</div>
<div class="flex flex-col items-center justify-center bg-background-light dark:bg-zinc-900 rounded-lg p-1 min-w-[48px]">
<span class="material-symbols-outlined text-zinc-400 text-xl">arrow_drop_up</span>
<span class="text-xs font-bold text-zinc-500">89</span>
</div>
</div>
<div class="flex flex-col bg-white dark:bg-zinc-800/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700/50 gap-3">
<div class="flex items-center gap-2">
<img alt="user" class="w-5 h-5 rounded-full bg-gray-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0ZHworj0gecnVvPewH5I6xm4GmWeNt5ed2tAJmY8efG7wEArIaonRbUbBTDXmXd6eNnLwFDwXznYFg7lkBjveIKSrulwCEI1aZ9dy4o7-wskNJ9p3U_F1XaSpmIG9YCo6TgkDP5HV0XeafSTeWVeif336_EdxFvLa-tMqdKfa5HOgs9rcm0SdlWWQ1P6s6PCREFDfy0CRfhOhK9mct2zHIY6pHRgfII4d_s5m3aeNoBMEVw4Z-JLJikNfjLaFyLcIhfnlYnjSpTs"/>
<span class="text-[10px] text-zinc-500 font-medium">LilyStyle</span>
<span class="text-[10px] text-zinc-400">• 昨天</span>
</div>
<div>
<h4 class="font-bold text-base leading-tight text-[#161412] dark:text-white mb-1">本月空瓶记：油皮挚爱的3款爽肤水</h4>
<p class="text-xs text-zinc-500 line-clamp-2 mb-2">不得不说，这几款真的是无限回购的好物。特别是第一款，控油力绝绝子！</p>
<div class="flex gap-2 mt-2 overflow-hidden">
<div class="w-20 h-20 rounded-lg bg-zinc-200 dark:bg-zinc-700 bg-cover bg-center" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCRwPXfeLH3yq8ErR3yRPNXBl-nm7abTENaQZr_Q9KYAQdUzGCjndlNTl6CykFm35PBvk5w1g_UaO8-wjYkM1lJ8MjUe1iyMKMMr6hikkNz4oCrFbkFk-bN72c4p6Ije_8klqBAp_Rb0Yssli1t3hccqpvdE_RCp4Pn_nV973C2-gY7I_xbZ-hmjte5buBsgZxThnViZ-LsgJvWCHc-pVz8vUZ4x1y6LPHzdWxxcf3Y4sYCZIZ_pguJOFZpeqmXtJq4xydLw6_7fFyM");'></div>
<div class="w-20 h-20 rounded-lg bg-zinc-200 dark:bg-zinc-700 bg-cover bg-center" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDxNWwcGcV9yCzENGCGkb3JDmGRJJfJttSCAkCVd8cN-_vKrIBd7nYUbLmPe57rsBtcNlGHLOKsjB2HFzhDwWg5QAdhc__dKyljZy1My4OFWB2E_leAxE2oluKmiCKWoa2SF0XwIMg3eTR3wP9Tq5_2I6N8ATVhGMoDnG_PBd_Dt6qzu77SrWJ0r4gXSptpOIR78IQLTmeNWgBj-EutemWAm--ikOBHhxTqqcQSVsf1foOioMyj1KNQe1jAdMMZ4xVZpCUVAcmGhZ2Q");'></div>
</div>
</div>
<div class="flex items-center justify-between mt-1">
<div class="flex items-center gap-4">
<div class="flex items-center gap-1 text-zinc-400">
<span class="material-symbols-outlined text-[16px]">chat_bubble</span>
<span class="text-[10px] font-medium">210</span>
</div>
<div class="flex items-center gap-1 text-zinc-400">
<span class="material-symbols-outlined text-[16px]">favorite</span>
<span class="text-[10px] font-medium">856</span>
</div>
</div>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-primary text-xl">arrow_drop_up</span>
<span class="text-xs font-bold text-primary">542</span>
</div>
</div>
</div>
<div class="flex gap-4 items-start bg-white dark:bg-zinc-800/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700/50">
<div class="flex-1">
<div class="flex items-center gap-2 mb-1.5">
<img alt="user" class="w-5 h-5 rounded-full bg-gray-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpDEU6EajUaii9aIfpdxZwF0wjW2dAF-8PrCkHgZ6k7p3Ot-WGRFtblXfDXGEZjZXHqVYRsNZp2rjjkjW0_0kW9wX_jSBcCa-nFTPu3xoGAmrs5D1_hLSZk9Mo6-krlhJr6nb8QDsH8M5Y9Z0L7vMYkQz5xDLzNetwvpVf_c5BEo-GgXQBBn0iCWOhNVKXpW0tqAk1e277yHczg4KPnnH-cVLwaPEtgcKFvZp-YsCad9j7Y6V_JpBomASfLAe5thkRTyEaY3Y-BwA"/>
<span class="text-[10px] text-zinc-500 font-medium">JackPot</span>
<span class="text-[10px] text-zinc-400">• 昨天</span>
</div>
<h4 class="font-bold text-base leading-tight text-[#161412] dark:text-white mb-1">泥膜清洁后需要立刻敷补水面膜吗？</h4>
<p class="text-xs text-zinc-500 line-clamp-2 mb-2">听专柜柜姐说需要，但是网上又有医生说没必要，到底该听谁的？</p>
<div class="flex items-center gap-4">
<div class="flex items-center gap-1 text-zinc-400">
<span class="material-symbols-outlined text-[16px]">chat_bubble</span>
<span class="text-[10px] font-medium">67</span>
</div>
<div class="flex items-center gap-1 text-zinc-400">
<span class="material-symbols-outlined text-[16px]">visibility</span>
<span class="text-[10px] font-medium">1.8k</span>
</div>
</div>
</div>
<div class="flex flex-col items-center justify-center bg-background-light dark:bg-zinc-900 rounded-lg p-1 min-w-[48px]">
<span class="material-symbols-outlined text-zinc-400 text-xl">arrow_drop_up</span>
<span class="text-xs font-bold text-zinc-500">124</span>
</div>
</div>
</div>
<div class="fixed bottom-24 right-4 z-50">
<button class="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-3 rounded-full shadow-lg shadow-primary/30 active:scale-95 transition-transform">
<span class="material-symbols-outlined text-[20px]">add</span>
<span class="text-sm font-bold">加入社区</span>
</button>
</div>
<div class="fixed bottom-0 w-full max-w-[430px] bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 flex justify-around items-end py-3 px-2 pb-6 z-50">
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