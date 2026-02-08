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
                        "peach-light": "#F9F3EA",
                        "text-main": "#4A4238",
                        "text-sub": "#81766a"
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
        }.no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white min-h-screen">
<div class="relative flex h-full min-h-screen w-full max-w-[430px] mx-auto flex-col overflow-x-hidden shadow-2xl border-x border-gray-100 dark:border-zinc-800 bg-background-light dark:bg-background-dark">
<div class="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-3 justify-between border-b border-primary/10">
<button class="text-text-sub dark:text-zinc-400 text-base font-medium px-2 py-1 -ml-2">
            取消
        </button>
<h2 class="text-text-main dark:text-white text-lg font-bold tracking-tight">发布帖子</h2>
<button class="bg-primary hover:bg-primary-dark text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm transition-colors">
            发布
        </button>
</div>
<div class="flex-1 flex flex-col px-4 pt-6 pb-20">
<div class="mb-4">
<input class="w-full bg-transparent border-none text-xl font-bold placeholder:text-text-sub/50 text-text-main dark:text-white focus:ring-0 px-0 py-2" placeholder="起个吸引人的标题吧..." type="text"/>
</div>
<div class="h-px w-full bg-primary/10 mb-4"></div>
<div class="flex-1 min-h-[200px]">
<textarea class="w-full h-full bg-transparent border-none text-base font-normal placeholder:text-text-sub/50 text-text-main dark:text-white focus:ring-0 px-0 resize-none leading-relaxed" placeholder="分享你的护肤心得、产品评测或疑问..."></textarea>
</div>
<div class="mt-6 mb-4">
<div class="flex items-center gap-2 mb-3">
<span class="material-symbols-outlined text-primary text-[20px]">sell</span>
<span class="text-sm font-bold text-text-main dark:text-white">添加标签</span>
</div>
<div class="flex flex-wrap gap-2">
<button class="px-3 py-1.5 bg-peach-light dark:bg-white/5 text-primary-dark dark:text-primary text-xs font-semibold rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors">
                    #护肤心得
                </button>
<button class="px-3 py-1.5 bg-peach-light dark:bg-white/5 text-primary-dark dark:text-primary text-xs font-semibold rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors">
                    #新品评测
                </button>
<button class="px-3 py-1.5 bg-peach-light dark:bg-white/5 text-primary-dark dark:text-primary text-xs font-semibold rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors">
                    #干皮救星
                </button>
<button class="px-3 py-1.5 bg-peach-light dark:bg-white/5 text-primary-dark dark:text-primary text-xs font-semibold rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors">
                    #晚间护肤
                </button>
<button class="flex items-center justify-center size-8 bg-transparent text-primary-dark dark:text-primary border border-dashed border-primary/40 rounded-lg hover:bg-primary/5 transition-colors">
<span class="material-symbols-outlined text-[18px]">add</span>
</button>
</div>
</div>
<div class="flex gap-2 overflow-x-auto no-scrollbar py-2">
</div>
</div>
<div class="sticky bottom-0 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-primary/10 p-4 pb-8 flex items-center gap-4">
<button class="flex items-center justify-center size-12 bg-peach-light dark:bg-zinc-800 rounded-xl text-primary hover:bg-primary/10 active:scale-95 transition-all">
<span class="material-symbols-outlined text-[28px]">image</span>
</button>
<button class="flex items-center justify-center size-12 bg-transparent rounded-xl text-text-sub hover:bg-black/5 dark:hover:bg-white/5 transition-all">
<span class="material-symbols-outlined text-[26px]">location_on</span>
</button>
<button class="flex items-center justify-center size-12 bg-transparent rounded-xl text-text-sub hover:bg-black/5 dark:hover:bg-white/5 transition-all">
<span class="material-symbols-outlined text-[26px]">alternate_email</span>
</button>
<button class="flex items-center justify-center size-12 bg-transparent rounded-xl text-text-sub hover:bg-black/5 dark:hover:bg-white/5 transition-all ml-auto">
<span class="material-symbols-outlined text-[26px]">keyboard_hide</span>
</button>
</div>
</div>

</body></html>